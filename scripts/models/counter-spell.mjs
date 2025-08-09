import wfrp4ePlAddon from '../constants.mjs';




/**
 *
 */
export class CounterSpellMessageModel extends WarhammerMessageModel {
    /**
     *
     */
    static defineSchema() {
        const schema = {};

        schema.defenders = new foundry.data.fields.ArrayField(new foundry.data.fields.SchemaField({
            tokenId : new fields.StringField(),
            actorId : new fields.StringField(),
            name : new fields.StringField()
        }));

        return schema;
    }

    /**
     * Creates a chat message for a counter spell.
     * @param {Array} defenders - The defenders of the counter spell.
     * @param {Object} [chatData={}] - Additional chat data to merge with the message.
     */
    static async createCounterSpellMessage(defenders, chatData = {}) {
        const html = await foundry.applications.handlebars.renderTemplate('modules/wfrp4e-pl-addons/templates/auto-counterspell.hbs', defenders);
        await ChatMessage.create(foundry.utils.mergeObject({
            type: 'wfrp4e-pl-addons.counterSpell',
            content: html,
            speaker: {
                alias: 'Counter Spell'
            },
            system: {
                defenders: defenders.map(defender => ({
                    tokenId: defender.tokenId,
                    actorId: defender.actorId,
                    name: defender.name
                }))
            }
        }, chatData));
    }

    /**
     *
     */
    static get actions() {
        return foundry.utils.mergeObject(super.actions, {
            'counter-spell': this._counterSpell
        });
    }

    /**
     *
     * @param _ev
     * @param target
     */
    static async _counterSpell(_ev, target) {
        const actorId = target.dataset.actor;
        const tokenId = target.dataset.token;

        if (!game.combat) {
            return;
        }

        if (!game.user.isGM) {
            return ui.notifications.error('ErrorCounterSpellNotGM', { localize: true });
        }

        if (!actorId || !tokenId) {
            return ui.notifications.error('ErrorCounterSpell', { localize: true });
        }

        const actor = game.actors.get(actorId);
        if (!actor) {
            return ui.notifications.error('ErrorActorNotFound', { localize: true });
        }

        const token = canvas.tokens.get(tokenId);
        if (!token) {
            return ui.notifications.error('ErrorTokenNotFound', { localize: true });
        }
        if (game.combat) {
            const combat = game.combat;
            const messageId = $(target).parents('.message').prev().attr('data-message-id');
            const message = game.messages.get(messageId);
            const test = message.system.test;
            const token = game.scenes.current.tokens.get(tokenId);
            await test.createOpposedMessage(token);

            const casters = combat.getFlag(wfrp4ePlAddon.moduleId, 'casters');
            casters[actorId] = true;
            await combat.setFlag(wfrp4ePlAddon.moduleId, 'casters', casters);
        }
    }
}