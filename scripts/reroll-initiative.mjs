/**
 *
 */
export default class RerollInitiative {

    /**
     *
     */
    setup() {
        if (game.settings.get('wfrp4e-pl-addons', 'initiativeRoll.Enable')) {
            Hooks.on('preUpdateCombat', (combat, update, options, userId) => {
                if (!game.user.isUniqueGM) {
                    return;
                }

                if (update.flags && update.flags['wfrp4e-pl-addons']?.round) {
                    setProperty(update, 'round', update.flags['wfrp4e-pl-addons'].round);
                    setProperty(update, 'turn', 0);

                    setProperty(update, 'flags.wfrp4e-pl-addons.shouldReroll', null);
                    setProperty(update, 'flags.wfrp4e-pl-addons.round', null);

                    setProperty(options, 'direction', 1);
                    return;
                }

                // If we are not moving forward through the rounds, return
                if (!update.round) {
                    return;
                }
                if (update.round < 2 || update.round <= combat.previous.round) {
                    return;
                }

                setProperty(update, 'flags.wfrp4e-pl-addons.shouldReroll', true);
                setProperty(update, 'flags.wfrp4e-pl-addons.round', update.round);
                delete update.round;
                delete update.turn;
            });

            Hooks.on('updateCombat', async(combat, update, options, userId) => {
                const shouldReroll = foundry.utils.getProperty(update, 'flags.wfrp4e-pl-addons.shouldReroll');
                const round = foundry.utils.getProperty(update, 'flags.wfrp4e-pl-addons.round');
                if (!shouldReroll || !game.user.isUniqueGM) {
                    return;
                }

                const combatantIds = combat.combatants.map(c => c.id);

                await combat.rollInitiative(combatantIds, false);
                await combat.update({
                    flags: {
                        'wfrp4e-pl-addons': {
                            'round': round,
                            'shouldReroll': null
                        }
                    }
                });
            });

            Hooks.on('preCreateChatMessage', (doc, message, options, userid) => {
                if (message.flags !== undefined && message.flags?.core?.initiativeRoll) {
                    return false;
                }
            });
        }
    }
}
