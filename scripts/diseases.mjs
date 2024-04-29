
import {constants} from './constants.mjs';

export default class Diseases {

/*
          symptoms.malaise = "WFRP4EADDON.Symptom.Malaise";
          symptoms.malaiseModerate = "WFRP4EADDON.Symptom.MalaiseModerate";
          symptoms.malaiseSevere = "WFRP4EADDON.Symptom.MalaiseSevere";
          
          symptoms.flux = "WFRP4EADDON.Symptom.Flux";
          symptoms.fluxModerate = "WFRP4EADDON.Symptom.FluxModerate";
          symptoms.fluxSevere = "WFRP4EADDON.Symptom.FluxSevere";

          symptoms.buboes = "WFRP4EADDON.Symptom.Buboes";
          symptoms.buboesModerate = "WFRP4EADDON.Symptom.BuboesModerate";
          symptoms.buboesSevere = "WFRP4EADDON.Symptom.BuboesSevere";

          symptoms.gangrene = "WFRP4EADDON.Symptom.Gangrene";

          symptoms.fever = "WFRP4EADDON.Symptom.Fever";
          symptoms.feverModerate = "WFRP4EADDON.Symptom.FeverModerate";
          symptoms.feverSevere = "WFRP4EADDON.Symptom.FeverSevere";

          symptoms.coughsAndSneezes = "WFRP4EADDON.Symptom.CoughsAndSneezes";
          symptoms.coughsAndSneezesModerate = "WFRP4EADDON.Symptom.CoughsAndSneezesModerate";
          symptoms.coughsAndSneezesSevere = "WFRP4EADDON.Symptom.CoughsAndSneezesSevere";

          symptoms.convulsions = "WFRP4EADDON.Symptom.Convulsions";
          symptoms.convulsionsModerate = "WFRP4EADDON.Symptom.ConvulsionsModerate";
          symptoms.convulsionsSevere = "WFRP4EADDON.Symptom.ConvulsionsSevere";

          symptoms.nausea = "WFRP4EADDON.Symptom.Nausea";
          symptoms.nauseaModerate = "WFRP4EADDON.Symptom.NauseaModerate";
          symptoms.nauseaSevere = "WFRP4EADDON.Symptom.NauseaSevere";

          symptoms.lingering = "WFRP4EADDON.Symptom.Lingering";
          symptoms.lingeringModerate = "WFRP4EADDON.Symptom.LingeringModerate";
          symptoms.lingeringSevere = "WFRP4EADDON.Symptom.LingeringSevere";

          symptoms.wounded = "WFRP4EADDON.Symptom.Wounded";
          symptoms.woundedModerate = "WFRP4EADDON.Symptom.WoundedModerate";
          symptoms.woundedSevere = "WFRP4EADDON.Symptom.WoundedSevere";

          symptoms.blight = "WFRP4EADDON.Symptom.Blight";
          symptoms.blightModerate = "WFRP4EADDON.Symptom.BlightModerate";
          symptoms.blightSevere = "WFRP4EADDON.Symptom.BlightSevere";

          symptoms.pox = "WFRP4EADDON.Symptom.Pox";
          symptoms.poxModerate = "WFRP4EADDON.Symptom.PoxModerate";
          symptoms.poxSevere = "WFRP4EADDON.Symptom.PoxSevere";

          symptoms.vertigo = "WFRP4EADDON.Symptom.Vertigo";
          symptoms.vertigoModerate = "WFRP4EADDON.Symptom.VertigoModerate";
          symptoms.vertigoSevere = "WFRP4EADDON.Symptom.VertigoSevere";

          symptoms.purblind = "WFRP4EADDON.Symptom.Purblind";
          symptoms.purblindModerate = "WFRP4EADDON.Symptom.PurblindModerate";
          symptoms.purblindSevere = "WFRP4EADDON.Symptom.PurblindSevere";

          symptoms.wasting = "WFRP4EADDON.Symptom.Wasting";
          symptoms.wastingModerate = "WFRP4EADDON.Symptom.WastingModerate";
          symptoms.wastingSevere = "WFRP4EADDON.Symptom.WastingSevere";

          symptoms.dementia = "WFRP4EADDON.Symptom.Dementia";
          symptoms.dementiaModerate = "WFRP4EADDON.Symptom.DementiaModerate";
          symptoms.dementiaSevere = "WFRP4EADDON.Symptom.DementiaSevere";

          symptoms.delirium = "WFRP4EADDON.Symptom.Delirium";
          symptoms.swelling = "WFRP4EADDON.Symptom.Swelling";
*/

  symptomEffects = {
    blight: {
      name: "Uwiąd (Lekki)",
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          symptom: true,
          scriptData: [{
            label: "Uwiąd (Lekki)",
            trigger: "manual",
            script: ` let difficulty = "veasy";
                      let test = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {context : {failure : args.actor.name + " umiera z powodu Uwiądu"}, absolute: {difficulty}, appendTitle : " - Uwiąd"});
                      await test.roll();
                      if (test.result.outcome == "failure") {
                              await args.actor.addCondition("dead");
                      }
                    `,
              }]
          }
        },
    },

    blightModerate: {
      name: "Uwiąd (Umiarkowany)",
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          symptom: true,
          scriptData: [{
            label: "Uwiąd (Lekki)",
            trigger: "manual",
            script: ` let difficulty = "easy";
                      let test = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {context : {failure : args.actor.name + " umiera z powodu Uwiądu"}, absolute: {difficulty}, appendTitle : " - Uwiąd"});
                      await test.roll();
                      if (test.result.outcome == "failure") {
                              await args.actor.addCondition("dead");
                      }
                    `
              }]
          }
        },
    },

    blightSevere: {
      name: "Uwiąd (Poważny)",
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          symptom: true,
          scriptData: [{
            label: "Uwiąd (Lekki)",
            trigger: "manual",
            script: ` let difficulty = "average";
                      let test = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {context : {failure : args.actor.name + " umiera z powodu Uwiądu"}, absolute: {difficulty}, appendTitle : " - Uwiąd"});
                      await test.roll();
                      if (test.result.outcome == "failure") {
                              await args.actor.addCondition("dead");
                      }
                    `
              }]
          }
        },
    },

    buboes: {
      name: "Dymienica (Lekka)",
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          symptom: true,
          scriptData: [{
            label: "Dymienica (Lekka)",
            trigger: "dialog",
            script: `args.prefillModifiers.modifier -= 5`,
            options : {
              dialog : {
                  hideScript : `let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]; 
                                return args.type != 'weapon' &&
                                      !(args.type == 'characteristic' && applicableCharacteristics.includes(args.item)) &&
                                      !(args.type == 'skill' && applicableCharacteristics.includes(args.item.characteristic.key))`,
                  activateScript : `let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]; 
                                    return args.type == 'weapon' || 
                                           (args.type == 'characteristic' && applicableCharacteristics.includes(args.item)) || 
                                           (args.type == 'skill' && applicableCharacteristics.includes(args.item.characteristic.key))`
                }
              }
            }]
          }
        },
    },

    buboesModerate: {
      name: "Dymienica (Umiarkowana)",
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          symptom: true,
          scriptData: [{
            label: "Dymienica (Umiarkowana)",
            trigger: "dialog",
            script: `args.prefillModifiers.modifier -= 10`,
            options : {
              dialog : {
                  hideScript : `let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]; 
                                return args.type != 'weapon' &&
                                      !(args.type == 'characteristic' && applicableCharacteristics.includes(args.item)) &&
                                      !(args.type == 'skill' && applicableCharacteristics.includes(args.item.characteristic.key))`,
                  activateScript : `let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]; 
                                    return args.type == 'weapon' || 
                                            (args.type == 'characteristic' && applicableCharacteristics.includes(args.item)) || 
                                            (args.type == 'skill' && applicableCharacteristics.includes(args.item.characteristic.key))`
                }
              }
            }]
          }
        },
    },

    buboesSevere: {
      name: "Dymienica (Poważna)",
      icon: "modules/wfrp4e-core/icons/diseases/disease.png",
      transfer: true,
      flags: {
        wfrp4e: {
          symptom: true,
          scriptData: [{
            label: "Dymienica (Poważna)",
            trigger: "dialog",
            script: `args.prefillModifiers.modifier -= 20`,
            options : {
              dialog : {
                  hideScript : `let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]; 
                                return args.type != 'weapon' &&
                                      !(args.type == 'characteristic' && applicableCharacteristics.includes(args.item)) &&
                                      !(args.type == 'skill' && applicableCharacteristics.includes(args.item.characteristic.key))`,
                  activateScript : `let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]; 
                                    return args.type == 'weapon' || 
                                            (args.type == 'characteristic' && applicableCharacteristics.includes(args.item)) || 
                                            (args.type == 'skill' && applicableCharacteristics.includes(args.item.characteristic.key))`
                }
              }
            }]
          }
        },
    },
  
    "WFRP4E.Symptom.Convulsions": {
  name: "Konwulsje",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      effectApplication: "actor",
      effectTrigger: "prefillDialog",
      symptom: true,
      script: `
                        let modifier = 0
                        if (this.effect.name.includes("Umiarkowany"))
                            modifier = -20
                        else
                            modifier = -10
                        
                        let applicableCharacteristics = ["ws", "bs", "s", "ag", "t", "dex"]
                        if (args.type == "weapon")
                            args.prefillModifiers.modifier += modifier
                        else if (args.type == "characteristic") {
                            if (applicableCharacteristics.includes(args.item))
                                args.prefillModifiers.modifier += modifier
                        }
                        else if (args.type == "skill") {
                            if (applicableCharacteristics.includes(args.item.characteristic.key))
                                args.prefillModifiers.modifier += modifier
                        }`,
    },
  },
},
"WFRP4E.Symptom.Fever": {
  name: "Gorączka",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      effectApplication: "actor",
      effectTrigger: "prefillDialog",
      symptom: true,
      script: `
                       
                    let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]
    
                    if (args.type == "weapon")
                        args.prefillModifiers.modifier -= 10
                    else if (args.type == "characteristic") {
                        if (applicableCharacteristics.includes(args.item))
                            args.prefillModifiers.modifier -= 10
                    }
                    else if (args.type == "skill") {
                        if (applicableCharacteristics.includes(args.item.characteristic.key))
                            args.prefillModifiers.modifier -= 10
                    }`,
      otherEffects: ["blight", "wounded"],
    },
  },
},
    "WFRP4E.Symptom.Flux": {
  name: "Biegunka",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      symptom: true,
    },
  },
},
    "WFRP4E.Symptom.Lingering": {
  name: "Nawroty",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      symptom: true,
    },
  },
},
    "WFRP4E.Symptom.CoughsandSneezes": {
  name: "Kaszel i katar",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      symptom: true,
    },
  },
},
    "WFRP4E.Symptom.Gangrene": {
  name: "Gangrena",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      effectApplication: "actor",
      effectTrigger: "prefillDialog",
      symptom: true,
      script: `
                        if (args.type == "characteristic" && args.item == "fel") {
                            if (args.item == "fel")
                                args.prefillModifiers.modifier -= 10
                        }
                        else if (args.type == "skill") {
                            if (args.item.characteristic.key == "fel")
                                args.prefillModifiers.modifier -= 10
                        }
                    }`,
    },
  },
},
    "WFRP4E.Symptom.Malaise": {
  name: "Apatia",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      effectApplication: "actor",
      effectTrigger: "prepareData",
      symptom: true,
      script: `
                    if (game.user.isUniqueGM) {
                        let fatigued = args.actor.hasCondition("fatigued")
                        if (!fatigued) {
                            args.actor.addCondition("fatigued")
                            ui.notifications.notify("Stan Zmęczenia dodany do " + args.actor.name + " który nie może zostać usunięty, dopóki symptom Apatii nie zostanie wyleczony.")
                        }
                    }
                    `,
    },
  },
},
    "WFRP4E.Symptom.Nausea": {
  name: "Nudności",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      effectApplication: "actor",
      effectTrigger: "rollTest",
      symptom: true,
      script: `
                    if (this.actor.isOwner && args.test.result.outcome == "failure") {
                        let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"]
                        if (applicableCharacteristics.includes(args.test.characteristicKey))
                            this.actor.addCondition("stunned")
                    }
                    `,
    },
  },
},
    "WFRP4E.Symptom.Pox": {
  name: "Wysypka",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      effectApplication: "actor",
      effectTrigger: "prefillDialog",
      symptom: true,
      script: `
                        if (args.type == "characteristic" && args.item == "fel")
                                args.prefillModifiers.modifier -= 10
                        else if (args.type == "skill") {
                            if (args.item.characteristic.key == "fel")
                                args.prefillModifiers.modifier -= 10
                        }`,
    },
  },
},
    "WFRP4E.Symptom.Wounded": {
  name: "Uciążliwa Rana",
  icon: "modules/wfrp4e-core/icons/diseases/disease.png",
  transfer: true,
  flags: {
    wfrp4e: {
      effectApplication: "actor",
      effectTrigger: "invoke",
      symptom: true,
      script: `
                        if (this.actor.isOwner) {
                            args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {absolute: {difficulty : "average"}}).then(async test => {
                                await test.roll();
                                if (test.result.outcome == "failure") {
                                    let disease = await fromUuid("Compendium.wfrp4e-core.diseases.kKccDTGzWzSXCBOb");
                                    args.actor.createEmbeddedDocuments("Item", [disease.toObject()])
                                }
                            });
                        }`,
    },
  },
},
};





  setup() {
    if (game.settings.get("wfrp4e-pl-addons", "customDiseases.Enable")) {

      Hooks.on("ready", () => {
          let symptoms = game.wfrp4e.config.symptoms;
          symptoms.malaise = "WFRP4EADDON.Symptom.Malaise";
          symptoms.malaiseModerate = "WFRP4EADDON.Symptom.MalaiseModerate";
          symptoms.malaiseSevere = "WFRP4EADDON.Symptom.MalaiseSevere";
          
          symptoms.flux = "WFRP4EADDON.Symptom.Flux";
          symptoms.fluxModerate = "WFRP4EADDON.Symptom.FluxModerate";
          symptoms.fluxSevere = "WFRP4EADDON.Symptom.FluxSevere";

          symptoms.buboes = "WFRP4EADDON.Symptom.Buboes";
          symptoms.buboesModerate = "WFRP4EADDON.Symptom.BuboesModerate";
          symptoms.buboesSevere = "WFRP4EADDON.Symptom.BuboesSevere";

          symptoms.gangrene = "WFRP4EADDON.Symptom.Gangrene";

          symptoms.fever = "WFRP4EADDON.Symptom.Fever";
          symptoms.feverModerate = "WFRP4EADDON.Symptom.FeverModerate";
          symptoms.feverSevere = "WFRP4EADDON.Symptom.FeverSevere";

          symptoms.coughsAndSneezes = "WFRP4EADDON.Symptom.CoughsAndSneezes";
          symptoms.coughsAndSneezesModerate = "WFRP4EADDON.Symptom.CoughsAndSneezesModerate";
          symptoms.coughsAndSneezesSevere = "WFRP4EADDON.Symptom.CoughsAndSneezesSevere";

          symptoms.convulsions = "WFRP4EADDON.Symptom.Convulsions";
          symptoms.convulsionsModerate = "WFRP4EADDON.Symptom.ConvulsionsModerate";
          symptoms.convulsionsSevere = "WFRP4EADDON.Symptom.ConvulsionsSevere";

          symptoms.nausea = "WFRP4EADDON.Symptom.Nausea";
          symptoms.nauseaModerate = "WFRP4EADDON.Symptom.NauseaModerate";
          symptoms.nauseaSevere = "WFRP4EADDON.Symptom.NauseaSevere";

          symptoms.lingering = "WFRP4EADDON.Symptom.Lingering";
          symptoms.lingeringModerate = "WFRP4EADDON.Symptom.LingeringModerate";
          symptoms.lingeringSevere = "WFRP4EADDON.Symptom.LingeringSevere";

          symptoms.wounded = "WFRP4EADDON.Symptom.Wounded";
          symptoms.woundedModerate = "WFRP4EADDON.Symptom.WoundedModerate";
          symptoms.woundedSevere = "WFRP4EADDON.Symptom.WoundedSevere";

          symptoms.blight = "WFRP4EADDON.Symptom.Blight";
          symptoms.blightModerate = "WFRP4EADDON.Symptom.BlightModerate";
          symptoms.blightSevere = "WFRP4EADDON.Symptom.BlightSevere";

          symptoms.pox = "WFRP4EADDON.Symptom.Pox";
          symptoms.poxModerate = "WFRP4EADDON.Symptom.PoxModerate";
          symptoms.poxSevere = "WFRP4EADDON.Symptom.PoxSevere";

          symptoms.vertigo = "WFRP4EADDON.Symptom.Vertigo";
          symptoms.vertigoModerate = "WFRP4EADDON.Symptom.VertigoModerate";
          symptoms.vertigoSevere = "WFRP4EADDON.Symptom.VertigoSevere";

          symptoms.purblind = "WFRP4EADDON.Symptom.Purblind";
          symptoms.purblindModerate = "WFRP4EADDON.Symptom.PurblindModerate";
          symptoms.purblindSevere = "WFRP4EADDON.Symptom.PurblindSevere";

          symptoms.wasting = "WFRP4EADDON.Symptom.Wasting";
          symptoms.wastingModerate = "WFRP4EADDON.Symptom.WastingModerate";
          symptoms.wastingSevere = "WFRP4EADDON.Symptom.WastingSevere";

          symptoms.dementia = "WFRP4EADDON.Symptom.Dementia";
          symptoms.dementiaModerate = "WFRP4EADDON.Symptom.DementiaModerate";
          symptoms.dementiaSevere = "WFRP4EADDON.Symptom.DementiaSevere";

          symptoms.delirium = "WFRP4EADDON.Symptom.Delirium";
          symptoms.swelling = "WFRP4EADDON.Symptom.Swelling";



          let symptomsDesc = game.wfrp4e.config.symptomDescriptions;
          symptomsDesc.malaise = "WFRP4EADDON.SymptomDescriptions.Malaise";
          symptomsDesc.malaiseModerate = "WFRP4EADDON.SymptomDescriptions.MalaiseModerate";
          symptomsDesc.malaiseSevere = "WFRP4EADDON.SymptomDescriptions.MalaiseSevere";
          
          symptomsDesc.flux = "WFRP4EADDON.SymptomDescriptions.Flux";
          symptomsDesc.fluxModerate = "WFRP4EADDON.SymptomDescriptions.FluxModerate";
          symptomsDesc.fluxSevere = "WFRP4EADDON.SymptomDescriptions.FluxSevere";

          symptomsDesc.buboes = "WFRP4EADDON.SymptomDescriptions.Buboes";
          symptomsDesc.buboesModerate = "WFRP4EADDON.SymptomDescriptions.BuboesModerate";
          symptomsDesc.buboesSevere = "WFRP4EADDON.SymptomDescriptions.BuboesSevere";

          symptomsDesc.gangrene = "WFRP4EADDON.SymptomDescriptions.Gangrene";

          symptomsDesc.fever = "WFRP4EADDON.SymptomDescriptions.Fever";
          symptomsDesc.feverModerate = "WFRP4EADDON.SymptomDescriptions.FeverModerate";
          symptomsDesc.feverSevere = "WFRP4EADDON.SymptomDescriptions.FeverSevere";

          symptomsDesc.coughsAndSneezes = "WFRP4EADDON.SymptomDescriptions.CoughsAndSneezes";
          symptomsDesc.coughsAndSneezesModerate = "WFRP4EADDON.SymptomDescriptions.CoughsAndSneezesModerate";
          symptomsDesc.coughsAndSneezesSevere = "WFRP4EADDON.SymptomDescriptions.CoughsAndSneezesSevere";

          symptomsDesc.convulsions = "WFRP4EADDON.SymptomDescriptions.Convulsions";
          symptomsDesc.convulsionsModerate = "WFRP4EADDON.SymptomDescriptions.ConvulsionsModerate";
          symptomsDesc.convulsionsSevere = "WFRP4EADDON.SymptomDescriptions.ConvulsionsSevere";

          symptomsDesc.nausea = "WFRP4EADDON.SymptomDescriptions.Nausea";
          symptomsDesc.nauseaModerate = "WFRP4EADDON.SymptomDescriptions.NauseaModerate";
          symptomsDesc.nauseaSevere = "WFRP4EADDON.SymptomDescriptions.NauseaSevere";

          symptomsDesc.lingering = "WFRP4EADDON.SymptomDescriptions.Lingering";
          symptomsDesc.lingeringModerate = "WFRP4EADDON.SymptomDescriptions.LingeringModerate";
          symptomsDesc.lingeringSevere = "WFRP4EADDON.SymptomDescriptions.LingeringSevere";

          symptomsDesc.wounded = "WFRP4EADDON.SymptomDescriptions.Wounded";
          symptomsDesc.woundedModerate = "WFRP4EADDON.SymptomDescriptions.WoundedModerate";
          symptomsDesc.woundedSevere = "WFRP4EADDON.SymptomDescriptions.WoundedSevere";

          symptomsDesc.blight = "WFRP4EADDON.SymptomDescriptions.Blight";
          symptomsDesc.blightModerate = "WFRP4EADDON.SymptomDescriptions.BlightModerate";
          symptomsDesc.blightSevere = "WFRP4EADDON.SymptomDescriptions.BlightSevere";

          symptomsDesc.pox = "WFRP4EADDON.SymptomDescriptions.Pox";
          symptomsDesc.poxModerate = "WFRP4EADDON.SymptomDescriptions.PoxModerate";
          symptomsDesc.poxSevere = "WFRP4EADDON.SymptomDescriptions.PoxSevere";

          symptomsDesc.vertigo = "WFRP4EADDON.SymptomDescriptions.Vertigo";
          symptomsDesc.vertigoModerate = "WFRP4EADDON.SymptomDescriptions.VertigoModerate";
          symptomsDesc.vertigoSevere = "WFRP4EADDON.SymptomDescriptions.VertigoSevere";

          symptomsDesc.purblind = "WFRP4EADDON.SymptomDescriptions.Purblind";
          symptomsDesc.purblindModerate = "WFRP4EADDON.SymptomDescriptions.PurblindModerate";
          symptomsDesc.purblindSevere = "WFRP4EADDON.SymptomDescriptions.PurblindSevere";

          symptomsDesc.wasting = "WFRP4EADDON.SymptomDescriptions.Wasting";
          symptomsDesc.wastingModerate = "WFRP4EADDON.SymptomDescriptions.WastingModerate";
          symptomsDesc.wastingSevere = "WFRP4EADDON.SymptomDescriptions.WastingSevere";

          symptomsDesc.dementia = "WFRP4EADDON.SymptomDescriptions.Dementia";
          symptomsDesc.dementiaModerate = "WFRP4EADDON.SymptomDescriptions.DementiaModerate";
          symptomsDesc.dementiaSevere = "WFRP4EADDON.SymptomDescriptions.DementiaSevere";

          symptomsDesc.delirium = "WFRP4EADDON.SymptomDescriptions.Delirium";
          symptomsDesc.swelling = "WFRP4EADDON.SymptomDescriptions.Swelling";

          let symptomsTreat = game.wfrp4e.config.symptomTreatment;
          symptomsTreat.malaise = "WFRP4EADDON.SymptomTreatment.Malaise";
          symptomsTreat.malaiseModerate = "WFRP4EADDON.SymptomTreatment.MalaiseModerate";
          symptomsTreat.malaiseSevere = "WFRP4EADDON.SymptomTreatment.MalaiseSevere";
          
          symptomsTreat.flux = "WFRP4EADDON.SymptomTreatment.Flux";
          symptomsTreat.fluxModerate = "WFRP4EADDON.SymptomTreatment.FluxModerate";
          symptomsTreat.fluxSevere = "WFRP4EADDON.SymptomTreatment.FluxSevere";

          symptomsTreat.buboes = "WFRP4EADDON.SymptomTreatment.Buboes";
          symptomsTreat.buboesModerate = "WFRP4EADDON.SymptomTreatment.BuboesModerate";
          symptomsTreat.buboesSevere = "WFRP4EADDON.SymptomTreatment.BuboesSevere";

          symptomsTreat.gangrene = "WFRP4EADDON.SymptomTreatment.Gangrene";

          symptomsTreat.fever = "WFRP4EADDON.SymptomTreatment.Fever";
          symptomsTreat.feverModerate = "WFRP4EADDON.SymptomTreatment.FeverModerate";
          symptomsTreat.feverSevere = "WFRP4EADDON.SymptomTreatment.FeverSevere";

          symptomsTreat.coughsAndSneezes = "WFRP4EADDON.SymptomTreatment.CoughsAndSneezes";
          symptomsTreat.coughsAndSneezesModerate = "WFRP4EADDON.SymptomTreatment.CoughsAndSneezesModerate";
          symptomsTreat.coughsAndSneezesSevere = "WFRP4EADDON.SymptomTreatment.CoughsAndSneezesSevere";

          symptomsTreat.convulsions = "WFRP4EADDON.SymptomTreatment.Convulsions";
          symptomsTreat.convulsionsModerate = "WFRP4EADDON.SymptomTreatment.ConvulsionsModerate";
          symptomsTreat.convulsionsSevere = "WFRP4EADDON.SymptomTreatment.ConvulsionsSevere";

          symptomsTreat.nausea = "WFRP4EADDON.SymptomTreatment.Nausea";
          symptomsTreat.nauseaModerate = "WFRP4EADDON.SymptomTreatment.NauseaModerate";
          symptomsTreat.nauseaSevere = "WFRP4EADDON.SymptomTreatment.NauseaSevere";

          symptomsTreat.lingering = "WFRP4EADDON.SymptomTreatment.Lingering";
          symptomsTreat.lingeringModerate = "WFRP4EADDON.SymptomTreatment.LingeringModerate";
          symptomsTreat.lingeringSevere = "WFRP4EADDON.SymptomTreatment.LingeringSevere";

          symptomsTreat.wounded = "WFRP4EADDON.SymptomTreatment.Wounded";
          symptomsTreat.woundedModerate = "WFRP4EADDON.SymptomTreatment.WoundedModerate";
          symptomsTreat.woundedSevere = "WFRP4EADDON.SymptomTreatment.WoundedSevere";

          symptomsTreat.blight = "WFRP4EADDON.SymptomTreatment.Blight";
          symptomsTreat.blightModerate = "WFRP4EADDON.SymptomTreatment.BlightModerate";
          symptomsTreat.blightSevere = "WFRP4EADDON.SymptomTreatment.BlightSevere";

          symptomsTreat.pox = "WFRP4EADDON.SymptomTreatment.Pox";
          symptomsTreat.poxModerate = "WFRP4EADDON.SymptomTreatment.PoxModerate";
          symptomsTreat.poxSevere = "WFRP4EADDON.SymptomTreatment.PoxSevere";

          symptomsTreat.vertigo = "WFRP4EADDON.SymptomTreatment.Vertigo";
          symptomsTreat.vertigoModerate = "WFRP4EADDON.SymptomTreatment.VertigoModerate";
          symptomsTreat.vertigoSevere = "WFRP4EADDON.SymptomTreatment.VertigoSevere";

          symptomsTreat.purblind = "WFRP4EADDON.SymptomTreatment.Purblind";
          symptomsTreat.purblindModerate = "WFRP4EADDON.SymptomTreatment.PurblindModerate";
          symptomsTreat.purblindSevere = "WFRP4EADDON.SymptomTreatment.PurblindSevere";

          symptomsTreat.wasting = "WFRP4EADDON.SymptomTreatment.Wasting";
          symptomsTreat.wastingModerate = "WFRP4EADDON.SymptomTreatment.WastingModerate";
          symptomsTreat.wastingSevere = "WFRP4EADDON.SymptomTreatment.WastingSevere";

          symptomsTreat.dementia = "WFRP4EADDON.SymptomTreatment.Dementia";
          symptomsTreat.dementiaModerate = "WFRP4EADDON.SymptomTreatment.DementiaModerate";
          symptomsTreat.dementiaSevere = "WFRP4EADDON.SymptomTreatment.DementiaSevere";

          symptomsTreat.delirium = "WFRP4EADDON.SymptomTreatment.Delirium";
          symptomsTreat.swelling = "WFRP4EADDON.SymptomTreatment.Swelling";

          for (let el in symptoms) {
            if (typeof symptoms[el] === "string") {
              symptoms[el] = game.i18n.localize(symptoms[el]);
            }
          }
          for (let el in symptomsDesc) {
            if (typeof symptomsDesc[el] === "string") {
              symptomsDesc[el] = game.i18n.localize(symptomsDesc[el]);
            }
          }
          for (let el in symptomsTreat) {
            if (typeof symptomsTreat[el] === "string") {
              symptomsTreat[el] = game.i18n.localize(symptomsTreat[el]);
            }
          }
      });
    }
  }
}