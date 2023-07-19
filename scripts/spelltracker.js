
Hooks.on("renderChatMessage", async (app, html, messageData) => {
    if (!game.user.isUniqueGM) {
      return;
    }
    const combat = game.combats.active;
    if (combat && combat.round != 0 && combat.turns && combat.active) {//combat started
        let castTest = app.getTest();
        if (castTest?.constructor?.name == "WomCastTest" && castTest.result.castOutcome == "success") {
            let newMessage = jQuery(html).find(".message-content").append(jQuery('<div class="card-content"><a class="chat-button card-track-spell" style="width: 100%">Śledź zaklęcie</a></div>'))
            newMessage.find(".card-track-spell").click(async function () {
              let messageId = messageData.message._id;
              let userId = messageData.user.id;
              let message = game.messages.get(messageId);
              let castTest = message.getTest();
              
              let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
              if (!spells) {
                spells = {};
              } 
              spells[messageId] = {
                user: userId, 
                castTest: castTest,
                message: messageId
              }
              await combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
          });
        }
    }
});
    
Hooks.on("renderCombatTracker", (app, html, options) => {

    const combat = game.combats.active; 

    if(combat) {
        let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
        if (spells) {
            let rows = ``;
            for(let messageId in spells) {
                if (!spells[messageId]) continue;
                let actorId = spells[messageId].castTest.data.context.speaker.actor;
                let actorName = spells[messageId].castTest.data.context.cardOptions.speaker.alias;
                let spellName = spells[messageId].castTest.data.preData.itemData.name;
                let spellImg = spells[messageId].castTest.data.preData.itemData.img;
                let spellId = spells[messageId].castTest.data.preData.itemData._id;
                let duration = spells[messageId].castTest.data.result.overcast.usage.duration;
                
                let textStyle = ""
                let imageStyle = "";
                if (duration.current == 0) {
                    textStyle = "color: var(--color-text-light-7);";
                    imageStyle = "opacity: 0.3";
                }

                rows += `<li class="directory-item flexrow" style="position: relative; height: 55px;" data-message-id="${messageId}" data-spell-id="${spellId}" data-actor-id="${actorId}">
                <div class="flexcol"><img style="width:48px;${imageStyle}" alt="${spellName}" src="${spellImg}"></div>
                <div class="flexcol">
                    <h4 style="width: 200px;text-overflow:ellipsis;${textStyle}">${spellName} - ${actorName}</h4>
                </div>        
                <div class="flexcol duration-value" style="text-align: center;">
                    <span style="${textStyle}">${duration.current}</span>
                </div>        
                <div class="flexcol duration-unit" style="text-align: center;">
                    <span style="${textStyle}">${duration.unit}</span>
                </div>
                <div>
                    <a class="item-controls item-delete" data-spell-id="${messageId}" title="Skasuj Zaklęcie"><i class="fas fa-trash"></i></a>
                </div>
            </li>`;
            }
            let element = 
            $(`
            <div style="width: 100%; text-align: center; flex: 0;"><h4>Aktywne zaklęcia</h4></div>
            <ol id="spell-tracker" style="min-height: 20%; flex: 0;" class="directory-list">
            ${rows}
            </ol>
            `)
        
            let newElement = element.insertBefore(html.find("#combat-controls"));
            newElement.find(".item-delete").click(async function () {
                let spells = game.combats.active.getFlag('wfrp4e-pl-addons', 'spells');
                if (!spells) {
                  spells = {};
                }
                spells[this.dataset.spellId] = null;
                await game.combats.active.setFlag('wfrp4e-pl-addons', 'spells', spells);
            });
        }
    }
});

Hooks.on("preUpdateCombat", async (combat, updateData, context) => {
    const previousId = combat.combatant?.id;
    const path = `wfrp4e-pl-addons.previousCombatant`;
    foundry.utils.setProperty(context, path, previousId);

    const prevPath = `wfrp4e-pl-addons.previousTR`;
    const prevTR = { T: combat.turn, R: combat.round };
    foundry.utils.setProperty(context, prevPath, prevTR);

    const startedPath = `wfrp4e-pl-addons.started`;
    const prevStarted = combat.started;
    foundry.utils.setProperty(context, startedPath, prevStarted);

    if (game.user.isGM) {
        if (combat.round != 0 && combat.turns && combat.active) {
            if (combat.current.turn > -1 && combat.current.turn == combat.turns.length - 1) {//end of round
                if (updateData.flags && updateData.flags['wfrp4e-pl-addons']) {
                    let moduleFlags = updateData.flags['wfrp4e-pl-addons'];
                    if (moduleFlags['spells'] !== null) return;
                }
                let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
                if (spells) {
                    for (let messageId in spells) {
                        let duration = spells[messageId].castTest.data.result.overcast.usage.duration;
                        if (duration.unit === 'rund' && Number.isInteger(duration.current) && duration.current > 0) {
                            duration.current = Number.parseInt(duration.current) - 1;
                        }
                    }
                    await combat.setFlag('wfrp4e-pl-addons', 'spells', spells);
                }
            }
        }
    }
});

  // onTurnStart/End/Each
Hooks.on("updateCombat", async (combat, changes, context) => {
    const cTurn = combat.current.turn;
    const pTurn = foundry.utils.getProperty(context, `wfrp4e-pl-addons.previousTR.T`);
    const cRound = combat.current.round;
    const pRound = foundry.utils.getProperty(context, `wfrp4e-pl-addons.previousTR.R`);

    // no change in turns nor rounds.
    if (changes.turn === undefined && changes.round === undefined) return;
    // combat not started or not active.
    if (!combat.started || !combat.isActive) return;
    // we went back.
    if (cRound < pRound || (cTurn < pTurn && cRound === pRound)) return;

    if (!game.user.isGM) return;

    // retrieve combatants.
    const currentCombatant = combat.combatant;
    const previousId = foundry.utils.getProperty(context, `wfrp4e-pl-addons.previousCombatant`);
    const wasStarted = foundry.utils.getProperty(context, `wfrp4e-pl-addons.started`);
    const previousCombatant = wasStarted ? combat.combatants.get(previousId) : null;

    // end turn
    if (previousCombatant && !previousCombatant.isDefeated) {
        let spells = combat.getFlag('wfrp4e-pl-addons', 'spells');
        if (!spells) 
            return;
        for (let messageId in spells) {
            if (!spells[messageId]) continue;
            let duration = spells[messageId].castTest.data.result.overcast.usage.duration;
            let templates = spells[messageId].castTest.data.context.templates;
            if (Number.isInteger(duration.current) && duration.current > 0 && templates) {
                for(let i = 0; i < templates.length; i++) {
                    let templateId = templates[i];
                    let template =  game.canvas.templates.get(templateId);
                    if (template) {
                        let grid = canvas.scene.grid;
                        let templateData = template.document;
                        let templateGridSize = templateData.distance/grid.distance * grid.size
                    
                        let minx = templateData.x - templateGridSize
                        let miny = templateData.y - templateGridSize
                    
                        let maxx = templateData.x + templateGridSize
                        let maxy = templateData.y + templateGridSize
                    
                        let targetCombatant;
                        canvas.tokens.placeables.forEach(t => {
                        if ((t.x + (t.width / 2)) < maxx && (t.x + (t.width / 2)) > minx && (t.y + (t.height / 2)) < maxy && (t.y + (t.height / 2)) > miny)
                            if (t.id == previousCombatant.tokenId) {
                                targetCombatant = previousCombatant;
                            }
                        });

                        if (targetCombatant && !targetCombatant.isDefeated) {
                            let caster = game.actors.get(spells[messageId].castTest.data.context.speaker.actor);
                            let spellItem = caster.items.get(spells[messageId].castTest.data.preData.itemData._id);
                            let actor = game.actors.get(targetCombatant.actorId);
                            let measuredTemplateeffects = spellItem.effects.filter(e => e.trigger == "measuredTemplate");
                            for (let j = 0; j < measuredTemplateeffects.length; j++) {
                                let effect = measuredTemplateeffects[j];
                                await game.wfrp4e.utility.runSingleEffect(effect, actor, spellItem, {caster});
                            }
                        }
                    }
                }
            }
        }
    }

    // start turn
    if (currentCombatant && !currentCombatant.isDefeated) {
        let measuredTemplateeffects = currentCombatant.actor.actorEffects.filter(e => e.trigger == "measuredTemplate");
        if (measuredTemplateeffects.length > 0) {
            await currentCombatant.actor.deleteEmbeddedDocuments("ActiveEffect", measuredTemplateeffects.map(e => e.id))
        }
    }
});