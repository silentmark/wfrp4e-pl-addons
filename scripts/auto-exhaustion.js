Hooks.on("preCreateCombatant", (combatant, data) => {
    combatant.updateSource({flags : {wfrp4e : {exhaustion: combatant.actor.characteristics.t.bonus }}});
});

Hooks.on("ready", () => {
    $('body').on('change', '.ce-modify-hp', (event) => {
        event.preventDefault();
        
        const dataset = event.currentTarget.dataset;
        let $input = $(event.currentTarget);
        let $actorRow = $input.parents('.directory-item.actor-elem');
        if (!$actorRow.length > 0 || !game.combat) return;
        
        const combatant = game.combat.combatants.find(c => c.id == $actorRow.data('combatant-id'));
        if (!combatant) return;
        let value = $input.val();
        combatant.setFlag('wfrp4e', 'exhaustion', value);
      });
});

Hooks.on("renderCombatTracker", (app, html, options) => {
    const combat = game.combats.active;
    if(combat) {
        let combatants = game.combat.turns;
        combatants.forEach(c => {
            let $combatant = html.find(`.combatant[data-combatant-id="${c.id}"]`);            
            let $exhaustionInput = $(`<div class="ce-modify-hp-wrapper">Wyczerpanie <input onclick="this.select();" class="ce-modify-hp" type="text" name="flags.wfrp4e.exhaustion" value="${c.flags?.wfrp4e?.exhaustion ?? c.actor.characteristics.t.bonus}" data-dtype="Number"></div>`);
            $combatant.find('.combatant-controls').append($exhaustionInput);
        });
    }
});

Hooks.on("updateCombat", async (combat, changes, context) => {
    if(getProperty(context, "wfrp4e-pl-addons.shouldReroll")) return;

    let cTurn = combat.current.turn;
    let pTurn = foundry.utils.getProperty(context, `wfrp4e.previousTR.T`);
    let cRound = combat.current.round;
    let pRound = foundry.utils.getProperty(context, `wfrp4e.previousTR.R`);

    if (changes?.flags && changes?.flags['wfrp4e-pl-addons'] && changes.flags['wfrp4e-pl-addons'].reroll) {
        pRound -= 1;
        changes.turn = cTurn;
        changes.round = cRound;
    }

    // no change in turns nor rounds.
    if (changes.turn === undefined && changes.round === undefined) return;
    // combat not started or not active.
    if (!combat.started || !combat.isActive) return;
    // we went back.
    if (cRound < pRound || (cTurn < pTurn && cRound === pRound)) return;

    if (combat.round != 1 && combat.turns && combat.active && cRound > 1 && combat.current.turn == 0) {
        for (let i = 0; i < combat.turns.length; i++) {
            let c = combat.turns[i];
            let exhaustion = c.flags?.wfrp4e?.exhaustion;
            if (exhaustion === undefined) exhaustion = c.actor.characteristics.t.bonus;
            exhaustion = Math.max(exhaustion - 1, 0);
            if (exhaustion == 0) {
                let test = await c.actor.setupSkill(game.i18n.localize('NAME.Endurance'));
                await test.roll();
                if (test.result.outcome == 'failure') {
                    await c.actor.addCondition('fatigued');
                    await c.setFlag('wfrp4e', 'exhaustion', c.actor.characteristics.t.bonus);
                } else {
                    await c.setFlag('wfrp4e', 'exhaustion', Number.parseInt(test.result.SL));
                }
            } else {
                await c.setFlag('wfrp4e', 'exhaustion', exhaustion);
            }
        }
    }
});