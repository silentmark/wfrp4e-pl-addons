
Hooks.on("createCombat", async function (combat) {
    if (game.user.isGM) {
        let winds = Object.values(game.wfrp4e.config.magicWind).filter(x => x != game.i18n.localize("None")).filter((value, index, array) => array.indexOf(value) === index);
        const templateData = {};
        templateData.winds = [];
        for(let i = 0; i < winds.length; i++) {
            templateData.winds[i] = {};
            templateData.winds[i].wind = winds[i];
            templateData.winds[i].modifier = 0;
        }
    
        const html = await renderTemplate('modules/wfrp4e-pl-addons/templates/winds-of-magic.hbs', templateData);
        new Dialog({
            content: html,
            title: "Rzut na Wiatry Magii",
            buttons: {
              confirm: {
                label: "Rzut",
                callback: async (dlg) => { 
                    const inputs = $('input[name]', dlg);
                    const winds = {}
                    winds.modifier = [];
                    let message = '';
                    for (let i = 0; i < inputs.length; i++) {
                        const input = inputs[i];
                        const wind =  input.attributes['name'].value;
                        const modifier = Number.parseInt(input.value);
                        const result = Number.parseInt( (await game.wfrp4e.tables.rollTable('winds', { hideDSN: true, modifier: modifier })).result);
                        winds.modifier.push({wind: wind, modifier: result});
                        message += `<tr><td><strong>${wind}</strong>:</td><td>${result > 0 ? '+' + result : result}</td></tr>`
                    }
                    winds.tzeentch = $('input[name="tzeentchInfluence"]', dlg)[0].checked;
                    await combat.setFlag('wfrp4e-pl-addons', 'winds', winds);
                    await ChatMessage.create({ content: `<p><strong>Zmienne Wiatry magii wpływają na splatanie w następujący sposób:</strong><br/><table>${message}</table></p>` });
                }
              }
            },
            default: "confirm",
            close: dlg => {
                // do nothing.
            }
        }).render(true);
    }
});
  
Hooks.on("updateCombat", async function (combat, updateData) {
    if (game.user.isGM) {
        if (!updateData.round && !updateData.turn) {
            return
        }
        let actor = game.actors.get(combat.combatants.get(combat.current.combatantId).actorId);
        let skills = actor.getItemTypes('skill').filter(x=> x.name.startsWith('Splatanie Magii'));
        if (skills.length == 0) {
            return;
        }
        for (let i = 0; i < skills.length; i++) {
            let skill = skills[i];
            let wind = skill.name.substring(skill.name.indexOf("(") + 1, skill.name.indexOf(")"));
            let winds = combat.flags['wfrp4e-pl-addons']['winds'];
            if (winds) {
                let modifier = winds.modifier.find(x=> x.wind == wind).modifier;
                if (modifier != 0) {
                    let effect = actor.effects.find(x => x.label == 'Wiatry Magii (' + wind + ')');
                    if (!effect) {
                        effect = {
                            label: 'Wiatry Magii (' + wind + ')',
                            icon: "systems/wfrp4e/ui/buttons/d10.webp",
                            transfer: false,
                            flags: {
                                wfrp4e: {
                                    "effectApplication": "actor",
                                    "effectTrigger": "prefillDialog",
                                    "script": `
                                        let skillName = "Splatanie Magii (${wind})";
                                        if (args.type == "skill" && args.item.name == skillName) {
                                            args.prefillModifiers.modifier += ${modifier};
                                        }
                                `
                                }
                            }
                        }
                        await actor.createEmbeddedDocuments("ActiveEffect", [effect])
                    }
                }
                if (winds.tzeentch) {
                    let effect = actor.effects.find(x => x.label == 'Złowrogie Wpływy Tzeentcha (Czarowanie)');
                    if (!effect) {
                        effect = {
                            label: 'Złowrogie Wpływy Tzeentcha (Czarowanie)',
                            icon: "modules/wfrp4e-core/icons/spells/undivided.png",
                            transfer: false,
                            flags: {
                                wfrp4e: {
                                    "effectApplication": "actor",
                                    "effectTrigger": "rollCastTest",
                                    "script": `
                                        if (args.test.result.roll.toString() == '99') {
                                            let demonTokenId = (await warpgate.spawn("Demonetka Slaanesha"))[0];
                                            let demonToken = game.canvas.tokens.get(demonTokenId);
                                            let caster = this.actor;
                                            setTimeout(async function () {
                                                new Sequence()
                                                .effect()
                                                    .file("modules/jb2a_patreon/Library/Generic/Magic_Signs/AbjurationCircleComplete_02_Dark_Pink_800x800.webm")
                                                    .atLocation(demonToken)
                                                    .scaleToObject(2.5)
                                                    .randomRotation()
                                                .play();
                                            }, 200);
                                            ChatMessage.Create({content: "<a class='table-click fumble-roll' title='Złowrogie Wpływy Tzeentcha' data-table='majormis'><i class='fas fa-list'></i>Poważna Manifestacja Chaosu</a>"})
                                            //TODO: add effect for one turn/ 
                                        }
                                        else if (args.test.result.roll.toString().split('').reverse()[0] == '9') {
                                            ChatMessage.Create({content: "<a class='table-click fumble-roll' title='Złowrogie Wpływy Tzeentcha' data-table='minormis'><i class='fas fa-list'></i>Pomniejsza Manifestacja Chaosu</a>"});
                                            //TODO: add effect for one turn/ 
                                        }
                                `
                                }
                            }
                        }
                        await actor.createEmbeddedDocuments("ActiveEffect", [effect])
                    }                    
                    effect = actor.effects.find(x => x.label == 'Złowrogie Wpływy Tzeentcha (Splatanie)');
                    if (!effect) {
                        effect = {
                            label: 'Złowrogie Wpływy Tzeentcha (Splatanie)',
                            icon: "modules/wfrp4e-core/icons/spells/undivided.png",
                            transfer: false,
                            flags: {
                                wfrp4e: {
                                    "effectApplication": "actor",
                                    "effectTrigger": "rollChannellingTest",
                                    "script": `                                    
                                        if (args.test.result.roll.toString() == '99') {
                                            let demonTokenId = (await warpgate.spawn("Demonetka Slaanesha"))[0];
                                            let demonToken = game.canvas.tokens.get(demonTokenId);
                                            let caster = this.actor;
                                            setTimeout(async function () {
                                                new Sequence()
                                                .effect()
                                                    .file("modules/jb2a_patreon/Library/Generic/Magic_Signs/AbjurationCircleComplete_02_Dark_Pink_800x800.webm")
                                                    .atLocation(demonToken)
                                                    .scaleToObject(2.5)
                                                    .randomRotation()
                                                .play();
                                            }, 200);
                                            ChatMessage.Create({content: "<a class='table-click fumble-roll' title='Złowrogie Wpływy Tzeentcha' data-table='majormis'><i class='fas fa-list'></i>Poważna Manifestacja Chaosu</a>"})
                                            //TODO: add effect for one turn/ 
                                        }
                                        else if (args.test.result.roll.toString().split('').reverse()[0] == '9') {
                                            ChatMessage.Create({content: "<a class='table-click fumble-roll' title='Złowrogie Wpływy Tzeentcha' data-table='minormis'><i class='fas fa-list'></i>Pomniejsza Manifestacja Chaosu</a>"});
                                            //TODO: add effect for one turn/ 
                                        }
                                `
                                }
                            }
                        }
                    }
                }
            }
        }
    }
});


Hooks.on("deleteCombat", async function (combat) {
    if (game.user.isGM) {
        let actors = game.actors.map(x=>x);
        for (let i = 0; i < actors.length; i++) {
            let actor = actors[i];
            let effects = actor.effects.filter(x=> x.label.startsWith('Wiatry Magii'));
            if (effects.length > 0) {
                effects = effects.map(x => x.id);
                await actor.deleteEmbeddedDocuments("ActiveEffect", effects);
            }
        }
    }
});


