import wfrp4ePlAddon from './constants.mjs';
import CombatDistances from './combat-distance.mjs';


/**
 *
 */
export default class AutoOutnumbered {

    calculateOutnumbering = function(args) {
        const outnumberingModifier = game.settings.get('wfrp4e-pl-addons', 'autoOutnumbered.Bonus');
        const maxOutnumberingMultiplier = game.settings.get('wfrp4e-pl-addons', 'autoOutnumbered.Max');

        /**
         *
         * @param token
         */
        function getTokenSize(token) {
            let sizeNum = token.actor.sizeNum;
            if (token.actor.isMounted) {
                sizeNum = token.actor.mount.sizeNum;
            }
            return sizeNum;
        }

        /**
         *
         * @param centerX
         * @param centerY
         * @param centerR
         * @param tokenX
         * @param tokenY
         * @param tokenReach
         */
        function checkReachIntersection(centerX, centerY, centerR, tokenX, tokenY, tokenReach) {
            const dx = centerX - tokenX;
            const dy = centerY - tokenY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return (distance < (centerR + tokenReach));
        }

        if (args.type !== 'trait' && args.type !== 'weapon') {
            return;
        }
        if (args.targets?.length === 1 && (args.item?.type === 'weapon' || args.item?.type === 'trait') && args.item?.attackType === 'melee') {
            let tooltip = 'Przewaga Liczebna: ';
            const attackerAllies = [];
            const targetAllies = [];
            const attackingToken = args.actor.getActiveTokens()[0];
            const targetToken = args.target.getActiveTokens()[0];

            if (attackingToken === null || targetToken === null) {
                return;
            }

            const attackingTokenX = attackingToken.center.x;
            const attackingTokenY = attackingToken.center.y;
            const attackingRadius = attackingToken.w / 2;


            const vampireGift = targetToken.actor.itemTags['talent'].find(x => x.name === game.i18n.localize('Samotny Rycerz'));
            if (vampireGift) {
                return {
                    script: 'args.fields.modifier += ' + 0,
                    label: 'Przewaga Liczebna: brak, przeciwnik to Samotny Rycerz',
                    trigger: 'dialog',
                    options: { activateScript: 'return true' }
                };
            }

            const targetTokenX = targetToken.center.x;
            const targetTokenY = targetToken.center.y;
            const targetRadius = targetToken.w / 2;

            for (const tok of canvas.tokens.placeables) {
                if (tok.actor !== null && tok.id !== targetToken.id && tok.id !== attackingToken.id
          && tok.actor.hasCondition('engaged')
          && !tok.actor.hasCondition('dead')
          && !tok.actor.hasCondition('unconscious')
          && !tok.actor.hasCondition('broken')
          && !tok.actor.hasCondition('stunned')) {

                    const tokReachRadius = CombatDistances.calculateWeaponReachRadius(tok);
                    if (attackingToken.actor.sameSideAs(tok.actor)) {
                        const isAttackerAlly = checkReachIntersection(targetTokenX, targetTokenY, targetRadius, tok.center.x, tok.center.y, tokReachRadius.radius);
                        if (isAttackerAlly) {
                            attackerAllies.push(tok);
                        }
                    }
                    if (targetToken.actor.sameSideAs(tok.actor)) {
                        const isTargetAlly = checkReachIntersection(attackingTokenX, attackingTokenY, attackingRadius, tok.center.x, tok.center.y, tokReachRadius.radius);
                        if (isTargetAlly) {
                            targetAllies.push(tok);
                        }
                    }
                }
            }

            for (const tok of attackerAllies) {
                tooltip += `${tok.document.name} (sojusznik), `;
            }
            for (const tok of targetAllies) {
                tooltip += `${tok.document.name}, `;
            }
            //TODO: remove mounts from outnumbering calculation, when they dont have "trained" talent

            attackerAllies.push(attackingToken);
            targetAllies.push(targetToken);

            attackerAllies.sort((x, y) => getTokenSize(x) - getTokenSize(y));
            targetAllies.sort((x, y) => getTokenSize(x) - getTokenSize(y));

            args.attackerAllies = [...attackerAllies.map(x => x.id)];
            args.targetAllies = [...targetAllies.map(x => x.id)];

            if (attackerAllies.length <= targetAllies.length) {
                return;
            }


            //TODO: algorytm powinien przeleciec po wszystkie tokeny atakujacych i "odjac" ich wielkosc od przeciwnikow, jesli liczba atakujacych jest wieksza niz przeciwnikow, dodac bonus
            let currentTargetSize = getTokenSize(targetAllies.shift());
            let outnumbering = 0;
            for (let i = 0; i < attackerAllies.length; i++) {
                if (currentTargetSize <= getTokenSize(attackerAllies[i])) {
                    const nextTargetToken = targetAllies.shift();
                    if (nextTargetToken) {
                        currentTargetSize = getTokenSize(nextTargetToken);
                    } else {
                        outnumbering = attackerAllies.length - i;
                        break;
                    }
                } else {
                    currentTargetSize -= getTokenSize(attackerAllies[i]);
                }
            }

            const talent = targetToken.actor.itemTags['talent'].find(x => x.name === game.i18n.localize('NAME.CombatMaster'));
            if (talent) {
                outnumbering -= talent.advances;
                tooltip += ', ' + game.i18n.localize('NAME.CombatMaster') + ' (' + talent.advances + ')';
            }

            if (outnumbering >= 0) {
                const outnumberFinalModifier = Math.min(outnumbering * outnumberingModifier, maxOutnumberingMultiplier * outnumberingModifier);
                const newScript = {
                    script: 'args.fields.modifier += ' + outnumberFinalModifier,
                    label: tooltip,
                    trigger: 'dialog',
                    options: { activateScript: 'return true' }
                };
                return new WarhammerScript(newScript);
            }
        }
    };


    /**
     *
     */
    setup() {
        if (game.settings.get('wfrp4e-pl-addons', 'autoOutnumbered.Enable')) {

            Hooks.on('updateCombat', async function() {
                if (game.user.isGM && Sequence) {
                    await Promise.all(game.canvas.tokens.placeables.map(tok => new Sequence().animation().on(tok).tint('#FFFFFF').play()));
                }
            });

            Hooks.on('wfrp4e:createRollDialog', (dialog) => {
                const script = game.modules.get(wfrp4ePlAddon.moduleId).api.autoOutnumbered.calculateOutnumbering(dialog);
                if (script) {
                    dialog.data.scripts.push(script);
                }
                if (Sequence) {
                    Promise.all(game.canvas.tokens.placeables.map(tok => new Sequence().animation().on(tok).tint('#FFFFFF').play()))
                        .then(async() => {
                            await new Promise(resolve => setTimeout(resolve, 50));
                            if (dialog.attackerAllies) {
                                await Promise.all(dialog.attackerAllies.map(id => new Sequence().animation().on(game.canvas.tokens.get(id)).tint('#00FF00').play()));
                            }
                            if (dialog.targetAllies) {
                                await Promise.all(dialog.targetAllies.map(id => new Sequence().animation().on(game.canvas.tokens.get(id)).tint('#FF0000').play()));
                            }
                        });
                }
            });
        }
    }
}