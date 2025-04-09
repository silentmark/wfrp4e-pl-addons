import CombatDistances from "./combat-distance.mjs";

export default class AutoEngaged {

  setup() {
    if (game.settings.get("wfrp4e-pl-addons", "autoEngaged.Enable")) {
      SocketHandlers.addCondition = async function (payload) {
        let condition = payload.condition;
        let actorId = payload.actorId;
        let actor = game.actors.get(actorId);
        let owner = warhammer.utility.getActiveDocumentOwner(actor);
        if (owner.id == game.user.id) {
          await actor.addCondition(condition);
        }
      };

      Hooks.on('updateToken', (tokenDocument, data) => {
        if (game.user.isGM) {
          if (data.x > 0 || data.y > 0) {
            let token = game.canvas.tokens.get(tokenDocument.id);

            if (!token || !token.hitArea || !token.actor) return;

            const originalTokenReach = CombatDistances.calculateWeaponReachRadius(token);

            const originalTokenX = token.center.x;
            const originalTokenY = token.center.y;

            const tokenWidth = token.getSize().width;

            const newTokenX = (data.x ?? token.x) + tokenWidth / 2;
            const newTokenY = (data.y ?? token.y) + tokenWidth / 2;

            const oldCollisions = [];
            const newCollisions = [];

            function checkReachIntersection(x1, y1, r1, x2, y2, r2, innerR1, innerR2) {
              const dx = x1 - x2;
              const dy = y1 - y2;
              const distance = Math.sqrt(dx * dx + dy * dy);
              return distance < (innerR1 + r2) || distance < (r1 + innerR2);
            }

            for (let tok of canvas.tokens.placeables) {
              if (tok.id != token.id) {
                const otherTokenReach = CombatDistances.calculateWeaponReachRadius(tok);

                const otherTokenWidth = tok.getSize().width;

                const tokenRadius = tokenWidth / 2;
                const otherTokenRadius = otherTokenWidth / 2;

                const reachRadius = originalTokenReach.radius;
                const otherReachRadius = otherTokenReach.radius;

                // Check for intersection between original token reach and other token
                if (checkReachIntersection(originalTokenX, originalTokenY, reachRadius, tok.center.x, tok.center.y, otherReachRadius, tokenRadius, otherTokenRadius) && tok.actor?.hasCondition("engaged")) {
                  oldCollisions.push(tok);
                }

                // Check for intersection between new token reach and other token
                if (checkReachIntersection(originalTokenX, originalTokenY, reachRadius, newTokenX, newTokenY, otherReachRadius, tokenRadius, otherTokenRadius) && tok.actor?.hasCondition("engaged")) {
                  newCollisions.push(tok);
                }
              }
            }

            const remain = oldCollisions.find(t => newCollisions.includes(t));

            if (!remain) {
              token.actor.removeCondition("engaged");
            }
          }
        }
      });

      Hooks.on('wfrp4e:rollWeaponTest', (test) => {
        if (test.item.attackType == "melee" && test.context.targets?.length > 0) {
          const tokens = test.context.targets.map(t => game.wfrp4e.utility.getToken(t));
          test.actor.addCondition("engaged");
          if (game.user.isGM) {
            tokens.forEach(t => t.actor.addCondition("engaged"));
          } else {
            tokens.forEach(t => SocketHandlers.executeOnOwner(t.actor, "addCondition", { condition: "engaged", actorId: t.actor.id }));
          }
        }
      });

      Hooks.on('wfrp4e:rollTraitTest', (test) => {
        if (test.item.attackType == "melee" && test.context.targets?.length > 0) {
          const tokens = test.context.targets.map(t => game.wfrp4e.utility.getToken(t));
          test.actor.addCondition("engaged");
          if (game.user.isGM) {
            tokens.forEach(t => t.actor.addCondition("engaged"));
          } else {
            tokens.forEach(t => SocketHandlers.executeOnOwner(t.actor, "addCondition", { condition: "engaged", actorId: t.actor.id }));
          }
        }
      });
    }
  }
}