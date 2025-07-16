import { constants } from './constants.mjs';

/**
 *
 */
export default class PrayerNerf {

    calculatePrayerNerf = function(args) {
        if (game.combat === null || !game.combat.active) {
            return;
        }
        if (args.type !== 'prayer') {
            return;
        }

        const combatant = game.combat.combatants.find(x => x.actorId === args.actor.id);
        if (combatant === null) {
            return;
        }

        const prayers = combatant.getFlag('wfrp4e-pl-addons', 'prayers') ?? {};
        if (prayers[args.item.id] === null || prayers[args.item.id] === 0) {
            return;
        }

        let tooltip = 'Liczba wysłuchanych modlitw: ' + prayers[args.item.id];
        const modifier = prayers[args.item.id] * -10;
        tooltip += ` (${modifier})`;
        const newScript = {
            script: 'args.fields.modifier += ' + modifier,
            label:  tooltip,
            trigger: 'dialog',
            options: {  activateScript: 'return true' }
        };
        return newScript;
    };

    /**
     *
     */
    setup() {
        if (game.settings.get('wfrp4e-pl-addons', 'prayerNerf.Enabled')) {

            Hooks.on('wfrp4e:rollPrayerTest', function(prayerTest) {
                if (game.combat === null || !game.combat.active) {
                    return;
                }
                const combatant = game.combat.combatants.find(x => x.actorId === prayerTest.actor.id);
                if (combatant === null) {
                    return;
                }
                const prayers = combatant.getFlag('wfrp4e-pl-addons', 'prayers') ?? {};
                if (prayerTest.data.result.outcome === 'success') {
                    prayers[prayerTest.item.id] = (prayers[prayerTest.item.id] || 0) + 1;
                } else {
                    prayers[prayerTest.item.id] = Math.max((prayers[prayerTest.item.id] || 0) - 1, 0);
                }
                combatant.setFlag('wfrp4e-pl-addons', 'prayers', prayers);
            });

            Hooks.on('wfrp4e:createRollDialog', (dialog) => {
                if (!dialog.options) {
                    dialog.options = {};
                }
                if (!dialog.options.scripts) {
                    dialog.options.scripts = [];
                }

                const script = game.modules.get(constants.moduleId).api.prayerNerf.calculatePrayerNerf(dialog);
                if (script) {
                    dialog.options.scripts.push(script);
                }
            });
        }
    }
}
