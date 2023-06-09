Hooks.on("init", function() {

  const outnumberingModifier = 10;
  const maxOutnumberingMultiplier = 3;

  game.wfrp4e.config.customPrefillModifiers.calculateOutnumbering = async function(item, type, options, tooltips, prefillModifiers) {
    // this = actor;
    if (type != "trait" && type != "weapon") return;
    if (game.user.targets.size && item.type === "weapon" && item.attackType == "melee") {
      let tooltip = "Przewaga Liczebna: ";
      const processedTokens = [];
      const attackingToken = this.getActiveTokens()[0];
      processedTokens.push(attackingToken.id);
      //TODO: various rules for outnumbering. First rule: count all engaged tokens near target. Target size reduces outnumbering by 1. 

      const targeToken = game.user.targets.first();
      let outnumbering = -(targeToken.hitArea.width / game.canvas.grid.grid.w) + 1;
      

      let tokenX = targeToken.x;
      let tokenY = targeToken.y;

      let wx = targeToken.hitArea.width / game.canvas.grid.grid.w;
      let hy = targeToken.hitArea.height / game.canvas.grid.grid.h;
      
      let hitAreaX = targeToken.hitArea.width;
      let hitAreaY = targeToken.hitArea.height;
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
        let w1 = targeToken.hitArea.x + targeToken.hitArea.width - (LAMBDA*2);
        let h1 = targeToken.hitArea.y + targeToken.hitArea.height - (LAMBDA*2);

        for (let tok of canvas.tokens.placeables) {
          if (tok.id != targeToken.id && tok.actor.hasCondition("engaged")) {
            let x2 = tok.x;
            let y2 = tok.y;
            let w2 = tok.hitArea.x + tok.hitArea.width;
            let h2 = tok.hitArea.y + tok.hitArea.height;
            
            if (!(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2)) {
              if (processedTokens.indexOf(tok.id) === -1) {
                if (tok.document.disposition === attackingToken.document.disposition) {
                  tooltip += `${tok.document.name}, `;
                  outnumbering++;
                } else {
                  outnumbering--;
                }
                processedTokens.push(tok.id);
              }
            }
          }
        }
      });

      const talent = targeToken.actor.getItemTypes("talent").find(x=>x.name == game.i18n.localize("NAME.CombatMaster"));
      if(talent?.length > 0) {
        outnumbering -= talent.advances;
      }
      if (outnumbering > 0) {
        const outnumberFinalModifier = Math.min(outnumbering * outnumberingModifier, maxOutnumberingMultiplier * outnumberingModifier);
        prefillModifiers.modifier += outnumberFinalModifier;
        tooltip += `(+${outnumberFinalModifier})`;
        tooltips.push(tooltip);
      }
    }
  }
});