Hooks.on("init", function() {

  if (game.settings.get("wfrp4e-pl-addons", "autoOutnumbered.Enable")) {
    const outnumberingModifier = game.settings.get("wfrp4e-pl-addons", "autoOutnumbered.Bonus");
    const maxOutnumberingMultiplier = game.settings.get("wfrp4e-pl-addons", "autoOutnumbered.Max");

    game.wfrp4e.config.customPrefillModifiers.calculateOutnumbering = async function(item, type, options, tooltips, prefillModifiers) {
      for (const tok of game.canvas.tokens.placeables) {
        await (new Sequence().animation().on(tok).tint("#FFFFFF").play());
      }

      if (type != "trait" && type != "weapon") return;
      if (game.user.targets.size && (item.type === "weapon" || item.type === "trait") && item.attackType == "melee") {
        let tooltip = "Przewaga Liczebna: ";
        let processedTokens = [];
        const attackingToken = this.getActiveTokens()[0];

        let targetToken = game.user.targets.first();
        let targetSizeNum = targetToken.actor._getTokenSize().width;
        if (targetToken.actor.isMounted) {
          processedTokens.push(targetToken);
          targetToken = targetToken.actor.mount.getActiveTokens()[0];
          targetSizeNum = targetToken.actor._getTokenSize().width;
        }
        
        let tokenX = targetToken.x;
        let tokenY = targetToken.y;

        let wx = targetToken.hitArea.width / game.canvas.grid.grid.w;
        let hy = targetToken.hitArea.height / game.canvas.grid.grid.h;
        
        let hitAreaX = targetToken.hitArea.width;
        let hitAreaY = targetToken.hitArea.height;
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

        for (const pos of surroundings) {
          const LAMBDA = 5;
          let x1 = pos.x + LAMBDA;
          let y1 = pos.y + LAMBDA;
          let w1 = targetToken.hitArea.x + targetToken.hitArea.width - (LAMBDA*2);
          let h1 = targetToken.hitArea.y + targetToken.hitArea.height - (LAMBDA*2);

          for (let tok of canvas.tokens.placeables) {
            if (tok.actor != null && tok.id != targetToken.id 
              && tok.actor.hasCondition("engaged") 
              && !tok.actor.hasCondition("dead") 
              && !tok.actor.hasCondition("unconscious")
              && !tok.actor.hasCondition("broken")
              && !tok.actor.hasCondition("stunned")) {
              let x2 = tok.x;
              let y2 = tok.y;
              let w2 = tok.hitArea.x + tok.hitArea.width;
              let h2 = tok.hitArea.y + tok.hitArea.height;
              
              if (!(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2)) {
                if (!processedTokens.find(x=>x.id == tok.id)) {
                  processedTokens.push(tok);                  
                  if (tok.document.disposition === 1) {
                    await (new Sequence().animation().on(tok).tint("#00FF00").play());
                  } else {
                    await (new Sequence().animation().on(tok).tint("#FF0000").play());
                  }
                }
              }
            }
          }
        }

        processedTokens = processedTokens.map(tok => {
          let sizeNum = tok.actor._getTokenSize().width;
          if (tok.actor.isMounted) {
            sizeNum = tok.actor.mount._getTokenSize().width;
          }
          sizeNum = Math.min(sizeNum, targetSizeNum);
          let disposition = tok.document.disposition;
          return {token: tok, sizeNum: sizeNum, disposition: disposition};
        });
        processedTokens = processedTokens.sort((t1, t2) => {
          return t1.sizeNum - t2.sizeNum;
        });
        
        let outnumbering = -targetSizeNum;
        for (let tokWrap of processedTokens) {
          let tok = tokWrap.token;
          if (tok.document.disposition === attackingToken.document.disposition) {
            tooltip += `${tok.document.name}`;
            if (tok.actor.isMounted) {
              tooltip += ` (${tok.actor.mount.name})`;
            }
            tooltip += ", ";
            outnumbering += tokWrap.sizeNum;
          } else {
            outnumbering -= tokWrap.sizeNum;
          }
        }

        const talent = targetToken.actor.getItemTypes("talent").find(x=>x.name == game.i18n.localize("NAME.CombatMaster"));
        if(talent?.length > 0) {
          outnumbering -= talent.advances;
          tooltips.push(game.i18n.localize("NAME.CombatMaster"))
        }
        if (outnumbering > 0) {
          const outnumberFinalModifier = Math.min(outnumbering * outnumberingModifier, maxOutnumberingMultiplier * outnumberingModifier);
          prefillModifiers.modifier += outnumberFinalModifier;
          tooltip += `(+${outnumberFinalModifier})`;
          tooltips.push(tooltip);
        }
      }
    }
  }
});

Hooks.on("updateCombat", async function() {
  if (game.user.isGM) {
    await Promise.all(game.canvas.tokens.placeables.map(tok => new Sequence().animation().on(tok).tint("#FFFFFF").play()));
  }
});
