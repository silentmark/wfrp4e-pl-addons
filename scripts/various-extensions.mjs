export default class VariousExtensions {
    setup() {
        game.wfrp4e.socket.handleDualWielder =  async function() {
            let message = game.messages.get(messageId);
            let test = message.getTest();
            await test.handleDualWielder();
            return true;
        }

        Reflect.defineProperty(WeaponTest.prototype, 'postTest', { value:
            async function () {
                if (this.result.critical && this.item.properties?.qualities.warpstone) {
                    this.result.other.push(`@Corruption[minor]{Minor Exposure to Corruption}`)
                }

                if (this.options.corruption) {
                    await this.handleCorruptionResult();
                }
                if (this.options.mutate) {
                    await this.handleMutationResult()
                }
            
                if (this.options.extended) {
                    await this.handleExtendedTest()
                }
            
                if (this.options.income) {
                    await this.handleIncomeTest()
                }
                await this.handleAmmo();
            }
        });

        Reflect.defineProperty(WeaponTest.prototype, 'handleDualWielder', {value: 
            async function() {
              if (this.preData.dualWielding && !this.context.edited) {
                let offHandData = foundry.utils.duplicate(this.preData)
          
                if (!this.actor.hasSystemEffect("dualwielder"))
                  await this.actor.addSystemEffect("dualwielder")
          
                if (game.wfrp4e.config.conditions.multiattacks) {
                    await this.actor.addCondition("multiattacks");
                }
          
                while (game.user.targets.size != 1) {
                  await Dialog.wait({
                      title: "Wybierz cel ataku drugą bronią",
                      content: "<p>Zaznacz cel (1) ataku drugą bronią i kliknij OK</p>",
                      buttons: {
                          ok: {
                              label: "OK",
                              callback: () => { return 0; }
                          }
                       }
                   });
                }
          
                let offhandWeapon = this.actor.getItemTypes("weapon").find(w => w.offhand.value);
                if (this.result.roll % 11 == 0 || this.result.roll == 100)
                  delete offHandData.roll
                else {
                  let offhandRoll = this.result.roll.toString();
                  if (offhandRoll.length == 1)
                    offhandRoll = offhandRoll[0] + "0"
                  else
                    offhandRoll = offhandRoll[1] + offhandRoll[0]
                  offHandData.roll = Number(offhandRoll);
                }
          
                let test = await this.actor.setupWeapon(offhandWeapon, { appendTitle: ` (${game.i18n.localize("SHEET.Offhand")})`, dualWieldOffhand: true, offhandReverse: offHandData.roll });
                await test.roll();
              }
            }
        });

        Reflect.defineProperty(OpposedWFRP.prototype, 'computeOpposeResult',  {value: 
            async function() {
                if (!this.attackerTest || !this.defenderTest)
                    throw new Error(game.i18n.localize("ERROR.Opposed"))
            
                this.opposedTest = new OpposedTest(this.attackerTest, this.defenderTest);
            
                await this.opposedTest.evaluate();
                this.formatOpposedResult();
                await this.renderOpposedResult()
                await this.colorWinnerAndLoser()
            
                if (this.opposedTest.attackerTest.handleDualWielder && this.opposedTest.opposeResult.winner == "attacker") {
                    let owner = game.wfrp4e.utility.getActiveDocumentOwner(this.opposedTest.attackerTest.actor);
                    game.wfrp4e.socket.executeOnUserAndWait(owner.id, "handleDualWielder", {messageId: this.attackerMessage.id}); 
                    //we dont want to await this one.
                }
            }
        });

        const baseFunc = StandardActorModel.prototype.computeDerived
        Reflect.defineProperty(StandardActorModel.prototype, 'computeDerived',  {value: 
            function(items, flags) {
                baseFunc.bind(this)(items, flags);

                let actor = this.parent;
                for(let e of actor.effects.map(x=>x)) {
                    if (e.flags?.wfrp4e?.weapon) {
                        actor.effects.delete(e.id);
                    }
                }
                
                for (let item of actor.itemTypes.weapon) {
                    if (item.equipped) {
                        let data = {
                            _id: item.id,
                            name: item.name,
                            icon: item.img,
                            transfer: false,
                            origin: item.uuid,
                            isTemporary: 1,
                            flags: {
                                wfrp4e: {
                                    value: item.twohanded.value ? "\uD83D\uDC50" : (item.offhand.value ? "\uD83D\uDC48" : "\uD83D\uDC49"),
                                    weapon: item.id
                                },
                                core: {
                                    statusId: item.name
                                }
                            }, 
                            duration: {
                                startTime: 87136335184
                            }
                        };
                        let weaponEffect =  ActiveEffect.implementation.create(data, {parent: actor });
                        actor.effects.set(item.id, weaponEffect);
                        actor.temporaryEffects.push(weaponEffect);
                    }
                }
            }
        });
        

        Hooks.on('createActor', async function (actor, options, userID) {
            if (userID != game.user.id) { return; }

            if (actor.system?.details?.height?.value && parseInt(actor.system.details.height.value)) {
                let h = parseInt(actor.system.details.height.value);
                this.prototypeToken.setFlag('wall-height', 'tokenHeight', h / 100);
            } else {
                this.prototypeToken.setFlag('wall-height', 'tokenHeight', 1.8);
            }
            this.prototypeToken.update({actorLink: true, sight: { enabled: true }});
        });
        

        AreaHelpers.isInTemplate = function(tokenDocument, templateObject) {
            let collisionMethod = game.settings.get("wfrp4e", "templateCollisionMethod");
            let minimalRatio = 0.25;
            if (!templateObject.shape) {
                let {x, y, direction, distance} = templateObject.document;
                distance *= game.canvas.dimensions.distancePixels;
                direction = Math.toRadians(direction);
                templateObject.ray = Ray.fromAngle(x, y, direction, distance);
    
                templateObject.shape = templateObject._computeShape();
            }
            if (collisionMethod == "centerPoint") {
                let point = tokenDocument.object.center;
                return templateObject.shape.contains(point.x - templateObject.x, point.y - templateObject.y);
            } else if (collisionMethod == "grid") {
                let points = AreaHelpers.getTokenGridCenterPoints(tokenDocument);
                const containedCount = points.reduce((counter, p) => (counter += templateObject.shape.contains(p.x - templateObject.x, p.y - templateObject.y) ? 1 : 0), 0);
                return containedCount / points.length >= minimalRatio; // if more than 25% of the centers of grid cells taken by token is in the template, return true
            } else if (collisionMethod == "area") {
    
                const size  = tokenDocument.parent.dimensions.size;
                const tokenRectanglePolygon = new PIXI.Rectangle(tokenDocument.x, tokenDocument.y, tokenDocument.width * size, tokenDocument.height * size).toPolygon();
                let templatePoly;
    
                switch (templateObject.shape.type) {
                    case 0: // generic poly
                        let x = templateObject.x;
                        let y = templateObject.y;
                        const clipperPolygon = templateObject.shape.toClipperPoints();
                        clipperPolygon.forEach((p) => {
                            p.X += x;
                            p.Y += y;
                        });
                        templatePoly = PIXI.Polygon.fromClipperPoints(clipperPolygon);
                        break;
                    case 1: // rect
                    case 2: // circle
                        const shapeCopy = templateObject.shape.clone();
                        shapeCopy.x += templateObject.x;
                        shapeCopy.y += templateObject.y;
                        templatePoly = shapeCopy.toPolygon();
                        break;
                }
                const intersectionArea = templatePoly.intersectPolygon(tokenRectanglePolygon).signedArea();
                return (intersectionArea / Math.min(templatePoly.signedArea(), tokenRectanglePolygon.signedArea())) >= minimalRatio;
            } else {
                throw new Error("Invalid collision method");
            }
        }

        AreaHelpers.getTokenGridCenterPoints = function(tokenDocument) {
            if (tokenDocument.object === null || tokenDocument.parent !== canvas.scene || canvas.grid.type === CONST.GRID_TYPES.GRIDLESS) {
                return [];
            }
    
            const size  = tokenDocument.parent.dimensions.size;
            const tokenRectangle = new PIXI.Rectangle(tokenDocument.x, tokenDocument.y, tokenDocument.width * size, tokenDocument.height * size);
            const d = game.canvas.dimensions;
            const grid = game.canvas.grid.grid;
            const [x, y] = [tokenDocument.x + (tokenDocument.width * d.size) / 2, tokenDocument.y + (tokenDocument.height * d.size) / 2]; // set x,y to token center
            const distance = (Math.sqrt(tokenDocument.width * tokenDocument.width + tokenDocument.height * tokenDocument.height) / 2) * d.distance;
    
            // ---------- modified from foundry MeasuredTemplate._getGridHighlightPositions ----------
    
            // Get number of rows and columns
            const [maxRow, maxCol] = grid.getGridPositionFromPixels(d.width, d.height);
            let nRows = Math.ceil((distance * 1.5) / d.distance / (d.size / grid.h));
            let nCols = Math.ceil((distance * 1.5) / d.distance / (d.size / grid.w));
            [nRows, nCols] = [Math.min(nRows, maxRow), Math.min(nCols, maxCol)];
    
            // Get the offset of the template origin relative to the top-left grid space
            const [tx, ty] = grid.getTopLeft(x, y);
            const [row0, col0] = grid.getGridPositionFromPixels(tx, ty);
            const [hx, hy] = [Math.ceil(grid.w / 2), Math.ceil(grid.h / 2)];
            const isCenter = x - tx === hx && y - ty === hy;
    
            // Identify grid coordinates covered by the template Graphics
            const positions = [];
            for (let r = -nRows; r < nRows; r++) {
                for (let c = -nCols; c < nCols; c++) {
                    const [gx, gy] = grid.getPixelsFromGridPosition(row0 + r, col0 + c);
                    // const [testX, testY] = [gx + hx - x, gy + hy - y];
                    // original shifts test points by shape's x,y as template shapes are defined at a 0,0 origin, but the shapes
                    // ByTokens generate for collision are not relative to a 0,0 origin and instead the token's actual x,y
                    // position on the grid, shifting the test points isn't required
                    const [testX, testY] = [gx + hx, gy + hy];
                    const contains = (r === 0 && c === 0 && isCenter) || AreaHelpers.testShape(testX, testY, tokenRectangle);
                    if (!contains) continue;
                    // original saves top-left of grid space, save center of space instead
                    positions.push({ x: testX, y: testY });
                }
            }
            return positions;
        }
    
        AreaHelpers.testShape = function(x, y, shape) {
            for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
                for (let dy = -0.5; dy <= 0.5; dy += 0.5) {
                    if (shape.contains(x + dx, y + dy)) return true;
                }
            }
        }

        window.onunhandledrejection = promiseRejectionEvent => {
            let reason = promiseRejectionEvent.reason;
            let stackTrace = promiseRejectionEvent.promise.__creationPoint;
            if (promiseRejectionEvent.reason.message) {
            reason = promiseRejectionEvent.reason.message;
            } 
            if (promiseRejectionEvent.reason.stack) {
            stackTrace = promiseRejectionEvent.reason.stack;
            }
            console.error(reason + ": " + stackTrace);
        
            let chatOptions = {  };
            chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
            chatOptions["user"] = game.user.id
        
            // Emit the HTML as a chat message
            chatOptions["content"] = `<h2>Unhandled Promise Rejection</h2><p>${reason}</p><p>${stackTrace}</p>`
            //ChatMessage.create(chatOptions);
        };
  
        window.oncustomerror = function(customMessage, error) {
            console.error(customMessage + ": " + error);
            let stackTrace = error.stack;
            let message = error.message;
  
            let chatOptions = {  };
            chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
            chatOptions["user"] = game.user.id
  
            // Emit the HTML as a chat message
            chatOptions["content"] = `<h2>${customMessage}</h2><p>${message}</p><p>${stackTrace}</p>`;
            //ChatMessage.create(chatOptions);
        }
  
        Hooks.on("error", (location, error, data) => {
            window.oncustomerror(`Error in ${location}`, error);
        });
    }
}