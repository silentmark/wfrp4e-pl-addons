Hooks.once("init", function() {
  // Allow and process incoming socket data
  game.socket.on("module.wfrp4e-pl-addons", data => {
    if (game.user.isGM) {
      if (data.type === "arrowToReclaim") {
        const actorId = data.payload.actorId;
        const ammoId = data.payload.ammoId;
        const userId = data.payload.userId

        // retrieve existing data or initialize it
        const ammoReplenish = game.combat.getFlag('wfrp4e-pl-addons', 'ammoReplenish') || {};
        const actorData = ammoReplenish[actorId] || [];
        let ammoData = actorData.find(a => a.id === ammoId);

        // if ammo object doesn't exist, create one
        if (ammoData === undefined) {
          ammoData = {
            "id": ammoId,
            "user": userId,
            "quantity": 0
          };
          actorData.push(ammoData);
        }
        ammoData.quantity += 1;

        // overwrite actor data
        ammoReplenish[actorId] = actorData;

        // set (overwrite) flag with updated data
        game.combat.unsetFlag('wfrp4e-pl-addons', 'ammoReplenish').then(() => {
          game.combat.setFlag('wfrp4e-pl-addons', 'ammoReplenish', ammoReplenish);
        });
      }
    }
  });

  Handlebars.registerHelper('i18nformat', function (stringId, ...arrData) {
      let objData;
      if (typeof arrData[0] === 'object')
          objData = arrData[0];
      else
          objData = { ...arrData };

      return game.i18n.format(stringId, objData);
  });
});

Hooks.on("setup", () => {
    const config = {
        weaponQualities: {
          slash: game.i18n.localize("PROPERTY.Slash"),
          sturdy: game.i18n.localize("PROPERTY.Sturdy"),
          recoverable: game.i18n.localize("PROPERTY.Recoverable")
        },
  
        weaponFlaws: {
          frail: game.i18n.localize("PROPERTY.Frail"),
          unrecoverable: game.i18n.localize("PROPERTY.Unrecoverable")
        },
  
        qualityDescriptions: {
          slash: game.i18n.localize("WFRP4E.Properties.Slash"),
          sturdy: game.i18n.localize("WFRP4E.Properties.Sturdy"),
          recoverable: game.i18n.localize("WFRP4E.Properties.Recoverable")
        },
  
        flawDescriptions : {
          frail: game.i18n.localize("WFRP4E.Properties.Frail"),
          unrecoverable: game.i18n.localize("WFRP4E.Properties.Unrecoverable"),
        },
      
        propertyHasValue: {
          sturdy: false,
          slash: true,
          recoverable: false,
          frail: false,
          unrecoverable: false
      }
    }
  
    mergeObject(game.wfrp4e.config, config);
});  

Hooks.on("deleteCombat", async function (combat) {
    if (game.user.isGM) {
      const ammoReplenish = combat.getFlag('wfrp4e-pl-addons', 'ammoReplenish');
  
      for (const actorId in ammoReplenish) {
        if (Array.isArray(ammoReplenish[actorId])) {
          for (let i = 0; i < ammoReplenish[actorId].length; i++) {
            const usedAmmo = ammoReplenish[actorId][i];
            
            const user = usedAmmo.user;          
            const actor = game.actors.find(a => a.id === actorId);
            const ammo = actor.items.get(usedAmmo.id);
        
            ammo.quantity.value += usedAmmo.quantity;
            await ammo.update({ "system.quantity.value": ammo.quantity.value })
  
            const templateData = {};
            templateData.name = actor.name;
            templateData.img = actor.img;
            templateData.ammo = {};
            templateData.ammo.name = ammo.name;
            templateData.ammo.img = ammo.img;
            templateData.quantity = usedAmmo.quantity;
        
            // Don't post any image for the item (which would leave a large gap) if the default image is used
            if (templateData.img.includes("/unknown.png")) {
              templateData.img = null;
            }
            if (templateData.ammo.img.includes("/blank.png")){ 
              templateData.ammo.img = null;
            }
        
            const html = await renderTemplate('modules/wfrp4e-pl-addons/templates/ammo-recovery.hbs', templateData)
              const chatData = {
              user: user,
              speaker: {alias: actor.name, actor: actor.id},
              whisper: game.users.filter((u) => u.isGM).map((u) => u.id),
              content: html
            };
            ChatMessage.create(chatData);
          }
        }
      }
    }
});
  
Hooks.on("wfrp4e:rollWeaponTest", function (roll, cardOptions) {
    // if feature not enabled, do nothing
    if (!game.settings.get("wfrp4e-pl-addons", "arrowReclamation.Enable")) {
      return;
    }
  
    // if there is no ammo, do nothing
    const weapon = roll.weapon;
    if (weapon === undefined || weapon.ammo === undefined || weapon.currentAmmo === undefined || game.combat == null) {
      return;
    }
  
    let recovered = false;
    let message = "";
    const ammoId = weapon.currentAmmo.value;
    const actorId = cardOptions.speaker.actor;
    const percentageTarget = game.settings.get("wfrp4e-pl-addons", "arrowReclamation.Percentage");
    const ammo = weapon.parent.items.get(ammoId);
    const ammoQualities = ammo.properties.qualities;
  
    const allowArrows = game.settings.get("wfrp4e-pl-addons", "arrowReclamation.EnableArrows");
    const allowBolts = game.settings.get("wfrp4e-pl-addons", "arrowReclamation.EnableBolts");
    const allowBullets = game.settings.get("wfrp4e-pl-addons", "arrowReclamation.EnableBullets");
    const recoverable = ammo.properties.qualities.recoverable !== undefined;
    const unrecoverable = ammo.properties.flaws.unrecoverable !== undefined;
    let allowed = null;
    let type = null;
  
    if (!unrecoverable) {
      if (weapon.ammunitionGroup.value === 'bow') {
        allowed = allowArrows;
        type = 'Arrow';
      } else if (weapon.ammunitionGroup.value === 'crossbow') {
        allowed = allowBolts;
        type = 'Bolt';
      } else if (weapon.ammunitionGroup.value === 'sling') {
        allowed = allowBullets;
        type = 'Bullet';
      }
  
      if (!allowed && !recoverable)
        type = null;
    }
  
    // if type is not recognized or not allowed, do nothing
    if (type == null) {
      return;
    }
  
    // define chat messages
    type = game.i18n.localize(`wfrp4epladdon.${type}`);
    const messageFuture = game.i18n.format("wfrp4epladdon.recoveredFuture", {type});
  
    // if unbreakable, recover, if not, apply rules
    if (ammoQualities.unbreakable !== undefined) {
      recovered = true;
    } else {
      //recovered = this.isProjectileSaved(roll, percentageTarget, ammo);
  
      const crit = (roll.result.critical !== undefined || roll.result.fumble !== undefined);
      const even = roll.result.roll % 2 === 0;
      const success = roll.result.roll <= roll.target;
      const sturdy = ammo.properties.qualities.sturdy !== undefined;
      const frail = ammo.properties.flaws.frail !== undefined;
      let formula = "1d100";
  
      if (sturdy) {
        formula = "2d100kl";
      } else if (frail) {
        formula = "2d100kh";
      }
  
      const percentage = (new Roll(formula).roll().total <= percentageTarget);
      const sturdyRoll = (new Roll("1d100").roll().total <= percentageTarget);
  
      switch (game.settings.get("wfrp4e-pl-addons", "arrowReclamation.Rule")) {
        case 'success':
          if (sturdy)
            recovered = even;
          else
            recovered = even && success;
          if (frail && recovered)
            recovered = sturdyRoll;
          break;
        case 'noCrit':
          recovered = even && !crit;
          if (sturdy && !recovered)
            recovered = sturdyRoll;
          if (frail && recovered)
            recovered = sturdyRoll;
          break;
        case 'successNoCrit':
          if (sturdy)
            recovered = even && !crit;
          else
            recovered = even && success && !crit;
          if (frail && recovered)
            recovered = sturdyRoll;
          break;
        case 'failure':
          if (sturdy)
            recovered = even;
          else
            recovered = even && !success;
          if (frail && recovered)
            recovered = sturdyRoll;
          break;
        case 'failureNoCrit':
          if (sturdy)
            recovered = even && !crit;
          else
            recovered = even && !success && !crit;
          if (frail && recovered)
            recovered = sturdyRoll;
          break;
        case 'percentage':
          recovered = percentage;
          break;
        case 'percentageNoCrit':
          recovered = percentage && !crit;
          break;
        case 'default':
        default:
          recovered = even;
          if (sturdy && !recovered)
            recovered = sturdyRoll;
          if (frail && recovered)
            recovered = sturdyRoll;
      }
    }
  
    if (recovered === true) {
      message = messageFuture;
      if (game.user.isGM) {
        // retrieve existing data or initialize it
        const ammoReplenish = game.combat.getFlag('wfrp4e-pl-addons', 'ammoReplenish') || {};
        const actorData = ammoReplenish[actorId] || [];
        let ammoData = actorData.find(a => a.id === ammoId);
  
        // if ammo object doesn't exist, create one
        if (ammoData === undefined) {
          ammoData = {
            "id": ammoId,
            "user": game.user.id,
            "quantity": 0
          };
          actorData.push(ammoData);
        }
        ammoData.quantity += 1;
  
        // overwrite actor data
        ammoReplenish[actorId] = actorData;
  
        // set (overwrite) flag with updated data
        game.combat.unsetFlag('wfrp4e-pl-addons', 'ammoReplenish').then(() => {
          game.combat.setFlag('wfrp4e-pl-addons', 'ammoReplenish', ammoReplenish);
        });
      } else {
        game.socket.emit("module.wfrp4e-pl", {
          type: "arrowToReclaim",
          payload: {actorId: actorId, ammoId: ammoId, userId: game.user.id}
        })
      }
  
      if (Array.isArray(roll.result.other)) {
        roll.result.other.push(message)
      } else {
        roll.result.other = [message];
      }
    }
});