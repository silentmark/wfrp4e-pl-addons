export default class AutoCounterSpell {

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "counterSpells.Enable")) {
            let updateCombatCasters = async function (combat, currentCombatant) {
                if (game.user.isGM && combat.active) {
                    let casters = combat.getFlag('wfrp4e-pl-addons', 'casters');
                    if (!casters) {
                        casters = {};
                    }
                    let actorIds = combat.combatants.map(x=>x.actorId);
                    for (let i = 0; i < actorIds.length; i++) { 
                        let actor = game.actors.get(actorIds[i]);
                        let skills = actor.getItemTypes('skill').filter(x=> x.name === "Język (Magiczny)");
                        if (skills.length == 0) {
                            continue;
                        }
                        if (!casters[actorIds[i]]) {
                            casters[actorIds[i]] = false;
                        }
                    }
                    await combat.setFlag('wfrp4e-pl-addons', 'casters', casters);
                }
            };
            game.wfrp4e.combat.scripts.startTurn.push(updateCombatCasters);

            let castOpposedClicked = async function(event) {
                if(game.combats.active) {
                    const combat = game.combats.active;
                    const button = $(event.currentTarget);
                    const tokenId = button.attr("data-token");
                    const actorId = button.attr("data-actor");
                    const messageId = button.parents('.message').prev().attr("data-message-id");
                    const message = game.messages.get(messageId);
                    const test = message.getTest();
                    const token = game.scenes.current.tokens.get(tokenId);
                    await test.createOpposedMessage(token);
                    
                    let casters = combat.getFlag('wfrp4e-pl-addons', 'casters');
                    casters[actorId] = true;
                    await combat.setFlag('wfrp4e-pl-addons', 'casters', casters);
                }
            }

            // Activate chat listeners defined in chat-wfrp4e.js
            Hooks.on('renderChatLog', (log, html, data) => {
                html.on('click', '.wfrp4e-addon-opposed-toggle', castOpposedClicked.bind(this));
            });
            
            Hooks.on("preUpdateCombat", async function (combat, updateData) {
                if (game.user.isGM) {
                    if (combat.round != 0 && combat.turns && combat.active) {
                        if (combat.current.turn > -1 && combat.current.turn == combat.turns.length - 1) {
                            let casters = combat.getFlag('wfrp4e-pl-addons', 'casters');
                            if (updateData.flags && updateData.flags['wfrp4e-pl-addons']) {
                                let moduleFlags = updateData.flags['wfrp4e-pl-addons'];
                                if (moduleFlags['-=casters'] === null) return;
                            }
                            if (casters) {
                                await combat.unsetFlag('wfrp4e-pl-addons', 'casters');
                            }
                        }
                    }
                }
            });

            Hooks.on("wfrp4e:rollCastTest", async function(castData, chatData) {
                if (castData.data.result.castOutcome == "success" && game.combats.active) {
                    const casterId = chatData.speaker.actor;
                    const combat = game.combats.active;
                    let casters = combat.getFlag('wfrp4e-pl-addons', 'casters');
                    let potentialDefenders = [];
                    if (casters) {
                        let combatants = combat.combatants.map(x=>x);
                        for (let i = 0; i < combatants.length; i++) { 
                            let actorId = combatants[i].actorId;
                            if (typeof(casters[actorId]) !== 'undefined' && !casters[actorId] && actorId !== casterId) {
                                potentialDefenders.push(combatants[i]);
                            }
                        }
                    }
                    if (potentialDefenders.length > 0) {
                        let message = "";
                        for (let i = 0; i < potentialDefenders.length; i++) {
                            message += `<tr><td>
                                <span id='defender-"${potentialDefenders[i].tokenId}' class='cast-defender'>${potentialDefenders[i].name}</span>
                                <a class="wfrp4e-addon-opposed-toggle chat-button-gm" data-actor='${potentialDefenders[i].actorId}' data-token='${potentialDefenders[i].tokenId}' title='{{localize "CHAT.OpposedTest"}}'><i class="fas fa-exchange-alt"></i></a>
                            </td></tr>`
                        }
                        message = `<p><strong>Następujący walczący mogą Rozproszyć Magię:</strong><br/><table>${message}</table></p>`;
                        setTimeout(() => { ChatMessage.create({ content: message }); }, 1000);
                    }
                }
            });

            Hooks.on("wfrp4e:opposedTestResult", async function(opposedData, attackerTest, defenderTest) {
                if (opposedData.data.attackerTestData.preData.rollClass == "CastTest"
                    && opposedData.data.defenderTestData.preData.rollClass == "SkillTest" 
                    && opposedData.data.defenderTestData.preData.skillName == "Język (Magiczny)" 
                    && opposedData.data.opposeResult.winner === 'attacker') {

                        const messageId = attackerTest.data.context.messageId;
                        const message = game.messages.get(messageId);
                        const test = message.getTest();
                        test.preData.SL = opposedData.data.opposeResult.differenceSL;
                        await test.updateMessageFlags();
                        await test.computeResult();
                        await test.renderRollCard();
                }
            });
        }
    }
}