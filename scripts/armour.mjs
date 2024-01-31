export default class Armours {

    ready() {
        if (game.settings.get("wfrp4e-pl-addons", "alternativeArmour.Enable")) {
            game.wfrp4e.config.armorTypes = {
              "light": game.i18n.localize("WFRP4E.ArmourType.Light"),
              "medium": game.i18n.localize("WFRP4E.ArmourType.Medium"),
              "heavy": game.i18n.localize("WFRP4E.ArmourType.Heavy"),
              "other": game.i18n.localize("WFRP4E.ArmourType.Other")
            };

            game.wfrp4e.config.armorQualities.inner = "PROPERTY.Inner";
            game.wfrp4e.config.armorQualities.outer = "PROPERTY.Outer";
            game.wfrp4e.config.armorQualities.complementary = "PROPERTY.Complementary";
            game.wfrp4e.config.armorQualities.metal = "PROPERTY.Metal";
        }
    }

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "alternativeArmour.Enable")) {

            Reflect.defineProperty(SkillDialog.prototype, '_computeArmour', { value: 
                function () {
                    let wearingMedium = 0;
                    let wearingHeavy = 0;
                
                    for (let a of this.actor.itemTypes["armour"].filter(i => i.isEquipped)) {
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
                        this.fields.modifier += stealthPenaltyValue
                        this.tooltips.addModifier(stealthPenaltyValue, `Kara do Skradania ze względu na pancerz ciężki (max -20) i średni (max -20) - (+${stealthPenaltyValue})`);
                    }
                }
            });
        
        
            Reflect.defineProperty(StandardStatusModel.prototype, 'addArmourItem', { value:
                function (item) {
                    // If the armor protects a certain location, add the AP value of the armor to the AP object's location value
                    // Then pass it to addLayer to parse out important information about the armor layer, namely qualities/flaws
                    for (let loc in item.system.currentAP) {
                        if (item.system.currentAP[loc] > 0) {
                  
                          this.armour[loc].value += item.system.currentAP[loc];
                  
                          let layer = {
                            value: item.system.currentAP[loc],
                            armourType: item.system.armorType.value, // used for sound
                            source : item
                          }
                  
                          let properties = item.system.properties
                          layer.impenetrable = !!properties.qualities.impenetrable;
                          layer.partial = !!properties.flaws.partial;
                          layer.weakpoints = !!properties.flaws.weakpoints;
                          layer.magical = item.system.isMagical;
                          layer.metal = !!properties.qualities.metal;
                  
                          this.armour[loc].layers.push(layer);
                        }
                      }
                }
            });
        }
    }
}