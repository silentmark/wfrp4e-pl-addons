class Armours {

    ready() {
        if (game.settings.get("wfrp4e-pl-addons", "alternativeArmour.Enable")) {
            game.wfrp4e.config.armorTypes = {
              "light": game.i18n.localize("WFRP4E.ArmourType.Light"),
              "medium": game.i18n.localize("WFRP4E.ArmourType.Medium"),
              "heavy": game.i18n.localize("WFRP4E.ArmourType.Heavy"),
              "other": game.i18n.localize("WFRP4E.ArmourType.Other")
            };

            game.wfrp4e.config.armorQualities.inner =  game.i18n.localize("PROPERTY.Inner");
            game.wfrp4e.config.armorQualities.complementary =  game.i18n.localize("PROPERTY.Complementary");
            game.wfrp4e.config.armorQualities.outer =  game.i18n.localize("PROPERTY.Outer");
            game.wfrp4e.config.armorQualities.metal =  game.i18n.localize("PROPERTY.Metal");
        }
    }

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "alternativeArmour.Enable")) {

            Reflect.defineProperty(ArmourModel.prototype, 'isMetal', { 
                get() {
                    return this.properties.qualities.metal?.key == "metal";
                }
            });

            
            Reflect.defineProperty(SkillDialog.prototype, '_computeArmour', { value: 
                function () {
                    let wearingMedium = 0;
                    let wearingHeavy = 0;
                
                    for (let a of this.actor.itemTags["armour"].filter(i => i.isEquipped)) {
                        if (a.properties.qualities.practical) {
                            continue;
                        }

                        if (a.armorType.value === "medium") {
                            wearingMedium += 1;
                        }
                        if (a.armorType.value === "heavy") {
                            wearingHeavy += 1;
                        }
                    }
                    wearingMedium = Math.min(wearingMedium, 2);
                    wearingHeavy = Math.min(wearingHeavy, 2);
                    let stealthPenaltyValue = 0;
                    if (wearingMedium !== 0) {
                        stealthPenaltyValue += -10 * wearingMedium;
                    }
                    if (wearingHeavy !== 0) {
                        stealthPenaltyValue += -10 * wearingHeavy;
                    }
                    if (this.item.name.includes(game.i18n.localize("NAME.Stealth")) && stealthPenaltyValue !== 0) {
                        this.fields.modifier += stealthPenaltyValue;
                        this.tooltips.addModifier(stealthPenaltyValue, `Kara do Skradania ze względu na pancerz ciężki (max -20) i średni (max -20) - (+${stealthPenaltyValue})`);
                    }
                }
            });

        }
    }
}

export { Armours as default };
