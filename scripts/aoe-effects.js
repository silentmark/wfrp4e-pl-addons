const AoEEffects = {

	promises: [],
	running: false,

	init: function () {
		setInterval(async () => {
			if (AoEEffects.running) return;
			try {
				AoEEffects.running = true;
				while (AoEEffects.promises.length > 0) {
					const promise = AoEEffects.promises.shift();
					await promise();
				}
			}
			finally {
				AoEEffects.running = false;
			}
		}, 100);
	},

	getAoEEffectData: function (template) {
		let flags = template.getFlag('wfrp4e-pl-addons', 'aoeEffects');
        if (flags) {
            let aoeEffect = {};
            aoeEffect.item = fromUuidSync(flags.itemId);
			aoeEffect.token = template.object.attachedToken; //walled template feature
            if (flags.messageId) {
                aoeEffect.message = game.messages.get(flags.messageId);
            }
            return aoeEffect;
        }
		return {};
	},

    onConfigRender: function (config, html) {
		const aoeEffect = AoEEffects.getAoEEffectData(config.object);

		// Expand the width
		config.position.width = 540;
		config.setPosition(config.position);

		const nav = html.find('.form-group').last();

		const effectConfig = `
			<div class="form-group">
				<label>Item UUID</label>
				<div class="form-fields">
					<input type="text" value="${aoeEffect.item?.uuid ?? ""}" name="flags.wfrp4e-pl-addons.aoeEffects.itemId">
				</div>
			</div>
			<div class="form-group">
				<label>Message Id</label>
				<div class="form-fields">
					<input type="text" value="${aoeEffect.message?.id ?? ""}" name="flags.wfrp4e-pl-addons.aoeEffects.messageId">
				</div>
			</div>
		`;

		nav.after(effectConfig);
	},

	refreshEffects: async function () {
		if (!game.user.isGM) return;
		if (!game.combat || !game.combat.active) return;

		for (let targetToken of game.canvas.tokens.placeables) {
			if (!targetToken || targetToken.isDefeated) continue;
			let effectsFromAoE = targetToken.actor.actorEffects.filter(x=>x.getFlag('wfrp4e-pl-addons', 'templateId'));
			let effectToDelete = targetToken.actor.actorEffects.filter(x=>x.getFlag('wfrp4e-pl-addons', 'templateId'));
	
			for (let templateDocument of game.canvas.scene.templates) {
				if (templateDocument.getFlag('wfrp4e-pl-addons', 'aoeEffects')?.itemId) {
					//let affected = templateDocument.collidesToken(targetToken.document, {collisionMethod: "GRID_SPACES_POINTS"});
					let affected = templateDocument.collidesToken(targetToken.document, {collisionMethod: "POINTS_CENTER"});
					if (affected && templateDocument.elevation == targetToken.document.elevation) {
						const aoeEffect = AoEEffects.getAoEEffectData(templateDocument);
						if (!aoeEffect.item) continue;

						if (!effectsFromAoE.find(x=>x.getFlag('wfrp4e-pl-addons', 'templateId') == templateDocument.id)) {
							const effectsToApply = aoeEffect.item.effects.filter(x=>x.getFlag('wfrp4e', 'effectApplication') == 'area');
							for (let effectToApply of effectsToApply) {
								let effect = effectToApply.toObject();
								let test;
								if (aoeEffect.message) {
									test = aoeEffect.message.getTest();
								}
								if (aoeEffect.token) {
									effect = aoeEffect.token.actor.populateEffect(effect._id, aoeEffect.item, test);
									if (test) {
								    	mergeObject(effect, { flags: {wfrp4e: { messageId: aoeEffect.message.id } } });
									} 
									mergeObject(effect, { 
										flags: {"wfrp4e-pl-addons": { 
											templateId: templateDocument.id, 
											itemId: aoeEffect.item.id, 
											actorId: aoeEffect.token.actor.id } 
										} 
									});
          							// this probably shouldnt happen
									if (effect.flags.wfrp4e.effectTrigger == "invoke") {
										await game.wfrp4e.utility.runSingleEffect(effect, targetToken.actor, aoeEffect.item, {actor, effect, item: aoeEffect.item});
									} else {
      									await game.wfrp4e.utility.applyEffectToTarget(effect, [targetToken]);
									}
								}
								else {
									mergeObject(effect, { 
										flags: {"wfrp4e-pl-addons": { 
											templateId: templateDocument.id, 
											itemId: aoeEffect.item.id } 
										} 
									});
									await game.wfrp4e.utility.applyEffectToTarget(effect, [targetToken]);
								}
							}
						}
						else {
							effectToDelete = effectToDelete.filter(x=>x.getFlag('wfrp4e-pl-addons', 'templateId') != templateDocument.id);
						}
					} else {
						const effectIds = effectsFromAoE.filter(x=>x.getFlag('wfrp4e-pl-addons', 'templateId') == templateDocument.id).map(x=>x.id);
						if (effectIds.length) {
							await targetToken.actor.deleteEmbeddedDocuments('ActiveEffect', effectIds);
						}
					}
				}
			}
			const effectIds = effectToDelete.map(x=>x.id);
			if (effectIds.length) {
				await targetToken.actor.deleteEmbeddedDocuments('ActiveEffect', effectIds);
			}
		}
	},

	getTemplateDuration: async function (template) {
		let duration = -1;
		aoeEffect = AoEEffects.getAoEEffectData(template);
		if (aoeEffect.message) {
			let test = aoeEffect.message.getTest();
			if (test.data.result?.overcast?.usage?.duration?.current && 
				test.data.result?.overcast?.usage?.duration?.unit?.toLowerCase() == game.i18n.localize("Rounds") &&
				game.combat?.active) {
					//TODO: get the round that template was placed. 
				duration = test.data.result.overcast.usage.duration.current - (game.combat.round - templatePlacementRound);
			}
		}
		return duration;
	},


	onRefreshToken: async function (tokenDocument, data, options) {
		if (!game.user.isGM) return;
		if (!game.combat || !game.combat.active) return;

		AoEEffects.promises.push(AoEEffects.refreshEffects);
	},

	onCreateTemplate: async function(templateDocument, data, options) {
		if (!game.user.isGM) return;
		if (!game.combat || !game.combat.active) return;

		AoEEffects.promises.push(AoEEffects.refreshEffects);
	},

	onDeleteTemplate: async function(templateDocument, data, options) {
		if (!game.user.isGM) return;
		if (!game.combat || !game.combat.active) return;

		AoEEffects.promises.push(AoEEffects.refreshEffects);
	},


	onUpdateTemplate: async function(templateDocument, data, options) {
		if (!game.user.isGM) return;
		if (!game.combat || !game.combat.active) return;

		AoEEffects.promises.push(AoEEffects.refreshEffects);
	}
}

Hooks.on('ready', AoEEffects.init);
Hooks.on('refreshToken', AoEEffects.onRefreshToken);
Hooks.on('updateMeasuredTemplate', AoEEffects.onUpdateTemplate);
Hooks.on('deleteMeasuredTemplate', AoEEffects.onDeleteTemplate);
Hooks.on('createMeasuredTemplate', AoEEffects.onCreateTemplate);
Hooks.on('renderMeasuredTemplateConfig', AoEEffects.onConfigRender);