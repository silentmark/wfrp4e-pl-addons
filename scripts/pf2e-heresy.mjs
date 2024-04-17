export default class PF2eHeresy {

    setup() {
        if (game.settings.get("wfrp4e-pl-addons", "pf2eHeresy.Enable")) {
            const multiattacks = {
                icon: "modules/wfrp4e-pl-addons/icons/multiattacks.png", 
                id: "multiattacks", 
                statuses: ["multiattacks"],
                name: game.i18n.localize("WFRP4E.ConditionName.Multiattacks"),
                flags: {
                    wfrp4e: {
                        value: 1,
                        scriptData: [
                            {
                                trigger: "dialog",
                                label : game.i18n.localize("WFRP4E.ConditionName.Multiattacks"),
                                script : `args.prefillModifiers.modifier -= (this.effect.conditionValue * 30)`,
                                options : {
                                    dialog : {
                                        hideScript : "return !args.item?.system.attackType && !args.skill?.name?.includes(game.i18n.localize('NAME.Dodge'))",
                                        activateScript : "return args.item?.system.attackType || args.skill?.name?.includes(game.i18n.localize('NAME.Dodge'))"
                                    }
                                }
                            }
                        ]
                    }
                }
            };

            const multiChannelling = {
                icon: "modules/wfrp4e-pl-addons/icons/multichannelling.png", 
                id: "multichannelling", 
                statuses: ["multichannelling"],
                name: game.i18n.localize("WFRP4E.ConditionName.Multichannelling"),
                flags: {
                    wfrp4e: {
                        value: 1,
                        scriptData: [
                            {
                                trigger: "dialog",
                                label : game.i18n.localize("WFRP4E.ConditionName.Multichannelling"),
                                script : `args.prefillModifiers.modifier -= (this.effect.conditionValue * 30)`,
                                options : {
                                    dialog : {
                                        hideScript : "return args.type != 'channelling'",
                                        activateScript : "return args.type == 'channelling'"
                                    }
                                }
                            }
                        ]
                    }
                }
            };

            const multispell = {
                icon: "modules/wfrp4e-pl-addons/icons/multispell.png", 
                id: "multispell", 
                statuses: ["multispell"],
                name: game.i18n.localize("WFRP4E.ConditionName.Multispell"),
                flags: {
                    wfrp4e: {
                        value: 1
                    }
                }
            };

            Hooks.on("createToken", async (token, data, user) => {
                if (game.canvas.grid.type == CONST.GRID_TYPES.GRIDLESS) {
                    await token.update({texture: {src: token.actor.img}});
                }
            });

            Hooks.on("ready", () => {
                setTimeout(() => {
                    game.wfrp4e.config.statusEffects.splice(9, 0, multiattacks);
                    game.wfrp4e.config.conditions.multiattacks = "Atak Wielokrotny";
                    
                    game.wfrp4e.config.statusEffects.splice(9, 0, multiChannelling);
                    game.wfrp4e.config.conditions.multichannelling = "Wielokrotne Splatanie";
                    
                    game.wfrp4e.config.statusEffects.splice(9, 0, multispell);
                    game.wfrp4e.config.conditions.multispell = "Wielokrotne Czarowanie";

                    game.wfrp4e.config.conditionDescriptions['multispell'] = "<b>Wielokrotne Czarowanie</b>: Postać ma w swojej Turze standarodowo 3 akcje. Rzucenie zaklęcia kosztuje liczbę akcji zależną od PZ Zaklęcia. Zaklęcia magii prostej kosztują 1 akcję. Zaklęcia magii tajemnej: zależy od PZ oraz Bonusu z siły woli. Rzucenie zaklęcia o PZ poniżej BSW kosztuje 1 akcje, rzucenie zaklęcia powyżej BSW kosztuje 2 akcje, rzucenie zaklęcia o PZ powyżej 2x BSW kosztuje 3 akcje. Każde kolejne rzucenie czaru w danej turze zwiększa o +50 (kumulatywnie) wynik na ewentualny rzut na tabelę manifestacji. ";
                    game.wfrp4e.config.conditionDescriptions['multichannelling'] = "<b>Wielokrotne Splatanie</b>: Postać ma w swojej Turze standarodowo 3 akcje. Splatanie zaklęcia to 1 akcja. Każde kolejne Splatanie Magii oprócz pierwszej w tej samej turze obarczone jest kumulatywną karą -30 oraz kumulatywnie zwiększa o +50 wynik rzutu na tabelę manifestacji.";
                    game.wfrp4e.config.conditionDescriptions['multiattacks'] = "<b>Atak Wielokrotny</b>: Postać ma w swojej Turze standarodowo 3 akcje. Każda akcja Ataku Bronią oprócz pierwszej wywołuje stan <b>Atak Wielokrotny</b>, który daje kumulatywną karę -30 do wszystkich akcji typu Atak lub Obrona aż do następnej tury. Te modyfikatory mogą być zmieniane przez różne talenty.";

                    game.wfrp4e.config.conditionDescriptions.defensive = "<b>Pozycja obronna</b>: 1 akcja, zapewnia +20 do następnej tury podczas obrony. Jeśli postać ma Tarczę, jej punkty pancerza liczą się wyłącznie jeśli postać wykorzysta tę akcję. Dodatkowo, jeśli postać ma Tarczę, korzystając z tej akcji może blokować ataki dystansowe, które są wymierzone na wprost w nią."
                    
                }, 10000);
                let f = async function(combat, combatant) {
                    await combatant.actor.removeCondition("multiattacks", 99);
                    await combatant.actor.removeCondition("multichannelling", 99);
                    await combatant.actor.removeCondition("multispell", 99);
                    await combatant.actor.removeCondition("defensive", 99);
                }
                game.wfrp4e.combat.scripts.startTurn.push(f);
            });
        }
    }
}
