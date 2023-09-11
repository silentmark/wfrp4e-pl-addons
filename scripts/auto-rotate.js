Hooks.on("wfrp4e:rollWeaponTest", function(weaponTest, cardOptions) {
    if (weaponTest.context.defending) return;
    const attackToken = game.canvas.tokens.get(cardOptions.speaker.token);
    const defenderToken = game.canvas.tokens.get(weaponTest.context.targets[0]?.token);
    if (attackToken && defenderToken) {
        attackToken.rotate(Math.atan2(attackToken.center.x - defenderToken.center.x, defenderToken.center.y - attackToken.center.y) * (180 / Math.PI))
    }
  });

  Hooks.on("init", function() {  
    game.wfrp4e.config.customPrefillModifiers.calculateFlanking = async function(item, type, options, tooltips, prefillModifiers) {
        if (type != "trait" && type != "weapon") return;
        if (game.user.targets.size && item.type === "weapon" && item.attackType == "melee") {

            const flankingBonus = 10;
            const backBonus = 20;

            const frontRange1Min = 0;
            const frontRange1Max = 90;
            const frontRange2Min = 270;
            const frontRange2Max = 360;
        
            const rearRange1Min = 91; 
            const rearRange1Max = 119;
            const rearRange2Min = 241;
            const rearRange2Max = 269;
        
            const backRange1Min = 120;
            const backRange1Max = 240;

            const attackingToken = this.getActiveTokens()[0];
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
            else if ((attackAngle > rearRange1Min && attackAngle < rearRange1Max) || attackAngle > rearRange2Min && attackAngle < rearRange2Max) {
                prefillModifiers.modifier += flankingBonus;
                tooltips.push(`Atak do flanki (+${backBonus})`);
            }
            else if (attackAngle > backRange1Min && attackAngle < backRange1Max) {
                prefillModifiers.modifier += backBonus;
                tooltips.push(`Atak od tyłu (+${backBonus})`);
            }
        }
    }
});