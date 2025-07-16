import { constants } from './constants.mjs';

/**
 *
 */
export default class AutoRotate {

    calculateRotation = function(args) {
        if (args.type != 'trait' && args.type != 'weapon') {
            return;
        }
        if (args.target && (args.item.type === 'weapon' || args.item.type === 'trait') && args.item.attackType == 'melee') {

            const flankingBonus = game.settings.get('wfrp4e-pl-addons', 'autoRotate.BonusFlanking');
            const backBonus = game.settings.get('wfrp4e-pl-addons', 'autoRotate.BonuBehind');

            const frontRange1Min = 0;
            const frontRange1Max = 90;
            const frontRange2Min = 270;
            const frontRange2Max = 360;

            const rearRange1Min = frontRange1Max;
            const rearRange1Max = 120;
            const rearRange2Min = 240;
            const rearRange2Max = frontRange2Min;

            const backRange1Min = rearRange1Max;
            const backRange1Max = rearRange2Min;

            const attackingToken = args.actor.getActiveTokens()[0];
            const targetToken = args.target.getActiveTokens()[0];

            if (attackingToken == null || targetToken == null) {
                return;
            }

            const attackAngle =
                Math.abs(
                    (
                        (
                            Math.atan2
                            (
                                targetToken.center.x - attackingToken.center.x,
                                attackingToken.center.y - targetToken.center.y
                            )
                            * (180 / Math.PI)
                        )
                        - targetToken.document.rotation
                    )
                    % 360);
            if ((attackAngle > frontRange1Min && attackAngle < frontRange1Max) || attackAngle > frontRange2Min && attackAngle < frontRange2Max) {
                //do nothing - frontal attack
            } else if ((attackAngle >= rearRange1Min && attackAngle <= rearRange1Max) || attackAngle >= rearRange2Min && attackAngle <= rearRange2Max) {
                const newScript = {
                    script: 'args.fields.modifier += ' + flankingBonus,
                    label: `Atak z flanki (+${flankingBonus})`,
                    trigger: 'dialog',
                    options: { activateScript: 'return true' }
                };
                return newScript;
            } else if (attackAngle > backRange1Min && attackAngle < backRange1Max) {
                const newScript = {
                    script: 'args.fields.modifier += ' + backBonus,
                    label: `Atak od tyłu (+${backBonus})`,
                    trigger: 'dialog',
                    options: { activateScript: 'return true' }
                };
                return newScript;
            }
        }
    };


    /**
     *
     */
    setup() {
        if (game.settings.get('wfrp4e-pl-addons', 'autoRotate.Enable')) {
            Hooks.on('wfrp4e:rollWeaponTest', function(weaponTest, cardOptions) {
                if (weaponTest.context.defending) {
                    return;
                }
                const attackToken = game.canvas.tokens.get(cardOptions.speaker.token);
                const defenderToken = game.canvas.tokens.get(weaponTest.context.targets[0]?.token);
                if (attackToken && defenderToken) {
                    attackToken.rotate(Math.atan2(attackToken.center.x - defenderToken.center.x, defenderToken.center.y - attackToken.center.y) * (180 / Math.PI));
                }
            });

            Hooks.on('wfrp4e:createRollDialog', (dialog) => {
                if (!dialog.options) {
                    dialog.options = {};
                }
                if (!dialog.options.scripts) {
                    dialog.options.scripts = [];
                }

                const script = game.modules.get(constants.moduleId).api.autoRotate.calculateRotation(dialog);
                if (script) {
                    dialog.options.scripts.push(script);
                }
            });
        }
    }
}
