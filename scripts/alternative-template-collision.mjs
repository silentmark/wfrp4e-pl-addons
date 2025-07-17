/**
 *
 */
export default class AlternativeTemplateCollision {
    /**
     *
     */
    setup() {
        if (game.settings.get('wfrp4e-pl-addons', 'templateCollision')) {

            AreaHelpers.isInTemplate = function(tokenObject, templateDocument, size) {
                const templateObject = templateDocument.object;
                let tokenDocument = tokenObject.document;
                if (!tokenDocument && size) {
                    const canvasSize  = canvas.scene.dimensions.size;
                    tokenDocument = {
                        x: tokenObject.x - (size.width / 2) * canvasSize,
                        y: tokenObject.y - (size.height / 2) * canvasSize,
                        width: size.width,
                        height: size.height
                    };
                }

                const minimalRatio = game.settings.get('wfrp4e-pl-addons', 'templateCollisionMinimalRatio') / 100;
                if (!templateObject.shape) {
                    let { x, y, direction, distance } = templateObject.document;
                    distance *= game.canvas.dimensions.distancePixels;
                    direction = Math.toRadians(direction);
                    templateObject.ray = Ray.fromAngle(x, y, direction, distance);

                    templateObject.shape = templateObject._computeShape();
                }

                const canvasSize  = canvas.scene.dimensions.size;
                const tokenRectanglePolygon = new PIXI.Rectangle(tokenDocument.x, tokenDocument.y, tokenDocument.width * canvasSize, tokenDocument.height * canvasSize).toPolygon();
                let templatePoly;

                switch (templateObject.shape.type) {
                    case 0: // generic poly
                        const x = templateObject.x;
                        const y = templateObject.y;
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
            };

            AreaHelpers.setTokenAreas = async function(token, update, options, _user) {
                const scene = token.parent;
                if (!options._priorAreas) {
                    options._priorAreas = {};
                    options._areas = {};
                    options._newCenter = {};
                }
                // Get all areas left, but aura owners should never leave their aura area
                options._priorAreas[token.id] = scene.templates.contents.filter(template => AreaHelpers.isInTemplate(token.object, template) && template.getFlag(game.system.id, 'aura')?.owner !== token.actor?.uuid).map(i => i.id);
                const newCenter = TokenHelpers.tokenCenter(foundry.utils.mergeObject(token.toObject(), update));
                options._newCenter[token.id] = newCenter;
                options._areas[token.id] = scene.templates.contents.filter(template => AreaHelpers.isInTemplate(newCenter, template, { width: token.width, height: token.height })).map(i => i.id);
            };

            // Checks a token's current zone and zone effects, adding and removing them
            AreaHelpers.checkTokenUpdate = async function(token, update, options, user) {
                if (user === game.user.id) {
                    // If every current region ID exists in priorAuras, and every priorRegion ID existis in current, there was no region change
                    const currentAreas = options._areas[token.id] || [];
                    const priorAreas = options._priorAreas[token.id] || [];
                    const changedRegion = !(currentAreas.every(rId => priorAreas.includes(rId)) && priorAreas.every(rId => currentAreas.includes(rId)));
                    if (changedRegion) {
                        await this.checkTokenAreaEffects(token, options._newCenter[token.id]);
                    }
                }
            };

            AreaHelpers.checkAreaUpdate = async function(template, update, options, _user) {
                // players can't manage token effects, so only the active GM should add/remove area effects
                if (game.users.activeGM.id === game.user.id && !options?.skipAreaCheck) {
                    // Tokens that are now in the template or have effects from this template
                    const tokens = template.parent?.tokens.contents.filter(token => AreaHelpers.isInTemplate(token.object, template) || token.actor?.effects.find(e => e.system.sourceData.area === template.uuid));
                    for (const token of tokens) {
                        AreaHelpers.semaphore.add(AreaHelpers.checkTokenAreaEffects.bind(AreaHelpers), token);
                    }
                }
            };

            AreaHelpers.checkAreaCreate = async function(template, options, _user) {
                // players can't manage token effects, so only the active GM should add/remove area effects
                if (game.users.activeGM.id === game.user.id && !options?.skipAreaCheck) {
                    // Tokens that are now in the template or have effects from this template
                    const tokens = template.parent?.tokens.contents.filter(token => AreaHelpers.isInTemplate(token.object, template) || token.actor?.effects.find(e => e.system.sourceData.area === template.uuid));
                    for (const token of tokens) {
                        AreaHelpers.semaphore.add(AreaHelpers.checkTokenAreaEffects.bind(AreaHelpers), token);
                    }

                    if (template.getFlag(game.system.id, 'instantaneous')) {
                        sleep(500).then(() => {
                            template.setFlag(game.system.id, 'effectData', null);
                        });
                    }
                }
            };

            AreaHelpers.checkAreaDelete = async function(template, options, _user) {
                // players can't manage token effects, so only the active GM should add/remove area effects
                if (game.users.activeGM.id === game.user.id && !options?.skipAreaCheck) {
                    // Tokens that have effects from this template
                    const tokens = template.parent?.tokens.contents.filter(token => token.actor?.effects.find(e => e.system.sourceData.area === template.uuid));
                    for (const token of tokens) {
                        AreaHelpers.semaphore.add(AreaHelpers.checkTokenAreaEffects.bind(AreaHelpers), token);
                    }
                }
            };

            AreaHelpers.checkTokenAreaEffects = async function(token, newCenter) {
                if (!token.actor) {
                    return;
                }

                const scene = token.parent;
                const inAreas = scene.templates.contents.filter(t => AreaHelpers.isInTemplate(newCenter || token.object.center, t, { width: token.width, height: token.height }));
                const effects = Array.from(token.actor?.effects);
                const areaEffects = [];
                inAreas.forEach(area => {
                    const areaEffect = area.areaEffect();
                    const auraData = area.getFlag(game.system.id, 'aura');
                    // If the effect exists, only add the area effect if the area is not an aura OR this isn't the owner of the aura and it's not a transferred aura
                    // in other words, if the aura is transferred, apply to owner of the aura. If it's a constant aura, don't add the effect to the owner
                    if (areaEffect && (!auraData || auraData.owner !== token.actor?.uuid || auraData.transferred)) {
                        areaEffects.push(areaEffect);
                    }
                });
                // Remove all area effects that reference an area the token is no longer in
                const toDelete = effects.filter(e => e.system.sourceData.area && !inAreas.map(i => i.uuid).includes(e.system.sourceData.area) && !e.system.transferData.area.keep).map(e => e.id);

                // filter out all area effects that are already on the actor
                const toAdd = areaEffects.filter(ae => !token.actor?.effects.find(e => e.system.sourceData.area === ae.system.sourceData.area));

                if (toDelete.length) {
                    if (token.actor) {
                        await token.actor.deleteEmbeddedDocuments('ActiveEffect', toDelete);
                    }
                }
                if (toAdd.length) {
                    if (token.actor) {
                        await token.actor.applyEffect({ effects : toAdd });
                    }
                }
                // If an effect from this area was not found, add it. otherwise ignore
            };

            /**
             * Get all Tokens inside template
             * @param template
             * @returns {any}
             */
            AreaHelpers.tokensInTemplate = function(template) {
                const scene = template.scene;
                const tokens = scene.tokens.contents;
                return tokens.filter(t => AreaHelpers.isInTemplate(t.object, template));
            };


            Hooks.off('preUpdateToken', Hooks.events.preUpdateToken.find(x => x.fn.name === 'bound setTokenAreas').fn);
            Hooks.off('updateToken', Hooks.events.updateToken.find(x => x.fn.name === 'bound checkTokenUpdate').fn);
            Hooks.off('createMeasuredTemplate', Hooks.events.createMeasuredTemplate.find(x => x.fn.name === 'bound checkAreaCreate').fn);
            Hooks.off('refreshMeasuredTemplate', Hooks.events.refreshMeasuredTemplate.find(x => x.fn.name === 'bound refreshArea').fn);
            Hooks.off('updateMeasuredTemplate', Hooks.events.updateMeasuredTemplate.find(x => x.fn.name === 'bound checkAreaUpdate').fn);
            Hooks.off('deleteMeasuredTemplate', Hooks.events.deleteMeasuredTemplate.find(x => x.fn.name === 'bound checkAreaDelete').fn);

            Hooks.on('preUpdateToken', AreaHelpers.setTokenAreas.bind(AreaHelpers));
            Hooks.on('updateToken', AreaHelpers.checkTokenUpdate.bind(AreaHelpers));
            Hooks.on('createMeasuredTemplate', AreaHelpers.checkAreaCreate.bind(AreaHelpers));
            Hooks.on('refreshMeasuredTemplate', AreaHelpers.refreshArea.bind(AreaHelpers));
            Hooks.on('updateMeasuredTemplate', AreaHelpers.checkAreaUpdate.bind(AreaHelpers));
            Hooks.on('deleteMeasuredTemplate', AreaHelpers.checkAreaDelete.bind(AreaHelpers));
        }
    }
}