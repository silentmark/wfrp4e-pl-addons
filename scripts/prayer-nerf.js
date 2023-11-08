Hooks.on("init", function() {
    //if (game.settings.get("wfrp4e-pl-addons", "autoOutnumbered.Enable")) {

      game.wfrp4e.config.customPrefillModifiers.calculatePrayerNerf = async function(item, type, options, tooltips, prefillModifiers) {
        if (game.combats.active == null || !game.combats.active.active) return;
        if (type != "prayer") return;
        const combatant = game.combats.active.combatants.find(x=>x.actorId == item.actor.id);
        if (combatant == null) return;
        let prayers = combatant.getFlag("wfrp4e-pl-addons", "prayers") ?? {}
        if (prayers[item.id] == null || prayers[item.id] == 0) return;
        
        let tooltip = "Liczba wysłuchanych modlitw: " + prayers[item.id];
        const modifier = prayers[item.id] * -10;
        prefillModifiers.modifier += modifier
        tooltip += ` (${modifier})`;
        tooltips.push(tooltip);
      }
    //}
});

Hooks.on("wfrp4e:rollPrayerTest", function(prayerTest, cardOptions) {
    //if (game.settings.get("wfrp4e-pl-addons", "autoRotate.Enable")) {
        if (game.combats.active == null || !game.combats.active.active) return;
        const combatant = game.combats.active.combatants.find(x=>x.actorId == prayerTest.actor.id);
        if (combatant == null) return;
        let prayers = combatant.getFlag("wfrp4e-pl-addons", "prayers") ?? {}
        if (prayerTest.data.result.outcome == "success")
            prayers[prayerTest.item.id] = (prayers[prayerTest.item.id] || 0) + 1;
        else 
            prayers[prayerTest.item.id] = Math.max((prayers[prayerTest.item.id] || 0) - 1, 0);
        combatant.setFlag("wfrp4e-pl-addons", "prayers", prayers);
    //}
});