
Hooks.on("setup", () => {    
    if (game.settings.get("wfrp4e-pl-addons", "alternativeArmour.Enable")) {

        Reflect.defineProperty(ActorWfrp4e.prototype, 'armourPrefillModifiers', { value: 
            function (item, type, options, tooltip = []) {
    
                let modifier = 0;
                let wearingMedium = 0;
                let wearingHeavy = 0;
            
                for (const a of this.getItemTypes("armour").filter(i => i.isEquipped)) {
                    // For each armor, apply its specific penalty value, as well as marking down whether
                    // it qualifies for armor type penalties (wearingMail/Plate)
            
                    // Skip practical
                    if (a.properties.qualities.practical)
                    continue;
            
                    if (a.armorType.value === "medium")
                    wearingMedium += 1;
                    if (a.armorType.value === "heavy")
                    wearingHeavy += 1;
                }
                wearingMedium = Math.min(wearingMedium, 2);
                wearingHeavy = Math.min(wearingHeavy, 2);
            
                let stealthPenaltyValue = 0;        
                if (wearingMedium)
                    stealthPenaltyValue += -10 * wearingMedium;
                if (wearingHeavy)
                    stealthPenaltyValue += -10 * wearingHeavy;
            
                if (type === "skill" && item.name.includes(game.i18n.localize("NAME.Stealth"))) {
                    if (stealthPenaltyValue) {
                    modifier += stealthPenaltyValue
                    tooltip.push(`Kara do Skradania ze względu na pancerz ciężki (max -20) lub średni (max -20) - (+${stealthPenaltyValue})`);
                    }
                }
                return modifier;
            }
        });
    
    
        Reflect.defineProperty(ItemWfrp4e.prototype, '_addAPLayer', { value:
            function (AP) {
                // If the armor protects a certain location, add the AP value of the armor to the AP object's location value
                // Then pass it to addLayer to parse out important information about the armor layer, namely qualities/flaws
                for (const loc in this.currentAP) {
                    if (this.currentAP[loc] > 0) {
                        AP[loc].value += this.currentAP[loc];
        
                        const layer = {
                            value: this.currentAP[loc],
                            armourType: this.armorType.value // used for sound
                        }
        
                        const properties = this.properties
                        layer.impenetrable = !!properties.qualities.impenetrable;
                        layer.partial = !!properties.flaws.partial;
                        layer.weakpoints = !!properties.flaws.weakpoints;
        
                        if (this.system.special?.value && this.system.special?.value?.indexOf('Metal') !== -1) {
                            layer.metal = true;
                        }
                        if (this.system.special?.value && this.system.special?.value?.indexOf('Magiczny') !== -1) {
                            layer.magic = true;
                        }
        
                        AP[loc].layers.push(layer);
                    }
                }
            }
        });
    
        Reflect.defineProperty(ItemWfrp4e.prototype, '_armourExpandData', { value:
            function()  {
                const data = this.toObject().system
                const properties = [];
                properties.push(game.wfrp4e.config.armorTypes[this.armorType.value]);
                const special = data.special?.value?.split(',');
                if (special) {
                    for(let i = 0; i < special.length; i++) {
                        properties.push(special[i]);
                    }
                }
                const itemProperties = this.Qualities.concat(this.Flaws)
                for (const prop of itemProperties) {
                    properties.push(`<a class ='item-property'>${prop}</a>`);
                }
                properties.push(this.penalty.value);
                data.properties = properties.filter(p => !!p);
                return data;
            }
        });
    }
});