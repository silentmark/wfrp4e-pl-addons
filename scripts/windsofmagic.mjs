import CircleHelper from "./circle-helper.mjs";

export default class WindsOfMagic {

    setup () {
        if (game.settings.get("wfrp4e-pl-addons", "windsOfMagicCombatRolls.Enable")) {
            Hooks.on("createCombat", async function (combat) {
                if (game.user.isGM) {
                    let winds = Object.values(game.wfrp4e.config.magicWind).filter(x => x != game.i18n.localize("None")).filter((value, index, array) => array.indexOf(value) === index);
                    const templateData = {};
                    templateData.winds = [];
                    for (let i = 0; i < winds.length; i++) {
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
                                    const inputs = $('input.wind[name]', dlg);
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
                                    winds.deamonName = $('input[name="tzeentchInfluenceDemon"]', dlg)[0].value;
                                    await combat.setFlag('wfrp4e-pl-addons', 'winds', winds);
                                    await ChatMessage.create({ content: `<p><strong>Zmienne Wiatry magii wpływają na splatanie w następujący sposób:</strong><br/><table>${message}</table></p>` });
                                }
                            }
                        },
                        default: "confirm",
                        close: dlg => { }
                    }).render(true);
                }
            });

            Hooks.on("combatRound", async function (combat, updateData, options) {
                if (game.user.isGM) {
                    let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
                    if (spells) {
                        for (let messageId in spells) {
                            if (spells[messageId]) {
                                let duration = spells[messageId].duration;
                                if (duration.unit === 'rund' && Number.isInteger(duration.current) && Number.parseInt(duration.current) > 0) {
                                    duration.current = Number.parseInt(duration.current) - 1;
                                }
                            }
                        }
                        await combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
                    }
                }
            });
    
            Hooks.on("updateCombat", async function (combat, updateData) {
                if (game.user.isGM) {
                    if (typeof(updateData.round) === 'undefined' && typeof(updateData.turn) === 'undefined') {
                        return;
                    }
                    if (!combat.started || !combat.isActive) return;

                    if (!combat.combatants.get(combat.current.combatantId)) {
                        return;
                    }
                    let actor = game.actors.get(combat.combatants.get(combat.current.combatantId).actorId);
                    let skills = actor.itemTags['skill'].filter(x=> x.name.startsWith('Splatanie Magii'));
                    if (skills.length == 0) {
                        return;
                    }
                    for (let i = 0; i < skills.length; i++) {
                        let skill = skills[i];
                        let wind = skill.name.substring(skill.name.indexOf("(") + 1, skill.name.indexOf(")"));
                        let winds = combat.flags['wfrp4e-pl-addons']['winds'];
                        if (winds) {
                            let modifier = winds.modifier.find(x=> x.wind == wind)?.modifier;
                            if (modifier != 0 && modifier != undefined) {
                                let effect = actor.effects.find(x => x.name == 'Wiatry Magii (' + wind + ')');
                                if (!effect) {
                                    effect = {
                                        name: 'Wiatry Magii (' + wind + ')',
                                        img: "modules/wfrp4e-core/icons/spells/octagram.png",
                                        system: {
                                            condition : { },
                                            scriptData: [{
                                                label: 'Wiatry Magii (' + wind + ')',
                                                trigger: "dialog",
                                                script : `args.fields.modifier += ${modifier};`,
                                                options : {
                                                    hideScript : `return args.type != 'channelling' || game.wfrp4e.config.magicWind[args.item?.lore?.value] != '${wind}'`,
                                                    activateScript : `return args.type == "channelling" && game.wfrp4e.config.magicWind[args.item?.lore?.value] == '${wind}'`
                                                }
                                            }]
                                        }
                                    }
                                    await actor.createEmbeddedDocuments("ActiveEffect", [effect])
                                }
                            }
                            if (winds.tzeentch) {
                                let deamonName = winds.deamonName;
                                let script = `
                                    let suffusedWithMagicEffect = {
                                        name: 'Nasycenie Magią',
                                        img: "modules/wfrp4e-core/icons/spells/tzeentch.png",
                                        duration: {
                                            rounds: 1
                                        },
                                        system: {
                                            condition : { },
                                            scriptData: [{
                                                    trigger: "dialog",
                                                    label: "Nasycenie Magią",
                                                    script : "args.fields.slBonus += 1;",
                                                    options : {
                                                        hideScript : "return args.type != 'cast'",
                                                        activateScript : "return args.type == 'cast'"
                                                    }
                                                }]
                                            }
                                        }
                                    };
                                    if (args.test.result.roll.toString() == '99') {
                                        const demon = game.actors.find(x=>x.name == "${deamonName}");
                                        if (demon) {
                                            const options = {
                                                updateData: {
                                                    token: { alpha: 0 }
                                                },
                                                count: 1
                                            }
                                            const [creature] = await new Portal()
                                                .addCreature(demon.uuid, options)
                                                .spawn();

                                            await Sequencer.Helpers.wait(200)
                                            new Sequence()
                                                .effect()
                                                .file("jb2a.magic_signs.circle.02.abjuration.intro.dark_purple")
                                                .atLocation(demonToken)
                                                .scaleToObject(2.5)
                                                .randomRotation()
                                            .play();

                                            ChatMessage.create({content: "<span>Złowrogie wpływy Tzeentcha wywołały manifestację chaosu: <a class='table-click fumble-roll' title='Złowrogie Wpływy Tzeentcha' data-table='miscast' data-modifier='100'><i class='fas fa-list'></i>Poważna Manifestacja Chaosu (+100)</a></span>"})
                                            caster.createEmbeddedDocuments("ActiveEffect", [suffusedWithMagicEffect]);
                                        }
                                    }
                                    else if (args.test.result.roll.toString().split('').reverse()[0] == '9') {
                                        ChatMessage.create({content: "<span>Złowrogie wpływy Tzeentcha wywołały manifestację chaosu: <a class='table-click fumble-roll' title='Złowrogie Wpływy Tzeentcha' data-table='miscast' data-modifier='0'><i class='fas fa-list'></i>Pomniejsza Manifestacja Chaosu</a></span>"});
                                        this.actor.createEmbeddedDocuments("ActiveEffect", [suffusedWithMagicEffect]);
                                    }`
                                let effect = actor.effects.find(x => x.name == 'Złowrogie Wpływy Tzeentcha');
                                if (!effect) {
                                    effect = {
                                        name: 'Złowrogie Wpływy Tzeentcha',
                                        img: "modules/wfrp4e-core/icons/spells/tzeentch.png",
                                        system: {
                                            condition : { },
                                            scriptData: [{
                                                label: "Złowrogie Wpływy Tzeentcha (Czarowanie)",
                                                trigger: "rollCastTest",
                                                script : script
                                            },
                                            {
                                                label: "Złowrogie Wpływy Tzeentcha (Splatanie)",
                                                trigger: "rollChannellingTest",
                                                script : script
                                            }]
                                        }
                                    }
                                    await actor.createEmbeddedDocuments("ActiveEffect", [effect])
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
                        let effects = actor.effects.filter(x=> x.name.startsWith('Wiatry Magii') || x.name.startsWith('Złowrogie Wpływy Tzeentcha'));
                        if (effects.length > 0) {
                            effects = effects.map(x => x.id);
                            await actor.deleteEmbeddedDocuments("ActiveEffect", effects);
                        }
                    }
                }
            });


            Hooks.on("renderChatMessage", async (app, html, messageData) => {
                if (!game.user.isGM) {
                    return;
                }
                const combat = game.combats.active;
                if (combat && combat.round != 0 && combat.turns && combat.active && app?.system?.test) {//combat started
                    let test = app.system.test;
                    if ((test?.constructor?.name == "WomCastTest" && test.result.castOutcome == "success") ||
                        (test?.constructor?.name == "WeaponTest" && test.result.outcome == "success" && test.weapon?.areaEffects?.length)) {
                        let newMessage = jQuery(html).find(".message-content").append(jQuery('<div class="card-content"><a class="chat-button card-track-spell" style="width: 100%">Śledź zaklęcie / Efekt</a></div>'))
                        newMessage.find(".card-track-spell").click(async function () {
                            let messageId = messageData.message._id;
                            let userId = messageData.user.id;
                            let message = game.messages.get(messageId);
                            let test = message.system.test;
                                
                            let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
                            if (!spells) {
                                spells = {};
                            }
                            
                            spells[messageId] = {
                                user: userId, 
                                test: test,
                                message: messageId
                            }                    
                            if (test.constructor.name == "WomCastTest") {
                                spells[messageId].type = "Spell"
                                spells[messageId].duration = test.result.overcast.usage.duration;
                            } else {
                                spells[messageId].type = "Weapon"
                                let effect = test.weapon.areaEffects;
                                spells[messageId].duration = {current: effect.duration.rounds, unit: "rund"};
                            }
                            if (test.data?.context?.templates) {
                                spells[messageId].templates = test.data.context.templates;
                            }
                            await combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
                        });
                    }
                }
            });

            Hooks.on("renderCombatTracker", (app, html, options) => {
                const combat = game.combats.active; 
                if(combat) {

                    game.combat.combatants.forEach(c => {
                        // Add class to trigger drag events.
                        let bar = c.token.getBarAttribute("bar1");
                        let healthSvg = CircleHelper.getProgressCircle({
                            current: bar.value,
                            max: bar.max,
                            radius: 16
                        });
                        let $combatant = html.find(`.combatant[data-combatant-id="${c.id}"]`);
                        $combatant.find('.token-image').wrap('<div class="ce-image-wrapper">');
                        $combatant.find('.ce-image-wrapper').append(CircleHelper.getProgressCircleHtml(healthSvg));
                    });

                    let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
                    if (spells) {
                        let rows = ``;
                        let element = `<div style="width: 100%; text-align: center; flex: 0;"><h4>Aktywne zaklęcia</h4></div><ol id="spell-tracker" style="min-height: 20%; flex: 0;" class="directory-list">[[rows]]</ol>`;
                    
                        for (let messageId in spells) {
                            if (!spells[messageId]) continue;
                            const msg = spells[messageId];
                            if (msg.type == "Spell") {
                                let actorId = msg.test.data.context.speaker.actor;
                                let actorName = msg.test.data.context.chatOptions.speaker.alias;
                                let spellName = msg.test.data.preData.itemData.name;
                                let spellImg = msg.test.data.preData.itemData.img;
                                let spellId = msg.test.data.preData.itemData._id;
                                let isMemorized = msg.test.data.result.itemData.system.memorized.value;
                                let cnValue = msg.test.data.result.itemData.system.cn.value;
                                if (!isMemorized) {
                                    cnValue = cnValue / 2;
                                }
                                let duration = msg.duration;
                                let dispelValue = cnValue + Number.parseInt(msg.test.data.result.SL);
                                
                                let textStyle = ""
                                let imageStyle = "";
                                if (duration.current == 0) {
                                    textStyle = "color: var(--color-text-light-7);";
                                    imageStyle = "opacity: 0.3";
                                }
            
                                rows += `<li class="directory-item flexrow" style="position: relative;" data-message-id="${messageId}" data-spell-id="${spellId}" data-actor-id="${actorId}">
                                    <div class="flexcol" style="max-width: 48px;max-height: 48px;">
                                        <img style="width:48px;max-width: 48px;${imageStyle}" alt="${spellName} - ${actorName}" src="${spellImg}">
                                    </div>
                                    <div class="flexcol" style="width: calc(100% - 48px);height: 48px;${textStyle}">
                                        <div class="flexrow" style="width: 100%;height: 50%;margin-top: -10px;padding-left: 10px;margin-bottom: 10px;">${spellName} - ${actorName}</div>
                                        <div class="flexrow" style="width: 100%;height: 50%;margin-top: -10px;padding-left: 10px;margin-bottom: 10px;">
                                            <div class="flexcol duration-value" style="text-align: center;width: 48px;min-width: 48px;max-width: 48px;height: 100%;">${duration.current}</div>
                                            <div class="flexcol duration-unit" style="min-width: calc(100% - 146px);text-align: center;height: 100%;">${duration.unit}</div>
                                            <div class="flexcol dispel-value" style="text-align: center;min-width: 48px;height: 100%;" title="Wartość Rozproszenia">${dispelValue}</div>
                                            <div style="max-width: 48px;min-width: 48px;text-align: center;height: 100%;">
                                                <a class="item-controls spell-dispel" data-spell-id="${messageId}" title="Rozprosz Zaklęcie"><i class="fas fa-burst"></i></a>
                                                <a class="item-controls spell-delete" data-spell-id="${messageId}" title="Skasuj Zaklęcie"><i class="fas fa-trash"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                    </li>`;
                            } else {
                                let actorId = msg.test.data.context.speaker.actor;
                                let actorName = msg.test.data.context.chatOptions.speaker.alias;
                                let item = game.actors.get(actorId).items.get(msg.test.data.preData.item);
            
                                let itemName = item.name;
                                let itemImg = item.img;
                                let itemId = item.id;
            
                                let duration = msg.duration;
                                let textStyle = ""
                                let imageStyle = "";
                                if (duration.current == 0) {
                                    textStyle = "color: var(--color-text-light-7);";
                                    imageStyle = "opacity: 0.3";
                                }
            
                                rows += `<li class="directory-item flexrow" style="position: relative;" data-message-id="${messageId}" data-item-id="${itemId}" data-actor-id="${actorId}">
                                    <div class="flexcol" style="max-width: 48px;max-height: 48px;">
                                        <img style="width:48px;max-width: 48px;${imageStyle}" alt="${itemName} - ${actorName}" src="${itemImg}">
                                    </div>
                                    <div class="flexcol" style="width: calc(100% - 48px);height: 48px;${textStyle}">
                                        <div class="flexrow" style="width: 100%;height: 50%;margin-top: -10px;padding-left: 10px;margin-bottom: 10px;">${itemName} - ${actorName}</div>
                                        <div class="flexrow" style="width: 100%;height: 50%;margin-top: -10px;padding-left: 10px;margin-bottom: 10px;">
                                            <div class="flexcol duration-value" style="text-align: center;width: 48px;min-width: 48px;max-width: 48px;height: 100%;">${duration.current}</div>
                                            <div class="flexcol duration-unit" style="min-width: calc(100% - 96px);text-align: center;height: 100%;">${duration.unit}</div>
                                            <div style="max-width: 48px;min-width: 48px;text-align: center;height: 100%;">
                                                <a class="item-controls item-delete" data-item-id="${messageId}" title="Skasuj Przedmiot"><i class="fas fa-trash"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                    </li>`;                    
                            }
                        }
                        element = element.replace('[[rows]]', rows);
                        let newElement = $(element).insertBefore(html.find("#combat-controls"));
                        newElement.find(".spell-delete").click(async function () {
                            let spells = game.combats.active.getFlag('wfrp4e-pl-addons', 'spells');
                            if (!spells) {
                                spells = {};
                            }
                            spells[this.dataset.spellId] = null;
                            await game.combats.active.setFlag('wfrp4e-pl-addons', 'spells', spells);
                        });            
                        newElement.find(".item-delete").click(async function () {
                            let spells = game.combats.active.getFlag('wfrp4e-pl-addons', 'spells');
                            if (!spells) {
                                spells = {};
                            }
                            spells[this.dataset.itemId] = null;
                            await game.combats.active.setFlag('wfrp4e-pl-addons', 'spells', spells);
                        });
                        newElement.find(".spell-dispel").click(async function () {
                            let spells = game.combats.active.getFlag('wfrp4e-pl-addons', 'spells');
                            let messageId = this.dataset.spellId;
                            if (!spells) {
                                return;
                            }
                            if (game.canvas.tokens.controlled.length !== 1) {
                                return;
                            }
                            let actor = game.canvas.tokens.controlled[0].actor;
                            let skill = actor.itemTags["skill"].find(x => x.name == "Język (Magiczny)");
                            if (!skill) {
                                return;
                            }
                            let spell = spells[messageId];
                            let dispelValue = spell.test.data.result.itemData.system.cn.value + Number.parseInt(spell.test.data.result.SL);
                            let dispelTest = actor.itemTags["extendedTest"].find(x => x.getFlag('wfrp4e-pl-addons', 'messageId') == messageId);
                            if (!dispelTest) {

                                const extendedTestData = {
                                    name : "Rozpraszanie Zaklęcia - " + spell.test.data.result.itemData.name,
                                    type: "extendedTest",
                                    system: {
                                        SL: {
                                            current: 0,
                                            target: dispelValue
                                        },
                                        test: {
                                            value: "Język (Magiczny)"
                                        },
                                        failingDecreases:{
                                            value: false
                                        },
                                        negativePossible: { 
                                            value: false 
                                        },
                                        completion: {
                                            value: "remove"
                                        },
                                        difficulty: {
                                            value: "challenging"
                                        }
                                    }
                                };
                                dispelTest = (await actor.createEmbeddedDocuments("Item", [extendedTestData]))[0];
                            }
                            await actor.setupExtendedTest(dispelTest, {appendTitle : " - Rozpraszanie Zaklęcia"});
                        });
                    }
                }
            });
        }
    }
}