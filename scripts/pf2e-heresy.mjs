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
                                        activateScript : "return args.item?.system.attackType || args.skill?.name?.includes(game.i18n.localize('NAME.Dodge'))",
                                        targeter: true
                                    }
                                }
                            },
                            {
                                trigger: "dialog",
                                label : game.i18n.localize("WFRP4E.ConditionName.Multiattacks"),
                                script : `args.prefillModifiers.modifier -= (this.effect.conditionValue * 30)`,
                                options : {
                                    dialog : {
                                        hideScript : "return !args.item?.system.attackType && !args.skill?.name?.includes(game.i18n.localize('NAME.Dodge'))",
                                        activateScript : "return args.item?.system.attackType || args.skill?.name?.includes(game.i18n.localize('NAME.Dodge'))",
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

            Hooks.on("ready", () => {
                setTimeout(() => {
                    game.wfrp4e.config.statusEffects.splice(9, 0, multiattacks);
                    game.wfrp4e.config.conditions.multiattacks = "Atak Wielokrotny";
                    
                    game.wfrp4e.config.statusEffects.splice(9, 0, multiChannelling);
                    game.wfrp4e.config.conditions.multichannelling = "Wielokrotne Splatanie";
                    
                    game.wfrp4e.config.statusEffects.splice(9, 0, multispell);
                    game.wfrp4e.config.conditions.multispell = "Wielokrotne Czarowanie";
                }, 1000);
                let f = async function(combat, combatant) {
                    await combatant.actor.removeCondition("multiattacks", 99);
                    await combatant.actor.removeCondition("multichannelling", 99);
                    await combatant.actor.removeCondition("multispell", 99);
                }
                game.wfrp4e.combat.scripts.startTurn.push(f);
            });
        }
    }
}
