import wfrp4ePlAddon from './constants.mjs';

/**
 *
 */
export default class CombatDistances {

    static DEFAULTS = {
        ranges: {
            ring1: {
                distance: 0.15,
                label: 'Osobisty',
                colorHostile: '#ffcccc', // Light Red
                colorAlly: '#ccffcc' // Light Green
            },
            ring2: {
                distance: 0.3,
                label: 'Bardzo Krótki',
                colorHostile: '#ff9999', // Light Coral
                colorAlly: '#99ff99' // Light Green
            },
            ring3: {
                distance: 0.6,
                label: 'Krótki',
                colorHostile: '#ff6666', // Salmon
                colorAlly: '#66ff66' // Light Green
            },
            ring4: {
                distance: 0.9,
                label: 'Średni',
                colorHostile: '#ff3333', // Red
                colorAlly: '#33cc33' // Green
            },
            ring5: {
                distance: 1.8,
                label: 'Długi',
                colorHostile: '#ff0000', // Dark Red
                colorAlly: '#00cc00' // Dark Green
            },
            ring6: {
                distance: 3,
                label: 'Bardzo Długi',
                colorHostile: '#cc0000', // Darker Red
                colorAlly: '#009900' // Darker Green
            },
            ring7: {
                distance: 6,
                label: 'Masywny',
                colorHostile: '#990000', // Dark Red/Purple
                colorAlly: '#006600' // Dark Green/Purple
            }
        }
    };

    /**
     *
     * @param wrapped
     * @param {...any} args
     */
    static async tokenDraw(wrapped, ...args) {
        await wrapped(...args);
        CombatDistances.createRings(this);
        return this;
    }

    /**
     *
     * @param token
     */
    static calculateWeaponReachRadius(token) {
        const weapons = token.actor.itemTags['weapon'].filter(x => x.equipped.value);
        const sortedWeapons = weapons.sort((x, _y) => x.reachNum < x.reachNum ? 1 : -1);
        let reach = 1;
        if (sortedWeapons.length > 0) {
            reach = sortedWeapons[0].reachNum ?? reach;
        }

        const range =  CombatDistances.DEFAULTS['ranges']['ring' + reach];
        const sceneSize = canvas.scene.grid.size / canvas.scene.grid.distance;
        const radius = (sceneSize * range.distance) + token.w / 2;
        return { radius, range };
    }

    /**
     *
     * @param token
     */
    static createRings(token) {
        if (!token.actor) {
            return;
        }
        const distance = CombatDistances.calculateWeaponReachRadius(token);
        const ring = new PIXI.Graphics();
        ring.beginFill(PIXI.utils.string2hex(distance.range.colorHostile), 0.25);
        ring.drawCircle(0, 0, distance.radius);
        ring.alpha = 0;
        ring.endFill();
        ring.position.set(token.w / 2, token.h / 2);

        // Add label
        const label = new PIXI.Text(`${distance.range.label} (${distance.range.distance} m)`, {
            fontSize: 15,
            fill: 0xffffff,
            align: 'center'
        });
        label.position.set(-distance.radius - 10, 0);
        label.zIndex = 100;
        ring.addChild(label);
        token.addChild(ring);

        token.on('mouseover', function() {
            const distance = CombatDistances.calculateWeaponReachRadius(token);
            const color = token.document.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY ? distance.range.colorAlly : distance.range.colorHostile;
            if (game.combat?.active) {
                ring.clear();
                ring.beginFill(PIXI.utils.string2hex(color), 0.25);
                ring.drawCircle(0, 0, distance.radius);
                ring.endFill();
                ring.alpha = 1;
            }
        });

        token.on('mouseout', function() {
            ring.alpha = 0;
        });
    }

    /**
     *
     */
    setup() {
        Hooks.on('createToken', (token, _data, _user) => {
            CombatDistances.createRings(token.object);
        });
        libWrapper.register(
            wfrp4ePlAddon.moduleId,
            'Token.prototype.draw',
            CombatDistances.tokenDraw,
            'WRAPPER'
        );
    }
}