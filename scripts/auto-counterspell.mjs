import wfrp4ePlAddon from './constants.mjs';
import { CounterSpellMessageModel } from './models/counter-spell.mjs';

/**
 *
 */
export default class AutoCounterSpell {

    /**
     *
     */
    setup() {
        if (game.settings.get(wfrp4ePlAddon.moduleId, 'counterSpells.Enable')) {

            const updateCombatCasters = async function(combat) {
                if (game.user.isGM && combat.active) {
                    const casters = combat.getFlag(wfrp4ePlAddon.moduleId, 'casters') ?? {};
                    const actorIds = combat.combatants.map(x => x.actorId);
                    for (const actorId of actorIds) {
                        const actor = game.actors.get(actorId);
                        const skill = actor.itemTypes['skill'].find(x=> x.name === 'Język (Magiczny)');
                        if (!skill) {
                            continue;
                        }
                        casters[actorId] = casters[actorId] ?? false;
                    }
                    await combat.setFlag(wfrp4ePlAddon.moduleId, 'casters', casters);
                }
            };

            const updateCombatCastersRound = async function(combat) {
                if (game.user.isGM && combat.active) {
                    const casters = {};
                    const actorIds = combat.combatants.map(x => x.actorId);
                    for (const actorId of actorIds) {
                        const actor = game.actors.get(actorId);
                        const skill = actor.itemTypes['skill'].find(x=> x.name === 'Język (Magiczny)');
                        if (!skill) {
                            continue;
                        }
                        casters[actorId] = casters[actorId] ?? false;
                    }
                    await combat.setFlag(wfrp4ePlAddon.moduleId, 'casters', casters);
                }
            };

            CombatHelpers.endRound.push(updateCombatCastersRound);
            CombatHelpers.startTurn.push(updateCombatCasters);

            Hooks.on('wfrp4e:rollCastTest', async function(castTest, chatData) {
                if (castTest.result.castOutcome === 'success' && game.combat) {
                    const casterId = chatData.speaker.actor;
                    const combat = game.combat;
                    const casters = combat.getFlag(wfrp4ePlAddon.moduleId, 'casters');
                    const potentialDefenders = [];
                    if (casters) {
                        combat.combatants.forEach(combatant => {
                            const { actorId } = combatant;
                            if (casters[actorId] === false && actorId !== casterId) {
                                potentialDefenders.push(combatant);
                            }
                        });
                    }
                    await sleep(1000);
                    await CounterSpellMessageModel.createCounterSpellMessage(potentialDefenders, chatData);
                }
            });

            Hooks.on('wfrp4e:opposedTestResult', async function(opposedData, attackerTest, defenderTest) {
                //TODO: TEST THIS - may not work anymore
                if ((attackerTest.preData.rollClass === 'CastTest' || attackerTest.preData.rollClass === 'WomCastTest')
                    && defenderTest.preData.rollClass === 'SkillTest'
                    && defenderTest.preData.skillName === 'Język (Magiczny)'
                    && opposedData.data.opposeResult.winner === 'attacker') {

                    attackerTest.preData.postOpposedModifiers.SL -= parseInt(defenderTest.result.SL);
                    attackerTest.result.other.push(`<p>${defenderTest.data.context.speaker.alias}: kontr-zaklęcie - ${defenderTest.result.SL} PS</p>`);
                    await sleep(500);
                    await attackerTest.computeResult();
                    await attackerTest.renderRollCard();
                }
            });
        }
    }
}