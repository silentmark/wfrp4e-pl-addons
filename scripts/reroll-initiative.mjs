export default class RerollInitiative {

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "initiativeRoll.Enable")) {
            Hooks.on("preUpdateCombat", (combat, update, options, userId) => {
                if (!game.user.isUniqueGM) return;

                const roundUpdate = hasProperty(update, "round");
                if (!roundUpdate) return;
        
                // If we are not moving forward through the rounds, return
                if (update.round < 2 || update.round < combat.previous.round) return;
        
                setProperty(options, `wfrp4e-pl-addons.shouldReroll`, true);
            });
            
            Hooks.on("updateCombat", async (combat, update, options, userId) => {
                const shouldReroll = getProperty(options, `wfrp4e-pl-addons.shouldReroll`);        
                if (!shouldReroll || !game.user.isUniqueGM) return;
        
                const combatantIds = combat.combatants.map(c => c.id);
                let previousCombatant = options.wfrp4e.previousCombatant;
                
                await combat.rollInitiative(combatantIds, false);
                await combat.update({turn: 0, round: update.round, flags: { 'wfrp4e-pl-addons': { 'reroll': update.round }}}, {'wfrp4e-pl-addons': {'pc': previousCombatant}});
            });

            Hooks.on('preCreateChatMessage', (doc, message, options, userid) => {
                if (message.flags !== undefined && message.flags?.core?.initiativeRoll) {
                    return false;
                }
            });
        }
    }
}
