
Hooks.on("setup", () => {  
    Reflect.defineProperty(TestWFRP.prototype, '_handleMiscasts', { value:
        function(miscastCounter)  {
            let mis = false;
            if (this.result.roll % 11 == 0) {
              mis = true;
            } else if (this.result.roll % 10 == 0 && this.preData.malignantInfluence) {
              mis = true;
            } else if (game.combats.active && game.combats.active.flags['wfrp4e-pl-addons']['winds']['tzeentch']) {
              if (this.result.roll.toString().split('').reverse()[0] == '9') {
                mis = true;
              }
            }
            if (game.wfrp4e.config.magicWind[this.spell.lore.value.toLowerCase()] == "Dhar" && this.result.roll.toString().includes("8")) {
              mis = true;
            } 

            if (mis) {
              let globalModifier = 0;
              this.result.mis = game.i18n.localize("Manifestacja Chaosu");
              const wind = game.wfrp4e.config.magicWind[this.spell.lore.value.toLowerCase()];
              let modifier = 0;
              if (game.combats.active && game.combats.active.flags['wfrp4e-pl-addons']['winds']) {
                modifier = game.combats.active.flags['wfrp4e-pl-addons']['winds']?.modifier.find(x=>x.wind == wind)?.modifier;

                if (modifier) {
                  console.log("Modyfikator z wiatrów magii: " + modifier);
                  this.result.tooltips.miscast.push("Modyfikator z wiatrów magii: " + modifier);
                  globalModifier += modifier;
                } else {
                  modifier = 0;
                }
              }
              console.log("Modyfikator z Punktów Zaklęcia: " + Number.parseInt(this.item.cn.SL) * 3);
              this.result.tooltips.miscast.push("Modyfikator z Punktów Zaklęcia: " + (Number.parseInt(this.item.cn.SL) * 3));
              globalModifier += Number.parseInt(this.item.cn.SL) * 3;
              
              if (!this.item.system.memorized.value) {
                console.log("Modyfikator z Księgi Zaklęć: " + 50);
                this.result.tooltips.miscast.push("Modyfikator z Księgi Zaklęć: " + 50);
                globalModifier += 50;
              }

              if (game.combats.active && game.combats.active.flags['wfrp4e-pl-addons']['winds']['tzeentch']) {
                console.log("Tzeentch: " + this.result.roll);
                this.result.tooltips.miscast.push("Tzeentch: " + this.result.roll);
                globalModifier += this.result.roll;
              }
              if (this.result.outcome == "failure") {
                console.log("Niezdany Test: " + 50);
                this.result.tooltips.miscast.push("Niezdany Test: " + 50);
                globalModifier += 50;
              }
              if (this.preData.unofficialGrimoire.ingredientMode == "power") {
                console.log("Użyto składnika Mocy: " + 50);
                this.result.tooltips.miscast.push("Użyto składnika Mocy: " + 50);
                globalModifier += 50;
              }
              if (this.preData.unofficialGrimoire.quickcasting) {
                console.log("Szybkie Czarowanie: " + 50);
                this.result.tooltips.miscast.push("Szybkie Czarowanie: " + 50);
                globalModifier += 50;
              }
              if (this.preData.unofficialGrimoire.overchannelling) {
                console.log("Nadsplatanie: " + (this.preData.unofficialGrimoire.overchannelling * 10));
                this.result.tooltips.miscast.push("Nadsplatanie: " + (this.preData.unofficialGrimoire.overchannelling * 10));
                globalModifier += this.preData.unofficialGrimoire.overchannelling * 10;
              }

              if (this.spell.lore.value.toLowerCase() == "petty") {
                console.log("Czar Prosty: " + -50);
                this.result.tooltips.miscast.push("Czar prosty: " + -50);
                globalModifier -= 50;
              }
              if (wind == "Dhar" && (this.preData.unofficialGrimoire.ingredientMode == 'none' || this.hasIngredient)) {
                console.log("Magia Dhar bez składnika: " + -50);
                this.result.tooltips.miscast.push("Magia Dhar bez składnika: " +50);
                globalModifier += 50;
              }
              if (wind == "Dhar" && this.result.roll == 88) {
                console.log("Magia Dhar 88: " +50);
                this.result.tooltips.miscast.push("Magia Dhar przy 88: " +50);
                globalModifier += 50;
              }

              if (this.preData.unofficialGrimoire.ingredientMode == "control") {
                console.log("Użyto składnika kontroli: " + -this.actor.characteristics.wp.value);
                this.result.tooltips.miscast.push("Użyto składnika kontroli: " + -this.actor.characteristics.wp.value);
                globalModifier -= this.actor.characteristics.wp.value;
              }
              if (this instanceof CastTest && this.actor.getItemTypes("talent").find(x=>x.name == "Precyzyjne Inkantowanie")) {
                console.log("Precyzyjne Inkantowanie: " + -this.actor.characteristics.wp.value);
                this.result.tooltips.miscast.push("Precyzyjne Inkantowanie: " + -this.actor.characteristics.wp.value);
                globalModifier -= this.actor.characteristics.wp.value;
              }
              if (this instanceof ChannelTest && this.actor.getItemTypes("talent").find(x=>x.name == "Zmysł Magii")) {
                console.log("Zmysł Magii: " + -this.actor.characteristics.wp.value);
                this.result.tooltips.miscast.push("Zmysł Magii: " + -this.actor.characteristics.wp.value);
                globalModifier -= this.actor.characteristics.wp.value;
              }
              this.result.miscastModifier = globalModifier;
              this.result.miscastTable = "miscast";
              const table = game.wfrp4e.tables.findTable("miscast" + wind?.toLowerCase())
              if (table) {
                let formula;
                if (modifier < 0) {
                  formula = `1d100 - ${Math.abs(modifier)}`
                } else {
                  formula = `1d100 + ${Math.abs(modifier)}`
                }
                if (Number.parseInt(new Roll("1d100").roll({async: false}).result) > 50) {
                  this.result.miscastTable = "miscast" + wind.toLowerCase();
                }
              }
            }
          }
    });
  });