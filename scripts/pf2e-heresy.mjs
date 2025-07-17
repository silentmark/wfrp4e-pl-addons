/* eslint-disable @stylistic/js/max-len */
/**
 *
 */
export default class PF2eHeresy {

    /**
     *
     */
    setup() {
        if (game.settings.get('wfrp4e-pl-addons', 'pf2eHeresy.Enable')) {

            Reflect.defineProperty(WeaponTest.prototype, 'computeDualWielder', { value:
                function() {
                    this.result.canDualWield = !this.weapon.system.offhand.value && !this.actor.noOffhand && !this.context.edited;
                }
            });

            Reflect.defineProperty(WeaponDialog.prototype, 'computeAmbidextrous', { value:
                function() {

                    // we don't stack off hand penalty in multi-attack case.
                    // we only add this modifier, in case this is first off-hand attack.
                    if (!this.actor.hasCondition('multiattacks')) {
                        this.fields.modifier += -20;
                        this.tooltips.add('modifier', -20, game.i18n.localize('SHEET.Offhand'));
                    }

                    const ambiMod = Math.min(20, this.actor.flags.ambi * 10); // TODO could be handled by ambidextrous effect
                    this.fields.modifier += ambiMod;
                    if (this.actor.flags.ambi) {
                        this.tooltips.add('modifier', ambiMod, game.i18n.localize('NAME.Ambi'));
                    }
                }
            });

            const dualwielder = {
                name: game.i18n.localize('EFFECT.DualWielder'),
                img: 'modules/wfrp4e-core/icons/talents/dual-wielder.png',
                statuses : ['dualwielder'],
                system: {
                    condition : { },
                    scriptData : [
                        {
                            label : game.i18n.localize('EFFECT.DualWielder'),
                            trigger : 'dialog',
                            script : 'args.fields.modifier += 10',
                            options : {
                                hideScript : 'return !args.item?.system.attackType || !this.actor.hasCondition(\'multiattacks\') || !this.actor.has(game.i18n.localize("NAME.DualWielder"), "talent")',
                                activateScript : 'return args.item?.system.attackType && this.actor.hasCondition(\'multiattacks\') && this.actor.has(game.i18n.localize("NAME.DualWielder"), "talent")'
                            }
                        }
                    ]
                }
            };

            const multiattacks = {
                img: 'modules/wfrp4e-pl-addons/icons/multiattacks.png',
                id: 'multiattacks',
                statuses: ['multiattacks'],
                name: game.i18n.localize('WFRP4E.ConditionName.Multiattacks'),
                system: {
                    condition : {
                        value : 1,
                        numbered: true
                    },
                    scriptData: [
                        {
                            trigger: 'dialog',
                            label : game.i18n.localize('WFRP4E.ConditionName.Multiattacks'),
                            script : 'args.fields.modifier -= (this.effect.conditionValue * 30)',
                            options : {
                                hideScript : 'return !args.item?.system.attackType && !args.skill?.name?.includes(game.i18n.localize(\'NAME.Dodge\'))',
                                activateScript : 'return args.item?.system.attackType || args.skill?.name?.includes(game.i18n.localize(\'NAME.Dodge\'))'
                            }
                        }
                    ]
                }
            };

            const multiChannelling = {
                img: 'modules/wfrp4e-pl-addons/icons/multichannelling.png',
                id: 'multichannelling',
                statuses: ['multichannelling'],
                name: game.i18n.localize('WFRP4E.ConditionName.Multichannelling'),
                system: {
                    condition : {
                        value : 1,
                        numbered: true
                    },
                    scriptData: [
                        {
                            trigger: 'dialog',
                            label : game.i18n.localize('WFRP4E.ConditionName.Multichannelling'),
                            script : 'args.fields.modifier -= (this.effect.conditionValue * 30)',
                            options : {
                                hideScript : 'return args.type !== \'channelling\'',
                                activateScript : 'return args.type === \'channelling\''
                            }
                        }
                    ]
                }
            };

            const multispell = {
                img: 'modules/wfrp4e-pl-addons/icons/multispell.png',
                id: 'multispell',
                statuses: ['multispell'],
                name: game.i18n.localize('WFRP4E.ConditionName.Multispell'),
                system: {
                    condition : {
                        value : 1,
                        numbered: true
                    }
                }
            };

            const defensive = {
                img: 'icons/svg/shield.svg',
                id: 'defensive',
                statuses : ['defensive'],
                name: game.i18n.localize('WFRP4E.ConditionName.Defensive'),
                system: {
                    condition : { },
                    scriptData : [
                        {
                            label : game.i18n.localize('WFRP4E.ConditionName.Defensive'),
                            trigger : 'dialog',
                            script : 'args.fields.modifier += 20',
                            options : {
                                hideScript : 'return !this.actor.isOpposing',
                                activateScript : 'return this.actor.isOpposing'
                            }
                        }
                    ]
                }
            };

            const aiming = {
                img: 'icons/svg/eye.svg',
                id: 'aiming',
                statuses : ['aiming'],
                name: game.i18n.localize('WFRP4E.ConditionName.Aim'),
                system: {
                    condition : { },
                    scriptData : [
                        {
                            label : game.i18n.localize('WFRP4E.ConditionName.Aim') + ' - Kara do obrony',
                            trigger : 'dialog',
                            script : 'args.fields.modifier -= 30',
                            options : {
                                hideScript : 'return args.item?.system.attackType !== \'melee\' && !args.skill?.name?.includes(game.i18n.localize(\'NAME.Dodge\'))',
                                activateScript : 'return args.item?.system.attackType === \'melee\' || args.skill?.name?.includes(game.i18n.localize(\'NAME.Dodge\'))'
                            }
                        },
                        {
                            label : game.i18n.localize('WFRP4E.ConditionName.Aim') + ' - Bonus do ataku dystansowego',
                            trigger : 'dialog',
                            script : 'args.fields.successBonus += args.actor.system.characteristics.bs.bonus',
                            options : {
                                hideScript : 'return args.item?.system.attackType !== \'ranged\'',
                                activateScript : 'return args.item?.system.attackType === \'ranged\''
                            }
                        }
                    ]
                }
            };

            Hooks.on('ready', () => {
                setTimeout(() => {
                    game.wfrp4e.config.statusEffects.splice(9, 0, multiattacks);
                    game.wfrp4e.config.conditions.multiattacks = 'Atak Wielokrotny';

                    game.wfrp4e.config.statusEffects.splice(9, 0, multiChannelling);
                    game.wfrp4e.config.conditions.multichannelling = 'Wielokrotne Splatanie';

                    game.wfrp4e.config.statusEffects.splice(9, 0, multispell);
                    game.wfrp4e.config.conditions.multispell = 'Wielokrotne Czarowanie';

                    game.wfrp4e.config.statusEffects.splice(9, 0, defensive);
                    game.wfrp4e.config.conditions.defensive = 'Pozycja obronna';

                    game.wfrp4e.config.statusEffects.splice(9, 0, aiming);
                    game.wfrp4e.config.conditions.aiming = 'Celowanie';

                    game.wfrp4e.config.systemEffects.dualwielder = dualwielder;
                    delete game.wfrp4e.config.systemItems.defensive;

                    game.wfrp4e.config.conditionDescriptions['multispell'] = '<b>Wielokrotne Czarowanie</b>: Postać ma w swojej Turze standarodowo 3 akcje. Rzucenie zaklęcia kosztuje liczbę akcji zależną od PZ Zaklęcia. Zaklęcia magii prostej kosztują 1 akcję. Zaklęcia magii tajemnej: zależy od PZ oraz Bonusu z siły woli. Rzucenie zaklęcia o PZ poniżej BSW kosztuje 1 akcje, rzucenie zaklęcia powyżej BSW kosztuje 2 akcje, rzucenie zaklęcia o PZ powyżej 2x BSW kosztuje 3 akcje. Każde kolejne rzucenie czaru w danej turze zwiększa o +50 (kumulatywnie) wynik na ewentualny rzut na tabelę manifestacji. ';

                    game.wfrp4e.config.conditionDescriptions['multichannelling'] = '<b>Wielokrotne Splatanie</b>: Postać ma w swojej Turze standarodowo 3 akcje. Splatanie zaklęcia to 1 akcja. Każde kolejne Splatanie Magii oprócz pierwszej w tej samej turze obarczone jest kumulatywną karą -30 oraz kumulatywnie zwiększa o +50 wynik rzutu na tabelę manifestacji.';

                    game.wfrp4e.config.conditionDescriptions['multiattacks'] = '<b>Atak Wielokrotny</b>: Postać ma w swojej Turze standarodowo 3 akcje. Każda akcja Ataku Bronią oprócz pierwszej wywołuje stan <b>Atak Wielokrotny</b>, który daje kumulatywną karę -30 do wszystkich akcji typu Atak lub Obrona aż do następnej tury. Te modyfikatory mogą być zmieniane przez różne talenty.';

                    game.wfrp4e.config.conditionDescriptions['defensive'] = '<b>Pozycja obronna</b>: 1 akcja, zapewnia +20 do następnej tury podczas obrony. Jeśli postać ma Tarczę, jej punkty pancerza liczą się wyłącznie jeśli postać wykorzysta tę akcję. Dodatkowo, jeśli postać ma Tarczę, korzystając z tej akcji może blokować ataki dystansowe, które są wymierzone na wprost w nią.';

                    game.wfrp4e.config.conditionDescriptions['aiming'] = '<b>Celowanie</b>: 1 akcja, zapewnia +Bonus US SL do następnej tury podczas ataków dystansowych. Niestety, z powodu skupienia na celu, postać jest bardziej podatna na ataki w walce wręcz (-30 do unikow i parowania).';

                    const bleeding = game.wfrp4e.config.statusEffects.find(x => x.id === 'bleeding');
                    bleeding.system = bleeding.system || {};
                    bleeding.system.condition = bleeding.system.condition || {};
                    bleeding.system.condition.trigger = 'startTurn';
                    bleeding.system.scriptData = bleeding.system.scriptData || [];
                    bleeding.system.scriptData[0].script = `let uiaBleeding = game.settings.get("wfrp4e", "uiaBleeding");
                                        let actor = this.actor;
                                        let effect = this.effect;
                                        let bleedingAmt;
                                        let bleedingRoll;
                                        let msg = ""
                                        let damage = effect.conditionValue;
                                        let scriptArgs = {msg, damage};
                                        await Promise.all(actor.runScripts("preApplyCondition", {effect, data : scriptArgs}))
                                        msg = scriptArgs.msg;
                                        damage = scriptArgs.damage;
                                        msg += await actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, minimumOne : false, suppressMsg : true})
                                        if (actor.status.wounds.value === 0 && !actor.hasCondition("unconscious"))
                                        {
                                            addBleedingUnconscious = async () => {
                                                await actor.addCondition("unconscious")
                                                msg += "<br>" + game.i18n.format("BleedUnc", {name: actor.prototypeToken.name })
                                            }
                                            if (uiaBleeding) {
                                                test = await actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle : " - " + this.effect.name, skipTargets: true, fields : {difficulty : "challenging"}});
                                                await test.roll();
                                                if (test.failed) {
                                                    await addBleedingUnconscious();
                                                }
                                            } else {
                                                await addBleedingUnconscious();
                                            }
                                        }
                                        if (actor.hasCondition("unconscious"))
                                        {
                                            bleedingAmt = effect.conditionValue;
                                            bleedingRoll = (await new Roll("1d100").roll()).total;
                                            if (bleedingRoll <= bleedingAmt * 10)
                                            {
                                                msg += "<br>" + game.i18n.format("BleedFail", {name: actor.prototypeToken.name}) + " (" + game.i18n.localize("Rolled") + " " + bleedingRoll + ")";
                                                await actor.addCondition("dead")
                                            }
                                            else if (bleedingRoll % 11 === 0)
                                            {
                                                msg += "<br>" + game.i18n.format("BleedCrit", { name: actor.prototypeToken.name } ) + " (" + game.i18n.localize("Rolled") + bleedingRoll + ")"
                                                await actor.removeCondition("bleeding")
                                            }
                                            else
                                            {
                                                msg += "<br>" + game.i18n.localize("BleedRoll") + ": " + bleedingRoll;
                                            }
                                        }
                                        await Promise.all(actor.runScripts("applyCondition", {effect, data : {bleedingRoll}}))
                                        if (args.suppressMessage)
                                        {
                                            let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                            messageData.speaker = {alias: this.effect.name}
                                            messageData.flavor = this.effect.name;
                                            return messageData
                                        }
                                        else
                                        {
                                            return this.script.message(msg)
                                        }
                                        `;

                    const poisoned = game.wfrp4e.config.statusEffects.find(x => x.id === 'poisoned');
                    poisoned.system = poisoned.system || {};
                    poisoned.system.condition = poisoned.system.condition || {};
                    poisoned.system.condition.trigger = 'startTurn';
                    poisoned.system.scriptData = poisoned.system.scriptData || [];
                    poisoned.system.scriptData = [
                        {
                            trigger: 'manual',
                            label : 'Zatrucie - Obrażenia',
                            script : `
                            let actor = this.actor;
                            let effect = this.effect;
                            let msg = ""

                            let damage = effect.conditionValue;
                            let scriptArgs = {msg, damage};

                            await Promise.all(actor.runScripts("preApplyCondition", {effect, data : scriptArgs}))
                            
                            msg = scriptArgs.msg;
                            damage = scriptArgs.damage;
                            msg += await actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true})
                            
                            await Promise.all(actor.runScripts("applyCondition", {effect}))

                            if (args.suppressMessage)
                            {
                                let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                messageData.speaker = {alias: this.effect.name}
                                return messageData
                            }
                            else
                            {
                                return this.script.message(msg)
                            }
                            `
                        },
                        {
                            trigger: 'manual',
                            label : 'Zatrucie - Odporność',
                            script : `
                            let actor = this.actor;
                            let effect = this.effect;
                            let msg = ""
                            let test = await actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle : " - Zatrucie"})
                            await test.roll();
                            if (test.result.outcome === "success")
                            {
                                await actor.removeCondition("poisoned", Math.min(test.result.SL, effect.conditionValue));
                                msg += "<br/>Liczba usuniętych stanów Zatrucia: " + Math.min(test.result.SL, effect.conditionValue);
                            }
                            else
                            {
                                msg += "<br/>Nie udało się usunąć stanu Zatrucia";
                            }

                            if (args.suppressMessage)
                            {
                                let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                messageData.speaker = {alias: this.effect.name}
                                return messageData
                            }
                            else
                            {
                                return this.script.message(msg)
                            }
                            `
                        },
                        {
                            trigger: 'dialog',
                            label : 'Zatrucie',
                            script : 'args.fields.modifier -= 10 * this.effect.conditionValue',
                            options : {
                                activateScript : 'return true'
                            }
                        }
                    ];

                    const ablaze = game.wfrp4e.config.statusEffects.find(x => x.id === 'ablaze');
                    ablaze.system = ablaze.system || {};
                    ablaze.system.condition = ablaze.system.condition || {};
                    ablaze.system.condition.trigger = 'startTurn';

                    const stunned = game.wfrp4e.config.statusEffects.find(x => x.id === 'stunned');
                    stunned.system = {
                        condition : {
                            value : 1,
                            numbered: true,
                            trigger: 'startTurn'
                        },
                        scriptData: [{
                            trigger: 'manual',
                            label: 'Oszołomienie - Odporność',
                            script: `
                                let actor = this.actor;
                                let effect = this.effect;
                                let msg = "<h2>" + game.i18n.localize("WFRP4E.ConditionName.Stunned") + "</h2>"
                                
                                let conditionValue = effect.conditionValue;
                                let damage = effect.conditionValue;
                                let scriptArgs = {msg, damage};
                                await Promise.all(actor.runScripts("preApplyCondition", {effect, data : scriptArgs}))
                                
                                let test = await actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle : " - Oszołomienie"})
                                await test.roll();
                                if (test.result.outcome === "success")
                                {
                                    await actor.removeCondition("stunned", Math.min(test.result.SL, conditionValue));
                                    msg += "Liczba usuniętych stanów Oszołomienia: " + Math.min(test.result.SL, conditionValue);
                                }
                                else
                                {
                                    msg += "Nie udało się usunąć stanu Oszołomienia";
                                }
                                let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                messageData.speaker = {alias: actor.prototypeToken.name}
                                await Promise.all(actor.runScripts("applyCondition", {effect, data : {messageData}}))
                                if (args.suppressMessage)
                                {
                                    let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                    messageData.speaker = {alias: this.actor.prototypeToken.name}
                                    messageData.flavor = this.effect.name
                                    return messageData
                                }
                                else
                                {
                                    return this.script.message(msg)
                                }
                                `
                        }, {
                            trigger: 'dialog',
                            label : 'Kara do wszystkich testów (Oszołomienie)',
                            script : 'args.fields.modifier -= 10 * this.effect.conditionValue',
                            options : {
                                activateScript : 'return true'
                            }
                        }, {
                            trigger: 'dialog',
                            label : 'Oszołomienie - Bonus do testów Ataku',
                            script : 'args.fields.slBonus += 1',
                            options : {
                                hideScript : 'return args.item?.system.attackType !== \'melee\'',
                                activateScript : 'return args.item?.system.attackType === \'melee\'',
                                targeter: true
                            }
                        }
                        ]
                    };

                    const entangled = game.wfrp4e.config.statusEffects.find(x => x.id === 'entangled');
                    entangled.system = {
                        condition : {
                            value : 1,
                            numbered: true,
                            trigger: 'startTurn'
                        },
                        scriptData: [
                            {
                                trigger: 'manual',
                                label: 'Pochwycenie',
                                script: `
                                    let actor = this.actor;
                                    let effect = this.effect;
                                    let msg = "<h2>Pochwycenie</h2>";
    
                                    let conditionValue = effect.conditionValue;
                                    let conditionStrength = effect.flags.wfrp4e.extra;
                                    let scriptArgs = {msg, conditionValue, conditionStrength};
                                    await Promise.all(actor.runScripts("preApplyCondition", {effect, data : scriptArgs}))
                                    let test = await actor.setupCharacteristic("s", {appendTitle : " - Pochwycenie vs " + conditionStrength})
                                    await test.roll();
                                    if (conditionStrength) 
                                    {
                                        const roll = await new Roll("1d100").roll();
                                        await game.dice3d.showForRoll(roll, game.user, true, null, false);
                                        const opponentSl = Math.floor(Number.parseInt(conditionStrength) / 10) - Math.floor(roll.total/ 10);
                                        if (test.result.SL - opponentSl > 0)
                                        {
                                            await actor.removeCondition("entangled", Math.min(test.result.SL - opponentSl, conditionValue));
                                            msg += "Punkty sukcesu z Testu Przeciwstawnego: " + opponentSl + " (" + roll.total + " vs " + conditionStrength + ")<br/>";
                                            msg += "Liczba usuniętych stanów Pochwycenie: " + Math.min(test.result.SL - opponentSl, conditionValue);
                                        } 
                                        else 
                                        {
                                            msg += "Punkty sukcesu z Testu Przeciwstawnego: " + opponentSl + " (" + roll.total + " vs " + conditionStrength + ")<br/>";
                                            msg += "Nie udało się usunąć stanu Pochwycenie";
                                        }
                                    } 
                                    else 
                                    {
                                        if (test.result.outcome === "success") 
                                        {
                                            await actor.removeCondition("entangled", Math.min(test.result.SL, conditionValue));
                                            msg += "Liczba usuniętych stanów Pochwycenie: " + Math.min(test.result.SL, conditionValue);
                                        }
                                        else 
                                        {
                                            msg += "Nie udało się usunąć stanu Pochwycenie";
                                        }
                                    }
                                    let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                    messageData.speaker = {alias: actor.prototypeToken.name}
                                    await Promise.all(actor.runScripts("applyCondition", {effect, data : {messageData}}))
                                    if (args.suppressMessage)
                                    {
                                        let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                        messageData.speaker = {alias: this.actor.prototypeToken.name}
                                        messageData.flavor = this.effect.name
                                        return messageData
                                    }
                                    else
                                    {
                                        return this.script.message(msg)
                                    }
                                `
                            },
                            {
                                trigger: 'dialog',
                                label : 'Pochwycenie - Testy związane z ruchem',
                                script : 'args.fields.modifier -= 10 * this.effect.conditionValue',
                                options : {
                                    activateScript : 'return [\'ws\', \'bs\', \'ag\'].includes(args.characteristic)'
                                }
                            }
                        ]
                    };

                    const broken = game.wfrp4e.config.statusEffects.find(x => x.id === 'broken');
                    broken.system =  {
                        condition: {
                            value: 1,
                            numbered: true,
                            trigger: 'startTurn'
                        },
                        scriptData: [
                            {
                                trigger: 'manual',
                                label: 'Panika',
                                script:
                                `
                                    let actor = this.actor;
                                    let effect = this.effect;
                                    let msg = "<h2>" + game.i18n.localize("WFRP4E.ConditionName.Broken") + "</h2>";
                                    let conditionValue = effect.conditionValue;
                                    let scriptArgs = {msg, conditionValue};
                                    await Promise.all(actor.runScripts("preApplyCondition", {effect, data : scriptArgs}))
                                    let test = await actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle : " - Panika"})
                                    await test.roll();
                                    if (test.result.outcome === "success")
                                    {
                                        await actor.removeCondition("broken", Math.min(test.result.SL, conditionValue));
                                        msg += "Liczba usuniętych stanów Paniki: " + Math.min(test.result.SL, conditionValue);
                                    }
                                    else
                                    {
                                        msg += "Nie udało się usunąć stanu Paniki";
                                    }
                                    let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                    messageData.speaker = {alias: actor.prototypeToken.name}
                                    await Promise.all(actor.runScripts("applyCondition", {effect, data : {messageData}}))
                                    if (args.suppressMessage)
                                    {
                                        let messageData = game.wfrp4e.utility.chatDataSetup(msg);
                                        messageData.speaker = {alias: this.actor.prototypeToken.name}
                                        messageData.flavor = this.effect.name
                                        return messageData
                                    }
                                    else
                                    {
                                        return this.script.message(msg)
                                    }
                                `
                            },
                            {
                                trigger: 'dialog',
                                label : 'Panika - Wszystkie testy nie związane z ucieczką i ukrywaniem się.',
                                script : 'args.fields.modifier -= 10 * this.effect.conditionValue',
                                options : {
                                    activateScript : 'return !args.skill?.name?.includes(game.i18n.localize(\'NAME.Stealth\')) && args.skill?.name !== game.i18n.localize(\'NAME.Athletics\')'
                                }
                            }
                        ]
                    };
                }, 10000);
                const f = async function(combat, _updateData) {
                    await combat.combatant.actor.removeCondition('multiattacks', 99);
                    await combat.combatant.actor.removeCondition('multichannelling', 99);
                    await combat.combatant.actor.removeCondition('multispell', 99);
                    await combat.combatant.actor.removeCondition('defensive', 99);
                    await combat.combatant.actor.removeCondition('aiming', 99);
                    await combat.combatant.actor.removeSystemEffect('dualwielder');
                };
                CombatHelpers.startTurn.push(f);
            });
        }
    }
}