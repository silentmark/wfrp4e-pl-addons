import {constants} from './constants.mjs';

export default class AutoMiss {

  processedMessages = [];

  setup() {
    if (game.modules.get("levelsautocover")?.active && game.settings.get("wfrp4e-pl-addons", "autoMiss.Enabled")) {


      const duckEffectData = {
        "name": "Kucanie",
        "duration": {
          "seconds": 99999
        },
        "img": "/modules/wfrp4e-pl-addons/icons/ducking.png",
        "tint": "#ffffff",
        "flags": {
          "wfrp4e": {
            "ducking": true
          }
        },
        "system": {
          "transferData" : {
              "type": "document",
              "documentType": "Actor",
            },
          "condition" : { },
          "scriptData": [
            {
              "label": "Kucanie",
              "script": "args.fields.modifier -= 20;",
              "trigger": "dialog",
              "options": {
                "hideScript": "return ![\"ws\", \"bs\", \"s\", \"ag\", \"t\", \"dex\"].includes(args.characteristic)",
                "activateScript": "return [\"ws\", \"bs\", \"s\", \"ag\", \"t\", \"dex\"].includes(args.characteristic)",
                "submissionScript": "",
                "targeter": false
              }
            }
          ]
        }
      }

      Hooks.on("renderTokenHUD", (data, hud, drawData) => {
        let token = data.object.document;
            let active = token.getFlag("wfrp4e-pl-addons", "ducking") || false;
            let toggleDuckbtn = `
                    <div class="control-icon${ active ? " active" : ""}" id="toggleDuck">
                      <img src="/modules/wfrp4e-pl-addons/icons/ducking.png" width="36" height="36" title='Kucnij'></i>
                    </div>`;
            const controlIcons = hud.find("div.control-icon");
            controlIcons.last().after(toggleDuckbtn);
            $(hud.find(`div[id="toggleDuck"]`)).on("click", toggDuck);

            async function toggDuck() {
              active = !active;
              await token.setFlag("wfrp4e-pl-addons", "ducking", !(token.getFlag("wfrp4e-pl-addons", "ducking") || false));

              let hudbtn = hud.find(`div[id="toggleDuck"]`);
              if (active) {
                hudbtn.addClass("active");
                await token.setFlag('wall-height', 'tokenHeight', parseInt(token.actor.details.height.value) / 250);
                let e = token.actor.effects.find(x=>x.flags?.wfrp4e.ducking);
                if (!e) {
                  await token.actor.createEmbeddedDocuments("ActiveEffect", [duckEffectData]);
                }
              }
              else {
                hudbtn.removeClass("active");
                await token.setFlag('wall-height', 'tokenHeight', parseInt(token.actor.details.height.value) / 100);
                let e = token.actor.effects.find(x=>x.flags?.wfrp4e.ducking);
                if (e) {
                  await token.actor.deleteEmbeddedDocuments("ActiveEffect", [e.id]);
                }
              }
              if (data.object?.id) {
                canvas.tokens.get(data.object.id)?.updateSource()
              }
            }
      });

      Hooks.on("renderChatMessage", async (app, html, messageData) => {
        if (!game.user.isGM || !app?.system?.test) {
          return;
        }

        let test = app.system.test;
        if (!test || game.modules.get(constants.moduleId).api.autoMiss.processedMessages.indexOf(app.id) != -1 || test?.weapon?.attackType != "ranged") return;

        game.modules.get(constants.moduleId).api.autoMiss.processedMessages.push(app.id);
        if (test.weapon?.weaponGroup?.value == 'throwing' && test.result.outcome == "failure") {
          let position = (await new Roll('1d8').roll()).total;
          let distance = game.canvas.grid.size * Math.abs(Number.parseInt(test.result.SL));
          let target = game.canvas.tokens.get(test.context.targets[0].token);
          let x = target.center.x;
          let y = target.center.y;
          if (position == 1) {
            x = x - distance;
            y = y - distance;
          } else if (position == 2) {
            x = x - distance;;
          } else if (position == 3) {
            x = x - distance;
            y = y + distance;
          } else if (position == 4) {
            y = y - distance;
          } else if (position == 5) {
            y = y + distance;
          } else if (position == 6) {
            y = y - distance;
            x = x + distance;
          } else if (position == 7) {
            x = x + distance;
          } else {
            x = x + distance;
            y = y + distance;
          }
          let tokensInArea = game.canvas.tokens.placeables.filter(t => t.x >= x && t.y >= y && t.x + t.w <= x && t.y + t.h <= y);
          if (tokensInArea.length > 0) {
            let newTarget = tokensInArea[Math.floor(Math.random() * tokensInArea.length)];
            let testData = app.flags.testData;
            testData.context.edited = true;
            testData.context.previousResult = duplicate(test.result);
            testData.preData.slBonus = 0;
            testData.preData.successBonus = 0;
            testData.preData.roll = test.result.roll;
            testData.preData.target = test.result.roll;
            testData.context.targets[0].token = newTarget.id;
            testData.preData.other.push(`Ups, trafiono inny cel w pobliżu <b>(${newTarget.name})</b>`);
            delete testData.context.messageId;
            let newTest = TestWFRP.recreate(testData);
            await newTest.roll();
          }
        }
        else if (test?.weapon?.properties?.qualities?.blast?.value && test.result.outcome == 'success' && test?.context?.targets?.length > 0) {
          let blast = test.weapon.properties.qualities.blast.value;
          let distance = canvas.dimensions.distance;
          let pixelDistance = (blast / distance) * canvas.dimensions.distancePixels;
          let target = game.canvas.tokens.get(test.context.targets[0].token);

          let tokenX = target.center.x;
          let tokenY = target.center.y;
          const area = new PIXI.Circle(tokenX, tokenY, pixelDistance + (game.canvas.grid.w / 2));

          for (let tok of canvas.tokens.placeables) {
            if (tok.actor != null && tok.id != target.id && !tok.actor.hasCondition("dead") && area.contains(tok.center.x, tok.center.y)) { 
              await ChatMessage.create({content: `Rozrzut zranił również: <b>(${tok.name})</b>`});
              await test.createOpposedMessage(tok);
            }
          }
          } else if (test?.result?.outcome == "failure" && test?.context?.targets?.length > 0 && test.context.targets[0] && test.context.targets[0].token && game.canvas?.tokens) {
          const shooter = test.actor.getActiveTokens()[0];
          const target = game.canvas.tokens.get(test.context.targets[0].token);

          const cover = AutoCover.calculateCover(shooter, target, {apiMode: true});

          let tokens = cover.obstructingTokens;

          if ((test.result.roll - test.result.target) <= 20) {
            if (tokens.length > 0 &&  Math.random() < 0.5) {
              const newTarget = tokens[Math.floor(Math.random() * tokens.length)];
              let testData = app.flags.testData;
              testData.context.edited = true;
              testData.context.previousResult = duplicate(test.result);
              testData.preData.slBonus = 0;
              testData.preData.successBonus = 0;
              testData.preData.roll = test.result.roll;
              testData.preData.target = test.target + 10;
              testData.context.targets[0].token = newTarget.id;
              testData.preData.other.push(`Ups, trafiono cel na linii ognia! <b>(${newTarget.name})</b>`);
              delete testData.context.messageId;
              let newTest = TestWFRP.recreate(testData);
              await newTest.roll();
            } else {
              let randomTokens = [];
              let tokenX = target.x;
              let tokenY = target.y;

              let wx = target.hitArea.width / game.canvas.grid.grid.w;
              let hy = target.hitArea.height / game.canvas.grid.grid.h;
              
              let hitAreaX = target.hitArea.width;
              let hitAreaY = target.hitArea.height;
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
                let w1 = target.hitArea.x + target.hitArea.width - (LAMBDA*2);
                let h1 = target.hitArea.y + target.hitArea.height - (LAMBDA*2);

                for (let tok of canvas.tokens.placeables) {
                  if (tok.actor != null && tok.id != target.id && !tok.actor.hasCondition("dead")) {
                    let x2 = tok.x;
                    let y2 = tok.y;
                    let w2 = tok.hitArea.x + tok.hitArea.width;
                    let h2 = tok.hitArea.y + tok.hitArea.height;
                    
                    if (!(x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2)) {
                      if (randomTokens.indexOf(tok.id) === -1) {
                        randomTokens.push(tok.id);
                      }
                    }
                  }
                }
              }
              if (randomTokens.length == 0) return;
              const newTarget = game.canvas.tokens.get(randomTokens[Math.floor(Math.random() * randomTokens.length)]);
              let testData = app.flags.testData;
              testData.context.edited = true;
              testData.context.previousResult = duplicate(test.result);
              testData.preData.slBonus = 0;
              testData.preData.successBonus = 0;
              testData.preData.roll = test.result.roll;
              testData.preData.target = test.target + 20;
              testData.context.targets[0].token = newTarget.id;
              testData.preData.other.push(`Ups, trafiono inny cel związany walką: <b>(${newTarget.name})</b>`);
              delete testData.context.messageId;
              let newTest = TestWFRP.recreate(testData);
              await newTest.roll();
            }
          }
        }
      });
    }
  }
}