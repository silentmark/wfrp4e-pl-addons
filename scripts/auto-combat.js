Hooks.on("renderTokenHUD", (app, html, data) => {
    const actor = game.actors.get(canvas.tokens.controlled[0].actor.id)
    if (actor === undefined) return
    if (actor.type !== "creature" && actor.type !== "npc") return
    
    const autoCombatColor = actor.flags?.wfrp4e?.autoCombat === 1 ? 'green' : (actor.flags?.wfrp4e?.autoCombat === 2 ? 'red' : 'black');
    const autoCombatTooltip =  actor.flags?.wfrp4e?.autoCombat === 1 ? 'Automatyczna Obrona' : (actor.flags?.wfrp4e?.autoCombat === 2 ? 'Automatyczny Atak' : 'Automatyczna Walka Wyłączona');
    const style = `0 0 23px ${autoCombatColor} inset`
    const hudAutoCombat = $(
      `<div style="box-shadow: ${style}" class="control-icon" id="toggleAutoCombat" title="${autoCombatTooltip}">
        <i class="fas fa-repeat"></i>
      </div>`)
    html.find(".col.left").append(hudAutoCombat)

    hudAutoCombat.find("i").click(async ev => {
        if (actor.flags?.wfrp4e?.autoCombat == 1) {
            actor.update({'flags.wfrp4e.autoCombat': 2});
            hudAutoCombat.css('box-shadow','0 0 23px red inset');
        }
        else if (actor.flags?.wfrp4e?.autoCombat == 2) {
            actor.update({'flags.wfrp4e.autoCombat': 0});
            hudAutoCombat.css('box-shadow','0 0 23px black inset');
        }
        else {
            actor.update({'flags.wfrp4e.autoCombat': 1});
            hudAutoCombat.css('box-shadow','0 0 23px green inset');
        }
        ev.preventDefault();
        ev.stopPropagation();
    });
  })
  

Hooks.on("updateCombat", async (combat, updateData) => {
    if (!game.user.isUniqueGM) {
      return;
    }
    const arr = combat.combatants.filter(x => !x.hidden && !Number.isNumeric(x.initiative));
    if (arr.length > 0) {
      return;
    }
    if (combat.current && combat.active) {
      let token = game.scenes.current.tokens.get(combat.current.tokenId);
      let tokenObj = game.canvas.tokens.get(combat.current.tokenId);
      let actor = token.actor;
      if (!actor?.flags?.wfrp4e?.autoCombat) {
        return;
      }
      if (actor.flags.wfrp4e.autoCombat != 2) {
        return;
      }
      if (game.combat.current.currentAutoCombatTurn == game.combat.current.turn) {
        return;
      }
      const combatant = game.combats.active.combatants.find(x=>x.tokenId === combat.current.tokenId);
      combatant.autoCombat = combatant.autoCombat || {};
      if (combatant.autoCombat["tracker." + game.combats.active.round + "." + game.combats.active.turn]) {
        return;
      }
      combatant.autoCombat["tracker." + game.combats.active.round + "." + game.combats.active.turn] = true;
      await game.wfrp4e.utility.sleep(500);

      game.combat.current.currentAutoCombatTurn = game.combat.current.turn;
      await tokenObj.document.update({sight: {angle: 360}});

      let potentialTargets = game.combats.active.combatants
      .map(x=>x.token)
      .filter(x => (x.disposition * -1) === token.disposition)
      .filter(x => !x.hidden)
      .filter(x => tokenObj.vision.los.contains(x.object.center.x, x.object.center.y));
      
      await tokenObj.document.update({sight: {angle: 240}});
      if (potentialTargets.length == 0) {
        return;
      }
      potentialTargets = potentialTargets.sort(() => Math.random());
      potentialTargets = potentialTargets.sort((a, b) => 
      game.canvas.grid.measureDistance({ x: tokenObj.x, y: tokenObj.y }, { x: a.x, y: a.y }, { gridSpaces: true }) - 
      game.canvas.grid.measureDistance({ x: tokenObj.x, y: tokenObj.y }, { x: b.x, y: b.y }, { gridSpaces: true }) );
      let target = potentialTargets[0].object;
      let distance = game.canvas.grid.measureDistance({ x: tokenObj.x, y: tokenObj.y }, { x: target.x, y: target.y }, { gridSpaces: true });
      if (distance <= 2) {//melee
        let stuffToUse = actor.getItemTypes("weapon").filter(w => w.attackType == "melee");
        if (stuffToUse.length > 0) {
          let setupItem = stuffToUse[0];
          for (let i = 1; i < stuffToUse.length; i++) {
            let max = 0;
            let skillToUse = setupItem.getSkillToUse(actor);
            if (skillToUse) {
              max = skillToUse.system.total.value;
            } else {
              max = actor.system.characteristics.ws.value;
            }

            let newMax = 0;
            let newSetupItem = stuffToUse[i];
            skillToUse = newSetupItem.getSkillToUse(actor)
            if (skillToUse) {
              newMax = skillToUse.system.total.value;
            } else {
              newMax = actor.system.characteristics.ws.value;
            }
            if(newMax > max) {
              setupItem = newSetupItem;
            }
          }
          target.setTarget();
          let test = await actor.setupWeapon(setupItem);
          await test.roll();
        }
      } else {
        let stuffToUse = actor.getItemTypes("weapon").filter(w => w.attackType == "ranged");
        if(stuffToUse.length > 0) {
          let setupItem = stuffToUse[0];
          if (setupItem.currentAmmo.value && actor.items.get(setupItem.currentAmmo.value).quantity.value > 0) {
            if (setupItem.loading) {
              if (setupItem.loaded.value) {                
                target.setTarget();
              }
              let test = await actor.setupWeapon(setupItem);
              await test.roll();
            }
            else {                              
              target.setTarget();
              let test = await actor.setupWeapon(setupItem);
              await test.roll();
            }
          }
        }
      }
    }
});

Hooks.on("renderChatMessage", async (app, html, messageData) => {
  if (!game.user.isGM) {
    return;
  }

  let castTest = app.getTest();
  if (castTest?.constructor?.name == "WomCastTest" && castTest.result.castOutcome == "success") {
    let newMessage = jQuery(html).find(".message-content").append(jQuery('<div class="card-content"><a class="chat-button card-apply-spell" style="width: 100%">Zastosuj do wszystkich Celów</a></div>'))
    newMessage.find(".card-apply-spell").click(async function (){
      let messageId = messageData.message._id;
      let userId = messageData.user.id;
      let message = game.messages.get(messageId);
      let castTest = message.getTest();
      let user = game.users.get(userId)
      let targets = Array.from(user.targets).map(t => t.actor.speakerData(t.document))

      castTest.context.targets = castTest.context.targets.concat(targets);
      let uniqueTargets = []; 
      castTest.context.targets.forEach(target => {
        if (uniqueTargets.find(x=>x._id == target._id)) {
          return;
        }
        uniqueTargets.push(target);
      });
      castTest.context.targets = uniqueTargets;

      targets = castTest.context.targets.map(t => WFRP_Utility.getToken(t));
      if(castTest.item.magicMissile?.value) {
        for(let i = 0; i < targets.length; i++) {
          let t = targets[i];
          await castTest.createOpposedMessage(t)
        }

        message = game.messages.get(messageId);
        castTest = message.getTest();
        for(let i = 0; i < castTest.opposedMessages.length; i++) {
          let opposeMessage = castTest.opposedMessages[i];
          if (opposeMessage) {
            let oppose = opposeMessage.getOppose();
            await oppose.resolveUnopposed();
          }
        };

        message = game.messages.get(messageId);
        castTest = message.getTest();
        for(let i = 0; i < castTest.opposedMessages.length; i++) {
          let opposeMessage = castTest.opposedMessages[i];
          if (opposeMessage) {
            let opposedTest = opposeMessage.getOppose();
            let updateMsg = await opposedTest.defender.applyDamage(opposedTest.resultMessage.getOpposedTest(), game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
            await OpposedWFRP.updateOpposedMessage(updateMsg, opposedTest.resultMessage.id);
          }
        }
      }
      let item = castTest.item;
      let actor = castTest.actor;
      for (let i = 0; i < castTest.effects.length; i++) {
        let effect = castTest.effects[i];
        let effectId = castTest.effects[i].id;
        if (effectId) {
          effect = actor.populateEffect(effectId, item, castTest);
        }
        if (effect.flags.wfrp4e.effectTrigger == "invoke") {
          game.wfrp4e.utility.invokeEffect(actor, effectId, item.id)
        }
        else {      
          if (item.range && item.range.value.toLowerCase() == game.i18n.localize("You").toLowerCase() && item.target && item.target.value.toLowerCase() == game.i18n.localize("You").toLowerCase())
            game.wfrp4e.utility.applyEffectToTarget(effect, [{ actor }]) // Apply to caster (self) 
          else {
            game.wfrp4e.utility.applyEffectToTarget(effect, targets, user);
          }
        }
      }
    });
  }

  if (game.ready && app.flags?.wfrp4e?.opposeData?.attackerMessageId && app.flags?.wfrp4e?.opposeData?.messageId && !app.flags.wfrp4e.opposeData.resultMessageId) {
    let msg = game.messages.get(app.flags.wfrp4e.opposeData.attackerMessageId);
    let postFunction = msg?.flags?.testData?.context?.postFunction;
    if (postFunction == "weaponTest" || postFunction == "traitTest") {
      let speaker;
      if (msg.flags.testData.context.speaker.actor) {
        speaker = game.actors.get(msg.flags.testData.context.speaker.actor);
      }
      else {      
        let speakerToken = game.canvas.tokens.get(msg.flags.testData.context.speaker.token);
        speaker = speakerToken.actor;
      }
      let item = speaker.items.get(msg.flags.testData.preData.item);
      if(msg.flags?.testData?.context?.targets 
          && msg.flags?.testData?.context?.targets.length > 0
          && msg.flags?.testData?.context?.opposedMessageIds?.length === 0) {
            let target = game.scenes.current.tokens.get(app.flags.wfrp4e.opposeData.targetSpeakerData.token);
            if (target.actor?.flags?.wfrp4e?.autoCombat && target.actor.flags.wfrp4e.autoCombat > 0) {
              let updateMsg;
              let resultMessage;
              if (item.attackType != "ranged") {
                let actor = target.actor;
                let stuffToUse = [];
                let dodge = actor.getItemTypes("skill").find(sk => sk.name == game.i18n.localize("NAME.Dodge"));
                if (dodge) {
                  stuffToUse.push(dodge);
                }
                stuffToUse = stuffToUse.concat(actor.getItemTypes("weapon").filter(w => w.attackType == "melee"));

                let setupItem = dodge; 
                for (let i = 0; i < stuffToUse.length; i++) {
                  let max = 0;
                  if (setupItem.type == "skill") {
                    max = setupItem.system.total.value;
                  } else {
                    let skillToUse = setupItem.getSkillToUse(actor)
                    if (skillToUse) {
                      max = skillToUse.system.total.value;
                    } else {
                      max = actor.system.characteristics.ws.value;
                    }
                  }
                  let newMax = 0;
                  let newSetupItem = stuffToUse[i];
                  if (newSetupItem.type == "skill") {
                    newMax = newSetupItem.system.total.value;
                  } else {
                    let skillToUse = newSetupItem.getSkillToUse(actor)
                    if (skillToUse) {
                      newMax = skillToUse.system.total.value;
                    } else {
                      newMax = actor.system.characteristics.ws.value;
                    }
                  }
                  if(newMax > max) {
                    setupItem = newSetupItem;
                  }
                }
                
                let test;
                if(setupItem.type == "skill") {
                  test = await actor.setupSkill(setupItem, {bypass: true});
                } else {
                  test = await actor.setupWeapon(setupItem, {bypass: true});
                }
                await test.roll();
                resultMessage = game.messages.get(app.flags.wfrp4e.opposeData.resultMessageId);
                let opposedTest = resultMessage.getOpposedTest();
                if (opposedTest.opposeResult.winner == "attacker") {
                  updateMsg = await opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
                  await OpposedWFRP.updateOpposedMessage(updateMsg, resultMessage.id);
                }
              } else {
                if (target.actor?.flags?.wfrp4e?.autoCombat) {
                  let message = game.messages.get(app.flags.wfrp4e.opposeData.messageId);
                  await message.getOppose().resolveUnopposed();
      
                  resultMessage = game.messages.get(app.flags.wfrp4e.opposeData.resultMessageId);
                  let opposedTest = resultMessage.getOpposedTest();
      
                  if (opposedTest.opposeResult.winner == "attacker") { 
                    updateMsg = await opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
                    await OpposedWFRP.updateOpposedMessage(updateMsg, resultMessage.id);
                  } 
                }
              }
              if (updateMsg) {
                let el = jQuery(`[data-message-id="${resultMessage.id}"]`).find('.table-click');
                if (el.length > 0) {
                  el.trigger({type: 'mousedown', button: 0});
                }
              }
            }
        }
    }
  }
})
