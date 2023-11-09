Hooks.on("renderChatMessage", async (app, html, messageData) => {
    if (game.settings.get("wfrp4e-pl-addons", "combatSpellTracker.Enable")) {
        if (!game.user.isGM) {
            return;
        }
        const combat = game.combats.active;
        if (combat && combat.round != 0 && combat.turns && combat.active) {//combat started
            let test = app.getTest();
            if ((test?.constructor?.name == "WomCastTest" && test.result.castOutcome == "success") ||
                (test?.constructor?.name == "WeaponTest" && test.result.outcome == "success" && test.weapon?.effects?.find(x=>x.flags?.wfrp4e?.effectApplication == 'area'))) {
                let newMessage = jQuery(html).find(".message-content").append(jQuery('<div class="card-content"><a class="chat-button card-track-spell" style="width: 100%">Śledź zaklęcie / Efekt</a></div>'))
                newMessage.find(".card-track-spell").click(async function () {
                    let messageId = messageData.message._id;
                    let userId = messageData.user.id;
                    let message = game.messages.get(messageId);
                    let test = message.getTest();
                    
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
                        let effect = test.weapon.effects.find(x=>x.flags?.wfrp4e?.effectApplication == 'area');
                        spells[messageId].duration = {current: effect.duration.rounds, unit: "rund"};
                    }
                    if (test.data?.context?.templates) {
                        spells[messageId].templates = test.data.context.templates;
                    }
                    await combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
                });
            }
        }
    }
});

Hooks.on("renderCombatTracker", (app, html, options) => {

    const combat = game.combats.active; 

    if(combat) {
        let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
        if (spells) {
            let rows = ``;
            let element = `<div style="width: 100%; text-align: center; flex: 0;"><h4>Aktywne zaklęcia</h4></div><ol id="spell-tracker" style="min-height: 20%; flex: 0;" class="directory-list">[[rows]]</ol>`;
        
            for(let messageId in spells) {
                if (!spells[messageId]) continue;
                const msg = spells[messageId];
                if (msg.type == "Spell") {
                    let actorId = msg.test.data.context.speaker.actor;
                    let actorName = msg.test.data.context.cardOptions.speaker.alias;
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
                    let actorName = msg.test.data.context.cardOptions.speaker.alias;
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
                let skill = actor.getItemTypes("skill").find(x => x.name == "Język (Magiczny)");
                if (!skill) {
                    return;
                }
                let spell = spells[messageId];
                let dispelValue = spell.test.data.result.itemData.system.cn.value + Number.parseInt(spell.test.data.result.SL);
                let dispelTest = actor.getItemTypes("extendedTest").find(x => x.getFlag('wfrp4e-pl-addons', 'messageId') == messageId);
                if (!dispelTest) {
                    let dispelTestData = {
                        name : "Rozpraszanie Zaklęcia - " + spell.test.data.result.itemData.name,
                        type : "extendedTest",
                        system : {
                            completion:{value: 'remove'},
                            description:{type: 'String', label: 'Description', value: ''},
                            failingDecreases:{value: true},
                            gmdescription:{type: 'String', label: 'Description', value: ''},
                            hide: { test: false, progress: false },
                            negativePossible: { value: true },
                            SL: { current: 0, target: dispelValue },
                            test: { value: "Język (Magiczny)" }
                        },
                        flags : { 
                            'wfrp4e-pl-addons' : {
                                messageId : messageId
                            }
                        }
                    }
                    dispelTest = await actor.createEmbeddedDocuments("Item", [dispelTestData])[0];
                }
                await actor.setupExtendedTest(dispelTest, {appendTitle : " - Rozpraszanie Zaklęcia"});
            });
        }
    }
});

Hooks.on("preUpdateCombat", async (combat, updateData, context) => {
    // no change in turns nor rounds.
    if (updateData.turn === undefined && updateData.round === undefined) return;
    // combat not started or not active.
    if (!combat.started || !combat.isActive) return;

    if (game.user.isGM) {

        if (combat.round != 1 && combat.turns && combat.active && combat.current.turn == combat.turns.length -1 && updateData.turn == 0) {
            if (updateData.flags && updateData.flags['wfrp4e-pl-addons']) {
                let moduleFlags = updateData.flags['wfrp4e-pl-addons'];
                if (moduleFlags['spells'] !== null) return;
            }
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
    }
});