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

    $("body").on("click", ".journal-sheet .item-property", ev => {
        game.wfrp4e.utility.postProperty(ev.target.text)
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

    setTimeout(() => {            
        game.wfrp4e.config.effectTriggers.measuredTemplate = "Efekt Szablonu";
        game.wfrp4e.config.effectPlaceholder.measuredTemplate = ``;
    }, (timeout = 250));

    if (game.settings.get("wfrp4e-pl-addons", "alternativeArmour.Enable")) {
      game.wfrp4e.config.armorTypes = {
        "light": game.i18n.localize("WFRP4E.ArmourType.Light"),
        "medium": game.i18n.localize("WFRP4E.ArmourType.Medium"),
        "heavy": game.i18n.localize("WFRP4E.ArmourType.Heavy"),
        "other": game.i18n.localize("WFRP4E.ArmourType.Other")
      };
    }
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

Hooks.on('preCreateChatMessage', (doc, message, options, userid) => {
    if (message.flags !== undefined) {
      if (message.flags?.core?.initiativeRoll) {
        return false;
      };
    };
  });