/**
 * Alternative Armour system for WFRP4e
 * Provides enhanced armor type functionality and calculations
 */
export default class AlternativeArmour {
    /**
     * Ready hook - initializes armor configuration when the setting is enabled
     */
    ready() {
        if (game.settings.get('wfrp4e-pl-addons', 'alternativeArmour.Enable')) {
            game.wfrp4e.config.armorTypes = {
                'light': game.i18n.localize('WFRP4E.AlternativeArmour.ArmourType.Light'),
                'medium': game.i18n.localize('WFRP4E.AlternativeArmour.ArmourType.Medium'),
                'heavy': game.i18n.localize('WFRP4E.AlternativeArmour.ArmourType.Heavy'),
                'other': game.i18n.localize('WFRP4E.AlternativeArmour.ArmourType.Other')
            };

            game.wfrp4e.config.armorQualities.inner = game.i18n.localize('PROPERTY.Inner');
            game.wfrp4e.config.armorQualities.complementary = game.i18n.localize('PROPERTY.Complementary');
            game.wfrp4e.config.armorQualities.outer = game.i18n.localize('PROPERTY.Outer');
            game.wfrp4e.config.armorQualities.metal = game.i18n.localize('PROPERTY.Metal');
        }
    }

    /**
     * Setup hook - defines armor-related property overrides and calculations
     */
    setup() {
        if (game.settings.get('wfrp4e-pl-addons', 'alternativeArmour.Enable')) {

            Reflect.defineProperty(ArmourModel.prototype, 'isMetal', {
                get() {
                    return this.properties.qualities.metal?.key === 'metal';
                }
            });

            Reflect.defineProperty(SkillDialog.prototype, '_computeArmour', { value:
                function() {
                    let wearingMedium = 0;
                    let wearingHeavy = 0;

                    for (const a of this.actor.itemTags['armour'].filter(i => i.isEquipped)) {
                        if (a.properties.qualities.practical) {
                            continue;
                        }

                        if (a.armorType.value === 'medium') {
                            wearingMedium += 1;
                        }
                        if (a.armorType.value === 'heavy') {
                            wearingHeavy += 1;
                        }
                    }
                    const maxArmorPieces = 2;
                    const stealthPenaltyPerPiece = 10;
                    wearingMedium = Math.min(wearingMedium, maxArmorPieces);
                    wearingHeavy = Math.min(wearingHeavy, maxArmorPieces);
                    let stealthPenaltyValue = 0;
                    if (wearingMedium !== 0) {
                        stealthPenaltyValue += -stealthPenaltyPerPiece * wearingMedium;
                    }
                    if (wearingHeavy !== 0) {
                        stealthPenaltyValue += -stealthPenaltyPerPiece * wearingHeavy;
                    }
                    if (this.item.name.includes(game.i18n.localize('NAME.Stealth')) && stealthPenaltyValue !== 0) {
                        this.fields.modifier += stealthPenaltyValue;
                        const stealthPenaltyText = game.i18n.localize('WFRP4E.AlternativeArmour.ModifierDescription') +
                            `(+${stealthPenaltyValue})`;
                        this.tooltips.addModifier(stealthPenaltyValue, stealthPenaltyText);
                    }
                }
            });
        }
    }
}
