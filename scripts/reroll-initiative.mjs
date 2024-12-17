export default class RerollInitiative {

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "initiativeRoll.Enable")) {
            Hooks.on("preUpdateCombat", (combat, update, options, userId) => {
                if (!game.user.isUniqueGM) return;

                const roundUpdate = foundry.utils.hasProperty(update, "round");
                if (!roundUpdate) return;
                const reroll = foundry.utils.getProperty(update, `flags.wfrp4e-pl-addons.reroll`);
                if (reroll == update.round) return;
        
                // If we are not moving forward through the rounds, return
                if (update.round < 2 || update.round < combat.previous.round) return;
        
                setProperty(options, `wfrp4e-pl-addons.shouldReroll`, true);
            });
            
            Hooks.on("updateCombat", async (combat, update, options, userId) => {
                const shouldReroll = foundry.utils.getProperty(options, `wfrp4e-pl-addons.shouldReroll`);
                if (!shouldReroll || !game.user.isUniqueGM) return;
                if (!update.round) return;
        
                const combatantIds = combat.combatants.map(c => c.id);

                await combat.rollInitiative(combatantIds, false);
                await combat.update({turn: 0, round: update.round, flags: { 'wfrp4e-pl-addons': { 'reroll': update.round, 'shouldReroll': false }}});
            });

            Hooks.on('preCreateChatMessage', (doc, message, options, userid) => {
                if (message.flags !== undefined && message.flags?.core?.initiativeRoll) {
                    return false;
                }
            });
        }
    }
}
