export default class AutoCounterSpell {

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "counterSpells.Enable")) {
            
            let updateCombatCasters = async function (combat) {
                if (game.user.isGM && combat.active) {
                    let casters = combat.getFlag('wfrp4e-pl-addons', 'casters');
                    if (!casters) {
                        casters = {};
                    }
                    let actorIds = combat.combatants.map(x => x.actorId);
                    for (let i = 0; i < actorIds.length; i++) { 
                        let actor = game.actors.get(actorIds[i]);
                        let skills = actor.itemTypes['skill'].filter(x=> x.name === "Język (Magiczny)");
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

            CombatHelpers.startTurn.push(updateCombatCasters);

            let castOpposedClicked = async function(event) {
                if (!event.target.classList.contains("wfrp4e-addon-opposed-toggle")) return;
                if(game.combats.active) {
                    const combat = game.combats.active;
                    const button = $(event.currentTarget);
                    const tokenId = button.attr("data-token");
                    const actorId = button.attr("data-actor");
                    const messageId = button.parents('.message').prev().attr("data-message-id");
                    const message = game.messages.get(messageId);
                    const test = message.system.test;
                    const token = game.scenes.current.tokens.get(tokenId);
                    await test.createOpposedMessage(token);
                    
                    let casters = combat.getFlag('wfrp4e-pl-addons', 'casters');
                    casters[actorId] = true;
                    await combat.setFlag('wfrp4e-pl-addons', 'casters', casters);
                }
            }

            // Activate chat listeners defined in chat-wfrp4e.js
            Hooks.on('renderChatLog', (log, html, data) => {
                html.addEventListener("click", castOpposedClicked.bind(this));
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
                //TODO: TEST THIS - may not work anymore
                if (opposedData.data.attackerTestData.preData.rollClass == "CastTest"
                    && opposedData.data.defenderTestData.preData.rollClass == "SkillTest" 
                    && opposedData.data.defenderTestData.preData.skillName == "Język (Magiczny)" 
                    && opposedData.data.opposeResult.winner === 'attacker') {

                        const messageId = attackerTest.data.context.messageId;
                        const message = game.messages.get(messageId);
                        const test = message.system.test;
                        test.preData.SL = opposedData.data.opposeResult.differenceSL;
                        await test.updateMessageFlags();
                        await test.computeResult();
                        await test.renderRollCard();
                }
            });
        }
    }
}