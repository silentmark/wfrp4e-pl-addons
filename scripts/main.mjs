import { constants } from './constants.mjs';
import { registerSettings } from './module-settings.mjs';
import AlternativeArmour from './alternative-armour.mjs';
import AlternativeTemplateCollision from './alternative-template-collision.mjs';

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
import VariousExtensions from './various-extensions.mjs';
import CombatDistances from './combat-distance.mjs';

/**
 * Main entry point for WFRP4e PL Addons module
 * Manages all addon components and their lifecycle
 */
class Main {
    /**
     * Constructor - initializes all addon components
     */
    constructor() {
        this.variousExtensions = new VariousExtensions();
        this.alternativeTemplateCollision = new AlternativeTemplateCollision();
        this.alternativeArmour = new AlternativeArmour();

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
        this.combatDistance = new CombatDistances();
    }

    alternativeTemplateCollision;
    alternativeArmour;

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
    combatDistance;
    diseases;
    socketTests;

    /**
     * Setup method - called during Foundry's setup phase
     * Initializes all addon components
     */
    setup() {
        this.alternativeTemplateCollision.setup();
        this.alternativeArmour.setup();

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
        this.combatDistance.setup();
    }

    /**
     * Ready method - called during Foundry's ready phase
     * Finalizes addon initialization
     */
    ready() {
        this.alternativeArmour.ready();
        this.socketTests.ready();
    }
}

Hooks.on('setup', () => {
    game.modules.get(constants.moduleId).api.setup();
});

Hooks.on('ready', () => {
    game.modules.get(constants.moduleId).api.ready();
});

Hooks.once('init', () => {
    game.modules.get(constants.moduleId).api = new Main();

    // Register all module settings
    registerSettings();
});

export default Main;