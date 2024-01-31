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
        },

        conditions: {
          "covered": "Zasłona przed Strzałem"
        }
    }

    mergeObject(game.wfrp4e.config, config);

    
});

