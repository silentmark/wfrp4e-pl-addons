Hooks.on('updateToken', (tokenDocument, data, options) => {
  if (game.settings.get("wfrp4e-pl-addons", "autoEngaged.Enable")) {
    if (game.user.isGM) {
        if (data.x > 0 || data.y > 0) {
        let token = game.canvas.tokens.get(tokenDocument.id);
        let tokenX = data.x ?? token.x;
        let tokenY = data.y ?? token.y;

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

        let remove = true;
        surroundings.forEach(pos => {
          const LAMBDA = 5;
          let x1 = pos.x + LAMBDA;
          let y1 = pos.y + LAMBDA;
          let w1 = token.hitArea.x + token.hitArea.width - (LAMBDA*2);
          let h1 = token.hitArea.y + token.hitArea.height - (LAMBDA*2);
          let collisions = [];

          for (let tok of canvas.tokens.placeables) {
            if (tok.id != token.id){
              let x2 = tok.x;
              let y2 = tok.y;
              let w2 = tok.hitArea.x + tok.hitArea.width;
              let h2 = tok.hitArea.y + tok.hitArea.height;
              
              if (!(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2)) {
                collisions.push(tok);
              }
            }
          }
          let collision = collisions.find(x => x.actor.hasCondition("engaged"));
          if (collision) {
            remove = false;
          }
        });
        if (remove) {
          token.actor.removeCondition("engaged");
        }
      }
    }
  }
});


Hooks.on('wfrp4e:rollWeaponTest', (test, cardOptions) => {
  if (game.settings.get("wfrp4e-pl-addons", "autoEngaged.Enable")) {
    if (test.item.attackType == "melee" && test.context.targets?.length > 0) {
      const tokens = test.context.targets.map(t => game.wfrp4e.utility.getToken(t));
      test.actor.addCondition("engaged");
      if (game.user.isGM) {
        tokens.forEach(t => t.actor.addCondition("engaged"));
      } else {
        const effectData = {
          name: "Zwiąż Walką",
          transfer: true,
          flags: {
            wfrp4e: {
              effectApplication: "actor",
              effectTrigger: "oneTime",
              script: `this.actor.addCondition("engaged");`,
            },
          },
        };
        let effect = new CONFIG.ActiveEffect.documentClass(effectData);
        const payload = { effect, targets: [...tokens].map(t => t.toObject()), scene: canvas.scene.id };
        WFRP_Utility.awaitSocket(game.user, "applyEffects", payload, "invoking effect");
      }
    }
  }
});