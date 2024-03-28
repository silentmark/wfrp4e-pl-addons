import {constants} from './constants.mjs';
import Armours from './armour.mjs';
import RerollInitiative from './reroll-initiative.mjs';
import AutoEngaged from './auto-engaged.mjs';
import WindsOfMagic from './windsofmagic.mjs';
import AutoRotate from './auto-rotate.mjs';
import Miscasts from './miscasts.mjs';
import PrayerNerf from './prayer-nerf.mjs';
import AutoCounterSpell from './auto-counterspell.mjs';
import AutoOutnumbered from './auto-outnumbered.mjs';
import AutoCombat from './auto-combat.mjs';
import AutoMiss from './auto-miss.mjs';
import PF2eHeresy from './pf2e-heresy.mjs';

class Main {
    constructor() {
        this.armoury = new Armours();
        this.rerollInitiative = new RerollInitiative();
        this.autoCounterSpell = new AutoCounterSpell();
        this.windsOfMagic = new WindsOfMagic();
        this.autoEngaged = new AutoEngaged();
        this.autoRotate = new AutoRotate();
        this.miscasts = new Miscasts();
        this.prayerNerf = new PrayerNerf();
        this.autoOutnumbered = new AutoOutnumbered();
        this.autoCombat = new AutoCombat();
        this.autoMiss = new AutoMiss();
        this.pf2eHeresy = new PF2eHeresy();

        this.customPrefillModifiers = {};
    }

    armoury;
    rerollInitiative;
    autoCounterSpell;
    windsOfMagic;
    autoEngaged;
    autoRotate;
    miscasts;
    prayerNerf;
    autoOutnumbered;
    autoCombat;
    autoMiss;
    pf2eHeresy;

    customPrefillModifiers;

    setup() {
        this.armoury.setup();
        this.rerollInitiative.setup();
        this.autoCounterSpell.setup();
        this.windsOfMagic.setup();
        this.autoEngaged.setup();
        this.autoRotate.setup();
        this.miscasts.setup();
        this.prayerNerf.setup();
        this.autoOutnumbered.setup();
        this.autoCombat.setup();
        this.autoMiss.setup();
        this.pf2eHeresy.setup();
    }

    ready() {
        this.armoury.ready();
    }
}

Hooks.on("setup", () => {    
    game.modules.get(constants.moduleId).api.setup();
});

Hooks.on("ready", () => {    
    game.modules.get(constants.moduleId).api.ready();
});

Hooks.once("init", () => {
    game.modules.get(constants.moduleId).api = new Main();

    const originalComputeScripts = RollDialog.prototype.computeScripts;
    Reflect.defineProperty(RollDialog.prototype, 'computeScripts', { value: 
        async function() {
            const obj = game.modules.get(constants.moduleId).api.customPrefillModifiers
            const functions = Object.getOwnPropertyNames(obj).filter(function (p) { return typeof obj[p] === 'function' });
            for (let func of functions) {
                let funcObj = game.modules.get(constants.moduleId).api.customPrefillModifiers[func];
                let resultScript = await funcObj.call(funcObj, this);
                if (resultScript && !this.data.scripts.find(x => x.label == resultScript.label)) {
                    this.data.scripts.push(resultScript);
                    resultScript.scriptCount = 1;
                    resultScript.isActive = true;
                }
            }
            await originalComputeScripts.call(this);
        } 
    });

    CONFIG.supportedLanguages["pl"] = "pl";

    // Add enable/disable setting for arrow reclamation feature
    game.settings.register("wfrp4e-pl-addons", "alternativeArmour.Enable", {
        name: "wfrp4epladdon.alternativeArmour.Enable",
        hint: "wfrp4epladdon.alternativeArmour.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload()
        }
    });

    game.settings.register("wfrp4e-pl-addons", "initiativeRoll.Enable", {
        name: "wfrp4epladdon.initiativeRoll.Enable",
        hint: "wfrp4epladdon.initiativeRoll.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "alternativeMiscasts.Enable", {
        name: "wfrp4epladdon.alternativeMiscasts.Enable",
        hint: "wfrp4epladdon.alternativeMiscasts.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload()
        }
    });

    game.settings.register("wfrp4e-pl-addons", "windsOfMagicCombatRolls.Enable", {
        name: "wfrp4epladdon.windsOfMagicCombatRolls.Enable",
        hint: "wfrp4epladdon.windsOfMagicCombatRolls.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload()
        }
    });

    game.settings.register("wfrp4e-pl-addons", "combatSpellTracker.Enable", {
        name: "wfrp4epladdon.combatSpellTracker.Enable",
        hint: "wfrp4epladdon.combatSpellTracker.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload()
        }
    });

    game.settings.register("wfrp4e-pl-addons", "counterSpells.Enable", {
        name: "wfrp4epladdon.counterSpells.Enable",
        hint: "wfrp4epladdon.counterSpells.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: value => {
            foundry.utils.debouncedReload()
        }
    });
  
    game.settings.register("wfrp4e-pl-addons", "autoEngaged.Enable", {
        name: "wfrp4epladdon.autoEngaged.Enable",
        hint: "wfrp4epladdon.autoEngaged.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
  
    game.settings.register("wfrp4e-pl-addons", "autoOutnumbered.Enable", {
        name: "wfrp4epladdon.autoOutnumbered.Enable",
        hint: "wfrp4epladdon.autoOutnumbered.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "autoOutnumbered.Bonus", {
        name: "wfrp4epladdon.autoOutnumbered.Bonus",
        hint: "wfrp4epladdon.autoOutnumbered.BonusHint",
        scope: "world",
        config: true,
        default: 10,
        type: Number
    });

    game.settings.register("wfrp4e-pl-addons", "autoOutnumbered.Max", {
        name: "wfrp4epladdon.autoOutnumbered.Max",
        hint: "wfrp4epladdon.autoOutnumbered.MaxHint",
        scope: "world",
        config: true,
        default: 3,
        type: Number
    });

  
    game.settings.register("wfrp4e-pl-addons", "autoRotate.Enable", {
        name: "wfrp4epladdon.autoRotate.Enable",
        hint: "wfrp4epladdon.autoRotate.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "autoRotate.BonusFlanking", {
        name: "wfrp4epladdon.autoRotate.BonusFlanking",
        hint: "wfrp4epladdon.autoRotate.BonusFlankingHint",
        scope: "world",
        config: true,
        default: 10,
        type: Number
    });

    game.settings.register("wfrp4e-pl-addons", "autoRotate.BonuBehind", {
        name: "wfrp4epladdon.autoRotate.BonuBehind",
        hint: "wfrp4epladdon.autoRotate.BonuBehindHint",
        scope: "world",
        config: true,
        default: 20,
        type: Number
    });

    game.settings.register("wfrp4e-pl-addons", "prayerNerf.Enabled", {
        name: "wfrp4epladdon.prayerNerf.Enable",
        hint: "wfrp4epladdon.prayerNerf.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "autoCombat.Enabled", {
        name: "wfrp4epladdon.autoCombat.Enable",
        hint: "wfrp4epladdon.autoCombat.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "autoMiss.Enabled", {
        name: "wfrp4epladdon.autoMiss.Enable",
        hint: "wfrp4epladdon.autoMiss.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "pf2eHeresy.Enable", {
        name: "wfrp4epladdon.pf2eHeresy.Enable",
        hint: "wfrp4epladdon.pf2eHeresy.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
});

export default Main;
