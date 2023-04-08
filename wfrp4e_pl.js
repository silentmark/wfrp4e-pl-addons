Hooks.once("init", function() {
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
        foundry.utils.debouncedReload()
      }
    });

    // Add enable/disable setting for arrow reclamation feature
    game.settings.register("wfrp4e-pl-addons", "arrowReclamation.Enable", {
      name: "wfrp4epladdon.arrowReclamation.Enable",
      hint: "wfrp4epladdon.arrowReclamation.EnableHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });
  
    // Add enable/disable recovery of Arrows
    game.settings.register("wfrp4e-pl-addons", "arrowReclamation.EnableArrows", {
      name: "wfrp4epladdon.arrowReclamation.EnableArrows",
      hint: "wfrp4epladdon.arrowReclamation.EnableArrowsHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });
  
    // Add enable/disable recovery of Bolts
    game.settings.register("wfrp4e-pl-addons", "arrowReclamation.EnableBolts", {
      name: "wfrp4epladdon.arrowReclamation.EnableBolts",
      hint: "wfrp4epladdon.arrowReclamation.EnableBoltsHint",
      scope: "world",
      config: true,
      default: false,
      type: Boolean
    });
  
    // Add enable/disable recovery of Bullets
    game.settings.register("wfrp4e-pl-addons", "arrowReclamation.EnableBullets", {
      name: "wfrp4epladdon.arrowReclamation.EnableBullets",
      hint: "wfrp4epladdon.arrowReclamation.EnableBulletsHint",
      scope: "world",
      config: true,
      default: true,
      type: Boolean
    });
  
    // Add setting that allows for different rules of arrow reclamation
    game.settings.register("wfrp4e-pl-addons", "arrowReclamation.Rule", {
      name: "wfrp4epladdon.arrowReclamation.Rule",
      hint: "wfrp4epladdon.arrowReclamation.RuleHint",
      scope: "world",
      config: true,
      default: "default",
      type: String,
      choices: {
        "default": "wfrp4epladdon.arrowReclamation.DefaultRule",
        "success": "wfrp4epladdon.arrowReclamation.SuccessRule",
        "noCrit": "wfrp4epladdon.arrowReclamation.NoCritRule",
        "successNoCrit": "wfrp4epladdon.arrowReclamation.SuccessNoCritRule",
        "failure": "wfrp4epladdon.arrowReclamation.FailureRule",
        "failureNoCrit": "wfrp4epladdon.arrowReclamation.FailureNoCritRule",
        "percentage": "wfrp4epladdon.arrowReclamation.PercentageRule",
        "percentageNoCrit": "wfrp4epladdon.arrowReclamation.PercentageNoCritRule",
      }
    });
  
    // Add Percentage setting for Percentage rules
    game.settings.register("wfrp4e-pl-addons", "arrowReclamation.Percentage", {
      name: "wfrp4epladdon.arrowReclamation.Percentage",
      hint: "wfrp4epladdon.arrowReclamation.PercentageHint",
      scope: "world",
      config: true,
      default: 50,
      type: Number
    });

  // Allow and process incoming socket data
  game.socket.on("module.wfrp4e-pl", data => {
    if (game.user.isGM) {
      if (data.type === "arrowToReclaim") {
        const actorId = data.payload.actorId;
        const ammoId = data.payload.ammoId;
        const userId = data.payload.userId

        // retrieve existing data or initialize it
        const ammoReplenish = game.combat.getFlag('wfrp4e-pl', 'ammoReplenish') || {};
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
        game.combat.unsetFlag('wfrp4e-pl', 'ammoReplenish').then(() => {
          game.combat.setFlag('wfrp4e-pl', 'ammoReplenish', ammoReplenish);
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

  $("body").on("click", ".journal-sheet .item-property", ev => {
    game.wfrp4e.utility.postProperty(ev.target.text)
  })
});

Hooks.on("renderCompendiumDirectory", async () => {
    if (game.packs.get("wfrp4e-gm-toolkit.db.gm-toolkit-tables")) {
        game.packs.delete("wfrp4e-gm-toolkit.gm-toolkit-tables")
        ui.sidebar.element.find("[data-pack='wfrp4e-gm-toolkit.gm-toolkit-tables']").remove()
    }
    if (!game.settings.get("wfrp4e-pl-addons", "alternativeArmour.Enable")) {
      if (game.packs.get("wfrp4e-pl-addons.armoury")) {
        ui.sidebar.element.find("[data-pack='wfrp4e-pl.armoury']").remove()
      }
    }
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

  mergeObject(game.wfrp4e.config, config)
  if (game.settings.get("wfrp4e-pl-addons", "alternativeArmour.Enable")) {
    game.wfrp4e.config.armorTypes = {
      "light": game.i18n.localize("WFRP4E.ArmourType.Light"),
      "medium": game.i18n.localize("WFRP4E.ArmourType.Medium"),
      "heavy": game.i18n.localize("WFRP4E.ArmourType.Heavy"),
      "other": game.i18n.localize("WFRP4E.ArmourType.Other")
    };


    Reflect.defineProperty(ActorWfrp4e.prototype, 'armourPrefillModifiers', { value: 
      function (item, type, options, tooltip = []) {

        let modifier = 0;
        let wearingMedium = 0;
        let wearingHeavy = 0;
    
        for (const a of this.getItemTypes("armour").filter(i => i.isEquipped)) {
          // For each armor, apply its specific penalty value, as well as marking down whether
          // it qualifies for armor type penalties (wearingMail/Plate)
    
          // Skip practical
          if (a.properties.qualities.practical)
            continue;
    
          if (a.armorType.value === "medium")
            wearingMedium += 1;
          if (a.armorType.value === "heavy")
            wearingHeavy += 1;
        }
        wearingMedium = Math.min(wearingMedium, 2);
        wearingHeavy = Math.min(wearingHeavy, 2);
  
        let stealthPenaltyValue = 0;        
        if (wearingMedium)
          stealthPenaltyValue += -10 * wearingMedium;
        if (wearingHeavy)
          stealthPenaltyValue += -10 * wearingHeavy;
  
        if (type === "skill" && item.name.includes(game.i18n.localize("NAME.Stealth"))) {
          if (stealthPenaltyValue) {
            modifier += stealthPenaltyValue
            tooltip.push(`Kara do Skradania ze względu na pancerz ciężki (max -20) lub średni (max -20) - (+${stealthPenaltyValue})`);
          }
        }
        return modifier;
      }
    });


    Reflect.defineProperty(ItemWfrp4e.prototype, '_addAPLayer', { value:
        function (AP) {
          // If the armor protects a certain location, add the AP value of the armor to the AP object's location value
          // Then pass it to addLayer to parse out important information about the armor layer, namely qualities/flaws
          for (const loc in this.currentAP) {
            if (this.currentAP[loc] > 0) {

              AP[loc].value += this.currentAP[loc];

              const layer = {
                value: this.currentAP[loc],
                armourType: this.armorType.value // used for sound
              }

              const properties = this.properties
              layer.impenetrable = !!properties.qualities.impenetrable;
              layer.partial = !!properties.flaws.partial;
              layer.weakpoints = !!properties.flaws.weakpoints;

              if (this.system.special?.value && this.system.special?.value?.indexOf('Metal') !== -1) {
                layer.metal = true;
              }

              AP[loc].layers.push(layer);
            }
          }
        }
      });

      Reflect.defineProperty(ItemWfrp4e.prototype, '_armourExpandData', { value:
        function()  {
          const data = this.toObject().system
          const properties = [];
          properties.push(game.wfrp4e.config.armorTypes[this.armorType.value]);
          const special = data.special?.value?.split(',');
          if (special) {
            for(let i = 0; i < special.length; i++) {
              properties.push(special[i]);
            }
          }
          const itemProperties = this.Qualities.concat(this.Flaws)
          for (const prop of itemProperties)
            properties.push(`<a class ='item-property'>${prop}</a>`)
          properties.push(this.penalty.value);
      
          data.properties = properties.filter(p => !!p);
          return data;
      }
    });
  }
});


Hooks.on("deleteCombat", async function (combat) {
  if (game.user.isGM) {
    const ammoReplenish = combat.getFlag('wfrp4e-pl', 'ammoReplenish');

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
      
          const html = await renderTemplate('modules/wfrp4e-pl-addons/templates/ammo-recovery.html', templateData)
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
      const ammoReplenish = game.combat.getFlag('wfrp4e-pl', 'ammoReplenish') || {};
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
      game.combat.unsetFlag('wfrp4e-pl', 'ammoReplenish').then(() => {
        game.combat.setFlag('wfrp4e-pl', 'ammoReplenish', ammoReplenish);
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