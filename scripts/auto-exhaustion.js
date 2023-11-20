Hooks.on("preCreateCombatant", (combatant, data) => {
    combatant.updateSource({flags : {wfrp4e : {exhaustion: combatant.actor.characteristics.t.bonus }}});
});

Hooks.on("ready", () => {
    game.wfrp4e.combat.scripts.endRound.push(postExhaustionMessage);

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

Hooks.on('renderChatLog', (log, html, data) => {
    html.on("click", '.exhaustion-test', async event => {
        let combatantId = event.currentTarget.dataset.combatantId;
        const c = game.combat.combatants.find(c => c.id == combatantId);
        if (c) {
            let msgId = $(event.currentTarget).parents(".message").attr("data-message-id")
            let message = game.messages.get(msgId);
            let newData;
            let test = await c.actor.setupSkill(game.i18n.localize('NAME.Endurance'));            
            await test.roll();
            if (test.result.outcome == 'failure') {
                await c.actor.addCondition('fatigued');
                await c.setFlag('wfrp4e', 'exhaustion', c.actor.characteristics.t.bonus);
                newData = game.wfrp4e.utility.chatDataSetup(`<h2>Wyczerpanie: ${c.actor.name}</h2><p>Test odporności nie zdany, rund do kolejnego wyczerpania: ${c.actor.characteristics.t.bonus}, otrzymano stan Zmęczenie</p>`)
            } else {
                await c.setFlag('wfrp4e', 'exhaustion', Number.parseInt(test.result.SL));
                newData = game.wfrp4e.utility.chatDataSetup(`<h2>Wyczerpanie: ${c.actor.name}</h2><p>Test odporności zdany, rund do kolejnego wyczerpania: ${Number.parseInt(test.result.SL)}</p>`)
            }
            if (game.user.isGM)
                message.update(newData)
            else
                WFRP_Utility.awaitSocket(game.user, "updateMsg", { id: msgId, updateData: newData }, "executing condition script");
        }
      });
      html.on("click", '.exhaustion-rest', async event => {
        let combatantId = event.currentTarget.dataset.combatantId;
        const c = game.combat.combatants.find(c => c.id == combatantId);
        if (c) {
            await c.setFlag('wfrp4e', 'exhaustion', c.actor.characteristics.t.bonus);
            let msgId = $(event.currentTarget).parents(".message").attr("data-message-id")
            let message = game.messages.get(msgId);
            let newData = game.wfrp4e.utility.chatDataSetup(`<h2>Wyczerpanie: ${c.actor.name}</h2><p>Odpoczynek podczas najbliższej rundy, rund do kolejnego wyczerpania: ${c.actor.characteristics.t.bonus + 1}</p>`)
            if (game.user.isGM)
              message.update(newData)
            else
              WFRP_Utility.awaitSocket(game.user, "updateMsg", { id: msgId, updateData: newData }, "executing condition script");
        }
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

async function postExhaustionMessage (combat) {
    if (!game.user.isGM) return;

    for (let i = 0; i < combat.turns.length; i++) {
        let c = combat.turns[i];
        let exhaustion = c.flags?.wfrp4e?.exhaustion;
        if (exhaustion === undefined) exhaustion = c.actor.characteristics.t.bonus;
        exhaustion = Math.max(exhaustion - 1, 0);
        await c.setFlag('wfrp4e', 'exhaustion', exhaustion);
        if (exhaustion == 0) {
            msgContent = `
            <h2>Wyczerpanie: ${c.actor.name}</h2>
            <a class="chat-button exhaustion-test" data-combatant-id="${c.id}">Test Odporności</a> lub <a class="chat-button exhaustion-rest" data-combatant-id="${c.id}">Opuszczenie następnej rundy</a>`;
            await ChatMessage.create({ content: msgContent, speaker: { alias: c.actor.name } });
        }
    }
}