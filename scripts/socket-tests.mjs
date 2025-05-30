export default class SocketTests {
  /**
* On load, replace default setup methods for ActorWFRP4e prototype and register global event listeners
*/
  ready() {
    if (game.settings.get("wfrp4e-pl-addons", "socketTests.mode") === 'never') return;

    SocketHandlers.setupSocketTest = async function (payload) {
      let dialogData = foundry.utils.deepClone(payload.dialogData);
      let dialogClass = eval(payload.dialogClassName);
      let actorId = payload.actorId;
      let actor = game.actors.get(actorId);
      let owner = warhammer.utility.getActiveDocumentOwner(actor);
      if (owner.id == game.user.id) {
        for (let propName of dialogData.datasets) {
          if (dialogData.data[propName]) {
            dialogData.data[propName] = actor.items.get(dialogData.data[propName]._id);
          }
        }
        let test = await actor._setupTest(dialogData, dialogClass);
        return test?.data;
      }
    };

    Reflect.defineProperty(ActorWFRP4e.prototype, "_setupSocketTest", {
      value:
        async function (dialogData, dialogClassName) {
          const isSocketTest = SocketTests.isSocketTest();
          let owner = warhammer.utility.getActiveDocumentOwner(this);
          if (owner.id != game.user.id && isSocketTest) {
            owner.updateTokenTargets([]);
            owner.updateTokenTargets(Array.from(game.user.targets.map(x => x.id)));
            owner.broadcastActivity({ targets: Array.from(game.user.targets.map(x => x.id)) });
            // broadcast activity is not async, so we have give it time to propagate. 
            await new Promise(resolve => setTimeout(resolve, 500));

            let props = Object.getOwnPropertyNames(dialogData.data);
            dialogData.datasets = [];
            for (let prop of props) {
              if (dialogData.data[prop]?.constructor?.name == "ItemWfrp4e") {
                dialogData.data[prop] = dialogData.data[prop].toObject();
                dialogData.datasets.push(prop);
              }
            }
            let chatData = {
              content: "<b><u>" + owner.name + "</u></b>: Sending test request...",
              whisper: ChatMessage.getWhisperRecipients("GM")
            };
            if (game.user.isGM) {
              chatData.user = owner;
            }
            let msg = await ChatMessage.create(chatData);

            let payload = { dialogData, dialogClassName, userId: game.user.id, actorId: this.id };
            let testData = await SocketHandlers.executeOnUserAndWait(owner.id, "setupSocketTest", payload);
            msg.delete();
            if (testData) {
              const test = game.wfrp4e.rolls.TestWFRP.recreate(testData);
              return test;
            } else {
              return null;
            }
          } else {
            let dialog = await this._setupTest(dialogData, eval(dialogClassName));
            return dialog;
          }
        }
    });

    Reflect.defineProperty(ActorWFRP4e.prototype, "setupCharacteristic", {
      value:
        async function (characteristic, options = {}) {
          let dialogData = {
            fields: options.fields || {},
            data: {
              characteristic,
              hitLoc: (characteristic == "ws" || characteristic == "bs") && !options.reload
            },
            options: options || {}
          };
          let test = await this._setupSocketTest(dialogData, "CharacteristicDialog");
          return test;
        }
    });

    Reflect.defineProperty(ActorWFRP4e.prototype, "setupWeapon", {
      value:
        async function (weapon, options = {}) {
          let dialogData = {
            fields: options.fields || {},
            data: {
              weapon,
              hitLoc: true
            },
            options: options || {}
          };
          let test = await this._setupSocketTest(dialogData, "WeaponDialog");
          return test;
        }
    });

    Reflect.defineProperty(ActorWFRP4e.prototype, "setupSkill", {
      value:
        async function (skill, options = {}) {
          if (typeof (skill) === "string") {
            let skillName = skill;
            skill = this.itemTypes["skill"].find(sk => sk.name == skill);
            if (!skill) {
              // Skill not found, find later and use characteristic
              skill = {
                name: skillName,
                id: "unknown",
                characteristic: {
                  key: ""
                }
              };
            }
          }

          let dialogData = {
            fields: options.fields || {},
            data: {
              skill,
              hitLoc: ((skill.characteristic.key == "ws" ||
                skill.characteristic.key == "bs" ||
                skill.name.includes(game.i18n.localize("NAME.Melee")) ||
                skill.name.includes(game.i18n.localize("NAME.Ranged")))
                && !options.reload)
            },
            options: options || {}
          };
          let test = await this._setupSocketTest(dialogData, "SkillDialog");
          return test;
        }
    });

    Reflect.defineProperty(ActorWFRP4e.prototype, "setupCast", {
      value:
        async function (spell, options = {}) {

          let dialogData = {
            fields: options.fields || {},
            data: {
              spell,
              hitLoc: !!spell.system.damage.value
            },
            options: options || {}
          };
          let test = await this._setupSocketTest(dialogData, "CastDialog");
          return test;
        }
    });

    Reflect.defineProperty(ActorWFRP4e.prototype, "setupChannell", {
      value:
        async function (spell, options = {}) {
          let dialogData = {
            fields: options.fields || {},
            data: {
              spell,
              hitLoc: false
            },
            options: options || {}
          };
          if (typeof (FatigueChannellingDialog) == 'function') {
            let test = await this._setupSocketTest(dialogData, "FatigueChannellingDialog");
            return test;
          } else {
            let test = await this._setupSocketTest(dialogData, "ChannellingDialog");
            return test;
          }
        }
    });

    Reflect.defineProperty(ActorWFRP4e.prototype, "setupPrayer", {
      value:
        async function (prayer, options = {}) {
          let dialogData = {
            fields: options.fields || {},
            data: {
              prayer,
              hitLoc: (prayer.damage.value || prayer.damage.dice || prayer.damage.addSL)
            },
            options: options || {}
          };
          let test = await this._setupSocketTest(dialogData, "PrayerDialog");
          return test;
        }
    });


    Reflect.defineProperty(ActorWFRP4e.prototype, "setupTrait", {
      value:
        async function (trait, options = {}) {
          let dialogData = {
            fields: options.fields || {},
            data: {
              trait,
              hitLoc: (trait.system.rollable.rollCharacteristic == "ws" || trait.system.rollable.rollCharacteristic == "bs")
            },
            options: options || {}
          };
          let test = await this._setupSocketTest(dialogData, "TraitDialog");
          return test;
        }
    });
  }

  static isSocketTest() {
    const socketTestMode = game.settings.get("wfrp4e-pl-addons", "socketTests.mode");
    const isControl = game.keyboard.isModifierActive('Control');

    if (socketTestMode === 'always' && !isControl) {
      return true;
    }
    if (socketTestMode === 'onKeyPress' && isControl) {
      return true;
    }
    return false;
  }
}