export default class AreaHelpersExtension {
    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "templateCollisionMethod") != 'default') {

            AreaHelpers.isInTemplate =function(tokenDocument, templateObject) {
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

            AreaHelpers.setTokenAreas = function(token, update, options, user)
            {
                let scene = token.parent;
                if (!options._priorAreas)
                {
                    options._priorAreas = {};
                    options._areas = {};
                    options._newCenter = {};
                }
                // Get all areas left, but aura owners should never leave their aura area
                options._priorAreas[token.id] = scene.templates.contents.filter(template => AreaHelpers.isInTemplate(token, template.toObject()) && template.getFlag("wfrp4e", "aura")?.owner != token.actor?.uuid).map(i => i.id);
                let newCenter = TokenHelpers.tokenCenter(foundry.utils.mergeObject(token.toObject(), update));
                options._newCenter[token.id] = newCenter;
                options._areas[token.id] = scene.templates.contents.filter(template => AreaHelpers.isInTemplate(token, template)).map(i => i.id);
            }

            
            AreaHelpers.checkAreaUpdate = async function(template, update, options, user)
            {
                // players can't manage token effects, so only the active GM should add/remove area effects
                if (game.users.activeGM.id == game.user.id && !options?.skipAreaCheck)
                {
                    // Tokens that are now in the template or have effects from AreaHelpers template
                    let tokens = template.parent?.tokens.contents.filter(token => AreaHelpers.isInTemplate(token, template) || token.actor.effects.find(e => e.system.sourceData.area == template.uuid));
                    for(let token of tokens)
                    {
                        AreaHelpers.semaphore.add(AreaHelpers.checkTokenAreaEffects.bind(AreaHelpers), token);
                    }
                }
            }

            
            AreaHelpers.checkAreaCreate = async function(template, options, user)
            {
                // players can't manage token effects, so only the active GM should add/remove area effects
                if (game.users.activeGM.id == game.user.id && !options?.skipAreaCheck)
                {
                    // Tokens that are now in the template or have effects from AreaHelpers template
                    let tokens = template.parent?.tokens.contents.filter(token => AreaHelpers.isInTemplate(token, template) || token.actor.effects.find(e => e.system.sourceData.area == template.uuid));
                    for (let token of tokens)
                    {
                        AreaHelpers.semaphore.add(AreaHelpers.checkTokenAreaEffects.bind(AreaHelpers), token);
                    }
            
                    if (template.getFlag("wfrp4e", "instantaneous"))
                    {
                        sleep(500).then(() => 
                        {
                            template.setFlag("wfrp4e", "effectData", null);
                        });
                    }
                }
            }

            
            AreaHelpers.checkTokenAreaEffects = async function (token, newCenter)
            {
                let sceneId = token.parent.id;
                let tokenId = token.id;
                if (newCenter) {
                    sleep(500).then(() => 
                        {
                            let scene = game.scenes.get(sceneId);
                            let token = scene?.tokens.get(tokenId);
                            if (!token) return;
                            AreaHelpers.checkTokenAreaEffects(token);
                        });
                }
                else 
                {
                    let scene = token.parent;
                    let inAreas = scene.templates.contents.filter(t => AreaHelpers.isInTemplate(token, t));
                    let effects = Array.from(token.actor.effects);
                    let areaEffects = [];
                    inAreas.forEach(area => 
                    {
                        let areaEffect = area.areaEffect();
                        let auraData = area.getFlag("wfrp4e", "aura");
                        // If the effect exists, only add the area effect if the area is not an aura OR AreaHelpers isn't the owner of the aura and it's not a transferred aura
                        // in other words, if the aura is transferred, apply to owner of the aura. If it's a constant aura, don't add the effect to the owner
                        if (areaEffect && (!auraData || auraData.owner != token.actor?.uuid || auraData.transferred))
                        {
                            areaEffects.push(areaEffect);
                        }
                    });
                    // Remove all area effects that reference an area the token is no longer in
                    let toDelete = effects.filter(e => e.system.sourceData.area && !inAreas.map(i => i.uuid).includes(e.system.sourceData.area) && !e.system.transferData.area.keep).map(e => e.id);

                    // filter out all area effects that are already on the actor
                    let toAdd = areaEffects.filter(ae => !token.actor.effects.find(e => e.system.sourceData.area == ae.system.sourceData.area));
        
                    if (toDelete.length)
                    {
                        await token.actor.deleteEmbeddedDocuments("ActiveEffect", toDelete);
                    }
                    if (toAdd.length)
                    {
                        await token.actor.applyEffect({effects : toAdd});
                    }
                    // If an effect from AreaHelpers area was not found, add it. otherwise ignore
                }
            }

            AreaHelpers.tokensInTemplate = function(template)
            {
                let scene = template.scene;
                let tokens = scene.tokens.contents;
                return tokens.filter(t => AreaHelpers.isInTemplate(t, template));
            }
        }
    }
}