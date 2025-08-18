import CircleHelper from './circle-helper.mjs';

/**
 *
 */
export default class WindsOfMagic {

    calculateWind = function(args) {
        const wind = args.skill.name.substring(args.skill.name.indexOf('(') + 1, args.skill.name.indexOf(')'));
        const winds = game.combat.flags['wfrp4e-pl-addons']['winds'];
        if (winds) {
            if (args.type === 'channelling') {
                const modifier = winds.modifier.find(x=> x.wind === wind)?.modifier;
                if (modifier !== 0 && modifier !== undefined) {
                    const newScript = {
                        label: 'Wiatry Magii (' + wind + ')',
                        trigger: 'dialog',
                        script : `args.fields.modifier += ${modifier};`,
                        options : { activateScript : 'return true;' }
                    };
                    return new WarhammerScript(newScript);
                }
            }
            if (winds.tzeentchInfluence && args.type === 'cast') {
                const newScript = {
                    trigger: 'dialog',
                    label: 'Nasycenie Magią',
                    script : 'args.fields.slBonus += 1;',
                    options : {
                        activateScript : 'return true;'
                    }
                };
                return new WarhammerScript(newScript);
            }
        }
    };

    calculateTzeentch = async function(test) {
        if (test.spell) { //channnel or cast test.
            const winds = game.combat.flags['wfrp4e-pl-addons']['winds'];
            if (winds?.tzeentchInfluence && test.result.roll.toString() === '99') {
                const demons = game.actors.filter(x => x.itemTags['trait'].find(t => t.name === 'Demoniczny'));
                if (demons.length) {
                    const choice = await ItemDialog.create(demons.map(z=> ({ id: z.uuid, name: z.name })), 1, 'Wybierz Demona');
                    if (choice && choice[0].id) {
                        const options = {
                            updateData: {
                                token: { alpha: 0 }
                            },
                            count: 1
                        };
                        const [creature] = await new Portal()
                            .addCreature(choice[0].id, options)
                            .spawn();

                        await Sequencer.Helpers.wait(200);
                        new Sequence()
                            .effect()
                            .file('jb2a.magic_signs.circle.02.abjuration.intro.dark_purple')
                            .atLocation(creature)
                            .scaleToObject(2.5)
                            .randomRotation()
                            .play();

                        ChatMessage.create({ content: '<span>Złowrogie wpływy Tzeentcha wywołały manifestację chaosu: <a class=\'table-click fumble-roll\' title=\'Złowrogie Wpływy Tzeentcha\' data-table=\'miscast\' data-modifier=\'100\'><i class=\'fas fa-list\'></i>Poważna Manifestacja Chaosu (+100)</a></span>' });
                    }
                }
            } else if (winds?.tzeentchInfluence && test.result.roll.toString().split('').reverse()[0] === '9') {
                ChatMessage.create({ content: '<span>Złowrogie wpływy Tzeentcha wywołały manifestację chaosu: <a class=\'table-click fumble-roll\' title=\'Złowrogie Wpływy Tzeentcha\' data-table=\'miscast\' data-modifier=\'0\'><i class=\'fas fa-list\'></i>Pomniejsza Manifestacja Chaosu</a></span>' });
            }
        }
    };
    /**
     *
     */
    setup() {
        if (game.settings.get('wfrp4e-pl-addons', 'windsOfMagicCombatRolls.Enable')) {
            Hooks.on('createCombat', async function(combat) {
                if (game.user.isGM) {
                    const winds = Object.values(game.wfrp4e.config.magicWind).filter(x => x !== game.i18n.localize('None')).filter((value, index, array) => array.indexOf(value) === index);
                    const templateData = {
                        winds: winds.map(wind => ({ wind, modifier: 0 })),
                        tzeentchInfluence: false
                    };

                    const html = await renderTemplate('modules/wfrp4e-pl-addons/templates/winds-of-magic.hbs', templateData);
                    new Dialog({
                        content: html,
                        title: 'Rzut na Wiatry Magii',
                        buttons: {
                            confirm: {
                                label: 'Rzut',
                                callback: async(dlg) => {
                                    const tableName = 'winds';
                                    const inputs = $('input.wind[name]', dlg).toArray();
                                    const windsModifier = await Promise.all(inputs.map(async input => {
                                        const wind = input.name;
                                        const modValue = Number(input.value);
                                        const roll = await game.wfrp4e.tables.rollTable(tableName, { hideDSN: true, modifier: modValue });
                                        const result = Number(roll.result);
                                        return { wind, modifier: result };
                                    }));

                                    const winds = {
                                        modifier: windsModifier,
                                        tzeentchInfluence: !!$('input[name="tzeentchInfluence"]', dlg).is(':checked')
                                    };

                                    await combat.setFlag('wfrp4e-pl-addons', 'winds', winds);

                                    const rows = windsModifier
                                        .map(w => `<tr><td><strong>${w.wind}</strong>:</td><td>${w.modifier > 0 ? '+' : ''}${w.modifier}</td></tr>`)
                                        .join('');

                                    await ChatMessage.create({
                                        content: `<p><strong>Zmienne Wiatry magii wpływają na splatanie w następujący sposób:</strong><table>${rows}</table></p>`
                                    });
                                }
                            }
                        },
                        default: 'confirm',
                        close: _dlg => { }
                    }).render(true);
                }
            });

            Hooks.on('wfrp4e:createRollDialog', (dialog) => {
                const script = game.modules.get(wfrp4ePlAddon.moduleId).api.windsOfMagic.calculateWind(dialog);
                if (script) {
                    dialog.data.scripts.push(script);
                }
            });

            Hooks.on('wfrp4e:rollCastTest', async function(castTest, _chatData) {
                await game.modules.get(wfrp4ePlAddon.moduleId).api.windsOfMagic.calculateTzeentch(castTest);
            });

            Hooks.on('wfrp4e:rollChannelTest', async function(castTest, _chatData) {
                await game.modules.get(wfrp4ePlAddon.moduleId).api.windsOfMagic.calculateTzeentch(castTest);
            });

            Hooks.on('combatRound', async function(combat, _updateData, _options) {
                if (game.user.isGM) {
                    const spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
                    if (spells) {
                        for (const messageId in spells) {
                            if (spells[messageId]) {
                                const duration = spells[messageId].duration;
                                if (duration.unit === 'rund' && Number.isInteger(duration.current) && Number.parseInt(duration.current) > 0) {
                                    duration.current = Number.parseInt(duration.current) - 1;
                                }
                            }
                        }
                        await combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
                    }
                }
            });

            Hooks.on('renderChatMessage', async(app, html, messageData) => {
                if (!game.user.isGM) {
                    return;
                }
                const combat = game.combat;
                if (combat && combat.round !== 0 && combat.turns && combat.active && app?.system?.test) {//combat started
                    const test = app.system.test;
                    if ((test?.constructor?.name === 'WomCastTest' && test.result.castOutcome === 'success') ||
                        (test?.constructor?.name === 'WeaponTest' && test.result.outcome === 'success' && test.weapon?.areaEffects?.length)) {
                        const newMessage = jQuery(html).find('.message-content').append(jQuery('<div class="card-content"><a class="chat-button card-track-spell" style="width: 100%">Śledź zaklęcie / Efekt</a></div>'));
                        newMessage.find('.card-track-spell').click(async function() {
                            const messageId = messageData.message._id;
                            const userId = messageData.user.id;
                            const message = game.messages.get(messageId);
                            const test = message.system.test;

                            let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
                            if (!spells) {
                                spells = {};
                            }

                            spells[messageId] = {
                                user: userId,
                                test: test,
                                message: messageId
                            };
                            if (test.constructor.name === 'WomCastTest') {
                                spells[messageId].type = 'Spell';
                                spells[messageId].duration = test.result.overcast.usage.duration;
                            } else {
                                spells[messageId].type = 'Weapon';
                                const effect = test.weapon.areaEffects;
                                spells[messageId].duration = { current: effect.duration.rounds, unit: 'rund' };
                            }
                            if (test.data?.context?.templates) {
                                spells[messageId].templates = test.data.context.templates;
                            }
                            await combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
                        });
                    }
                }
            });

            Hooks.on('renderCombatTracker', (_app, html, _options) => {
                const combat = game.combat;
                if (combat) {

                    game.combat.combatants.forEach(c => {
                        // Add class to trigger drag events.
                        const bar = c.token.getBarAttribute('bar1');
                        const healthSvg = CircleHelper.getProgressCircle({
                            current: bar.value,
                            max: bar.max,
                            radius: 22
                        });
                        const $combatant = jQuery(html).find(`.combatant[data-combatant-id="${c.id}"]`);
                        $combatant.find('.token-image').wrap('<div class="ce-image-wrapper" style="position: relative;">');
                        $combatant.find('.ce-image-wrapper').append(CircleHelper.getProgressCircleHtml(healthSvg));
                    });

                    const spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
                    if (spells) {
                        let rows = '';
                        let element = '<div style="width: 100%; text-align: center; flex: 0;"><h4>Aktywne zaklęcia</h4></div><ol id="spell-tracker" style="min-height: 20%; flex: 0;" class="directory-list">[[rows]]</ol>';

                        for (const messageId in spells) {
                            if (!spells[messageId]) {
                                continue;
                            }
                            const msg = spells[messageId];
                            if (msg.type === 'Spell') {
                                const actorId = msg.test.data.context.speaker.actor;
                                const actorName = msg.test.data.context.chatOptions.speaker.alias;
                                const spellName = msg.test.data.preData.itemData.name;
                                const spellImg = msg.test.data.preData.itemData.img;
                                const spellId = msg.test.data.preData.itemData._id;
                                const isMemorized = msg.test.data.result.itemData.system.memorized.value;
                                let cnValue = msg.test.data.result.itemData.system.cn.value;
                                if (!isMemorized) {
                                    cnValue = cnValue / 2;
                                }
                                const duration = msg.duration;
                                const dispelValue = cnValue + Number.parseInt(msg.test.data.result.SL);

                                let textStyle = '';
                                let imageStyle = '';
                                if (duration.current === 0) {
                                    textStyle = 'color: var(--color-text-light-7);';
                                    imageStyle = 'opacity: 0.3';
                                }

                                rows += `<li class="directory-item flexrow" style="position: relative;" data-message-id="${messageId}" data-spell-id="${spellId}" data-actor-id="${actorId}">
                                    <div class="flexcol" style="max-width: 48px;max-height: 48px;">
                                        <img style="width:48px;max-width: 48px;${imageStyle}" alt="${spellName} - ${actorName}" src="${spellImg}">
                                    </div>
                                    <div class="flexcol" style="width: calc(100% - 48px);height: 48px;${textStyle}">
                                        <div class="flexrow" style="width: 100%;height: 50%;margin-top: -10px;padding-left: 10px;margin-bottom: 10px;">${spellName} - ${actorName}</div>
                                        <div class="flexrow" style="width: 100%;height: 50%;margin-top: -10px;padding-left: 10px;margin-bottom: 10px;">
                                            <div class="flexcol duration-value" style="text-align: center;width: 48px;min-width: 48px;max-width: 48px;height: 100%;">${duration.current}</div>
                                            <div class="flexcol duration-unit" style="min-width: calc(100% - 146px);text-align: center;height: 100%;">${duration.unit}</div>
                                            <div class="flexcol dispel-value" style="text-align: center;min-width: 48px;height: 100%;" title="Wartość Rozproszenia">${dispelValue}</div>
                                            <div style="max-width: 48px;min-width: 48px;text-align: center;height: 100%;">
                                                <a class="item-controls spell-dispel" data-spell-id="${messageId}" title="Rozprosz Zaklęcie"><i class="fas fa-burst"></i></a>
                                                <a class="item-controls spell-delete" data-spell-id="${messageId}" title="Skasuj Zaklęcie"><i class="fas fa-trash"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                    </li>`;
                            } else {
                                const actorId = msg.test.data.context.speaker.actor;
                                const actorName = msg.test.data.context.chatOptions.speaker.alias;
                                const item = game.actors.get(actorId).items.get(msg.test.data.preData.item);

                                const itemName = item.name;
                                const itemImg = item.img;
                                const itemId = item.id;

                                const duration = msg.duration;
                                let textStyle = '';
                                let imageStyle = '';
                                if (duration.current === 0) {
                                    textStyle = 'color: var(--color-text-light-7);';
                                    imageStyle = 'opacity: 0.3';
                                }

                                rows += `<li class="directory-item flexrow" style="position: relative;" data-message-id="${messageId}" data-item-id="${itemId}" data-actor-id="${actorId}">
                                    <div class="flexcol" style="max-width: 48px;max-height: 48px;">
                                        <img style="width:48px;max-width: 48px;${imageStyle}" alt="${itemName} - ${actorName}" src="${itemImg}">
                                    </div>
                                    <div class="flexcol" style="width: calc(100% - 48px);height: 48px;${textStyle}">
                                        <div class="flexrow" style="width: 100%;height: 50%;margin-top: -10px;padding-left: 10px;margin-bottom: 10px;">${itemName} - ${actorName}</div>
                                        <div class="flexrow" style="width: 100%;height: 50%;margin-top: -10px;padding-left: 10px;margin-bottom: 10px;">
                                            <div class="flexcol duration-value" style="text-align: center;width: 48px;min-width: 48px;max-width: 48px;height: 100%;">${duration.current}</div>
                                            <div class="flexcol duration-unit" style="min-width: calc(100% - 96px);text-align: center;height: 100%;">${duration.unit}</div>
                                            <div style="max-width: 48px;min-width: 48px;text-align: center;height: 100%;">
                                                <a class="item-controls item-delete" data-item-id="${messageId}" title="Skasuj Przedmiot"><i class="fas fa-trash"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                    </li>`;
                            }
                        }
                        element = element.replace('[[rows]]', rows);
                        const newElement = $(element).insertBefore(jQuery(html).find('#combat-controls'));
                        newElement.find('.spell-delete').click(async function() {
                            let spells = game.combat.getFlag('wfrp4e-pl-addons', 'spells');
                            if (!spells) {
                                spells = {};
                            }
                            spells[this.dataset.spellId] = null;
                            await game.combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
                        });
                        newElement.find('.item-delete').click(async function() {
                            let spells = game.combat.getFlag('wfrp4e-pl-addons', 'spells');
                            if (!spells) {
                                spells = {};
                            }
                            spells[this.dataset.itemId] = null;
                            await game.combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
                        });
                        newElement.find('.spell-dispel').click(async function() {
                            const spells = game.combat.getFlag('wfrp4e-pl-addons', 'spells');
                            const messageId = this.dataset.spellId;
                            if (!spells) {
                                return;
                            }
                            if (game.canvas.tokens.controlled.length !== 1) {
                                return;
                            }
                            const actor = game.canvas.tokens.controlled[0].actor;
                            const skill = actor.itemTags['skill'].find(x => x.name === 'Język (Magiczny)');
                            if (!skill) {
                                return;
                            }
                            const spell = spells[messageId];
                            const dispelValue = spell.test.data.result.itemData.system.cn.value + Number.parseInt(spell.test.data.result.SL);
                            let dispelTest = actor.itemTags['extendedTest'].find(x => x.getFlag('wfrp4e-pl-addons', 'messageId') === messageId);
                            if (!dispelTest) {

                                const extendedTestData = {
                                    name : 'Rozpraszanie Zaklęcia - ' + spell.test.data.result.itemData.name,
                                    type: 'extendedTest',
                                    system: {
                                        SL: {
                                            current: 0,
                                            target: dispelValue
                                        },
                                        test: {
                                            value: 'Język (Magiczny)'
                                        },
                                        failingDecreases:{
                                            value: false
                                        },
                                        negativePossible: {
                                            value: false
                                        },
                                        completion: {
                                            value: 'remove'
                                        },
                                        difficulty: {
                                            value: 'challenging'
                                        }
                                    }
                                };
                                dispelTest = (await actor.createEmbeddedDocuments('Item', [extendedTestData]))[0];
                            }
                            await actor.setupExtendedTest(dispelTest, { appendTitle : ' - Rozpraszanie Zaklęcia' });
                        });
                    }
                }
            });
        }
    }
}