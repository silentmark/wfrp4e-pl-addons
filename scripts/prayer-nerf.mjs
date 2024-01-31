import {constants} from './constants.mjs';

export default class PrayerNerf {

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "prayerNerf.Enabled")) {
           
            game.modules.get(constants.moduleId).api.customPrefillModifiers.calculatePrayerNerf = async function(args) {
                if (game.combats.active == null || !game.combats.active.active) return;
                if (args.type != "prayer") return;
                const combatant = game.combats.active.combatants.find(x => x.actorId == args.actor.id);
                if (combatant == null) return;
                let prayers = combatant.getFlag("wfrp4e-pl-addons", "prayers") ?? {}
                if (prayers[args.item.id] == null || prayers[args.item.id] == 0) return;
                
                let tooltip = "Liczba wysłuchanych modlitw: " + prayers[args.item.id];
                const modifier = prayers[args.item.id] * -10;
                tooltip += ` (${modifier})`;
                let newScript = new WFRP4eScript({
                    script: 'args.prefillModifiers.modifier += ' + modifier,
                    label:  tooltip,
                    trigger: 'dialog',
                    options: { dialog: { activateScript: "return true" } }
                  });
                return newScript;
            }
            
            Hooks.on("wfrp4e:rollPrayerTest", function(prayerTest, cardOptions) {
                    if (game.combats.active == null || !game.combats.active.active) return;
                    const combatant = game.combats.active.combatants.find(x => x.actorId == prayerTest.actor.id);
                    if (combatant == null) return;
                    let prayers = combatant.getFlag("wfrp4e-pl-addons", "prayers") ?? {}
                    if (prayerTest.data.result.outcome == "success")
                        prayers[prayerTest.item.id] = (prayers[prayerTest.item.id] || 0) + 1;
                    else 
                        prayers[prayerTest.item.id] = Math.max((prayers[prayerTest.item.id] || 0) - 1, 0);
                    combatant.setFlag("wfrp4e-pl-addons", "prayers", prayers);
            });
        }
    }
}
