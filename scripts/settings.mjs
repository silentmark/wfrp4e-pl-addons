Hooks.on('ready', () => {
    const config = {

        magicLores: {
            waaagh: 'Waaagh!'
        },

        magicWind: {
            waaagh: 'Waaagh!'
        },

        loreEffectDescriptions: {
            waaagh: 'Waaagh! Gorka Morka!'
        },

        loreEffects: {
            waaagh: {
                name: 'Tradycja Waaagh!',
                img: 'modules/wfrp4e-unofficial-grimoire/icons/spell_waaaaaagh!.jpg',
                system: {
                    transferData : {
                        type : 'target',
                        documentType : 'Actor'
                    },
                    condition : { },
                    scriptData: [
                        {
                            trigger: 'immediate',
                            label : 'Tradycja Waaagh!',
                            script :  `
                            let advantage = game.settings.get("wfrp4e", "groupAdvantageValues")
                            let playersAdvantage = advantage["players"];
                            let enemiesAdvantage = advantage["enemies"];
                            if (playersAdvantage > 0) {
                              playersAdvantage -= 1;
                              enemiesAdvantage += 1;
                              ChatMessage.create({ content: "Skradziono Przewagę w imieniu Gorka i Morka!" });
                              await game.wfrp4e.utility.updateGroupAdvantage({["players"] : playersAdvantage});
                              await game.wfrp4e.utility.updateGroupAdvantage({["enemies"] : enemiesAdvantage});
                            }
                            `,
                            options : {
                                immediate : {
                                    deleteEffect : true
                                }
                            }
                        }
                    ]
                },
                flags: {
                    wfrp4e: {
                        lore: true
                    }
                }
            }
        }
    };
    foundry.utils.mergeObject(game.wfrp4e.config, config);
});

