export default class RerollInitiative {

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "initiativeRoll.Enable")) {
            Hooks.on("preUpdateCombat", (combat, update, options, userId) => {
                // Return early if we are NOT a GM OR we are not the player that triggered the update AND that player IS a GM
                const roundUpdate = hasProperty(update, "round");
        
                // Return if this update does not contains a round
                if (!roundUpdate) return;
        
                // If we are not moving forward through the rounds, return
                if (update.round < 2 || update.round < combat.previous.round) return;
        
                const gmUsers = game.users.contents.filter(u => u.isGM);
                const gmUserId = game.user.isGM ? game.userId : gmUsers.length ? gmUsers[0].id : null;
        
                if (!gmUserId) return;
        
                setProperty(options, `wfrp4e-pl-addons.shouldReroll`, true);
                setProperty(options, `wfrp4e-pl-addons.rerollUserId`, gmUserId);
            });
            
            Hooks.on("updateCombat", async (combat, update, options, userId) => {
                const shouldReroll = getProperty(options, `wfrp4e-pl-addons.shouldReroll`);
                const rerollUserId = getProperty(options, `wfrp4e-pl-addons.rerollUserId`);
        
                if (!shouldReroll || game.userId != rerollUserId) return;
        
                const combatantIds = combat.combatants.map(c => c.id);
                await combat.rollInitiative(combatantIds);
                await combat.update({turn: 0, round: update.round, flags: {'wfrp4e-pl-addons': {'reroll': update.round }}});
            });

            Hooks.on('preCreateChatMessage', (doc, message, options, userid) => {
                if (message.flags !== undefined && message.flags?.core?.initiativeRoll) {
                    return false;
                }
            });
        }
    }
}
