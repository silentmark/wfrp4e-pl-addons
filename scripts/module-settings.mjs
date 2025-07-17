/**
 * Module settings registration for WFRP4e PL Addons
 * Centralizes all module settings in one place
 */

/**
 * Register all module settings
 */
export function registerSettings() {
    // Alternative Armour Settings
    game.settings.register('wfrp4e-pl-addons', 'alternativeArmour.Enable', {
        name: 'wfrp4epladdon.alternativeArmour.Enable',
        hint: 'wfrp4epladdon.alternativeArmour.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
        onChange: _value => {
            foundry.utils.debouncedReload();
        }
    });

    // Initiative Roll Settings
    game.settings.register('wfrp4e-pl-addons', 'initiativeRoll.Enable', {
        name: 'wfrp4epladdon.initiativeRoll.Enable',
        hint: 'wfrp4epladdon.initiativeRoll.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });

    // Miscasts Settings
    game.settings.register('wfrp4e-pl-addons', 'alternativeMiscasts.Enable', {
        name: 'wfrp4epladdon.alternativeMiscasts.Enable',
        hint: 'wfrp4epladdon.alternativeMiscasts.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
        onChange: _value => {
            foundry.utils.debouncedReload();
        }
    });

    // Winds of Magic Settings
    game.settings.register('wfrp4e-pl-addons', 'windsOfMagicCombatRolls.Enable', {
        name: 'wfrp4epladdon.windsOfMagicCombatRolls.Enable',
        hint: 'wfrp4epladdon.windsOfMagicCombatRolls.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
        onChange: _value => {
            foundry.utils.debouncedReload();
        }
    });

    // Combat Spell Tracker Settings
    game.settings.register('wfrp4e-pl-addons', 'combatSpellTracker.Enable', {
        name: 'wfrp4epladdon.combatSpellTracker.Enable',
        hint: 'wfrp4epladdon.combatSpellTracker.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
        onChange: _value => {
            foundry.utils.debouncedReload();
        }
    });

    // Counter Spells Settings
    game.settings.register('wfrp4e-pl-addons', 'counterSpells.Enable', {
        name: 'wfrp4epladdon.counterSpells.Enable',
        hint: 'wfrp4epladdon.counterSpells.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean,
        onChange: _value => {
            foundry.utils.debouncedReload();
        }
    });

    // Auto Engaged Settings
    game.settings.register('wfrp4e-pl-addons', 'autoEngaged.Enable', {
        name: 'wfrp4epladdon.autoEngaged.Enable',
        hint: 'wfrp4epladdon.autoEngaged.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });

    // Auto Outnumbered Settings
    game.settings.register('wfrp4e-pl-addons', 'autoOutnumbered.Enable', {
        name: 'wfrp4epladdon.autoOutnumbered.Enable',
        hint: 'wfrp4epladdon.autoOutnumbered.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register('wfrp4e-pl-addons', 'autoOutnumbered.Bonus', {
        name: 'wfrp4epladdon.autoOutnumbered.Bonus',
        hint: 'wfrp4epladdon.autoOutnumbered.BonusHint',
        scope: 'world',
        config: true,
        default: 10,
        type: Number
    });

    game.settings.register('wfrp4e-pl-addons', 'autoOutnumbered.Max', {
        name: 'wfrp4epladdon.autoOutnumbered.Max',
        hint: 'wfrp4epladdon.autoOutnumbered.MaxHint',
        scope: 'world',
        config: true,
        default: 3,
        type: Number
    });

    // Auto Rotate Settings
    game.settings.register('wfrp4e-pl-addons', 'autoRotate.Enable', {
        name: 'wfrp4epladdon.autoRotate.Enable',
        hint: 'wfrp4epladdon.autoRotate.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });

    game.settings.register('wfrp4e-pl-addons', 'autoRotate.BonusFlanking', {
        name: 'wfrp4epladdon.autoRotate.BonusFlanking',
        hint: 'wfrp4epladdon.autoRotate.BonusFlankingHint',
        scope: 'world',
        config: true,
        default: 10,
        type: Number
    });

    game.settings.register('wfrp4e-pl-addons', 'autoRotate.BonuBehind', {
        name: 'wfrp4epladdon.autoRotate.BonuBehind',
        hint: 'wfrp4epladdon.autoRotate.BonuBehindHint',
        scope: 'world',
        config: true,
        default: 20,
        type: Number
    });

    // Prayer Nerf Settings
    game.settings.register('wfrp4e-pl-addons', 'prayerNerf.Enabled', {
        name: 'wfrp4epladdon.prayerNerf.Enable',
        hint: 'wfrp4epladdon.prayerNerf.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });

    // Auto Combat Settings
    game.settings.register('wfrp4e-pl-addons', 'autoCombat.Enabled', {
        name: 'wfrp4epladdon.autoCombat.Enable',
        hint: 'wfrp4epladdon.autoCombat.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });

    // Auto Miss Settings
    game.settings.register('wfrp4e-pl-addons', 'autoMiss.Enabled', {
        name: 'wfrp4epladdon.autoMiss.Enable',
        hint: 'wfrp4epladdon.autoMiss.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });

    // PF2e Heresy Settings
    game.settings.register('wfrp4e-pl-addons', 'pf2eHeresy.Enable', {
        name: 'wfrp4epladdon.pf2eHeresy.Enable',
        hint: 'wfrp4epladdon.pf2eHeresy.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });

    // Custom Diseases Settings
    game.settings.register('wfrp4e-pl-addons', 'customDiseases.Enable', {
        name: 'wfrp4epladdon.customDiseases.Enable',
        hint: 'wfrp4epladdon.customDiseases.EnableHint',
        scope: 'world',
        config: true,
        default: false,
        type: Boolean
    });

    // Socket Tests Settings
    game.settings.register('wfrp4e-pl-addons', 'socketTests.mode', {
        name: 'wfrp4epladdon.socketTests.Mode',
        hint: 'wfrp4epladdon.socketTests.ModeHint',
        scope: 'world',
        config: true,
        default: 'onKeyPress',
        type: String,
        choices: {
            'onKeyPress': 'wfrp4epladdon.socketTests.OnKeyPress',
            'always': 'wfrp4epladdon.socketTests.Always',
            'never': 'wfrp4epladdon.socketTests.Never'
        }
    });

    // Template Collision Settings
    game.settings.register('wfrp4e-pl-addons', 'templateCollision', {
        name: 'SETTINGS.templateCollision',
        hint: 'SETTINGS.templateCollisionHint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register('wfrp4e-pl-addons', 'templateCollisionMinimalRatio', {
        name: 'SETTINGS.templateCollisionMinimalRatio',
        hint: 'SETTINGS.templateCollisionMinimalRatioHint',
        scope: 'world',
        config: true,
        type: Number,
        default: 25
    });
}