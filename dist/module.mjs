//#region src/module/features/BaseFeature.ts
var BaseFeature = class {
	constructor(featureManager) {
		this._featureManager = featureManager;
		this._actorId = "";
		this._weaponId = "";
		this.init();
	}
	get featureManager() {
		return this._featureManager;
	}
	get moduleManager() {
		return this._featureManager.moduleManager;
	}
	get character() {
		return game?.actors?.get(this._actorId);
	}
	get characterId() {
		return this._actorId;
	}
	set characterId(id) {
		this._actorId = id;
	}
	get weapon() {
		return this.character.items.get(this._weaponId);
	}
	get weaponId() {
		return this._weaponId;
	}
	set weaponId(id) {
		this._weaponId = id;
	}
	get loadout() {
		return this.getReloadFlag("chambered");
	}
	get fired() {
		return this.getReloadFlag("fired");
	}
	getReloadFlag(name) {
		const reloadableWeapon = this.weapon;
		const maxShots = reloadableWeapon.system.uses.max;
		const fired = reloadableWeapon.getFlag(this.moduleManager.id, name) || new Array(maxShots).fill("Empty");
		if (fired.length < maxShots) {
			const missing = maxShots - fired.length;
			for (let i = 0; i < missing; i++) fired.push("Empty");
		}
		return fired;
	}
	ammunition(items, equipped = false, exclude = []) {
		return items.filter((item) => {
			const gameSystem = item.system;
			if (equipped) return item.type == "consumable" && gameSystem.type.subtype == "firearmBullet" && gameSystem.equipped && !exclude.includes(item.name);
			return item.type == "consumable" && gameSystem.type.subtype == "firearmBullet" && !exclude.includes(item.name);
		});
	}
	init() {}
	translate(key, opts, format) {
		return this.moduleManager.uiManager.getLocalizedTxt(key, opts, format);
	}
	toString() {
		return "class BaseFeature";
	}
};
//#endregion
//#region src/module/features/NextRoundFeature.ts
var NextRoundFeature = class extends BaseFeature {
	init() {
		Hooks.on("dnd5e.preUseActivity", this.onUseActivity.bind(this));
	}
	onUseActivity(activity) {
		if (activity.type === "utility" && activity.name == "Next Round") {
			console.log("Weapon Reload | Triggered Next Round");
			this.characterId = activity.actor.id;
			this.weaponId = activity.item.id;
			this.nextRound();
			return false;
		}
		return true;
	}
	async nextRound() {
		const nextRound = this.loadout[0];
		const actor = this.character;
		const htmlTemplate = await foundry.applications.handlebars.renderTemplate("modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs", {
			item: {
				img: "systems/dnd5e/icons/svg/damage/piercing.svg",
				name: nextRound
			},
			description: this.translate("WEAPON_RELOAD.Features.NextRound.Description", {
				bullet: nextRound,
				weapon: this.weapon.name
			}, true),
			title: this.translate("WEAPON_RELOAD.Features.NextRound.Title")
		});
		this.moduleManager.uiManager.sendChat(actor, htmlTemplate, void 0, void 0, [actor.id]);
	}
	toString() {
		return "class NextRoundFeature";
	}
};
//#endregion
//#region src/module/features/ReloadableWeaponAttackFeature.ts
var ReloadableWeaponAttackFeature = class extends BaseFeature {
	constructor(featureManager) {
		super(featureManager);
		this._nextRound = {
			id: "",
			type: ""
		};
		this._hookId = -1;
	}
	init() {
		Hooks.on("dnd5e.postRollConfiguration", this.onUseActivity.bind(this));
	}
	onUseActivity(d20Roll, event) {
		if (!event.hookNames.includes("attack") || event.subject.name !== "Attack") return;
		if ((d20Roll[0]?.data?.item)?.type?.baseItem !== "reloadableWeapon") return;
		console.log("Weapon Reload | Triggered Attack");
		this.weaponId = event.subject.item.id;
		this.characterId = event.subject.actor.id;
		return this.reloadableWeaponAttack();
	}
	reloadableWeaponAttack() {
		const bullet = this.getNextRound();
		if (bullet.name == "Empty") {
			this.dryfireWeapon();
			if (this.weapon.system.uses.spent == this.weapon.system.uses.max) return false;
		}
		if (bullet.name !== "Empty") {
			this._nextRound = {
				id: bullet.id,
				type: bullet.type
			};
			this._hookId = Hooks.on("dnd5e.renderChatMessage", this.onRenderChatMessage.bind(this));
		}
		return this.fireRound(bullet);
	}
	async onRenderChatMessage(message, html) {
		const itemId = message.flags.dnd5e?.item.id;
		const itemType = message.flags.dnd5e?.item.type;
		if (this._nextRound.id === itemId && this._nextRound.type === itemType) {
			Hooks.off("dnd5e.renderChatMessage", this._hookId);
			this._nextRound = {
				id: "",
				type: ""
			};
			const bullet = this.character.items.get(itemId);
			const activationCard = html.querySelector(".activation-card");
			const itemcard = html.querySelector(".item-card");
			const parentElement = activationCard || itemcard;
			const checkUnstableAmmo = game.settings.get(this.moduleManager.id, "unstableAmmo");
			const checkMisfire = game.settings.get(this.moduleManager.id, "useMisfires");
			const unstableAmmoFailureThreshold = game.settings.get(this.moduleManager.id, "unstableAmmoFailureThreshhold");
			if (checkMisfire) {
				const criticalFailureMsg = checkUnstableAmmo && bullet?.system.properties.find((prop) => {
					return prop === "unstable";
				}) ? this.translate("WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireUnstable", { failure: `${unstableAmmoFailureThreshold}` }, true) : this.translate("WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireNatOne");
				((parentElement?.querySelector(".card-content"))?.querySelector(".wrapper"))?.insertAdjacentHTML("beforeend", `<p>${criticalFailureMsg}</p>`);
			}
			if (itemcard && !activationCard) {
				const referenceElement = parentElement?.querySelector(".card-header");
				const buttonContainer = document.createElement("div");
				buttonContainer.className = "card-buttons";
				referenceElement?.after(buttonContainer);
			}
			const cardButtonsElement = parentElement?.querySelector(".card-buttons");
			if (checkMisfire) {
				const misfireBtn = document.createElement("button");
				misfireBtn.onclick = this.onClickMisfire.bind(this);
				misfireBtn.innerHTML = `${this.makeIcon("fa-burst")}${this.translate("WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfiredBtnTxt")}`;
				cardButtonsElement?.append(misfireBtn);
			}
			const refundBtn = document.createElement("button");
			refundBtn.onclick = this.onClickRefund.bind(this);
			refundBtn.innerHTML = `${this.makeIcon("fa-undo")}${this.translate("WEAPON_RELOAD.Features.ReloadableWeaponAttack.RefundBtnTxt")}`;
			cardButtonsElement?.append(refundBtn);
		}
	}
	getNextRound() {
		const character = this.character;
		const weapon = this.weapon;
		const loadout = this.loadout;
		loadout.push("Empty");
		const nextRound = loadout.shift();
		weapon.setFlag(this.moduleManager.id, "chambered", loadout);
		return this.ammunition(character.items).find((ammo) => {
			if (ammo.name == nextRound) return ammo;
			return null;
		}) || { name: "Empty" };
	}
	dryfireWeapon() {
		const character = this.character;
		const weapon = this.weapon;
		const renderHookId = Hooks.on("renderChatMessage", (_chatItem, html) => {
			const reloadBtn = html[0].querySelector(".reload-ammo");
			reloadBtn?.addEventListener("click", () => {
				this.reload(character, weapon);
			});
			if (reloadBtn) Hooks.off("renderChatMessage", renderHookId);
		});
		const templateData = {
			description: { chat: `<p>${this.translate("WEAPON_RELOAD.Features.ReloadableWeaponAttack.DryFireDescription", {
				name: character.name,
				reloadableWeapon: weapon.name
			}, true)}</p>` },
			item: {
				img: weapon.img,
				name: this.translate("WEAPON_RELOAD.Features.ReloadableWeaponAttack.DryFireTitle")
			},
			subtitle: weapon.name,
			buttons: [{
				dataset: { visibility: "all" },
				icon: this.makeIcon("fa-rotate-right"),
				label: this.translate("WEAPON_RELOAD.Features.Reload.Text"),
				classes: "reload-ammo"
			}]
		};
		this.renderCard(templateData, character);
	}
	async renderCard(templateData, character) {
		const htmlTemplate = await foundry.applications.handlebars.renderTemplate("modules/fvtt-weapon-reload/templates/activity-card.hbs", templateData);
		this.moduleManager.uiManager.sendChat(character, htmlTemplate);
	}
	fireRound(bullet) {
		const reloadableWeapon = this.weapon;
		const maxShots = reloadableWeapon.system.uses.max;
		const firedLoadout = reloadableWeapon.getFlag(this.moduleManager.id, "fired") || new Array(maxShots).fill("Empty");
		firedLoadout.unshift(bullet.name);
		firedLoadout.splice(-1);
		reloadableWeapon.setFlag(this.moduleManager.id, "fired", firedLoadout);
		if (bullet.name !== "Empty") {
			const uses = reloadableWeapon.system.uses;
			const qty = uses.spent + 1 <= uses.max ? uses.spent + 1 : uses.max;
			reloadableWeapon.update({
				"system.uses.spent": qty,
				"system.uses.value": uses.max - qty
			});
			bullet.use();
		}
		return true;
	}
	reload(actor, reloadableWeapon) {
		this.featureManager.getFeature("reload").onReloadCallback(actor, reloadableWeapon);
	}
	async onClickRefund() {
		const actor = this.character;
		const reloadableWeapon = this.weapon;
		const inventoryAmmunition = this.ammunition(actor.items);
		const fired = this.fired;
		const refund = fired.splice(0, 1)[0];
		fired.push("Empty");
		if (refund == "Empty") {
			this.moduleManager.uiManager.uiNotification(this.translate("WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundNoMoreMsg", {
				name: actor.name,
				reloadableWeapon: reloadableWeapon.name
			}, true), "warn");
			return;
		}
		await reloadableWeapon.setFlag(this.moduleManager.id, "fired", fired);
		let bullet = { name: refund };
		inventoryAmmunition.forEach((ammo) => {
			if (ammo.name == refund) bullet = ammo;
		});
		const ammoLoadout = this.loadout;
		ammoLoadout.unshift(refund);
		ammoLoadout.splice(-1);
		await reloadableWeapon.setFlag(this.moduleManager.id, "chambered", ammoLoadout);
		const uses = reloadableWeapon.system.uses;
		const qty = uses.spent - 1 >= 0 ? uses.spent - 1 : 0;
		reloadableWeapon.update({
			"system.uses.spent": qty,
			"system.uses.value": uses.max - qty
		});
		const htmlTemplate = await foundry.applications.handlebars.renderTemplate("modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs", {
			item: {
				img: bullet.img,
				name: bullet.name
			},
			description: this.translate("WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundCompleteMsg", {
				bullet: refund,
				name: reloadableWeapon.name
			}, true),
			title: this.translate("WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundCompleteTitle")
		});
		this.moduleManager.uiManager.sendChat(actor, htmlTemplate);
	}
	async onClickMisfire() {
		const actor = this.character;
		await (await new Roll("1d6").roll()).toMessage({ speaker: { alias: actor.name } });
	}
	makeIcon(icon) {
		return `<i class="fas ${icon}"></i>`;
	}
	toString() {
		return "class ReloadableWeaponAttackFeature";
	}
};
//#endregion
//#region src/module/features/ReloadableWeaponCreationFeature.ts
var ReloadableWeaponCreationFeature = class extends BaseFeature {
	constructor(featureManager) {
		super(featureManager);
		this._creatingReloadableWeapon = false;
		this._createItemHookId = -1;
	}
	init() {
		Hooks.on("preCreateItem", this.onPreCreateItem.bind(this));
	}
	async onPreCreateItem(item) {
		if (item.system.type.baseItem == "reloadableWeapon") {
			console.log("Weapon Reload | Triggered Pre-Creation");
			if (item.actor) {
				this.weaponId = item.id;
				this.characterId = item.actor?.id;
				this._creatingReloadableWeapon = true;
				this._createItemHookId = Hooks.on("createItem", this.onCreateItem.bind(this));
			}
		}
	}
	async onCreateItem(item) {
		if (!this._creatingReloadableWeapon || item.id !== this.weaponId) return;
		console.log("Weapon Reload | Triggered ReloadableWeapon Creation");
		const reloadableWeapon = this.weapon;
		const ammoQty = reloadableWeapon.system.uses.max;
		await reloadableWeapon.update({
			"system.uses.spent": ammoQty,
			"system.uses.value": 0
		});
		await reloadableWeapon.setFlag(this.moduleManager.id, "chambered", new Array(ammoQty).fill("Empty"));
		await reloadableWeapon.setFlag(this.moduleManager.id, "fired", new Array(ammoQty).fill("Empty"));
		this.weaponId = "";
		this.characterId = "";
		this._creatingReloadableWeapon = false;
		Hooks.off("createItem", this._createItemHookId);
		this._createItemHookId = -1;
	}
	toString() {
		return "class ReloadableWeaponCreationFeature";
	}
};
//#endregion
//#region src/module/features/ReloadFeature.ts
var ReloadFeature = class extends BaseFeature {
	constructor(featureManager) {
		super(featureManager);
		this._hookId = -1;
		this._handleChoiceDialogClose = false;
		this._repeaterRound = {};
	}
	init() {
		Hooks.on("dnd5e.preUseActivity", this.onUseActivity.bind(this));
		Hooks.on("ready", this.getRepeaterAmmo.bind(this));
	}
	async getRepeaterAmmo() {
		const repeater_round_uuid = game.settings.get(this.moduleManager.id, "repeaterRoundUUID");
		this._repeaterRound = await fromUuid(repeater_round_uuid);
	}
	onUseActivity(activity) {
		if (activity.type === "utility" && activity.name == "Reload") {
			console.log("Weapon Reload | Triggered Reload");
			this.characterId = activity.actor.id;
			this.weaponId = activity.item.id;
			this.weaponReload();
			return false;
		}
		return true;
	}
	weaponReload(refundAmmo = true) {
		const items = this.character?.items;
		const currentLoadout = this.loadout;
		const inventoryAmmunition = this.ammunition(items, false, [this._repeaterRound.name]);
		let ammunitionChoices = [];
		if (refundAmmo) ammunitionChoices = this.refundChamberedAmmo(inventoryAmmunition);
		else ammunitionChoices = inventoryAmmunition.map((ammo) => {
			return {
				name: ammo.name,
				value: ammo.name,
				count: ammo.system.quantity,
				equipped: ammo.system.equipped
			};
		});
		const checkEquipped = game.settings.get(this.moduleManager.id, "filterAmmunitionByEquipped");
		this.chooseAmmunition(ammunitionChoices.filter((ammoItem) => {
			if (ammoItem.count > 0) {
				if (checkEquipped && ammoItem.equipped || !checkEquipped) return true;
			}
			return false;
		}), currentLoadout);
	}
	refundChamberedAmmo(inventoryAmmunition) {
		const loadoutCounts = this.getLoadoutCounts(this.loadout);
		const availableAmmunition = [];
		inventoryAmmunition.forEach((ammo) => {
			const name = ammo.name;
			const ammoInfo = {
				name: ammo.name,
				value: ammo.name,
				count: ammo.system.quantity,
				equipped: ammo.system.equipped
			};
			if (loadoutCounts[name]) {
				ammoInfo.count = ammo.system.quantity + loadoutCounts[name];
				ammo.update({ "system.quantity": ammoInfo.count });
			}
			availableAmmunition.push(ammoInfo);
		});
		return availableAmmunition;
	}
	onSubmitChooseAmmunition(data) {
		const { loadout, reloadCanceled } = data;
		return this.reloadReloadableWeapon(loadout, reloadCanceled);
	}
	async chooseAmmunition(ammoOptions, currentLoadout) {
		const dialogContent = await foundry.applications.handlebars.renderTemplate("modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs", {
			loadoutSlots: new Array(this.weapon.system.uses.max).fill("Empty"),
			ammoOptions
		});
		const dialogButtons = [{
			action: "load",
			label: this.translate("WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtLoad"),
			callback: (_event, button) => {
				this._handleChoiceDialogClose = false;
				const loadout = [];
				for (let i = 0; i < button.form?.elements?.length; i++) {
					const elm = button.form?.elements.item(i);
					if (elm?.name == "ammo-select") loadout.push(elm.value);
				}
				return {
					loadout,
					reloadCanceled: false
				};
			}
		}, {
			action: "cancel",
			label: this.translate("WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtCancel"),
			callback: () => {
				this._handleChoiceDialogClose = false;
				return {
					loadout: currentLoadout,
					reloadCanceled: true
				};
			}
		}];
		const onCloseDialogHook = (dialogV2) => {
			if (dialogV2.id === "ammo-choice-dialog") this.onCloseChoiceDialog(currentLoadout);
		};
		this._handleChoiceDialogClose = true;
		this._hookId = Hooks.on("closeDialogV2", onCloseDialogHook.bind(this));
		this.moduleManager.uiManager.buildDialog({
			title: this.translate("WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogTitle"),
			content: dialogContent,
			buttons: dialogButtons,
			onSubmit: this.onSubmitChooseAmmunition.bind(this)
		}, "ammo-choice-dialog").render({ force: true });
	}
	onCloseChoiceDialog(loadout) {
		Hooks.off("closeDialogV2", this._hookId);
		this._hookId = -1;
		if (this._handleChoiceDialogClose) {
			this._handleChoiceDialogClose = false;
			this.reloadReloadableWeapon(loadout, true);
		}
	}
	async buildReloadChat(reloadableWeapon, reloadCanceled, loadout) {
		return await foundry.applications.handlebars.renderTemplate("modules/fvtt-weapon-reload/templates/reloadableWeaponReloadTemplate.hbs", {
			item: {
				img: reloadableWeapon.img,
				name: reloadableWeapon.name
			},
			flavor: this.translate(reloadCanceled ? "WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavorCanceled" : "WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavor"),
			title: this.translate(reloadCanceled ? "WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsgCanceled" : "WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsg", { reloadableWeapon: reloadableWeapon.name }, true),
			loadout
		});
	}
	async reloadReloadableWeapon(loadout, reloadCanceled = false) {
		const reloadableWeapon = this.weapon;
		const ammoCounts = this.getLoadoutCounts(loadout);
		const canceledLoadout = new Array(this.weapon.system.uses.max).fill("Empty");
		let htmlTemplate;
		if (this.removeLoadout(ammoCounts)) {
			let qty = 0;
			if (ammoCounts["Empty"] > 0) qty += ammoCounts["Empty"];
			await reloadableWeapon.update({
				"system.uses.spent": qty,
				"system.uses.value": reloadableWeapon.system.uses.max - qty
			});
			await reloadableWeapon.setFlag(this.moduleManager.id, "chambered", loadout);
			htmlTemplate = await this.buildReloadChat(reloadableWeapon, reloadCanceled, loadout);
		} else {
			Hooks.off("closeDialogV2", this._hookId);
			this._hookId = -1;
			await reloadableWeapon.setFlag(this.moduleManager.id, "chambered", canceledLoadout);
			htmlTemplate = await this.buildReloadChat(reloadableWeapon, reloadCanceled, canceledLoadout);
		}
		await reloadableWeapon.setFlag(this.moduleManager.id, "fired", canceledLoadout);
		this.moduleManager.uiManager.sendChat(this.character, htmlTemplate);
		this.characterId = "";
		this.weaponId = "";
	}
	removeLoadout(counts) {
		let ammunitionAvailable = true;
		const inventoryAmmunition = this.ammunition(this.character?.items);
		inventoryAmmunition.forEach((ammo) => {
			const name = ammo.name;
			if (ammo.system.quantity - counts[name] < 0) {
				this.moduleManager.uiManager.uiNotification(this.translate("WEAPON_RELOAD.Features.Reload.Weapon.LoadingErrorMsg", { name: ammo.name }, true), "error");
				ammunitionAvailable = false;
			}
		});
		if (ammunitionAvailable) inventoryAmmunition.forEach(async (ammo) => {
			const name = ammo.name;
			if (counts[name]) await ammo.update({ "system.quantity": ammo.system.quantity - counts[name] });
		});
		return ammunitionAvailable;
	}
	async onReloadCallback(actor, weapon) {
		this.characterId = actor.id;
		this.weaponId = weapon.id;
		this.weaponReload();
	}
	getLoadoutCounts(currentLoadout) {
		const loadout = {};
		currentLoadout.forEach((ammo) => {
			if (!loadout[ammo]) loadout[ammo] = 0;
			loadout[ammo] = loadout[ammo] + 1;
		});
		return loadout;
	}
	toString() {
		return "class ReloadFeature";
	}
};
//#endregion
//#region src/module/features/RepeatingShotFeature.ts
var RepeatingShotFeature = class extends BaseFeature {
	constructor(featureManager) {
		super(featureManager);
		this._ammo = {};
	}
	init() {
		Hooks.on("dnd5e.postRollConfiguration", this.onUseActivity.bind(this));
	}
	onUseActivity(d20Roll, event) {
		if (!event.hookNames.includes("attack") || event.subject.name !== "Repeating Shot") return;
		if ((d20Roll[0]?.data?.item)?.type?.baseItem !== "reloadableWeapon") return;
		console.log("Weapon Reload | Triggered Repeating Shot");
		this.weaponId = event.subject.item.id;
		this.characterId = event.subject.actor.id;
		return this.fireRound();
	}
	async fireRound() {
		await this.loadAmmo();
		if (!this._ammo) return false;
		this._ammo.use();
		return true;
	}
	findAmmo(name) {
		return this.character.items.filter((item) => {
			const gameSystem = item.system;
			return item.type == "consumable" && gameSystem.type.subtype == "firearmBullet" && item.name == name;
		})[0];
	}
	hasAmmo(name) {
		if (this.character.items.filter((item) => {
			const gameSystem = item.system;
			return item.type == "consumable" && gameSystem.type.subtype == "firearmBullet" && item.name == name;
		}).length > 0) return true;
		return false;
	}
	async loadAmmo() {
		const repeater_round_uuid = game.settings.get(this.moduleManager.id, "repeaterRoundUUID");
		const compendiumAmmo = await fromUuid(repeater_round_uuid);
		if (!this.hasAmmo(compendiumAmmo.name)) await this.character.createEmbeddedDocuments("Item", [compendiumAmmo.toObject()]);
		this._ammo = this.findAmmo(compendiumAmmo.name);
	}
	toString() {
		return "class RepeatingShotFeature";
	}
};
//#endregion
//#region src/module/managers/FeatureManager.ts
var FeatureManager = class {
	constructor(moduleManager) {
		this._moduleManager = moduleManager;
		this._features = {};
	}
	init() {
		this._features = {
			nextRound: new NextRoundFeature(this),
			reload: new ReloadFeature(this),
			reloadableWeaponAttack: new ReloadableWeaponAttackFeature(this),
			reloadableWeaponCreation: new ReloadableWeaponCreationFeature(this),
			repeatingShot: new RepeatingShotFeature(this)
		};
	}
	getFeature(id) {
		if (this._features[id]) return this._features[id];
		return null;
	}
	get moduleManager() {
		return this._moduleManager;
	}
	toString() {
		return `class FeatureManager: ${this._features.length}`;
	}
};
//#endregion
//#region src/module/managers/UiManager.ts
var UiManager = class {
	constructor(moduleManager) {
		this._moduleManager = moduleManager;
	}
	get moduleManager() {
		return this._moduleManager;
	}
	buildDialog(options, id) {
		return new foundry.applications.api.DialogV2({
			window: {
				title: options.title,
				contentClasses: options.contentClasses || []
			},
			content: options.content,
			buttons: options.buttons,
			submit: options.onSubmit,
			id
		});
	}
	uiNotification(msg, type = "info") {
		if (ui.notifications) switch (type) {
			case "error":
				ui.notifications.error(msg);
				break;
			case "warn":
				ui.notifications.warn(msg);
				break;
			default: ui.notifications.info(msg);
		}
	}
	sendChat(speaker, content, flavor, sound, whisper = []) {
		const ChatData = {
			speaker: ChatMessage.getSpeaker({ actor: speaker }),
			content,
			...flavor !== void 0 && { flavor },
			...sound !== void 0 && { sound },
			whisper
		};
		ChatMessage.create(ChatData);
	}
	getLocalizedTxt(key, opts, format = false) {
		if (format) return game.i18n.format(key, opts);
		return game.i18n.localize(key, opts);
	}
	toString() {
		return "class UiManager";
	}
};
//#endregion
//#region src/module/managers/TemplateManager.ts
var TemplateManager = class TemplateManager {
	init() {
		foundry.applications.handlebars.loadTemplates(TemplateManager.paths);
	}
	static get paths() {
		const paths = {};
		const templatePaths = "__ALL_TEMPLATES__".split(",");
		for (const path of templatePaths) paths[path.replace(".hbs", ".html")] = path;
		return paths;
	}
	static onHotReload() {
		for (const template in _templateCache) if (Object.prototype.hasOwnProperty.call(_templateCache, template)) Reflect.deleteProperty(_templateCache, template);
		foundry.applications.handlebars.loadTemplates(this.paths).then(() => {
			for (const application in ui.windows) if (Object.prototype.hasOwnProperty.call(ui.windows, application)) ui.windows[application].render(true);
		});
	}
	toString() {
		return "class TemplateManager";
	}
};
//#endregion
//#region src/module/managers/ModuleManager.ts
var ModuleManager = class {
	constructor(id) {
		this._moduleId = id;
		this._featureManager = new FeatureManager(this);
		this._uiManager = new UiManager(this);
		this._templateManager = new TemplateManager();
	}
	get id() {
		return this._moduleId;
	}
	get featureManager() {
		return this._featureManager;
	}
	get uiManager() {
		return this._uiManager;
	}
	get templateManager() {
		return this._templateManager;
	}
	init() {
		this.systemOverrides();
		this.moduleConfigurations();
		this._featureManager.init();
		this._templateManager.init();
	}
	systemOverrides() {
		CONFIG.DND5E.featureTypes.item = { label: this.uiManager.getLocalizedTxt("WEAPON_RELOAD.ItemFeature") };
		CONFIG.DND5E.itemProperties.concealable = { label: this.uiManager.getLocalizedTxt("WEAPON_RELOAD.Concealable") };
		CONFIG.DND5E.validProperties.weapon.add("concealable");
		CONFIG.DND5E.itemProperties.unstable = {
			label: this.uiManager.getLocalizedTxt("WEAPON_RELOAD.Unstable"),
			isPhysical: true
		};
		CONFIG.DND5E.weaponIds.reloadableWeapon = "Compendium.fvtt-weapon-reload.weapon-reload-item-pack.Item.lE60QaS1sctb3OAd";
	}
	moduleConfigurations() {
		const moduleName = "fvtt-weapon-reload";
		game.settings.register(moduleName, "unstableAmmo", {
			scope: "world",
			name: "SETTINGS.WEAPON_RELOAD.UnstableAmmo.Name",
			hint: "SETTINGS.WEAPON_RELOAD.UnstableAmmo.Hint",
			type: Boolean,
			config: true,
			default: true
		});
		game.settings.register(moduleName, "unstableAmmoFailureThreshhold", {
			scope: "world",
			name: "SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Name",
			hint: "SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Hint",
			type: Number,
			config: true,
			default: 2
		});
		game.settings.register(moduleName, "useMisfires", {
			scope: "world",
			name: "SETTINGS.WEAPON_RELOAD.UseMisfires.Name",
			hint: "SETTINGS.WEAPON_RELOAD.UseMisfires.Hint",
			type: Boolean,
			config: true,
			default: true
		});
		game.settings.register(moduleName, "filterAmmunitionByEquipped", {
			scope: "user",
			name: "SETTINGS.WEAPON_RELOAD.FilterAmmunitionByEquipped.Name",
			hint: "SETTINGS.WEAPON_RELOAD.FilterAmmunitionByEquipped.Hint",
			type: Boolean,
			config: true,
			default: false
		});
		game.settings.register(moduleName, "repeaterRoundUUID", {
			scope: "world",
			name: "SETTINGS.WEAPON_RELOAD.RepeaterRoundUUID.Name",
			hint: "SETTINGS.WEAPON_RELOAD.RepeaterRoundUUID.Hint",
			type: String,
			config: true,
			default: "Compendium.fvtt-weapon-reload.weapon-reload-item-pack.Item.GQzRN4amlRZX7k0V"
		});
	}
	debug(hooks = false) {
		CONFIG.debug.hooks = hooks;
		console.log("CONFIG: ", CONFIG);
		console.log("CONFIG.DND5E: ", CONFIG.DND5E);
	}
	toString() {
		return "class ModuleManager";
	}
};
//#endregion
//#region src/utils/rolldown.ts
const MODULE_ID = "fvtt-weapon-reload";
/**
* Rolls down global/system settings to world scope if missing or outdated.
* Typically called on `ready`.
*/
async function rollDownSettings() {
	for (const [key, value] of Object.entries({
		unstableAmmo: true,
		unstableAmmoFailureThreshhold: 2,
		useMisfires: true,
		filterAmmunitionByEquipped: false,
		repeaterRoundUUID: "Compendium.fvtt-weapon-reload.weapon-reload-item-pack.Item.GQzRN4amlRZX7k0V"
	})) {
		const current = game.settings.get(MODULE_ID, key);
		if (current === void 0 || current === null) {
			console.log(`[${MODULE_ID}] Rolling down default for ${key}: ${value}`);
			await game.settings.set(MODULE_ID, key, value);
		}
	}
}
/**
* Watch for system-level setting changes and propagate them.
*/
function listenForSystemChanges() {
	Hooks.on("updateSetting", async (setting) => {
		if (setting.key?.startsWith("system.") && setting.key.includes(MODULE_ID)) {
			const [, , key] = setting.key.split(".");
			console.log(`[${MODULE_ID}] Detected system-level change: ${key}`);
			await game.settings.set(MODULE_ID, key, setting.value);
		}
	});
}
//#endregion
//#region module.json
var id = "fvtt-weapon-reload";
//#endregion
//#region src/index.ts
Hooks.once("init", async () => {
	console.log("Weapon Reload | Foundry VTT Module");
	new ModuleManager(id).init();
});
Hooks.once("ready", async () => {
	await rollDownSettings();
	listenForSystemChanges();
});
//#endregion

//# sourceMappingURL=module.mjs.map