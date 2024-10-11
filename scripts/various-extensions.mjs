export default class VariousExtensions {
    setup() {
        SocketHandlers.handleDualWielder =  async function() {
            let message = game.messages.get(messageId);
            let test = message.getTest();
            await test.handleDualWielder();
            return true;
        }

        Reflect.defineProperty(game.wfrp4e.rolls.WeaponTest.prototype, 'postTest', { value:
            async function () {
                await AttackTest.prototype.postTest.call(this);                 
                await this.handleAmmo();
            }
        });

        Reflect.defineProperty(game.wfrp4e.rolls.WeaponTest.prototype, 'handleDualWielder', {value: 
            async function() {
              if (this.preData.dualWielding && !this.context.edited) {
                let offHandData = foundry.utils.duplicate(this.preData)
          
                if (!this.actor.hasSystemEffect("dualwielder")) {
                    await this.actor.addSystemEffect("dualwielder")
                }
          
                if (game.wfrp4e.config.conditions.multiattacks) {
                    await this.actor.addCondition("multiattacks");
                }
                if (this.succeeded) {
                    while (game.user.targets.size != 1) {
                        await Dialog.wait({
                            title: "Wybierz cel ataku drugą bronią",
                            content: "<p>Zaznacz cel (1) ataku drugą bronią i kliknij OK</p>",
                            buttons: {
                                ok: {
                                    label: "OK",
                                    callback: () => { return 0; }
                                }
                            }
                        });
                    }
                    let offhandWeapon = this.actor.itemTags["weapon"].find(w => w.offhand.value);
                    if (this.result.roll % 11 == 0 || this.result.roll == 100) {
                        delete offHandData.roll
                    }
                    else {
                        let offhandRoll = this.result.roll.toString();
                        if (offhandRoll.length == 1)
                            offhandRoll = offhandRoll[0] + "0"
                        else {
                            offhandRoll = offhandRoll[1] + offhandRoll[0]
                        }
                        offHandData.roll = Number(offhandRoll);
                    }
          
                    let test = await this.actor.setupWeapon(offhandWeapon, { appendTitle: ` (${game.i18n.localize("SHEET.Offhand")})`, dualWieldOffhand: true, offhandReverse: offHandData.roll })
                    await test.roll();
                }
              }
            }
        });

        Reflect.defineProperty(game.wfrp4e.opposedHandler.prototype, 'computeOpposeResult',  {value: 
            async function() {
                if (!this.attackerTest || !this.defenderTest)
                    throw new Error(game.i18n.localize("ERROR.Opposed"))
            
                this.opposedTest = new OpposedTest(this.attackerTest, this.defenderTest);
            
                await this.opposedTest.evaluate();
                this.formatOpposedResult();
                await this.renderOpposedResult()
                await this.colorWinnerAndLoser()
            
                if (this.opposedTest.attackerTest.handleDualWielder && this.opposedTest.opposeResult.winner == "attacker") {
                    let owner = game.wfrp4e.utility.getActiveDocumentOwner(this.opposedTest.attackerTest.actor);
                    SocketHandlers.executeOnUserAndWait(owner.id, "handleDualWielder", {messageId: this.attackerMessage.id}); 
                    //we dont want to await this one.
                }
            }
        });

        
        Hooks.on('createActor', async function (actor, options, userID) {
            if (userID != game.user.id) { return; }

            if (actor.system?.details?.height?.value && parseInt(actor.system.details.height.value)) {
                let h = parseInt(actor.system.details.height.value);
                actor.prototypeToken.setFlag('wall-height', 'tokenHeight', h / 100);
            } else {
                actor.prototypeToken.setFlag('wall-height', 'tokenHeight', 1.8);
            }
            actor.prototypeToken.update({actorLink: true, sight: { enabled: true }});
        });

        window.onunhandledrejection = promiseRejectionEvent => {
            let reason = promiseRejectionEvent.reason;
            let stackTrace = promiseRejectionEvent.promise.__creationPoint;
            if (promiseRejectionEvent.reason.message) {
            reason = promiseRejectionEvent.reason.message;
            } 
            if (promiseRejectionEvent.reason.stack) {
            stackTrace = promiseRejectionEvent.reason.stack;
            }
            console.error(reason + ": " + stackTrace);
        
            let chatOptions = {  };
            chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
            chatOptions["user"] = game.user.id
        
            // Emit the HTML as a chat message
            chatOptions["content"] = `<h2>Unhandled Promise Rejection</h2><p>${reason}</p><p>${stackTrace}</p>`
            //ChatMessage.create(chatOptions);
        };
  
        window.oncustomerror = function(customMessage, error) {
            console.error(customMessage + ": " + error);
            let stackTrace = error.stack;
            let message = error.message;
  
            let chatOptions = {  };
            chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
            chatOptions["user"] = game.user.id
  
            // Emit the HTML as a chat message
            chatOptions["content"] = `<h2>${customMessage}</h2><p>${message}</p><p>${stackTrace}</p>`;
            //ChatMessage.create(chatOptions);
        }
  
        Hooks.on("error", (location, error, data) => {
            window.oncustomerror(`Error in ${location}`, error);
        });
    }
}