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
          foundry.utils.debouncedReload()
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
        foundry.utils.debouncedReload()
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
        foundry.utils.debouncedReload()
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
        foundry.utils.debouncedReload()
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

    $("body").on("click", ".journal-sheet .item-property", ev => {
        game.wfrp4e.utility.postProperty(ev.target.text)
    });
});



Hooks.on("ready", () => {
    const config = {

        magicLores: {
          waaagh: "Waaagh!"
        },

        magicWind: {
          waaagh: "Waaagh!"
        },

        loreEffectDescriptions: {
          waaagh: "Waaagh! Gorka Morka!",
          slaanesh: "Tradycja Slaanesha przynosi ból i ekstazę, wszystko w imię Księcia Bólu i Przyjemności dla jego wiecznego zadowolenia, łącząc perwersyjną mieszankę Ametystowego, Złotego i Jadeitowego Wiatru w coś pokręconego i egzotycznego. Efekt Tradycji: Czarnoksiężnik Slaanesha jest biegły w sztuce dostarczania przyjemności i bólu. Możesz zadać dodatkową ranę za każdy Stan Ogłuszenia lub Paniki odniesiony przez cele twoich zaklęć."
        },

        loreEffects: {
          waaagh: {
            name: "Tradycja Waaagh!",
            icon: "modules/wfrp4e-unofficial-grimoire/icons/spell_waaaaaagh!.jpg",
            transfer: true,
            flags: {
              wfrp4e: {
                effectApplication: "apply",
                effectTrigger: "oneTime",
                lore: true,
                script: `
                        let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")
                        let playersAdvantage = advantage["players"];
                        let enemiesAdvantage = advantage["enemies"];
                        if (playersAdvantage > 0) {
                          playersAdvantage -= 1;
                          enemiesAdvantage += 1;
                          ChatMessage.create({ content: "Skradziono Przewagę w imieniu Gorka i Morka!" });
                          await WFRP_Utility.updateGroupAdvantage({["players"] : playersAdvantage});
                          await WFRP_Utility.updateGroupAdvantage({["enemies"] : enemiesAdvantage});
                        }
                    `,
              },
            }
          },

          slaanesh: {
            name: "Tradycja Slaanesha",
            icon: "modules/wfrp4e-core/icons/spells/slaanesh.png",
            transfer: true,
            flags: {
              wfrp4e: {
                effectApplication: "apply",
                effectTrigger: "oneTime",
                lore: true,
                script: `
                        let stunned = this.actor.hasCondition("stunned");
                        let broken = this.actor.hasCondition("broken");
                        let wounds = 0; 
                        if (stunned) { 
                          wounds += stunned.conditionValue;
                        }
                        if (broken) {
                          wounds += broken.conditionValue;
                        }
                        if (wounds) {
                          this.actor.applyBasicDamage(wounds, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL});
                        }
                    `,
              }
            },
          },
        }
    }

    mergeObject(game.wfrp4e.config, config);
    
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
  if (game.settings.get("wfrp4e-pl-addons", "initiativeRoll.Enable")) {
    if (message.flags !== undefined) {
      if (message.flags?.core?.initiativeRoll) {
        return false;
      };
    };
  }
});