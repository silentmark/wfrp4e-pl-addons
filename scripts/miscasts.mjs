export default class Miscasts {

  setup() {
    if (game.settings.get("wfrp4e-pl-addons", "alternativeMiscasts.Enable")) {
      Reflect.defineProperty(TestWFRP.prototype, '_handleMiscasts', { value:
        function(miscastCounter)  {
            const maxRandom = 25;
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
              let spellCn = Math.max(Number.parseInt(this.item.cn.SL), Number.parseInt(this.item.cn.value)) * 3;
              console.log("Modyfikator z Punktów Zaklęcia: " + spellCn);
              this.result.tooltips.miscast.push("Modyfikator z Punktów Zaklęcia: " + spellCn);
              globalModifier += spellCn;
              
              if (!this.item.system.memorized.value) {
                let random = Math.floor(Math.random() * maxRandom) + 50;
                console.log("Modyfikator z Księgi Zaklęć: " + random);
                this.result.tooltips.miscast.push("Modyfikator z Księgi Zaklęć: " + random);
                globalModifier += 50;
              }

              if (game.combats.active && game.combats.active.flags['wfrp4e-pl-addons']['winds']['tzeentch']) {
                console.log("Tzeentch: " + this.result.roll);
                this.result.tooltips.miscast.push("Tzeentch: " + this.result.roll);
                globalModifier += this.result.roll;
              }
              if (this.result.outcome == "failure") {
                let random = Math.floor(Math.random() * maxRandom) + 50;
                console.log("Niezdany Test: " + random);
                this.result.tooltips.miscast.push("Niezdany Test: " + random);
                globalModifier += random;
              }
              if (this.preData.unofficialGrimoire.ingredientMode == "power") {
                let random = Math.floor(Math.random() * maxRandom) + 50;
                console.log("Użyto składnika Mocy: " + random);
                this.result.tooltips.miscast.push("Użyto składnika Mocy: " + random);
                globalModifier += random;
              }
              if (this.preData.unofficialGrimoire.quickcasting) {
                let random = Math.floor(Math.random() * maxRandom) + 50;
                console.log("Szybkie Czarowanie: " + random);
                this.result.tooltips.miscast.push("Szybkie Czarowanie: " + random);
                globalModifier += random;
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
                let random = Math.floor(Math.random() * maxRandom) + 50;
                console.log("Magia Dhar bez składnika: " + random);
                this.result.tooltips.miscast.push("Magia Dhar bez składnika: " + random);
                globalModifier += random;
              }
              if (wind == "Dhar" && this.result.roll == 88) {
                let random = Math.floor(Math.random() * maxRandom) + 50;
                console.log("Magia Dhar 88: " + random);
                this.result.tooltips.miscast.push("Magia Dhar przy 88: " + random);
                globalModifier += random;
              }

              if (this.preData.unofficialGrimoire.ingredientMode == "control") {
                let random = Math.floor(Math.random() * maxRandom) + 50;
                console.log("Użyto składnika kontroli: " + -random);
                this.result.tooltips.miscast.push("Użyto składnika kontroli: " + -random);
                globalModifier -= -random;
              }
              if (this instanceof CastTest && this.actor.itemTypes["talent"].find(x=>x.name == "Precyzyjne Inkantowanie")) {
                let random = Math.floor(Math.random() * maxRandom) + 50;
                console.log("Precyzyjne Inkantowanie: " + -random);
                this.result.tooltips.miscast.push("Precyzyjne Inkantowanie: " + -random);
                globalModifier -= random;
              }
              if (this instanceof ChannelTest && this.actor.itemTypes["talent"].find(x=>x.name == "Zmysł Magii")) {
                let random = Math.floor(Math.random() * maxRandom) + 50;
                console.log("Zmysł Magii: " + -random);
                this.result.tooltips.miscast.push("Zmysł Magii: " + -random);
                globalModifier -= random;
              }
              this.result.tooltips.miscastText = `Manifestacje Chaosu: <ul><li style='float: left'>${this.result.tooltips.miscast.map(t => t.trim()).join("</li><li>")}</li></ul>`
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
    }
  }
}