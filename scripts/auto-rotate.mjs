import {constants} from './constants.mjs';

export default class AutoRotate {

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "autoRotate.Enable")) {
            Hooks.on("wfrp4e:rollWeaponTest", function(weaponTest, cardOptions) {
                if (weaponTest.context.defending) return;
                const attackToken = game.canvas.tokens.get(cardOptions.speaker.token);
                const defenderToken = game.canvas.tokens.get(weaponTest.context.targets[0]?.token);
                if (attackToken && defenderToken) {
                    attackToken.rotate(Math.atan2(attackToken.center.x - defenderToken.center.x, defenderToken.center.y - attackToken.center.y) * (180 / Math.PI))
                }
            });
        
            game.modules.get(constants.moduleId).api.customPrefillModifiers.calculateRotation = async function(args) {
                if (args.type != "trait" && args.type != "weapon") return;
                if (game.user.targets.size && (args.item.type === "weapon" || args.item.type === "trait") && args.item.attackType == "melee") {
    
                    const flankingBonus = game.settings.get("wfrp4e-pl-addons", "autoRotate.BonusFlanking");
                    const backBonus =  game.settings.get("wfrp4e-pl-addons", "autoRotate.BonuBehind");
    
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
                    const targeToken = game.user.targets.first();
                    const attackAngle = 
                        Math.abs(
                        (
                            (
                                Math.atan2
                                (
                                    targeToken.center.x - attackingToken.center.x, 
                                    attackingToken.center.y - targeToken.center.y
                                ) 
                                * (180 / Math.PI) 
                            )
                            - targeToken.document.rotation
                        )
                        % 360);
                    if ((attackAngle > frontRange1Min && attackAngle < frontRange1Max) || attackAngle > frontRange2Min && attackAngle < frontRange2Max) {
                        //do nothing - frontal attack
                    }
                    else if ((attackAngle >= rearRange1Min && attackAngle <= rearRange1Max) || attackAngle >= rearRange2Min && attackAngle <= rearRange2Max) {
                        let newScript = new WFRP4eScript({
                            script: 'args.prefillModifiers.modifier += ' + flankingBonus,
                            label:  `Atak z flanki (+${flankingBonus})`,
                            trigger: 'dialog',
                            options: { dialog: { activateScript: "return true" } }
                          });
                        return newScript;
                    }
                    else if (attackAngle > backRange1Min && attackAngle < backRange1Max) {
                        let newScript = new WFRP4eScript({
                            script: 'args.prefillModifiers.modifier += ' + backBonus,
                            label:  `Atak od tyłu (+${backBonus})`,
                            trigger: 'dialog',
                            options: { dialog: { activateScript: "return true" } }
                          });
                        return newScript;
                    }
                }
            }
        }
    }
}