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
import Diseases from './diseases.mjs';
import SocketTests from './socket-tests.mjs';
import AreaHelpersExtension from './area-helpers.mjs';
import VariousExtensions from './various-extensions.mjs'
import CombatDistances from './combat-distance.mjs';

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
        this.diseases = new Diseases();
        this.socketTests = new SocketTests();
        this.variousExtensions = new VariousExtensions();
        this.areaHelpers = new AreaHelpersExtension();
        this.combatDistance = new CombatDistances();
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
    areaHelpers;
    combatDistance;
    diseases;
    socketTests;

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
        this.diseases.setup();
        this.variousExtensions.setup();
        this.areaHelpers.setup();
        this.combatDistance.setup();
    }

    ready() {
        this.armoury.ready();
        this.socketTests.ready();
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

    game.settings.register("wfrp4e-pl-addons", "customDiseases.Enable", {
        name: "wfrp4epladdon.customDiseases.Enable",
        hint: "wfrp4epladdon.customDiseases.EnableHint",
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register("wfrp4e-pl-addons", "socketTests.mode", {
        name: 'wfrp4epladdon.socketTests.Mode',
        hint: 'wfrp4epladdon.socketTests.ModeHint',
        scope: 'world',
        config: true,
        default: 'onKeyPress',
        type: String,
        choices: {
        'onKeyPress': 'wfrp4epladdon.socketTests.OnKeyPress',
        'always': 'wfrp4epladdon.socketTests.Always',
        'never': 'wfrp4epladdon.socketTests.Never',
        }
    });

    
    
    game.settings.register("wfrp4e-pl-addons", "templateCollisionMethod", {
        name: `SETTINGS.templateCollisionMethod`,
        hint: `SETTINGS.templateCollisionMethodHint`,
        scope: 'world',
        config: true,
        type: String,
        choices: {
            "default": "SETTINGS.templateCollisionMethodDefault",
            "centerPoint": "SETTINGS.templateCollisionCenterPoint",
            "grid": "SETTINGS.templateCollisionGrid",
            "area": "SETTINGS.templateCollisionArea"
        },
    });
  
});

export default Main;
