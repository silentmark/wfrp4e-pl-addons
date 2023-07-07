Hooks.on("setup", () => {

  Reflect.defineProperty(ActorWfrp4e.prototype, 'actorEffects', { 
    get: function () {
      let actorEffects = new Collection()
      let effects = this.effects
      effects.forEach(e => {
        let effectApplication = e.application
        let remove
        try {
          if (e.origin && e.item) { // If effect comes from an item
            let item = e.item
            if (item.type == "disease") { // If disease, don't show symptoms until disease is actually active
              if (!item.system.duration.active)
                remove = true
            }
            else if (item.type == "spell" || item.type == "prayer") {
              remove = true
            }
            else if (item.type == "trait" && this.type == "creature" && !item.included) {
              remove = true
            }
            else if (effectApplication) { // if not equipped, remove if effect specifies it needs to be equipped
              if (effectApplication == "equipped") {
                if (!item.isEquipped)
                  remove = true;
              }
              else if (effectApplication != "actor") // Otherwise (if effect is targeted), remove it. 
                remove = true
            }
          }
          else {// If not an item effect
            if (effectApplication == "apply")
              remove = true
          }
          if (!remove)
            actorEffects.set(e.id, e)
        }
        catch (error) {
          game.wfrp4e.utility.log(`The effect ${e.label} threw an error when being prepared. ${error}`, e)
        }
      });
      if (this.flags.wfrp4e?.conditionalEffects?.length) {
        this.flags.wfrp4e?.conditionalEffects.map(e => new EffectWfrp4e(e, {parent: this})).forEach(e => {
          actorEffects.set(randomID(), e)
        });
      }
      const effectData = {
        label: "Przewaga Liczebna",
        transfer: true,
        flags: {
          wfrp4e: {
            effectApplication: "actor",
            effectTrigger: "prefillDialog",
            script: ` if (game.user.targets.size && args.item && args.item.attackType == 'melee') 
                        await game.wfrp4e.utility.calculateOutnumbering(args.prefillModifiers, args.item);`,
          },
        },
      };
      let prefillEffect = new CONFIG.ActiveEffect.documentClass(effectData, {parent: this});
      actorEffects.set(randomID(), prefillEffect)
      return actorEffects;
    }
  });
});

Hooks.on("init", function() {

  game.wfrp4e.utility.calculateOutnumbering = async function(prefillModifiers, item) {
    if (game.user.targets.size && item.type === "weapon" && item.attackType == "melee") {
      const token = game.user.targets.first();
      let outnumbering = -(token.hitArea.width / game.canvas.grid.grid.w);

      let tokenX = token.x;
      let tokenY = token.y;

      let wx = token.hitArea.width / game.canvas.grid.grid.w;
      let hy = token.hitArea.height / game.canvas.grid.grid.h;
      
      let hitAreaX = token.hitArea.width;
      let hitAreaY = token.hitArea.height;
      let gridX = game.canvas.grid.grid.w;
      let gridY = game.canvas.grid.grid.h;

      let surroundings = [];
      surroundings.push({x: tokenX - gridX, y: tokenY - gridY});
      surroundings.push({x: tokenX + hitAreaX, y: tokenY + hitAreaY});
      surroundings.push({x: tokenX - gridX, y: tokenY + hitAreaY});
      surroundings.push({x: tokenX + hitAreaX, y: tokenY - gridY});
      for (let i = 0; i < wx; i++) {
        surroundings.push({x: tokenX + gridX * i, y: tokenY - gridY});
        surroundings.push({x: tokenX + gridX * i, y: tokenY + hitAreaY});
      }
      for (let i = 0; i < hy; i++) {
        surroundings.push({x: tokenX - gridX, y: tokenY + gridY * i});
        surroundings.push({x: tokenX + hitAreaX, y: tokenY + gridY * i});
      }

      surroundings.forEach(pos => {
        const LAMBDA = 5;
        let x1 = pos.x + LAMBDA;
        let y1 = pos.y + LAMBDA;
        let w1 = token.hitArea.x + token.hitArea.width - (LAMBDA*2);
        let h1 = token.hitArea.y + token.hitArea.height - (LAMBDA*2);

        for (let tok of canvas.tokens.placeables) {
          if (tok.id != token.id && token.actor.hasCondition("engaged")) {
            let x2 = tok.x;
            let y2 = tok.y;
            let w2 = tok.hitArea.x + tok.hitArea.width;
            let h2 = tok.hitArea.y + tok.hitArea.height;
            
            if (!(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2)) {
              if (tok.document.disposition === token.document.disposition) {
                outnumbering--;
              } else {
                outnumbering++;
              }
            }
          }
        }
      });

      const talent = token.actor.getItemTypes("talent").find(x=>x.name == "Combat Master" || x.name == "Mistrz Walki");
      if(talent?.length > 0) {
        outnumbering -= talent.advances;
      }
      if (outnumbering > 0) {
        prefillModifiers.modifier += Math.min(outnumbering * 10, 30);
      }
    }
  }
});