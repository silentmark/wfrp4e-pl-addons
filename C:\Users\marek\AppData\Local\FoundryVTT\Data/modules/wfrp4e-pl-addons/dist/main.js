import { constants } from './constants.js';
import Armours from './armour.js';
import RerollInitiative from './reroll-initiative.js';
import AutoEngaged from './auto-engaged.js';
import WindsOfMagic from './windsofmagic.js';
import AutoRotate from './auto-rotate.js';
import Miscasts from './miscasts.js';
import PrayerNerf from './prayer-nerf.js';
import AutoCounterSpell from './auto-counterspell.js';
import AutoOutnumbered from './auto-outnumbered.js';
import AutoCombat from './auto-combat.js';
import AutoMiss from './auto-miss.js';
import PF2eHeresy from './pf2e-heresy.js';
import Diseases from './diseases.js';
import SocketTests from './socket-tests.js';
import CombatDistances from './combat-distance.js';
import './circle-helper.js';

class AreaHelpersExtension {
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
            };

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
            };
        
            AreaHelpers.testShape = function(x, y, shape) {
                for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
                    for (let dy = -0.5; dy <= 0.5; dy += 0.5) {
                        if (shape.contains(x + dx, y + dy)) return true;
                    }
                }
            };

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
            };

            
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
            };

            
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
            };

            
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
            };

            AreaHelpers.tokensInTemplate = function(template)
            {
                let scene = template.scene;
                let tokens = scene.tokens.contents;
                return tokens.filter(t => AreaHelpers.isInTemplate(t, template));
            };
        }
    }
}

class VariousExtensions {
    setup() {

        Hooks.on('createActor', async function (actor, options, userID) {
            if (userID != game.user.id) { return; }

            if (actor.system?.details?.height?.value && parseInt(actor.system.details.height.value)) {
                let h = parseInt(actor.system.details.height.value);
                actor.prototypeToken.setFlag('wall-height', 'tokenHeight', h / 100);
            } else {
                actor.prototypeToken.setFlag('wall-height', 'tokenHeight', 1.8);
            }
        });

        Reflect.defineProperty(WarhammerActor.prototype, 'hasPlayerOwner', {
            get() {
                return game.users.some(u => !u.isGM && u.name != "Stream" && this.testUserPermission(u, "OWNER"));
            }
        });

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
            ChatMessage.getWhisperRecipients("GM").map(u => u.id);
            game.user.id;
            //ChatMessage.create(chatOptions);
        };

        window.oncustomerror = function (customMessage, error) {
            console.error(customMessage + ": " + error);
            error.stack;
            error.message;
            ChatMessage.getWhisperRecipients("GM").map(u => u.id);
            game.user.id;
            //ChatMessage.create(chatOptions);
        };

        Hooks.on("error", (location, error, data) => {
            window.oncustomerror(`Error in ${location}`, error);
        });
    }
}

class Main {
    constructor() {
        this.armoury = new Armours();
        this.rerollInitiative = new RerollInitiative();
        this.autoCounterSpell = new AutoCounterSpell();
        this.windsOfMagic = new WindsOfMagic();
        this.autoEngaged = new AutoEngaged();
        this.autoRotate = new AutoRotate();
        this.miscasts = new Miscasts();
        this.prayerNerf = new PrayerNerf();
        this.autoOutnumbered = new AutoOutnumbered();
        this.autoCombat = new AutoCombat();
        this.autoMiss = new AutoMiss();
        this.pf2eHeresy = new PF2eHeresy();
        this.diseases = new Diseases();
        this.socketTests = new SocketTests();
        this.variousExtensions = new VariousExtensions();
        this.areaHelpers = new AreaHelpersExtension();
        this.combatDistance = new CombatDistances();
    }

    armoury;
    rerollInitiative;
    autoCounterSpell;
    windsOfMagic;
    autoEngaged;
    autoRotate;
    miscasts;
    prayerNerf;
    autoOutnumbered;
    autoCombat;
    autoMiss;
    pf2eHeresy;
    areaHelpers;
    combatDistance;
    diseases;
    socketTests;

    setup() {
        this.armoury.setup();
        this.rerollInitiative.setup();
        this.autoCounterSpell.setup();
        this.windsOfMagic.setup();
        this.autoEngaged.setup();
        this.autoRotate.setup();
        this.miscasts.setup();
        this.prayerNerf.setup();
        this.autoOutnumbered.setup();
        this.autoCombat.setup();
        this.autoMiss.setup();
        this.pf2eHeresy.setup();
        this.diseases.setup();
        this.variousExtensions.setup();
        this.areaHelpers.setup();
        this.combatDistance.setup();
    }

    ready() {
        this.armoury.ready();
        this.socketTests.ready();
    }
}

Hooks.on("setup", () => {    
    game.modules.get(constants.moduleId).api.setup();
});

Hooks.on("ready", () => {    
    game.modules.get(constants.moduleId).api.ready();
});

Hooks.once("init", () => {
    game.modules.get(constants.moduleId).api = new Main();
    CONFIG.supportedLanguages["pl"] = "pl";

    // Add enable/disable setting for arrow reclamation feature
    game.settings.register("wfrp4e-pl-addons", "alternativeArmour.Enable", {
        name: "wfrp4epladdon.alternativeArmour.Enable",
        hint: "wfrp4epladdon.alternativeArmour.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload();
        }
    });

    game.settings.register("wfrp4e-pl-addons", "initiativeRoll.Enable", {
        name: "wfrp4epladdon.initiativeRoll.Enable",
        hint: "wfrp4epladdon.initiativeRoll.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "alternativeMiscasts.Enable", {
        name: "wfrp4epladdon.alternativeMiscasts.Enable",
        hint: "wfrp4epladdon.alternativeMiscasts.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload();
        }
    });

    game.settings.register("wfrp4e-pl-addons", "windsOfMagicCombatRolls.Enable", {
        name: "wfrp4epladdon.windsOfMagicCombatRolls.Enable",
        hint: "wfrp4epladdon.windsOfMagicCombatRolls.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload();
        }
    });

    game.settings.register("wfrp4e-pl-addons", "combatSpellTracker.Enable", {
        name: "wfrp4epladdon.combatSpellTracker.Enable",
        hint: "wfrp4epladdon.combatSpellTracker.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload();
        }
    });

    game.settings.register("wfrp4e-pl-addons", "counterSpells.Enable", {
        name: "wfrp4epladdon.counterSpells.Enable",
        hint: "wfrp4epladdon.counterSpells.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload();
        }
    });
  
    game.settings.register("wfrp4e-pl-addons", "autoEngaged.Enable", {
        name: "wfrp4epladdon.autoEngaged.Enable",
        hint: "wfrp4epladdon.autoEngaged.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
  
    game.settings.register("wfrp4e-pl-addons", "autoOutnumbered.Enable", {
        name: "wfrp4epladdon.autoOutnumbered.Enable",
        hint: "wfrp4epladdon.autoOutnumbered.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "autoOutnumbered.Bonus", {
        name: "wfrp4epladdon.autoOutnumbered.Bonus",
        hint: "wfrp4epladdon.autoOutnumbered.BonusHint",
        scope: "world",
        config: true,
        default: 10,
        type: Number
    });

    game.settings.register("wfrp4e-pl-addons", "autoOutnumbered.Max", {
        name: "wfrp4epladdon.autoOutnumbered.Max",
        hint: "wfrp4epladdon.autoOutnumbered.MaxHint",
        scope: "world",
        config: true,
        default: 3,
        type: Number
    });

  
    game.settings.register("wfrp4e-pl-addons", "autoRotate.Enable", {
        name: "wfrp4epladdon.autoRotate.Enable",
        hint: "wfrp4epladdon.autoRotate.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "autoRotate.BonusFlanking", {
        name: "wfrp4epladdon.autoRotate.BonusFlanking",
        hint: "wfrp4epladdon.autoRotate.BonusFlankingHint",
        scope: "world",
        config: true,
        default: 10,
        type: Number
    });

    game.settings.register("wfrp4e-pl-addons", "autoRotate.BonuBehind", {
        name: "wfrp4epladdon.autoRotate.BonuBehind",
        hint: "wfrp4epladdon.autoRotate.BonuBehindHint",
        scope: "world",
        config: true,
        default: 20,
        type: Number
    });

    game.settings.register("wfrp4e-pl-addons", "prayerNerf.Enabled", {
        name: "wfrp4epladdon.prayerNerf.Enable",
        hint: "wfrp4epladdon.prayerNerf.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "autoCombat.Enabled", {
        name: "wfrp4epladdon.autoCombat.Enable",
        hint: "wfrp4epladdon.autoCombat.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "autoMiss.Enabled", {
        name: "wfrp4epladdon.autoMiss.Enable",
        hint: "wfrp4epladdon.autoMiss.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "pf2eHeresy.Enable", {
        name: "wfrp4epladdon.pf2eHeresy.Enable",
        hint: "wfrp4epladdon.pf2eHeresy.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "customDiseases.Enable", {
        name: "wfrp4epladdon.customDiseases.Enable",
        hint: "wfrp4epladdon.customDiseases.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "socketTests.mode", {
        name: 'wfrp4epladdon.socketTests.Mode',
        hint: 'wfrp4epladdon.socketTests.ModeHint',
        scope: 'world',
        config: true,
        default: 'onKeyPress',
        type: String,
        choices: {
        'onKeyPress': 'wfrp4epladdon.socketTests.OnKeyPress',
        'always': 'wfrp4epladdon.socketTests.Always',
        'never': 'wfrp4epladdon.socketTests.Never',
        }
    });

    
    
    game.settings.register("wfrp4e-pl-addons", "templateCollisionMethod", {
        name: `SETTINGS.templateCollisionMethod`,
        hint: `SETTINGS.templateCollisionMethodHint`,
        scope: 'world',
        config: true,
        type: String,
        choices: {
            "default": "SETTINGS.templateCollisionMethodDefault",
            "centerPoint": "SETTINGS.templateCollisionCenterPoint",
            "grid": "SETTINGS.templateCollisionGrid",
            "area": "SETTINGS.templateCollisionArea"
        },
    });
  
});

export { Main as default };
