Hooks.on("renderChatMessage", async (app, html, messageData) => {
    if (game.settings.get("wfrp4e-pl-addons", "combatSpellTracker.Enable")) {
        if (!game.user.isGM) {
            return;
        }
        const combat = game.combats.active;
        if (combat && combat.round != 0 && combat.turns && combat.active) {//combat started
            let castTest = app.getTest();
            if (castTest?.constructor?.name == "WomCastTest" && castTest.result.castOutcome == "success") {
                let newMessage = jQuery(html).find(".message-content").append(jQuery('<div class="card-content"><a class="chat-button card-track-spell" style="width: 100%">Śledź zaklęcie</a></div>'))
                newMessage.find(".card-track-spell").click(async function () {
                    let messageId = messageData.message._id;
                    let userId = messageData.user.id;
                    let message = game.messages.get(messageId);
                    let castTest = message.getTest();
                    
                    let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
                    if (!spells) {
                        spells = {};
                    } 
                    spells[messageId] = {
                        user: userId, 
                        castTest: castTest,
                        message: messageId
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
            for(let messageId in spells) {
                if (!spells[messageId]) continue;
                const msg = spells[messageId]
                let actorId = msg.castTest.data.context.speaker.actor;
                let actorName = msg.castTest.data.context.cardOptions.speaker.alias;
                let spellName = msg.castTest.data.preData.itemData.name;
                let spellImg = msg.castTest.data.preData.itemData.img;
                let spellId = msg.castTest.data.preData.itemData._id;
                let duration = msg.castTest.data.result.overcast.usage.duration;
                let isMemorized = msg.castTest.data.result.itemData.system.memorized.value;
                let cnValue = msg.castTest.data.result.itemData.system.cn.value;
                if (!isMemorized) {
                    cnValue = cnValue / 2;
                }
                let dispelValue = cnValue + Number.parseInt(msg.castTest.data.result.SL);
                
                let textStyle = ""
                let imageStyle = "";
                if (duration.current == 0) {
                    textStyle = "color: var(--color-text-light-7);";
                    imageStyle = "opacity: 0.3";
                }

                rows += `<li class="directory-item flexrow" style="position: relative; height: 55px;" data-message-id="${messageId}" data-spell-id="${spellId}" data-actor-id="${actorId}">
                <div class="flexcol"><img style="width:48px;${imageStyle}" alt="${spellName}" src="${spellImg}"></div>
                <div class="flexcol">
                    <h4 style="width: 150px;text-overflow:ellipsis;${textStyle}" title="${spellName} - ${actorName}">${spellName} - ${actorName}</h4>
                </div>
                <div class="flexcol duration-value" style="text-align: center;">
                    <span style="${textStyle}">${duration.current}</span>
                </div>
                <div class="flexcol duration-unit" style="text-align: center;">
                    <span style="${textStyle}">${duration.unit}</span>
                </div>
                <div class="flexcol dispel-value" style="text-align: center;" title="Wartość Rozproszenia">
                    <span style="${textStyle}">${dispelValue}</span>
                </div>
                <div>
                    <a class="item-controls item-dispel" data-spell-id="${messageId}" title="Rozprosz Zaklęcie"><i class="fas fa-burst"></i></a>
                    <a class="item-controls item-delete" data-spell-id="${messageId}" title="Skasuj Zaklęcie"><i class="fas fa-trash"></i></a>
                </div>
            </li>`;
            }
            let element = 
            $(`
            <div style="width: 100%; text-align: center; flex: 0;"><h4>Aktywne zaklęcia</h4></div>
            <ol id="spell-tracker" style="min-height: 20%; flex: 0;" class="directory-list">
            ${rows}
            </ol>
            `)
        
            let newElement = element.insertBefore(html.find("#combat-controls"));
            newElement.find(".item-delete").click(async function () {
                let spells = game.combats.active.getFlag('wfrp4e-pl-addons', 'spells');
                if (!spells) {
                  spells = {};
                }
                spells[this.dataset.spellId] = null;
                await game.combats.active.setFlag('wfrp4e-pl-addons', 'spells', spells);
            });
            newElement.find(".item-dispel").click(async function () {
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
                let dispelValue = spell.castTest.data.result.itemData.system.cn.value + Number.parseInt(spell.castTest.data.result.SL);
                let dispelTest = actor.getItemTypes("extendedTest").find(x => x.getFlag('wfrp4e-pl-addons', 'messageId') == messageId);
                if (!dispelTest) {
                    dispelTestData = {
                        name : "Rozpraszanie Zaklęcia - " + spell.castTest.data.result.itemData.name,
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
    const previousId = combat.combatant?.id;
    const path = `wfrp4e-pl-addons.previousCombatant`;
    foundry.utils.setProperty(context, path, previousId);

    const prevPath = `wfrp4e-pl-addons.previousTR`;
    const prevTR = { T: combat.turn, R: combat.round };
    foundry.utils.setProperty(context, prevPath, prevTR);

    const startedPath = `wfrp4e-pl-addons.started`;
    const prevStarted = combat.started;
    foundry.utils.setProperty(context, startedPath, prevStarted);

    if (game.user.isGM) {
        if (combat.round != 0 && combat.turns && combat.active) {
            if (combat.current.turn > -1 && combat.current.turn == combat.turns.length - 1) {//end of round
                if (updateData.flags && updateData.flags['wfrp4e-pl-addons']) {
                    let moduleFlags = updateData.flags['wfrp4e-pl-addons'];
                    if (moduleFlags['spells'] !== null) return;
                }
                let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
                if (spells) {
                    for (let messageId in spells) {
                        if (spells[messageId]) {
                            let duration = spells[messageId].castTest.data.result.overcast.usage.duration;
                            if (duration.unit === 'rund' && Number.isInteger(duration.current) && duration.current > 0) {
                                duration.current = Number.parseInt(duration.current) - 1;
                            }
                        }
                    }
                    await combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
                }
            }
        }
    }
});