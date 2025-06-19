/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./module.json":
/*!*********************!*\
  !*** ./module.json ***!
  \*********************/
/***/ ((module) => {

module.exports = /*#__PURE__*/JSON.parse('{"id":"fvtt-weapon-reload","title":"Weapon Reload","version":"0.0.1","compatibility":{"minimum":"13","verified":"13"},"authors":[{"name":"Andrew Page","email":"andrew.page32@gmail.com","discord":"andyp22#1298"}],"relationships":{"systems":[{"id":"dnd5e","type":"system","compatibility":{"minimum":"5","verified":"5"}}]},"conflicts":[],"esmodules":["build/index.mjs"],"scripts":[],"styles":["build/styles/module.css"],"languages":[{"lang":"en","name":"English","path":"languages/en.json"}],"packs":[{"name":"journal-pack","label":"Journal Pack","path":"packs/journal-pack","type":"JournalEntry","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}},{"name":"actor-pack","label":"Actor Pack","path":"packs/actor-pack","type":"Actor","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}},{"name":"item-pack","label":"Item Pack","path":"packs/item-pack","type":"Item","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{"dnd5e":{"sorting":"m","sourceBooks":{"EbW":"EWEAPON_RELOAD.Title"},"types":["item"]}}},{"name":"macro-pack","label":"Macro Pack","path":"packs/macro-pack","type":"Macro","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}},{"name":"rollable-table-pack","label":"Rollable Table Pack","path":"packs/rollable-table-pack","type":"RollTable","ownership":{"PLAYER":"OBSERVER","ASSISTANT":"OWNER"},"system":"dnd5e","flags":{}}],"packFolders":[{"name":"Weapon Reload","sorting":"a","color":"#8b5e3c","ownership":{"PLAYER":"NONE"},"packs":["journal-pack","actor-pack","item-pack","macro-pack","rollable-table-pack"]}]}');

/***/ }),

/***/ "./src/module/features/BaseFeature.ts":
/*!********************************************!*\
  !*** ./src/module/features/BaseFeature.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ BaseFeature)
/* harmony export */ });
class BaseFeature {
    _featureManager;
    _actorId;
    _weaponId;
    constructor(featureManager) {
        this._featureManager = featureManager;
        this._actorId = '';
        this._weaponId = '';
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
        const reloadableWeapon = this.weapon;
        const maxShots = parseInt(reloadableWeapon.system.uses.max);
        const currentLoadout = reloadableWeapon.getFlag(this.moduleManager.id, 'chambered') || new Array(maxShots).fill('Empty');
        if (currentLoadout.length < maxShots) {
            const missing = maxShots - currentLoadout.length;
            for (let i = 0; i < missing; i++) {
                currentLoadout.push('Empty');
            }
        }
        return currentLoadout;
    }
    get fired() {
        const reloadableWeapon = this.weapon;
        const maxShots = parseInt(reloadableWeapon.system.uses.max);
        const fired = reloadableWeapon.getFlag(this.moduleManager.id, 'fired') || new Array(maxShots).fill('Empty');
        if (fired.length < maxShots) {
            const missing = maxShots - fired.length;
            for (let i = 0; i < missing; i++) {
                fired.push('Empty');
            }
        }
        return fired;
    }
    ammunition(items, equipped = false) {
        return items.filter((item) => {
            const gameSystem = item.system;
            if (equipped) {
                return (item.type == 'consumable' &&
                    gameSystem.type.subtype == 'firearmBullet' &&
                    gameSystem.equipped);
            }
            return (item.type == 'consumable' &&
                gameSystem.type.subtype == 'firearmBullet');
        });
    }
    init() { }
    translate(key, opts, format) {
        return this.moduleManager.uiManager.getLocalizedTxt(key, opts, format);
    }
    toString() {
        return 'class BaseFeature';
    }
}


/***/ }),

/***/ "./src/module/features/NextRoundFeature.ts":
/*!*************************************************!*\
  !*** ./src/module/features/NextRoundFeature.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NextRoundFeature: () => (/* binding */ NextRoundFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class NextRoundFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
    constructor(featureManager) {
        super(featureManager);
    }
    init() {
        Hooks.on('dnd5e.preUseActivity', this.onUseActivity.bind(this));
    }
    onUseActivity(activity) {
        if (activity.type === 'utility' && activity.name == 'Next Round') {
            console.log('Weapon Reload | Triggered Next Round');
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
        const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs', {
            item: {
                img: 'modules/fvtt-weapon-reload/assets/icons/bullets_bw_icon.png',
                name: nextRound,
            },
            description: this.translate('WEAPON_RELOAD.Features.NextRound.Description', { bullet: nextRound, weapon: this.weapon.name }, true),
            title: this.translate('WEAPON_RELOAD.Features.NextRound.Title'),
        });
        this.moduleManager.uiManager.sendChat(actor, htmlTemplate, undefined, undefined, [actor.id], CONST.CHAT_MESSAGE_TYPES.WHISPER);
    }
    toString() {
        return 'class NextRoundFeature';
    }
}


/***/ }),

/***/ "./src/module/features/ReloadFeature.ts":
/*!**********************************************!*\
  !*** ./src/module/features/ReloadFeature.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReloadFeature: () => (/* binding */ ReloadFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class ReloadFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
    _hookId;
    _handleChoiceDialogClose;
    constructor(featureManager) {
        super(featureManager);
        this._hookId = -1;
        this._handleChoiceDialogClose = false;
    }
    init() {
        Hooks.on('dnd5e.preUseActivity', this.onUseActivity.bind(this));
    }
    onUseActivity(activity) {
        if (activity.type === 'utility' && activity.name == 'Reload') {
            console.log('Weapon Reload | Triggered Reload');
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
        const inventoryAmmunition = this.ammunition(items);
        let ammunitionChoices = [];
        if (refundAmmo) {
            ammunitionChoices = this.refundChamberedAmmo(inventoryAmmunition);
        }
        else {
            ammunitionChoices = inventoryAmmunition.map((ammo) => {
                return {
                    name: ammo.name,
                    value: ammo.name,
                    count: ammo.system.quantity,
                    equipped: ammo.system.equipped,
                };
            });
        }
        const checkEquipped = game.settings.get(this.moduleManager.id, 'filterAmmunitionByEquipped');
        this.chooseAmmunition(ammunitionChoices.filter((ammoItem) => {
            if (ammoItem.count > 0) {
                if ((checkEquipped && ammoItem.equipped) ||
                    !checkEquipped) {
                    return true;
                }
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
                equipped: ammo.system.equipped,
            };
            if (loadoutCounts[name]) {
                ammoInfo.count = ammo.system.quantity + loadoutCounts[name];
                ammo.update({
                    'system.quantity': ammoInfo.count,
                });
            }
            availableAmmunition.push(ammoInfo);
        });
        return availableAmmunition;
    }
    async chooseAmmunition(ammoOptions, currentLoadout) {
        const dialogContent = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs', {
            loadoutSlots: new Array(parseInt(this.weapon.system.uses.max)).fill('Empty'),
            ammoOptions,
        });
        const dialogButtons = [
            {
                action: 'load',
                label: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtLoad'),
                callback: (_event, button) => {
                    this._handleChoiceDialogClose = false;
                    const loadout = [];
                    for (let i = 0; i < button.form?.elements?.length; i++) {
                        const elm = button.form?.elements.item(i);
                        if (elm?.name == 'ammo-select') {
                            loadout.push(elm.value);
                        }
                    }
                    return { loadout, reloadCanceled: false };
                },
            },
            {
                action: 'cancel',
                label: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogButtonTxtCancel'),
                callback: () => {
                    this._handleChoiceDialogClose = false;
                    return { loadout: currentLoadout, reloadCanceled: true };
                },
            },
        ];
        this._handleChoiceDialogClose = true;
        this._hookId = Hooks.on('closeDialogV2', (dialogV2) => {
            if (dialogV2.id === 'ammo-choice-dialog') {
                this.onCloseChoiceDialog(currentLoadout);
            }
        });
        this.moduleManager.uiManager
            .buildDialog({
            title: this.translate('WEAPON_RELOAD.Features.Reload.Ammunition.ChoiceDialogTitle'),
            content: dialogContent,
            buttons: dialogButtons,
            onSubmit: ({ loadout, reloadCanceled, }) => {
                return this.reloadReloadableWeapon(loadout, reloadCanceled);
            },
        }, 'ammo-choice-dialog')
            .render({ force: true });
    }
    onCloseChoiceDialog(loadout) {
        Hooks.off('closeDialogV2', this._hookId);
        this._hookId = -1;
        if (this._handleChoiceDialogClose) {
            this._handleChoiceDialogClose = false;
            this.reloadReloadableWeapon(loadout, true);
        }
    }
    async reloadReloadableWeapon(loadout, reloadCanceled = false) {
        const reloadableWeapon = this.weapon;
        const ammoCounts = this.getLoadoutCounts(loadout);
        if (this.removeLoadout(ammoCounts)) {
            let qty = 0;
            if (ammoCounts['Empty'] > 0) {
                qty += ammoCounts['Empty'];
            }
            await reloadableWeapon.update({
                'system.uses.spent': qty,
                'system.uses.value': parseInt(reloadableWeapon.system.uses.max) - qty,
            });
            await reloadableWeapon.setFlag(this.moduleManager.id, 'chambered', loadout);
            await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', new Array(parseInt(this.weapon.system.uses.max)).fill('Empty'));
            const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/reloadableWeaponReloadTemplate.hbs', {
                item: {
                    img: reloadableWeapon.img,
                    name: reloadableWeapon.name,
                },
                flavor: this.translate(reloadCanceled
                    ? 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavorCanceled'
                    : 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatFlavor'),
                title: this.translate(reloadCanceled
                    ? 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsgCanceled'
                    : 'WEAPON_RELOAD.Features.Reload.Weapon.WeaponReloadedChatMsg', { reloadableWeapon: reloadableWeapon.name }, true),
                loadout: loadout,
            });
            this.moduleManager.uiManager.sendChat(this.character, htmlTemplate);
            this.characterId = '';
            this.weaponId = '';
        }
        else {
            await this.weaponReload(false);
        }
        return;
    }
    removeLoadout(counts) {
        let ammunitionAvailable = true;
        const inventoryAmmunition = this.ammunition(this.character?.items);
        inventoryAmmunition.forEach((ammo) => {
            const name = ammo.name;
            const qty = ammo.system.quantity - counts[name];
            if (qty < 0) {
                this.moduleManager.uiManager.uiNotification(this.translate('WEAPON_RELOAD.Features.Reload.Weapon.LoadingErrorMsg', { name: ammo.name }, true), 'error');
                ammunitionAvailable = false;
            }
        });
        if (ammunitionAvailable) {
            inventoryAmmunition.forEach(async (ammo) => {
                const name = ammo.name;
                if (counts[name]) {
                    await ammo.update({
                        'system.quantity': ammo.system.quantity - counts[name],
                    });
                }
            });
        }
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
            if (!loadout[ammo])
                loadout[ammo] = 0;
            loadout[ammo] = loadout[ammo] + 1;
        });
        return loadout;
    }
    toString() {
        return 'class ReloadFeature';
    }
}


/***/ }),

/***/ "./src/module/features/ReloadableWeaponAttackFeature.ts":
/*!**************************************************************!*\
  !*** ./src/module/features/ReloadableWeaponAttackFeature.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReloadableWeaponAttackFeature: () => (/* binding */ ReloadableWeaponAttackFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class ReloadableWeaponAttackFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
    _nextRound;
    _hookId;
    constructor(featureManager) {
        super(featureManager);
        this._nextRound = { id: '', type: '' };
        this._hookId = -1;
    }
    init() {
        Hooks.on('dnd5e.postRollConfiguration', this.onUseActivity.bind(this));
    }
    onUseActivity(d20Roll, event) {
        const roll = d20Roll[0];
        const weaponData = roll?.data?.item;
        if (weaponData?.type?.baseItem !== 'reloadableWeapon')
            return;
        console.log('Weapon Reload | Triggered Attack');
        this.weaponId = event.subject.item.id;
        this.characterId = event.subject.actor.id;
        return this.reloadableWeaponAttack();
    }
    reloadableWeaponAttack() {
        const bullet = this.getNextRound();
        if (bullet.name == 'Empty') {
            this.dryfireWeapon();
            if (this.weapon.system.uses.spent ==
                parseInt(this.weapon.system.uses.max)) {
                return false;
            }
        }
        if (bullet.name !== 'Empty') {
            this._nextRound = {
                id: bullet.id,
                type: bullet.type,
            };
            this._hookId = Hooks.on('dnd5e.renderChatMessage', this.onRenderChatMessage.bind(this));
        }
        return this.fireRound(bullet);
    }
    async onRenderChatMessage(message, html) {
        const itemId = message.flags.dnd5e?.item.id;
        const itemType = message.flags.dnd5e?.item.type;
        if (this._nextRound.id === itemId &&
            this._nextRound.type === itemType) {
            Hooks.off('dnd5e.renderChatMessage', this._hookId);
            this._nextRound = { id: '', type: '' };
            const bullet = this.character.items.get(itemId);
            const activationCard = html.querySelector('.activation-card');
            const itemcard = html.querySelector('.item-card');
            const parentElement = activationCard || itemcard;
            const checkUnstableAmmo = game.settings.get(this.moduleManager.id, 'unstableAmmo');
            const checkMisfire = game.settings.get(this.moduleManager.id, 'useMisfires');
            const unstableAmmoFailureThreshold = game.settings.get(this.moduleManager.id, 'unstableAmmoFailureThreshhold');
            if (checkMisfire) {
                const criticalFailureMsg = checkUnstableAmmo &&
                    bullet?.system.properties.find((prop) => {
                        return prop === 'unstable';
                    })
                    ? this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireUnstable', { failure: `${unstableAmmoFailureThreshold}` }, true)
                    : this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfireNatOne');
                const cardContentElement = parentElement?.querySelector('.card-content');
                const wrapperElement = cardContentElement?.querySelector('.wrapper');
                wrapperElement?.insertAdjacentHTML('beforeend', `<p>${criticalFailureMsg}</p>`);
            }
            if (itemcard && !activationCard) {
                const referenceElement = parentElement?.querySelector('.card-header');
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'card-buttons';
                referenceElement?.after(buttonContainer);
            }
            const cardButtonsElement = parentElement?.querySelector('.card-buttons');
            if (checkMisfire) {
                const misfireBtn = document.createElement('button');
                misfireBtn.onclick = this.onClickMisfire.bind(this);
                misfireBtn.innerHTML = `${this.makeIcon('fa-burst')}${this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.MisfiredBtnTxt')}`;
                cardButtonsElement?.append(misfireBtn);
            }
            const refundBtn = document.createElement('button');
            refundBtn.onclick = this.onClickRefund.bind(this);
            refundBtn.innerHTML = `${this.makeIcon('fa-undo')}${this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.RefundBtnTxt')}`;
            cardButtonsElement?.append(refundBtn);
        }
    }
    getNextRound() {
        const character = this.character;
        const weapon = this.weapon;
        const loadout = this.loadout;
        loadout.push('Empty');
        const nextRound = loadout.shift();
        weapon.setFlag(this.moduleManager.id, 'chambered', loadout);
        const inventoryAmmunition = this.ammunition(character.items);
        return (inventoryAmmunition.find((ammo) => {
            const name = ammo.name;
            if (name == nextRound) {
                return ammo;
            }
            return null;
        }) || { name: 'Empty' });
    }
    dryfireWeapon() {
        const character = this.character;
        const weapon = this.weapon;
        const renderHookId = Hooks.on('renderChatMessage', (_chatItem, html) => {
            const reloadBtn = html[0].querySelector('.reload-ammo');
            reloadBtn?.addEventListener('click', () => {
                this.reload(character, weapon);
            });
            if (reloadBtn) {
                Hooks.off('renderChatMessage', renderHookId);
            }
        });
        const templateData = {
            description: {
                chat: `<p>${this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.DryFireDescription', { name: character.name, reloadableWeapon: weapon.name }, true)}</p>`,
            },
            item: {
                img: weapon.img,
                name: this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.DryFireTitle'),
            },
            subtitle: weapon.name,
            buttons: [
                {
                    dataset: {
                        visibility: 'all',
                    },
                    icon: this.makeIcon('fa-rotate-right'),
                    label: this.translate('WEAPON_RELOAD.Features.Reload.Text'),
                    classes: 'reload-ammo',
                },
            ],
        };
        this.renderCard(templateData, character);
    }
    async renderCard(templateData, character) {
        const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/activity-card.hbs', templateData);
        this.moduleManager.uiManager.sendChat(character, htmlTemplate);
    }
    fireRound(bullet) {
        const reloadableWeapon = this.weapon;
        const maxShots = parseInt(reloadableWeapon.system.uses.max);
        const firedLoadout = reloadableWeapon.getFlag(this.moduleManager.id, 'fired') || new Array(maxShots).fill('Empty');
        firedLoadout.unshift(bullet.name);
        firedLoadout.splice(-1);
        reloadableWeapon.setFlag(this.moduleManager.id, 'fired', firedLoadout);
        const uses = reloadableWeapon.system.uses;
        const qty = uses.spent + 1 <= parseInt(uses.max)
            ? uses.spent + 1
            : parseInt(uses.max);
        reloadableWeapon.update({
            'system.uses.spent': qty,
            'system.uses.value': parseInt(uses.max) - qty,
        });
        if (bullet.name !== 'Empty') {
            bullet.use();
        }
        return true;
    }
    reload(actor, reloadableWeapon) {
        this.featureManager
            .getFeature('reload')
            .onReloadCallback(actor, reloadableWeapon);
    }
    async onClickRefund() {
        const actor = this.character;
        const reloadableWeapon = this.weapon;
        const inventoryAmmunition = this.ammunition(actor.items);
        const fired = this.fired;
        const refund = fired.splice(0, 1)[0];
        fired.push('Empty');
        if (refund == 'Empty') {
            this.moduleManager.uiManager.uiNotification(this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundNoMoreMsg', {
                name: actor.name,
                reloadableWeapon: reloadableWeapon.name,
            }, true), 'warn');
            return;
        }
        await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', fired);
        let bullet = { name: refund };
        inventoryAmmunition.forEach((ammo) => {
            const name = ammo.name;
            if (name == refund) {
                bullet = ammo;
            }
        });
        const ammoLoadout = this.loadout;
        ammoLoadout.unshift(refund);
        ammoLoadout.splice(-1);
        await reloadableWeapon.setFlag(this.moduleManager.id, 'chambered', ammoLoadout);
        const uses = reloadableWeapon.system.uses;
        const qty = uses.spent - 1 >= 0 ? uses.spent - 1 : 0;
        reloadableWeapon.update({
            'system.uses.spent': qty,
            'system.uses.value': parseInt(uses.max) - qty,
        });
        const htmlTemplate = await foundry.applications.handlebars.renderTemplate('modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs', {
            item: {
                img: bullet.img,
                name: bullet.name,
            },
            description: this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundCompleteMsg', { bullet: refund, name: reloadableWeapon.name }, true),
            title: this.translate('WEAPON_RELOAD.Features.ReloadableWeaponAttack.Refund.RefundCompleteTitle'),
        });
        this.moduleManager.uiManager.sendChat(actor, htmlTemplate);
    }
    async onClickMisfire() {
        const actor = this.character;
        const roll = await new Roll('1d6').roll();
        await roll.toMessage({
            speaker: {
                alias: actor.name,
            },
        });
    }
    makeIcon(icon) {
        return `<i class="fas ${icon}"></i>`;
    }
    toString() {
        return 'class ReloadableWeaponAttackFeature';
    }
}


/***/ }),

/***/ "./src/module/features/ReloadableWeaponCreationFeature.ts":
/*!****************************************************************!*\
  !*** ./src/module/features/ReloadableWeaponCreationFeature.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReloadableWeaponCreationFeature: () => (/* binding */ ReloadableWeaponCreationFeature)
/* harmony export */ });
/* harmony import */ var _BaseFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseFeature */ "./src/module/features/BaseFeature.ts");

class ReloadableWeaponCreationFeature extends _BaseFeature__WEBPACK_IMPORTED_MODULE_0__["default"] {
    _creatingReloadableWeapon;
    _createItemHookId;
    constructor(featureManager) {
        super(featureManager);
        this._creatingReloadableWeapon = false;
        this._createItemHookId = -1;
    }
    init() {
        Hooks.on('preCreateItem', this.onPreCreateItem.bind(this));
    }
    async onPreCreateItem(item) {
        if (item.system.type.baseItem == 'reloadableWeapon') {
            console.log('Weapon Reload | Triggered Pre-Creation');
            this.weaponId = item.id;
            this.characterId = item.actor?.id;
            this._creatingReloadableWeapon = true;
            this._createItemHookId = Hooks.on('createItem', this.onCreateItem.bind(this));
        }
    }
    async onCreateItem(item) {
        if (!this._creatingReloadableWeapon || item.id !== this.weaponId)
            return;
        console.log('Weapon Reload | Triggered ReloadableWeapon Creation');
        const reloadableWeapon = this.weapon;
        const ammoQty = parseInt(reloadableWeapon.system.uses.max);
        await reloadableWeapon.update({
            'system.uses.spent': ammoQty,
            'system.uses.value': 0,
        });
        await reloadableWeapon.setFlag(this.moduleManager.id, 'chambered', new Array(ammoQty).fill('Empty'));
        await reloadableWeapon.setFlag(this.moduleManager.id, 'fired', new Array(ammoQty).fill('Empty'));
        this.weaponId = '';
        this.characterId = '';
        this._creatingReloadableWeapon = false;
        Hooks.off('createItem', this._createItemHookId);
        this._createItemHookId = -1;
    }
    toString() {
        return 'class ReloadableWeaponCreationFeature';
    }
}


/***/ }),

/***/ "./src/module/features/index.ts":
/*!**************************************!*\
  !*** ./src/module/features/index.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NextRoundFeature: () => (/* reexport safe */ _NextRoundFeature__WEBPACK_IMPORTED_MODULE_0__.NextRoundFeature),
/* harmony export */   ReloadFeature: () => (/* reexport safe */ _ReloadFeature__WEBPACK_IMPORTED_MODULE_3__.ReloadFeature),
/* harmony export */   ReloadableWeaponAttackFeature: () => (/* reexport safe */ _ReloadableWeaponAttackFeature__WEBPACK_IMPORTED_MODULE_1__.ReloadableWeaponAttackFeature),
/* harmony export */   ReloadableWeaponCreationFeature: () => (/* reexport safe */ _ReloadableWeaponCreationFeature__WEBPACK_IMPORTED_MODULE_2__.ReloadableWeaponCreationFeature)
/* harmony export */ });
/* harmony import */ var _NextRoundFeature__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./NextRoundFeature */ "./src/module/features/NextRoundFeature.ts");
/* harmony import */ var _ReloadableWeaponAttackFeature__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ReloadableWeaponAttackFeature */ "./src/module/features/ReloadableWeaponAttackFeature.ts");
/* harmony import */ var _ReloadableWeaponCreationFeature__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ReloadableWeaponCreationFeature */ "./src/module/features/ReloadableWeaponCreationFeature.ts");
/* harmony import */ var _ReloadFeature__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ReloadFeature */ "./src/module/features/ReloadFeature.ts");






/***/ }),

/***/ "./src/module/managers/FeatureManager.ts":
/*!***********************************************!*\
  !*** ./src/module/managers/FeatureManager.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FeatureManager)
/* harmony export */ });
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../features */ "./src/module/features/index.ts");

class FeatureManager {
    _moduleManager;
    _features;
    constructor(moduleManager) {
        this._moduleManager = moduleManager;
        this._features = {};
    }
    init() {
        this._features = {
            nextRound: new _features__WEBPACK_IMPORTED_MODULE_0__.NextRoundFeature(this),
            reload: new _features__WEBPACK_IMPORTED_MODULE_0__.ReloadFeature(this),
            reloadableWeaponAttack: new _features__WEBPACK_IMPORTED_MODULE_0__.ReloadableWeaponAttackFeature(this),
            reloadableWeaponCreation: new _features__WEBPACK_IMPORTED_MODULE_0__.ReloadableWeaponCreationFeature(this),
        };
    }
    getFeature(id) {
        if (this._features[id]) {
            return this._features[id];
        }
        return null;
    }
    get moduleManager() {
        return this._moduleManager;
    }
    toString() {
        return `class FeatureManager: ${this._features.length}`;
    }
}


/***/ }),

/***/ "./src/module/managers/ModuleManager.ts":
/*!**********************************************!*\
  !*** ./src/module/managers/ModuleManager.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ModuleManager)
/* harmony export */ });
/* harmony import */ var _FeatureManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./FeatureManager */ "./src/module/managers/FeatureManager.ts");
/* harmony import */ var _UiManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UiManager */ "./src/module/managers/UiManager.ts");
/* harmony import */ var _TemplateManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TemplateManager */ "./src/module/managers/TemplateManager.ts");



class ModuleManager {
    _moduleId;
    _featureManager;
    _uiManager;
    _templateManager;
    constructor(id) {
        this._moduleId = id;
        this._featureManager = new _FeatureManager__WEBPACK_IMPORTED_MODULE_0__["default"](this);
        this._uiManager = new _UiManager__WEBPACK_IMPORTED_MODULE_1__["default"](this);
        this._templateManager = new _TemplateManager__WEBPACK_IMPORTED_MODULE_2__["default"]();
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
        this._uiManager.init();
        this._templateManager.init();
    }
    systemOverrides() {
        CONFIG.DND5E.featureTypes.item = {
            label: this.uiManager.getLocalizedTxt('WEAPON_RELOAD.ItemFeature'),
        };
        CONFIG.DND5E.itemProperties.concealable = {
            label: this.uiManager.getLocalizedTxt('WEAPON_RELOAD.Concealable'),
        };
        CONFIG.DND5E.validProperties.weapon.add('concealable');
        CONFIG.DND5E.itemProperties.unstable = {
            label: this.uiManager.getLocalizedTxt('WEAPON_RELOAD.Unstable'),
            isPhysical: true,
        };
        CONFIG.DND5E.weaponIds.reloadableWeapon =
            'Compendium.fvtt-weapon-reload.item-pack.Item.lE60QaS1sctb3OAd';
    }
    moduleConfigurations() {
        const moduleName = 'fvtt-weapon-reload';
        game.settings.register(moduleName, 'unstableAmmo', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.UnstableAmmo.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.UnstableAmmo.Hint',
            type: Boolean,
            config: true,
            default: true,
        });
        game.settings.register(moduleName, 'unstableAmmoFailureThreshhold', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.UnstableAmmoFailureThreshold.Hint',
            type: Number,
            config: true,
            default: 2,
        });
        game.settings.register(moduleName, 'useMisfires', {
            scope: 'world',
            name: 'SETTINGS.WEAPON_RELOAD.UseMisfires.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.UseMisfires.Hint',
            type: Boolean,
            config: true,
            default: true,
        });
        game.settings.register(moduleName, 'filterAmmunitionByEquipped', {
            scope: 'user',
            name: 'SETTINGS.WEAPON_RELOAD.FilterAmmunitionByEquipped.Name',
            hint: 'SETTINGS.WEAPON_RELOAD.FilterAmmunitionByEquipped.Hint',
            type: Boolean,
            config: true,
            default: false,
        });
    }
    debug(hooks = false) {
        CONFIG.debug.hooks = hooks;
        console.log('CONFIG: ', CONFIG);
        console.log('CONFIG.DND5E: ', CONFIG.DND5E);
    }
    toString() {
        return 'class ModuleManager';
    }
}


/***/ }),

/***/ "./src/module/managers/TemplateManager.ts":
/*!************************************************!*\
  !*** ./src/module/managers/TemplateManager.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TemplateManager)
/* harmony export */ });
class TemplateManager {
    constructor() { }
    init() {
        foundry.applications.handlebars.loadTemplates(TemplateManager.paths);
    }
    static get paths() {
        const paths = {};
        const templatePaths = 'modules/fvtt-weapon-reload/templates/reloadableWeaponReloadTemplate.hbs,modules/fvtt-weapon-reload/templates/basicMessage.hbs,modules/fvtt-weapon-reload/templates/ammoSelectionDialogTemplate.hbs,modules/fvtt-weapon-reload/templates/ammoRefundNoticeTemplate.hbs,modules/fvtt-weapon-reload/templates/activity-card.hbs'.split(',');
        for (const path of templatePaths) {
            paths[path.replace('.hbs', '.html')] = path;
        }
        return paths;
    }
    static onHotReload() {
        for (const template in _templateCache) {
            if (Object.prototype.hasOwnProperty.call(_templateCache, template)) {
                delete _templateCache[template];
            }
        }
        foundry.applications.handlebars
            .loadTemplates(this.paths)
            .then(() => {
            for (const application in ui.windows) {
                if (Object.prototype.hasOwnProperty.call(ui.windows, application)) {
                    ui.windows[application].render(true);
                }
            }
        });
    }
    toString() {
        return 'class TemplateManager';
    }
}


/***/ }),

/***/ "./src/module/managers/UiManager.ts":
/*!******************************************!*\
  !*** ./src/module/managers/UiManager.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ UiManager)
/* harmony export */ });
class UiManager {
    _moduleManager;
    constructor(moduleManager) {
        this._moduleManager = moduleManager;
    }
    init() {
    }
    get moduleManager() {
        return this._moduleManager;
    }
    buildDialog(options, id) {
        return new foundry.applications.api.DialogV2({
            window: {
                title: options.title,
                contentClasses: options.contentClasses || [],
            },
            content: options.content,
            buttons: options.buttons,
            submit: options.onSubmit,
            id: id,
        });
    }
    uiNotification(msg, type = 'info') {
        if (ui.notifications) {
            switch (type) {
                case 'error':
                    ui.notifications.error(msg);
                    break;
                case 'warn':
                    ui.notifications.warn(msg);
                    break;
                case 'info':
                default:
                    ui.notifications.info(msg);
            }
        }
    }
    sendChat(speaker, content, flavor, sound, whisper = [], type = CONST.CHAT_MESSAGE_TYPES.OTHER) {
        const ChatData = {
            speaker: ChatMessage.getSpeaker({ actor: speaker }),
            type,
            flavor,
            sound,
            content,
            whisper,
        };
        ChatMessage.create(ChatData);
    }
    getLocalizedTxt(key, opts, format = false) {
        if (format) {
            return game.i18n.format(key, opts);
        }
        return game.i18n.localize(key, opts);
    }
    toString() {
        return 'class UiManager';
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _module_managers_ModuleManager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./module/managers/ModuleManager */ "./src/module/managers/ModuleManager.ts");
/* harmony import */ var _module_managers_TemplateManager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./module/managers/TemplateManager */ "./src/module/managers/TemplateManager.ts");
/* harmony import */ var _module_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../module.json */ "./module.json");



Hooks.once('init', async () => {
    console.log('Weapon Reload | Foundry VTT Module');
    const weapon_reload = new _module_managers_ModuleManager__WEBPACK_IMPORTED_MODULE_0__["default"](_module_json__WEBPACK_IMPORTED_MODULE_2__.id);
    weapon_reload.init();
});
if (true) {
    if (false) // removed by dead control flow
{}
}

})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!********************************!*\
  !*** ./src/styles/module.scss ***!
  \********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + "styles/module.css");
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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YXNlRmVhdHVyZS50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL2ZlYXR1cmVzL05leHRSb3VuZEZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRGZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9mZWF0dXJlcy9SZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlLnRzIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9tb2R1bGUvZmVhdHVyZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlci50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkLy4vc3JjL21vZHVsZS9tYW5hZ2Vycy9VaU1hbmFnZXIudHMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZnZ0dC13ZWFwb24tcmVsb2FkL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2Z2dHQtd2VhcG9uLXJlbG9hZC8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly9mdnR0LXdlYXBvbi1yZWxvYWQvLi9zcmMvc3R5bGVzL21vZHVsZS5zY3NzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5cbmltcG9ydCB7IERuZEFjdG9yNWUsIERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VGZWF0dXJlIHtcbiAgICBwcml2YXRlIF9mZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfYWN0b3JJZDogc3RyaW5nO1xuICAgIHByaXZhdGUgX3dlYXBvbklkOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIgPSBmZWF0dXJlTWFuYWdlcjtcbiAgICAgICAgdGhpcy5fYWN0b3JJZCA9ICcnO1xuICAgICAgICB0aGlzLl93ZWFwb25JZCA9ICcnO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICBnZXQgZmVhdHVyZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZlYXR1cmVNYW5hZ2VyLm1vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcigpOiBEbmRBY3RvcjVlIHtcbiAgICAgICAgcmV0dXJuIGdhbWU/LmFjdG9ycz8uZ2V0KHRoaXMuX2FjdG9ySWQpIGFzIERuZEFjdG9yNWU7XG4gICAgfVxuXG4gICAgZ2V0IGNoYXJhY3RlcklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0b3JJZDtcbiAgICB9XG5cbiAgICBzZXQgY2hhcmFjdGVySWQoaWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9hY3RvcklkID0gaWQ7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbigpOiBEbmRJdGVtNWUge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFyYWN0ZXIuaXRlbXMuZ2V0KHRoaXMuX3dlYXBvbklkKSBhcyBEbmRJdGVtNWU7XG4gICAgfVxuXG4gICAgZ2V0IHdlYXBvbklkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fd2VhcG9uSWQ7XG4gICAgfVxuXG4gICAgc2V0IHdlYXBvbklkKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fd2VhcG9uSWQgPSBpZDtcbiAgICB9XG5cbiAgICBnZXQgbG9hZG91dCgpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KTtcbiAgICAgICAgY29uc3QgY3VycmVudExvYWRvdXQgPVxuICAgICAgICAgICAgKHJlbG9hZGFibGVXZWFwb24uZ2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2NoYW1iZXJlZCdcbiAgICAgICAgICAgICkgYXMgc3RyaW5nW10pIHx8IG5ldyBBcnJheShtYXhTaG90cykuZmlsbCgnRW1wdHknKTtcblxuICAgICAgICBpZiAoY3VycmVudExvYWRvdXQubGVuZ3RoIDwgbWF4U2hvdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmcgPSBtYXhTaG90cyAtIGN1cnJlbnRMb2Fkb3V0Lmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWlzc2luZzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudExvYWRvdXQucHVzaCgnRW1wdHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJyZW50TG9hZG91dDtcbiAgICB9XG5cbiAgICBnZXQgZmlyZWQoKSB7XG4gICAgICAgIGNvbnN0IHJlbG9hZGFibGVXZWFwb24gPSB0aGlzLndlYXBvbjtcbiAgICAgICAgY29uc3QgbWF4U2hvdHMgPSBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCk7XG4gICAgICAgIGNvbnN0IGZpcmVkID1cbiAgICAgICAgICAgIChyZWxvYWRhYmxlV2VhcG9uLmdldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdmaXJlZCdcbiAgICAgICAgICAgICkgYXMgc3RyaW5nW10pIHx8IG5ldyBBcnJheShtYXhTaG90cykuZmlsbCgnRW1wdHknKTtcblxuICAgICAgICBpZiAoZmlyZWQubGVuZ3RoIDwgbWF4U2hvdHMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1pc3NpbmcgPSBtYXhTaG90cyAtIGZpcmVkLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWlzc2luZzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZmlyZWQucHVzaCgnRW1wdHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaXJlZDtcbiAgICB9XG5cbiAgICBhbW11bml0aW9uKGl0ZW1zOiBDb2xsZWN0aW9uPEl0ZW01ZT4sIGVxdWlwcGVkOiBib29sZWFuID0gZmFsc2UpOiBJdGVtNWVbXSB7XG4gICAgICAgIHJldHVybiBpdGVtcy5maWx0ZXIoKGl0ZW06IEl0ZW01ZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ2FtZVN5c3RlbSA9IChpdGVtIGFzIERuZEl0ZW01ZSkuc3lzdGVtO1xuICAgICAgICAgICAgaWYgKGVxdWlwcGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50eXBlID09ICdjb25zdW1hYmxlJyAmJlxuICAgICAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLnR5cGUuc3VidHlwZSA9PSAnZmlyZWFybUJ1bGxldCcgJiZcbiAgICAgICAgICAgICAgICAgICAgZ2FtZVN5c3RlbS5lcXVpcHBlZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9PSAnY29uc3VtYWJsZScgJiZcbiAgICAgICAgICAgICAgICBnYW1lU3lzdGVtLnR5cGUuc3VidHlwZSA9PSAnZmlyZWFybUJ1bGxldCdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXQoKSB7fVxuXG4gICAgdHJhbnNsYXRlKGtleTogc3RyaW5nLCBvcHRzPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfSwgZm9ybWF0PzogYm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5nZXRMb2NhbGl6ZWRUeHQoa2V5LCBvcHRzLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIEJhc2VGZWF0dXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi4vbWFuYWdlcnMvRmVhdHVyZU1hbmFnZXInO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5leHBvcnQgY2xhc3MgTmV4dFJvdW5kRmVhdHVyZSBleHRlbmRzIEJhc2VGZWF0dXJlIHtcbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdkbmQ1ZS5wcmVVc2VBY3Rpdml0eScsIHRoaXMub25Vc2VBY3Rpdml0eS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBvblVzZUFjdGl2aXR5KGFjdGl2aXR5OiBhbnkpIHtcbiAgICAgICAgaWYgKGFjdGl2aXR5LnR5cGUgPT09ICd1dGlsaXR5JyAmJiBhY3Rpdml0eS5uYW1lID09ICdOZXh0IFJvdW5kJykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBUcmlnZ2VyZWQgTmV4dCBSb3VuZCcpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gYWN0aXZpdHkuYWN0b3IuaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gYWN0aXZpdHkuaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMubmV4dFJvdW5kKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYXN5bmMgbmV4dFJvdW5kKCkge1xuICAgICAgICBjb25zdCBuZXh0Um91bmQgPSB0aGlzLmxvYWRvdXRbMF07XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG5cbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHdoYXQgdGhlIG5leHQgcm91bmQgaXNcbiAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55XG4gICAgICAgICkuaGFuZGxlYmFycy5yZW5kZXJUZW1wbGF0ZShcbiAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvYW1tb1JlZnVuZE5vdGljZVRlbXBsYXRlLmhicycsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgICAgICBpbWc6ICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC9hc3NldHMvaWNvbnMvYnVsbGV0c19id19pY29uLnBuZycsXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IG5leHRSb3VuZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuTmV4dFJvdW5kLkRlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgeyBidWxsZXQ6IG5leHRSb3VuZCwgd2VhcG9uOiB0aGlzLndlYXBvbi5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLnRyYW5zbGF0ZSgnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5OZXh0Um91bmQuVGl0bGUnKSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLnVpTWFuYWdlci5zZW5kQ2hhdChcbiAgICAgICAgICAgIGFjdG9yLFxuICAgICAgICAgICAgaHRtbFRlbXBsYXRlLFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgW2FjdG9yLmlkXSxcbiAgICAgICAgICAgIENPTlNULkNIQVRfTUVTU0FHRV9UWVBFUy5XSElTUEVSXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgTmV4dFJvdW5kRmVhdHVyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IERpYWxvZ1YyIGZyb20gJ0BsZWFndWUtb2YtZm91bmRyeS1kZXZlbG9wZXJzL2ZvdW5kcnktdnR0LXR5cGVzL3NyYy9mb3VuZHJ5L2NsaWVudC1lc20vYXBwbGljYXRpb25zL2FwaS9kaWFsb2cubWpzJztcbmltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgeyBEbmRBY3RvcjVlLCBEbmRJdGVtNWUgfSBmcm9tICcuLi90eXBlcy9kbmQudHlwZXMnO1xuaW1wb3J0IEJhc2VGZWF0dXJlIGZyb20gJy4vQmFzZUZlYXR1cmUnO1xuXG5pbnRlcmZhY2UgQW1tb0l0ZW1PcHRpb24ge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICB2YWx1ZTogc3RyaW5nO1xuICAgIGNvdW50OiBudW1iZXI7XG4gICAgZXF1aXBwZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2hvb2tJZDogbnVtYmVyO1xuICAgIHByaXZhdGUgX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoZmVhdHVyZU1hbmFnZXI6IEZlYXR1cmVNYW5hZ2VyKSB7XG4gICAgICAgIHN1cGVyKGZlYXR1cmVNYW5hZ2VyKTtcbiAgICAgICAgdGhpcy5faG9va0lkID0gLTE7XG4gICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgSG9va3Mub24oJ2RuZDVlLnByZVVzZUFjdGl2aXR5JywgdGhpcy5vblVzZUFjdGl2aXR5LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uVXNlQWN0aXZpdHkoYWN0aXZpdHk6IGFueSkge1xuICAgICAgICBpZiAoYWN0aXZpdHkudHlwZSA9PT0gJ3V0aWxpdHknICYmIGFjdGl2aXR5Lm5hbWUgPT0gJ1JlbG9hZCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFJlbG9hZCcpO1xuXG4gICAgICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gYWN0aXZpdHkuYWN0b3IuaWQ7XG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gYWN0aXZpdHkuaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMud2VhcG9uUmVsb2FkKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgd2VhcG9uUmVsb2FkKHJlZnVuZEFtbW86IGJvb2xlYW4gPSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gdGhpcy5jaGFyYWN0ZXI/Lml0ZW1zO1xuICAgICAgICBjb25zdCBjdXJyZW50TG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgY29uc3QgaW52ZW50b3J5QW1tdW5pdGlvbiA9IHRoaXMuYW1tdW5pdGlvbihpdGVtcykgYXMgRG5kSXRlbTVlW107XG4gICAgICAgIGxldCBhbW11bml0aW9uQ2hvaWNlczogQW1tb0l0ZW1PcHRpb25bXSA9IFtdO1xuXG4gICAgICAgIGlmIChyZWZ1bmRBbW1vKSB7XG4gICAgICAgICAgICBhbW11bml0aW9uQ2hvaWNlcyA9IHRoaXMucmVmdW5kQ2hhbWJlcmVkQW1tbyhpbnZlbnRvcnlBbW11bml0aW9uKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFtbXVuaXRpb25DaG9pY2VzID0gaW52ZW50b3J5QW1tdW5pdGlvbi5tYXAoXG4gICAgICAgICAgICAgICAgKGFtbW86IERuZEl0ZW01ZSk6IEFtbW9JdGVtT3B0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBhbW1vLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudDogYW1tby5zeXN0ZW0ucXVhbnRpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICBlcXVpcHBlZDogYW1tby5zeXN0ZW0uZXF1aXBwZWQsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNoZWNrRXF1aXBwZWQgPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZCdcbiAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgIHRoaXMuY2hvb3NlQW1tdW5pdGlvbihcbiAgICAgICAgICAgIGFtbXVuaXRpb25DaG9pY2VzLmZpbHRlcigoYW1tb0l0ZW06IEFtbW9JdGVtT3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGFtbW9JdGVtLmNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAoY2hlY2tFcXVpcHBlZCAmJiBhbW1vSXRlbS5lcXVpcHBlZCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICFjaGVja0VxdWlwcGVkXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBjdXJyZW50TG9hZG91dFxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlZnVuZENoYW1iZXJlZEFtbW8oaW52ZW50b3J5QW1tdW5pdGlvbjogRG5kSXRlbTVlW10pOiBBbW1vSXRlbU9wdGlvbltdIHtcbiAgICAgICAgY29uc3QgbG9hZG91dENvdW50cyA9IHRoaXMuZ2V0TG9hZG91dENvdW50cyh0aGlzLmxvYWRvdXQpO1xuICAgICAgICBjb25zdCBhdmFpbGFibGVBbW11bml0aW9uOiBBbW1vSXRlbU9wdGlvbltdID0gW107XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgY29uc3QgYW1tb0luZm86IEFtbW9JdGVtT3B0aW9uID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IGFtbW8ubmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogYW1tby5uYW1lLFxuICAgICAgICAgICAgICAgIGNvdW50OiBhbW1vLnN5c3RlbS5xdWFudGl0eSxcbiAgICAgICAgICAgICAgICBlcXVpcHBlZDogYW1tby5zeXN0ZW0uZXF1aXBwZWQsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGxvYWRvdXRDb3VudHNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICBhbW1vSW5mby5jb3VudCA9IGFtbW8uc3lzdGVtLnF1YW50aXR5ICsgbG9hZG91dENvdW50c1tuYW1lXTtcbiAgICAgICAgICAgICAgICBhbW1vLnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICdzeXN0ZW0ucXVhbnRpdHknOiBhbW1vSW5mby5jb3VudCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF2YWlsYWJsZUFtbXVuaXRpb24ucHVzaChhbW1vSW5mbyk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXZhaWxhYmxlQW1tdW5pdGlvbjtcbiAgICB9XG5cbiAgICBhc3luYyBjaG9vc2VBbW11bml0aW9uKFxuICAgICAgICBhbW1vT3B0aW9uczogQW1tb0l0ZW1PcHRpb25bXSxcbiAgICAgICAgY3VycmVudExvYWRvdXQ6IHN0cmluZ1tdXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IGRpYWxvZ0NvbnRlbnQgPSBhd2FpdCAoXG4gICAgICAgICAgICBmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnlcbiAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgJ21vZHVsZXMvZnZ0dC13ZWFwb24tcmVsb2FkL3RlbXBsYXRlcy9hbW1vU2VsZWN0aW9uRGlhbG9nVGVtcGxhdGUuaGJzJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsb2Fkb3V0U2xvdHM6IG5ldyBBcnJheShcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQodGhpcy53ZWFwb24uc3lzdGVtLnVzZXMubWF4KVxuICAgICAgICAgICAgICAgICkuZmlsbCgnRW1wdHknKSxcbiAgICAgICAgICAgICAgICBhbW1vT3B0aW9ucyxcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBkaWFsb2dCdXR0b25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2xvYWQnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0TG9hZCdcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoXG4gICAgICAgICAgICAgICAgICAgIF9ldmVudDogUG9pbnRlckV2ZW50IHwgU3VibWl0RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnRcbiAgICAgICAgICAgICAgICApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hZG91dDogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPCAoYnV0dG9uLmZvcm0/LmVsZW1lbnRzPy5sZW5ndGggYXMgbnVtYmVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsbSA9IGJ1dHRvbi5mb3JtPy5lbGVtZW50cy5pdGVtKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlcbiAgICAgICAgICAgICAgICAgICAgICAgICkgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWxtPy5uYW1lID09ICdhbW1vLXNlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0LnB1c2goZWxtLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4geyBsb2Fkb3V0LCByZWxvYWRDYW5jZWxlZDogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdjYW5jZWwnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkLkFtbXVuaXRpb24uQ2hvaWNlRGlhbG9nQnV0dG9uVHh0Q2FuY2VsJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgbG9hZG91dDogY3VycmVudExvYWRvdXQsIHJlbG9hZENhbmNlbGVkOiB0cnVlIH07XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF07XG5cbiAgICAgICAgdGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UgPSB0cnVlO1xuICAgICAgICB0aGlzLl9ob29rSWQgPSBIb29rcy5vbignY2xvc2VEaWFsb2dWMicsIChkaWFsb2dWMjogRGlhbG9nVjIpID0+IHtcbiAgICAgICAgICAgIGlmIChkaWFsb2dWMi5pZCA9PT0gJ2FtbW8tY2hvaWNlLWRpYWxvZycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2xvc2VDaG9pY2VEaWFsb2coY3VycmVudExvYWRvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyXG4gICAgICAgICAgICAuYnVpbGREaWFsb2coXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuQW1tdW5pdGlvbi5DaG9pY2VEaWFsb2dUaXRsZSdcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogZGlhbG9nQ29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgYnV0dG9uczogZGlhbG9nQnV0dG9ucyxcbiAgICAgICAgICAgICAgICAgICAgb25TdWJtaXQ6ICh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWQsXG4gICAgICAgICAgICAgICAgICAgIH06IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRvdXQ6IHN0cmluZ1tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWQ6IGJvb2xlYW47XG4gICAgICAgICAgICAgICAgICAgIH0pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbG9hZFJlbG9hZGFibGVXZWFwb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9hZG91dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRDYW5jZWxlZFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdhbW1vLWNob2ljZS1kaWFsb2cnXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAucmVuZGVyKHsgZm9yY2U6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgb25DbG9zZUNob2ljZURpYWxvZyhsb2Fkb3V0OiBzdHJpbmdbXSkge1xuICAgICAgICBIb29rcy5vZmYoJ2Nsb3NlRGlhbG9nVjInLCB0aGlzLl9ob29rSWQpO1xuICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcblxuICAgICAgICBpZiAodGhpcy5faGFuZGxlQ2hvaWNlRGlhbG9nQ2xvc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNob2ljZURpYWxvZ0Nsb3NlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnJlbG9hZFJlbG9hZGFibGVXZWFwb24obG9hZG91dCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyByZWxvYWRSZWxvYWRhYmxlV2VhcG9uKFxuICAgICAgICBsb2Fkb3V0OiBzdHJpbmdbXSxcbiAgICAgICAgcmVsb2FkQ2FuY2VsZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICAgICkge1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGFtbW9Db3VudHMgPSB0aGlzLmdldExvYWRvdXRDb3VudHMobG9hZG91dCk7XG5cbiAgICAgICAgaWYgKHRoaXMucmVtb3ZlTG9hZG91dChhbW1vQ291bnRzKSkge1xuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZWxvYWRhYmxlV2VhcG9uIHVzZXNcbiAgICAgICAgICAgIGxldCBxdHkgPSAwO1xuICAgICAgICAgICAgaWYgKGFtbW9Db3VudHNbJ0VtcHR5J10gPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gQWRqdXN0IHNwZW50IHVzZXMgYnkgdGhlIG51bWJlciBvZiBFbXB0eSBzbG90c1xuICAgICAgICAgICAgICAgIHF0eSArPSBhbW1vQ291bnRzWydFbXB0eSddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICAgICAnc3lzdGVtLnVzZXMudmFsdWUnOlxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCkgLSBxdHksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICAgICAgbG9hZG91dFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ2ZpcmVkJyxcbiAgICAgICAgICAgICAgICBuZXcgQXJyYXkocGFyc2VJbnQodGhpcy53ZWFwb24uc3lzdGVtLnVzZXMubWF4KSkuZmlsbCgnRW1wdHknKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgaHRtbFRlbXBsYXRlID0gYXdhaXQgKFxuICAgICAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICAgICAgKS5oYW5kbGViYXJzLnJlbmRlclRlbXBsYXRlKFxuICAgICAgICAgICAgICAgICdtb2R1bGVzL2Z2dHQtd2VhcG9uLXJlbG9hZC90ZW1wbGF0ZXMvcmVsb2FkYWJsZVdlYXBvblJlbG9hZFRlbXBsYXRlLmhicycsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWc6IHJlbG9hZGFibGVXZWFwb24uaW1nLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogcmVsb2FkYWJsZVdlYXBvbi5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBmbGF2b3I6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0Rmxhdm9yQ2FuY2VsZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdEZsYXZvcidcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsb2FkQ2FuY2VsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/ICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uV2VhcG9uUmVsb2FkZWRDaGF0TXNnQ2FuY2VsZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuV2VhcG9uLldlYXBvblJlbG9hZGVkQ2hhdE1zZycsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlbG9hZGFibGVXZWFwb246IHJlbG9hZGFibGVXZWFwb24ubmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBsb2Fkb3V0OiBsb2Fkb3V0LFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBOb3RpZnkgdGhlIHBlZXBzXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KHRoaXMuY2hhcmFjdGVyLCBodG1sVGVtcGxhdGUpO1xuICAgICAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9ICcnO1xuICAgICAgICAgICAgdGhpcy53ZWFwb25JZCA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy53ZWFwb25SZWxvYWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZW1vdmVMb2Fkb3V0KGNvdW50czogeyBba2V5OiBzdHJpbmddOiBudW1iZXIgfSk6IGJvb2xlYW4ge1xuICAgICAgICBsZXQgYW1tdW5pdGlvbkF2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oXG4gICAgICAgICAgICB0aGlzLmNoYXJhY3Rlcj8uaXRlbXNcbiAgICAgICAgKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgaW52ZW50b3J5QW1tdW5pdGlvbi5mb3JFYWNoKChhbW1vOiBEbmRJdGVtNWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBhbW1vLm5hbWU7XG4gICAgICAgICAgICBjb25zdCBxdHkgPSBhbW1vLnN5c3RlbS5xdWFudGl0eSAtIGNvdW50c1tuYW1lXTtcblxuICAgICAgICAgICAgLy8gSWYgYW55IGJ1bGxldCBpcyBhZGRlZCBiZXlvbmQgdGhlIHF1YW50aXR5IHRoZSBwbGF5ZXIgYWN0dWFsbHkgaGFzIHRoZW4gdGhyb3cgYW4gZXJyb3IgYW5kIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgaWYgKHF0eSA8IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnVpTm90aWZpY2F0aW9uKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZC5XZWFwb24uTG9hZGluZ0Vycm9yTXNnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbmFtZTogYW1tby5uYW1lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICdlcnJvcidcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGFtbXVuaXRpb25BdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGFtbXVuaXRpb25BdmFpbGFibGUpIHtcbiAgICAgICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaChhc3luYyAoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGFtbW8udXBkYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdzeXN0ZW0ucXVhbnRpdHknOiBhbW1vLnN5c3RlbS5xdWFudGl0eSAtIGNvdW50c1tuYW1lXSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYW1tdW5pdGlvbkF2YWlsYWJsZTtcbiAgICB9XG5cbiAgICBhc3luYyBvblJlbG9hZENhbGxiYWNrKGFjdG9yOiBEbmRBY3RvcjVlLCB3ZWFwb246IERuZEl0ZW01ZSkge1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gYWN0b3IuaWQ7XG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSB3ZWFwb24uaWQ7XG5cbiAgICAgICAgdGhpcy53ZWFwb25SZWxvYWQoKTtcbiAgICB9XG5cbiAgICBnZXRMb2Fkb3V0Q291bnRzKGN1cnJlbnRMb2Fkb3V0OiBzdHJpbmdbXSk6IHtcbiAgICAgICAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xuICAgIH0ge1xuICAgICAgICBjb25zdCBsb2Fkb3V0OiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gICAgICAgIGN1cnJlbnRMb2Fkb3V0LmZvckVhY2goKGFtbW86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgaWYgKCFsb2Fkb3V0W2FtbW9dKSBsb2Fkb3V0W2FtbW9dID0gMDtcbiAgICAgICAgICAgIGxvYWRvdXRbYW1tb10gPSBsb2Fkb3V0W2FtbW9dICsgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBsb2Fkb3V0O1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFJlbG9hZEZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5cbmltcG9ydCB7XG4gICAgRG5kQWN0b3I1ZSxcbiAgICBEbmRJdGVtNWUsXG4gICAgRG5kRDIwUm9sbCxcbiAgICBEbmRBdHRhY2tFdmVudCxcbn0gZnJvbSAnLi4vdHlwZXMvZG5kLnR5cGVzJztcblxuaW1wb3J0IHsgQWN0aXZpdHlDYXJkQ2hhdFR5cGUsIENoYXRNZXNzYWdlNWUgfSBmcm9tICcuLi90eXBlcy9jaGF0LnR5cGVzJztcbmltcG9ydCBCYXNlRmVhdHVyZSBmcm9tICcuL0Jhc2VGZWF0dXJlJztcblxuZXhwb3J0IGNsYXNzIFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX25leHRSb3VuZDoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICB0eXBlOiBzdHJpbmc7XG4gICAgfTtcbiAgICBwcml2YXRlIF9ob29rSWQ6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcikge1xuICAgICAgICBzdXBlcihmZWF0dXJlTWFuYWdlcik7XG4gICAgICAgIHRoaXMuX25leHRSb3VuZCA9IHsgaWQ6ICcnLCB0eXBlOiAnJyB9O1xuICAgICAgICB0aGlzLl9ob29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICBpbml0KCkge1xuICAgICAgICBIb29rcy5vbignZG5kNWUucG9zdFJvbGxDb25maWd1cmF0aW9uJywgdGhpcy5vblVzZUFjdGl2aXR5LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIG9uVXNlQWN0aXZpdHkoZDIwUm9sbDogRG5kRDIwUm9sbFtdLCBldmVudDogRG5kQXR0YWNrRXZlbnQpIHtcbiAgICAgICAgY29uc3Qgcm9sbCA9IGQyMFJvbGxbMF07XG4gICAgICAgIGNvbnN0IHdlYXBvbkRhdGEgPSByb2xsPy5kYXRhPy5pdGVtO1xuICAgICAgICBpZiAod2VhcG9uRGF0YT8udHlwZT8uYmFzZUl0ZW0gIT09ICdyZWxvYWRhYmxlV2VhcG9uJykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIEF0dGFjaycpO1xuICAgICAgICB0aGlzLndlYXBvbklkID0gZXZlbnQuc3ViamVjdC5pdGVtLmlkO1xuICAgICAgICB0aGlzLmNoYXJhY3RlcklkID0gZXZlbnQuc3ViamVjdC5hY3Rvci5pZDtcblxuICAgICAgICByZXR1cm4gdGhpcy5yZWxvYWRhYmxlV2VhcG9uQXR0YWNrKCk7XG4gICAgfVxuXG4gICAgcmVsb2FkYWJsZVdlYXBvbkF0dGFjaygpIHtcbiAgICAgICAgY29uc3QgYnVsbGV0ID0gdGhpcy5nZXROZXh0Um91bmQoKTtcblxuICAgICAgICBpZiAoYnVsbGV0Lm5hbWUgPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgdGhpcy5kcnlmaXJlV2VhcG9uKCk7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgdGhlIGF0dGFjayBpZiBEcnkgZmlyaW5nIHRoZSB3ZWFwb24gYW5kIHRoZXJlIGFyZSBubyBvdGhlciBidWxsZXRzIGxlZnRcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICB0aGlzLndlYXBvbi5zeXN0ZW0udXNlcy5zcGVudCA9PVxuICAgICAgICAgICAgICAgIHBhcnNlSW50KHRoaXMud2VhcG9uLnN5c3RlbS51c2VzLm1heClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChidWxsZXQubmFtZSAhPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0ge1xuICAgICAgICAgICAgICAgIGlkOiBidWxsZXQuaWQsXG4gICAgICAgICAgICAgICAgdHlwZTogYnVsbGV0LnR5cGUsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLl9ob29rSWQgPSBIb29rcy5vbihcbiAgICAgICAgICAgICAgICAnZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgICAgIHRoaXMub25SZW5kZXJDaGF0TWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyZVJvdW5kKGJ1bGxldCk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25SZW5kZXJDaGF0TWVzc2FnZShtZXNzYWdlOiBDaGF0TWVzc2FnZTVlLCBodG1sOiBIVE1MRWxlbWVudCkge1xuICAgICAgICBjb25zdCBpdGVtSWQgPSBtZXNzYWdlLmZsYWdzLmRuZDVlPy5pdGVtLmlkO1xuICAgICAgICBjb25zdCBpdGVtVHlwZSA9IG1lc3NhZ2UuZmxhZ3MuZG5kNWU/Lml0ZW0udHlwZTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kLmlkID09PSBpdGVtSWQgJiZcbiAgICAgICAgICAgIHRoaXMuX25leHRSb3VuZC50eXBlID09PSBpdGVtVHlwZVxuICAgICAgICApIHtcbiAgICAgICAgICAgIEhvb2tzLm9mZignZG5kNWUucmVuZGVyQ2hhdE1lc3NhZ2UnLCB0aGlzLl9ob29rSWQpO1xuICAgICAgICAgICAgdGhpcy5fbmV4dFJvdW5kID0geyBpZDogJycsIHR5cGU6ICcnIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGJ1bGxldCA9IHRoaXMuY2hhcmFjdGVyLml0ZW1zLmdldChpdGVtSWQpIGFzIERuZEl0ZW01ZTtcblxuICAgICAgICAgICAgY29uc3QgYWN0aXZhdGlvbkNhcmQgPSBodG1sLnF1ZXJ5U2VsZWN0b3IoJy5hY3RpdmF0aW9uLWNhcmQnKTtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1jYXJkID0gaHRtbC5xdWVyeVNlbGVjdG9yKCcuaXRlbS1jYXJkJyk7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRFbGVtZW50ID0gYWN0aXZhdGlvbkNhcmQgfHwgaXRlbWNhcmQ7XG5cbiAgICAgICAgICAgIC8vIEdyYWIgbW9kdWxlIGNvbmZpZ3VyYXRpb25zXG4gICAgICAgICAgICBjb25zdCBjaGVja1Vuc3RhYmxlQW1tbyA9IGdhbWUuc2V0dGluZ3MuZ2V0KFxuICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICAgICAndW5zdGFibGVBbW1vJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCBjaGVja01pc2ZpcmUgPSBnYW1lLnNldHRpbmdzLmdldChcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAgICAgJ3VzZU1pc2ZpcmVzJ1xuICAgICAgICAgICAgKSBhcyBib29sZWFuO1xuXG4gICAgICAgICAgICBjb25zdCB1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkID0gZ2FtZS5zZXR0aW5ncy5nZXQoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICd1bnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNoaG9sZCdcbiAgICAgICAgICAgICkgYXMgbnVtYmVyO1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIG1pc2ZpcmUgbWVzc2FnZVxuICAgICAgICAgICAgaWYgKGNoZWNrTWlzZmlyZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNyaXRpY2FsRmFpbHVyZU1zZyA9XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrVW5zdGFibGVBbW1vICYmXG4gICAgICAgICAgICAgICAgICAgIGJ1bGxldD8uc3lzdGVtLnByb3BlcnRpZXMuZmluZCgocHJvcDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvcCA9PT0gJ3Vuc3RhYmxlJztcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVVbnN0YWJsZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGZhaWx1cmU6IGAke3Vuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGR9YCB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5NaXNmaXJlTmF0T25lJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY2FyZENvbnRlbnRFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLmNhcmQtY29udGVudCcpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHdyYXBwZXJFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgY2FyZENvbnRlbnRFbGVtZW50Py5xdWVyeVNlbGVjdG9yKCcud3JhcHBlcicpO1xuICAgICAgICAgICAgICAgIHdyYXBwZXJFbGVtZW50Py5pbnNlcnRBZGphY2VudEhUTUwoXG4gICAgICAgICAgICAgICAgICAgICdiZWZvcmVlbmQnLFxuICAgICAgICAgICAgICAgICAgICBgPHA+JHtjcml0aWNhbEZhaWx1cmVNc2d9PC9wPmBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBZGQgY2FyZCBidXR0b24gY29udGFpbmVyIGlmIG1pc3NpbmdcbiAgICAgICAgICAgIGlmIChpdGVtY2FyZCAmJiAhYWN0aXZhdGlvbkNhcmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWZlcmVuY2VFbGVtZW50ID1cbiAgICAgICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLmNhcmQtaGVhZGVyJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgYnV0dG9uQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgYnV0dG9uQ29udGFpbmVyLmNsYXNzTmFtZSA9ICdjYXJkLWJ1dHRvbnMnO1xuICAgICAgICAgICAgICAgIHJlZmVyZW5jZUVsZW1lbnQ/LmFmdGVyKGJ1dHRvbkNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGNhcmRCdXR0b25zRWxlbWVudCA9XG4gICAgICAgICAgICAgICAgcGFyZW50RWxlbWVudD8ucXVlcnlTZWxlY3RvcignLmNhcmQtYnV0dG9ucycpO1xuXG4gICAgICAgICAgICAvLyBBZGQgTWlzZmlyZSBidXR0b25cbiAgICAgICAgICAgIGlmIChjaGVja01pc2ZpcmUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtaXNmaXJlQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgbWlzZmlyZUJ0bi5vbmNsaWNrID0gdGhpcy5vbkNsaWNrTWlzZmlyZS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgICAgIG1pc2ZpcmVCdG4uaW5uZXJIVE1MID0gYCR7dGhpcy5tYWtlSWNvbignZmEtYnVyc3QnKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLk1pc2ZpcmVkQnRuVHh0J1xuICAgICAgICAgICAgICAgICl9YDtcbiAgICAgICAgICAgICAgICBjYXJkQnV0dG9uc0VsZW1lbnQ/LmFwcGVuZChtaXNmaXJlQnRuKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQWRkIGFtbW8gcmVmdW5kIGJ1dHRvblxuICAgICAgICAgICAgY29uc3QgcmVmdW5kQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICByZWZ1bmRCdG4ub25jbGljayA9IHRoaXMub25DbGlja1JlZnVuZC5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgcmVmdW5kQnRuLmlubmVySFRNTCA9IGAke3RoaXMubWFrZUljb24oJ2ZhLXVuZG8nKX0ke3RoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kQnRuVHh0J1xuICAgICAgICAgICAgKX1gO1xuICAgICAgICAgICAgY2FyZEJ1dHRvbnNFbGVtZW50Py5hcHBlbmQocmVmdW5kQnRuKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldE5leHRSb3VuZCgpOiBEbmRJdGVtNWUge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgd2VhcG9uID0gdGhpcy53ZWFwb247XG5cbiAgICAgICAgY29uc3QgbG9hZG91dCA9IHRoaXMubG9hZG91dDtcbiAgICAgICAgbG9hZG91dC5wdXNoKCdFbXB0eScpO1xuICAgICAgICBjb25zdCBuZXh0Um91bmQgPSBsb2Fkb3V0LnNoaWZ0KCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBidWxsZXQgZnJvbSB0aGUgcmVsb2FkYWJsZVdlYXBvbiBhbW11bml0aW9uXG4gICAgICAgIHdlYXBvbi5zZXRGbGFnKHRoaXMubW9kdWxlTWFuYWdlci5pZCwgJ2NoYW1iZXJlZCcsIGxvYWRvdXQpO1xuXG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oXG4gICAgICAgICAgICBjaGFyYWN0ZXIuaXRlbXNcbiAgICAgICAgKSBhcyBEbmRJdGVtNWVbXTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZmluZCgoYW1tbzogRG5kSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGFtbW8ubmFtZTtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSA9PSBuZXh0Um91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFtbW87XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSkgfHwgKHsgbmFtZTogJ0VtcHR5JyB9IGFzIERuZEl0ZW01ZSlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBkcnlmaXJlV2VhcG9uKCkge1xuICAgICAgICBjb25zdCBjaGFyYWN0ZXIgPSB0aGlzLmNoYXJhY3RlcjtcbiAgICAgICAgY29uc3Qgd2VhcG9uID0gdGhpcy53ZWFwb247XG5cbiAgICAgICAgY29uc3QgcmVuZGVySG9va0lkID0gSG9va3Mub24oXG4gICAgICAgICAgICAncmVuZGVyQ2hhdE1lc3NhZ2UnLFxuICAgICAgICAgICAgKF9jaGF0SXRlbSwgaHRtbCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbG9hZEJ0biA9IGh0bWxbMF0ucXVlcnlTZWxlY3RvcignLnJlbG9hZC1hbW1vJyk7XG4gICAgICAgICAgICAgICAgcmVsb2FkQnRuPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWxvYWQoY2hhcmFjdGVyLCB3ZWFwb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlbG9hZEJ0bikge1xuICAgICAgICAgICAgICAgICAgICBIb29rcy5vZmYoJ3JlbmRlckNoYXRNZXNzYWdlJywgcmVuZGVySG9va0lkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgdGVtcGxhdGVEYXRhOiBBY3Rpdml0eUNhcmRDaGF0VHlwZSA9IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7XG4gICAgICAgICAgICAgICAgY2hhdDogYDxwPiR7dGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suRHJ5RmlyZURlc2NyaXB0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBjaGFyYWN0ZXIubmFtZSwgcmVsb2FkYWJsZVdlYXBvbjogd2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICl9PC9wPmAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXRlbToge1xuICAgICAgICAgICAgICAgIGltZzogd2VhcG9uLmltZyxcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5EcnlGaXJlVGl0bGUnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWJ0aXRsZTogd2VhcG9uLm5hbWUsXG4gICAgICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBkYXRhc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmlsaXR5OiAnYWxsJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogdGhpcy5tYWtlSWNvbignZmEtcm90YXRlLXJpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0aGlzLnRyYW5zbGF0ZSgnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWQuVGV4dCcpLFxuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzOiAncmVsb2FkLWFtbW8nLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVuZGVyQ2FyZCh0ZW1wbGF0ZURhdGEsIGNoYXJhY3Rlcik7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVuZGVyQ2FyZChcbiAgICAgICAgdGVtcGxhdGVEYXRhOiBBY3Rpdml0eUNhcmRDaGF0VHlwZSxcbiAgICAgICAgY2hhcmFjdGVyOiBEbmRBY3RvcjVlXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FjdGl2aXR5LWNhcmQuaGJzJyxcbiAgICAgICAgICAgIHRlbXBsYXRlRGF0YVxuICAgICAgICApO1xuICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIudWlNYW5hZ2VyLnNlbmRDaGF0KGNoYXJhY3RlciwgaHRtbFRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBmaXJlUm91bmQoYnVsbGV0OiBEbmRJdGVtNWUpIHtcbiAgICAgICAgY29uc3QgcmVsb2FkYWJsZVdlYXBvbiA9IHRoaXMud2VhcG9uO1xuICAgICAgICBjb25zdCBtYXhTaG90cyA9IHBhcnNlSW50KHJlbG9hZGFibGVXZWFwb24uc3lzdGVtLnVzZXMubWF4KTtcbiAgICAgICAgY29uc3QgZmlyZWRMb2Fkb3V0ID1cbiAgICAgICAgICAgIChyZWxvYWRhYmxlV2VhcG9uLmdldEZsYWcoXG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgICAgICdmaXJlZCdcbiAgICAgICAgICAgICkgYXMgc3RyaW5nW10pIHx8IG5ldyBBcnJheShtYXhTaG90cykuZmlsbCgnRW1wdHknKTtcblxuICAgICAgICBmaXJlZExvYWRvdXQudW5zaGlmdChidWxsZXQubmFtZSk7XG4gICAgICAgIGZpcmVkTG9hZG91dC5zcGxpY2UoLTEpO1xuICAgICAgICByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcodGhpcy5tb2R1bGVNYW5hZ2VyLmlkLCAnZmlyZWQnLCBmaXJlZExvYWRvdXQpO1xuXG4gICAgICAgIGNvbnN0IHVzZXMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzO1xuICAgICAgICBjb25zdCBxdHk6IG51bWJlciA9XG4gICAgICAgICAgICB1c2VzLnNwZW50ICsgMSA8PSBwYXJzZUludCh1c2VzLm1heClcbiAgICAgICAgICAgICAgICA/IHVzZXMuc3BlbnQgKyAxXG4gICAgICAgICAgICAgICAgOiBwYXJzZUludCh1c2VzLm1heCk7XG5cbiAgICAgICAgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogcXR5LFxuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnZhbHVlJzogcGFyc2VJbnQodXNlcy5tYXgpIC0gcXR5LFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoYnVsbGV0Lm5hbWUgIT09ICdFbXB0eScpIHtcbiAgICAgICAgICAgIGJ1bGxldC51c2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZWxvYWQoYWN0b3I6IERuZEFjdG9yNWUsIHJlbG9hZGFibGVXZWFwb246IERuZEl0ZW01ZSkge1xuICAgICAgICB0aGlzLmZlYXR1cmVNYW5hZ2VyXG4gICAgICAgICAgICAuZ2V0RmVhdHVyZSgncmVsb2FkJylcbiAgICAgICAgICAgIC5vblJlbG9hZENhbGxiYWNrKGFjdG9yLCByZWxvYWRhYmxlV2VhcG9uKTtcbiAgICB9XG5cbiAgICBhc3luYyBvbkNsaWNrUmVmdW5kKCkge1xuICAgICAgICBjb25zdCBhY3RvciA9IHRoaXMuY2hhcmFjdGVyO1xuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGludmVudG9yeUFtbXVuaXRpb24gPSB0aGlzLmFtbXVuaXRpb24oYWN0b3IuaXRlbXMpO1xuXG4gICAgICAgIGNvbnN0IGZpcmVkID0gdGhpcy5maXJlZDtcbiAgICAgICAgY29uc3QgcmVmdW5kOiBzdHJpbmcgPSBmaXJlZC5zcGxpY2UoMCwgMSlbMF0gYXMgc3RyaW5nO1xuICAgICAgICBmaXJlZC5wdXNoKCdFbXB0eScpO1xuXG4gICAgICAgIGlmIChyZWZ1bmQgPT0gJ0VtcHR5Jykge1xuICAgICAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlcmUgaXMgbm8gYW1tdW5pdGlvbiB0byByZWZ1bmRcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIudWlOb3RpZmljYXRpb24oXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGUoXG4gICAgICAgICAgICAgICAgICAgICdXRUFQT05fUkVMT0FELkZlYXR1cmVzLlJlbG9hZGFibGVXZWFwb25BdHRhY2suUmVmdW5kLlJlZnVuZE5vTW9yZU1zZycsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWxvYWRhYmxlV2VhcG9uOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICd3YXJuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyh0aGlzLm1vZHVsZU1hbmFnZXIuaWQsICdmaXJlZCcsIGZpcmVkKTtcblxuICAgICAgICBsZXQgYnVsbGV0ID0geyBuYW1lOiByZWZ1bmQgfSBhcyBEbmRJdGVtNWU7XG4gICAgICAgIGludmVudG9yeUFtbXVuaXRpb24uZm9yRWFjaCgoYW1tbzogSXRlbTVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gYW1tby5uYW1lO1xuICAgICAgICAgICAgaWYgKG5hbWUgPT0gcmVmdW5kKSB7XG4gICAgICAgICAgICAgICAgYnVsbGV0ID0gYW1tbyBhcyBEbmRJdGVtNWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFJlZnVuZCB0aGUgbm9uLUVtcHR5IGFtbXVuaXRpb25cbiAgICAgICAgY29uc3QgYW1tb0xvYWRvdXQgPSB0aGlzLmxvYWRvdXQ7XG4gICAgICAgIGFtbW9Mb2Fkb3V0LnVuc2hpZnQocmVmdW5kKTtcbiAgICAgICAgYW1tb0xvYWRvdXQuc3BsaWNlKC0xKTtcbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi5zZXRGbGFnKFxuICAgICAgICAgICAgdGhpcy5tb2R1bGVNYW5hZ2VyLmlkLFxuICAgICAgICAgICAgJ2NoYW1iZXJlZCcsXG4gICAgICAgICAgICBhbW1vTG9hZG91dFxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVsb2FkYWJsZVdlYXBvbiB1c2VzXG4gICAgICAgIGNvbnN0IHVzZXMgPSByZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzO1xuICAgICAgICBjb25zdCBxdHk6IG51bWJlciA9IHVzZXMuc3BlbnQgLSAxID49IDAgPyB1c2VzLnNwZW50IC0gMSA6IDA7XG4gICAgICAgIHJlbG9hZGFibGVXZWFwb24udXBkYXRlKHtcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy5zcGVudCc6IHF0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IHBhcnNlSW50KHVzZXMubWF4KSAtIHF0eSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gTm90aWZ5IHRoZSB1c2VyIHRoYXQgdGhlIHJlZnVuZCB3YXMgYSBzdWNjZXNzXG4gICAgICAgIGNvbnN0IGh0bWxUZW1wbGF0ZSA9IGF3YWl0IChcbiAgICAgICAgICAgIGZvdW5kcnkuYXBwbGljYXRpb25zIGFzIGFueVxuICAgICAgICApLmhhbmRsZWJhcnMucmVuZGVyVGVtcGxhdGUoXG4gICAgICAgICAgICAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMnLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGl0ZW06IHtcbiAgICAgICAgICAgICAgICAgICAgaW1nOiBidWxsZXQuaW1nLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBidWxsZXQubmFtZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnRyYW5zbGF0ZShcbiAgICAgICAgICAgICAgICAgICAgJ1dFQVBPTl9SRUxPQUQuRmVhdHVyZXMuUmVsb2FkYWJsZVdlYXBvbkF0dGFjay5SZWZ1bmQuUmVmdW5kQ29tcGxldGVNc2cnLFxuICAgICAgICAgICAgICAgICAgICB7IGJ1bGxldDogcmVmdW5kLCBuYW1lOiByZWxvYWRhYmxlV2VhcG9uLm5hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMudHJhbnNsYXRlKFxuICAgICAgICAgICAgICAgICAgICAnV0VBUE9OX1JFTE9BRC5GZWF0dXJlcy5SZWxvYWRhYmxlV2VhcG9uQXR0YWNrLlJlZnVuZC5SZWZ1bmRDb21wbGV0ZVRpdGxlJ1xuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci51aU1hbmFnZXIuc2VuZENoYXQoYWN0b3IsIGh0bWxUZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25DbGlja01pc2ZpcmUoKSB7XG4gICAgICAgIGNvbnN0IGFjdG9yID0gdGhpcy5jaGFyYWN0ZXI7XG4gICAgICAgIGNvbnN0IHJvbGwgPSBhd2FpdCBuZXcgUm9sbCgnMWQ2Jykucm9sbCgpO1xuICAgICAgICBhd2FpdCByb2xsLnRvTWVzc2FnZSh7XG4gICAgICAgICAgICBzcGVha2VyOiB7XG4gICAgICAgICAgICAgICAgYWxpYXM6IGFjdG9yLm5hbWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtYWtlSWNvbihpY29uOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGA8aSBjbGFzcz1cImZhcyAke2ljb259XCI+PC9pPmA7XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiAnY2xhc3MgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCBGZWF0dXJlTWFuYWdlciBmcm9tICcuLi9tYW5hZ2Vycy9GZWF0dXJlTWFuYWdlcic7XG5cbmltcG9ydCB7IERuZEl0ZW01ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgQmFzZUZlYXR1cmUgZnJvbSAnLi9CYXNlRmVhdHVyZSc7XG5cbmV4cG9ydCBjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlIGV4dGVuZHMgQmFzZUZlYXR1cmUge1xuICAgIHByaXZhdGUgX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbjogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9jcmVhdGVJdGVtSG9va0lkOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihmZWF0dXJlTWFuYWdlcjogRmVhdHVyZU1hbmFnZXIpIHtcbiAgICAgICAgc3VwZXIoZmVhdHVyZU1hbmFnZXIpO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IC0xO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIEhvb2tzLm9uKCdwcmVDcmVhdGVJdGVtJywgdGhpcy5vblByZUNyZWF0ZUl0ZW0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgb25QcmVDcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoaXRlbS5zeXN0ZW0udHlwZS5iYXNlSXRlbSA9PSAncmVsb2FkYWJsZVdlYXBvbicpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFByZS1DcmVhdGlvbicpO1xuXG4gICAgICAgICAgICB0aGlzLndlYXBvbklkID0gaXRlbS5pZDtcbiAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVySWQgPSBpdGVtLmFjdG9yPy5pZCBhcyBzdHJpbmc7XG4gICAgICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCA9IEhvb2tzLm9uKFxuICAgICAgICAgICAgICAgICdjcmVhdGVJdGVtJyxcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ3JlYXRlSXRlbS5iaW5kKHRoaXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgb25DcmVhdGVJdGVtKGl0ZW06IERuZEl0ZW01ZSkge1xuICAgICAgICBpZiAoIXRoaXMuX2NyZWF0aW5nUmVsb2FkYWJsZVdlYXBvbiB8fCBpdGVtLmlkICE9PSB0aGlzLndlYXBvbklkKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKCdXZWFwb24gUmVsb2FkIHwgVHJpZ2dlcmVkIFJlbG9hZGFibGVXZWFwb24gQ3JlYXRpb24nKTtcblxuICAgICAgICBjb25zdCByZWxvYWRhYmxlV2VhcG9uID0gdGhpcy53ZWFwb247XG4gICAgICAgIGNvbnN0IGFtbW9RdHkgPSBwYXJzZUludChyZWxvYWRhYmxlV2VhcG9uLnN5c3RlbS51c2VzLm1heCk7XG5cbiAgICAgICAgYXdhaXQgcmVsb2FkYWJsZVdlYXBvbi51cGRhdGUoe1xuICAgICAgICAgICAgJ3N5c3RlbS51c2VzLnNwZW50JzogYW1tb1F0eSxcbiAgICAgICAgICAgICdzeXN0ZW0udXNlcy52YWx1ZSc6IDAsXG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCByZWxvYWRhYmxlV2VhcG9uLnNldEZsYWcoXG4gICAgICAgICAgICB0aGlzLm1vZHVsZU1hbmFnZXIuaWQsXG4gICAgICAgICAgICAnY2hhbWJlcmVkJyxcbiAgICAgICAgICAgIG5ldyBBcnJheShhbW1vUXR5KS5maWxsKCdFbXB0eScpXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IHJlbG9hZGFibGVXZWFwb24uc2V0RmxhZyhcbiAgICAgICAgICAgIHRoaXMubW9kdWxlTWFuYWdlci5pZCxcbiAgICAgICAgICAgICdmaXJlZCcsXG4gICAgICAgICAgICBuZXcgQXJyYXkoYW1tb1F0eSkuZmlsbCgnRW1wdHknKVxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMud2VhcG9uSWQgPSAnJztcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJJZCA9ICcnO1xuICAgICAgICB0aGlzLl9jcmVhdGluZ1JlbG9hZGFibGVXZWFwb24gPSBmYWxzZTtcbiAgICAgICAgSG9va3Mub2ZmKCdjcmVhdGVJdGVtJywgdGhpcy5fY3JlYXRlSXRlbUhvb2tJZCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUl0ZW1Ib29rSWQgPSAtMTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlJztcbiAgICB9XG59XG4iLCJleHBvcnQgeyBOZXh0Um91bmRGZWF0dXJlIH0gZnJvbSAnLi9OZXh0Um91bmRGZWF0dXJlJztcbmV4cG9ydCB7IFJlbG9hZGFibGVXZWFwb25BdHRhY2tGZWF0dXJlIH0gZnJvbSAnLi9SZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSc7XG5leHBvcnQgeyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlIH0gZnJvbSAnLi9SZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlJztcbmV4cG9ydCB7IFJlbG9hZEZlYXR1cmUgfSBmcm9tICcuL1JlbG9hZEZlYXR1cmUnO1xuIiwiaW1wb3J0IE1vZHVsZU1hbmFnZXIgZnJvbSAnLi9Nb2R1bGVNYW5hZ2VyJztcbmltcG9ydCB7XG4gICAgTmV4dFJvdW5kRmVhdHVyZSxcbiAgICBSZWxvYWRhYmxlV2VhcG9uQXR0YWNrRmVhdHVyZSxcbiAgICBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlLFxuICAgIFJlbG9hZEZlYXR1cmUsXG59IGZyb20gJy4uL2ZlYXR1cmVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmVhdHVyZU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXI7XG4gICAgcHJpdmF0ZSBfZmVhdHVyZXM6IHsgW2tleTogc3RyaW5nXTogYW55IH07XG5cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZU1hbmFnZXIgPSBtb2R1bGVNYW5hZ2VyO1xuICAgICAgICB0aGlzLl9mZWF0dXJlcyA9IHt9O1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIHRoaXMuX2ZlYXR1cmVzID0ge1xuICAgICAgICAgICAgbmV4dFJvdW5kOiBuZXcgTmV4dFJvdW5kRmVhdHVyZSh0aGlzKSxcbiAgICAgICAgICAgIHJlbG9hZDogbmV3IFJlbG9hZEZlYXR1cmUodGhpcyksXG4gICAgICAgICAgICByZWxvYWRhYmxlV2VhcG9uQXR0YWNrOiBuZXcgUmVsb2FkYWJsZVdlYXBvbkF0dGFja0ZlYXR1cmUodGhpcyksXG4gICAgICAgICAgICByZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb246IG5ldyBSZWxvYWRhYmxlV2VhcG9uQ3JlYXRpb25GZWF0dXJlKHRoaXMpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGdldEZlYXR1cmUoaWQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5fZmVhdHVyZXNbaWRdKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmVhdHVyZXNbaWRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGdldCBtb2R1bGVNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbW9kdWxlTWFuYWdlcjtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIGBjbGFzcyBGZWF0dXJlTWFuYWdlcjogJHt0aGlzLl9mZWF0dXJlcy5sZW5ndGh9YDtcbiAgICB9XG59XG4iLCJpbXBvcnQgRmVhdHVyZU1hbmFnZXIgZnJvbSAnLi9GZWF0dXJlTWFuYWdlcic7XG5pbXBvcnQgVWlNYW5hZ2VyIGZyb20gJy4vVWlNYW5hZ2VyJztcbmltcG9ydCBUZW1wbGF0ZU1hbmFnZXIgZnJvbSAnLi9UZW1wbGF0ZU1hbmFnZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2R1bGVNYW5hZ2VyIHtcbiAgICBwcml2YXRlIF9tb2R1bGVJZDogc3RyaW5nO1xuICAgIHByaXZhdGUgX2ZlYXR1cmVNYW5hZ2VyOiBGZWF0dXJlTWFuYWdlcjtcbiAgICBwcml2YXRlIF91aU1hbmFnZXI6IFVpTWFuYWdlcjtcbiAgICBwcml2YXRlIF90ZW1wbGF0ZU1hbmFnZXI6IFRlbXBsYXRlTWFuYWdlcjtcblxuICAgIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fbW9kdWxlSWQgPSBpZDtcbiAgICAgICAgdGhpcy5fZmVhdHVyZU1hbmFnZXIgPSBuZXcgRmVhdHVyZU1hbmFnZXIodGhpcyk7XG4gICAgICAgIHRoaXMuX3VpTWFuYWdlciA9IG5ldyBVaU1hbmFnZXIodGhpcyk7XG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFuYWdlciA9IG5ldyBUZW1wbGF0ZU1hbmFnZXIoKTtcbiAgICB9XG5cbiAgICBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVJZDtcbiAgICB9XG5cbiAgICBnZXQgZmVhdHVyZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mZWF0dXJlTWFuYWdlcjtcbiAgICB9XG5cbiAgICBnZXQgdWlNYW5hZ2VyKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdWlNYW5hZ2VyO1xuICAgIH1cblxuICAgIGdldCB0ZW1wbGF0ZU1hbmFnZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90ZW1wbGF0ZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5zeXN0ZW1PdmVycmlkZXMoKTtcbiAgICAgICAgdGhpcy5tb2R1bGVDb25maWd1cmF0aW9ucygpO1xuICAgICAgICB0aGlzLl9mZWF0dXJlTWFuYWdlci5pbml0KCk7XG4gICAgICAgIHRoaXMuX3VpTWFuYWdlci5pbml0KCk7XG4gICAgICAgIHRoaXMuX3RlbXBsYXRlTWFuYWdlci5pbml0KCk7XG4gICAgfVxuXG4gICAgc3lzdGVtT3ZlcnJpZGVzKCkge1xuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUuZmVhdHVyZVR5cGVzLml0ZW0gPSB7XG4gICAgICAgICAgICBsYWJlbDogdGhpcy51aU1hbmFnZXIuZ2V0TG9jYWxpemVkVHh0KCdXRUFQT05fUkVMT0FELkl0ZW1GZWF0dXJlJyksXG4gICAgICAgIH07XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLml0ZW1Qcm9wZXJ0aWVzLmNvbmNlYWxhYmxlID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnV0VBUE9OX1JFTE9BRC5Db25jZWFsYWJsZScpLFxuICAgICAgICB9O1xuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUudmFsaWRQcm9wZXJ0aWVzLndlYXBvbi5hZGQoJ2NvbmNlYWxhYmxlJyk7XG5cbiAgICAgICAgKENPTkZJRyBhcyBhbnkpLkRORDVFLml0ZW1Qcm9wZXJ0aWVzLnVuc3RhYmxlID0ge1xuICAgICAgICAgICAgbGFiZWw6IHRoaXMudWlNYW5hZ2VyLmdldExvY2FsaXplZFR4dCgnV0VBUE9OX1JFTE9BRC5VbnN0YWJsZScpLFxuICAgICAgICAgICAgaXNQaHlzaWNhbDogdHJ1ZSxcbiAgICAgICAgfTtcblxuICAgICAgICAoQ09ORklHIGFzIGFueSkuRE5ENUUud2VhcG9uSWRzLnJlbG9hZGFibGVXZWFwb24gPVxuICAgICAgICAgICAgJ0NvbXBlbmRpdW0uZnZ0dC13ZWFwb24tcmVsb2FkLml0ZW0tcGFjay5JdGVtLmxFNjBRYVMxc2N0YjNPQWQnO1xuICAgIH1cblxuICAgIG1vZHVsZUNvbmZpZ3VyYXRpb25zKCkge1xuICAgICAgICBjb25zdCBtb2R1bGVOYW1lID0gJ2Z2dHQtd2VhcG9uLXJlbG9hZCc7XG5cbiAgICAgICAgZ2FtZS5zZXR0aW5ncy5yZWdpc3Rlcihtb2R1bGVOYW1lLCAndW5zdGFibGVBbW1vJywge1xuICAgICAgICAgICAgc2NvcGU6ICd3b3JsZCcsXG4gICAgICAgICAgICBuYW1lOiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5VbnN0YWJsZUFtbW8uTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5VbnN0YWJsZUFtbW8uSGludCcsXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2FtZS5zZXR0aW5ncy5yZWdpc3Rlcihtb2R1bGVOYW1lLCAndW5zdGFibGVBbW1vRmFpbHVyZVRocmVzaGhvbGQnLCB7XG4gICAgICAgICAgICBzY29wZTogJ3dvcmxkJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVuc3RhYmxlQW1tb0ZhaWx1cmVUaHJlc2hvbGQuTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5VbnN0YWJsZUFtbW9GYWlsdXJlVGhyZXNob2xkLkhpbnQnLFxuICAgICAgICAgICAgdHlwZTogTnVtYmVyLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogMixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2FtZS5zZXR0aW5ncy5yZWdpc3Rlcihtb2R1bGVOYW1lLCAndXNlTWlzZmlyZXMnLCB7XG4gICAgICAgICAgICBzY29wZTogJ3dvcmxkJyxcbiAgICAgICAgICAgIG5hbWU6ICdTRVRUSU5HUy5XRUFQT05fUkVMT0FELlVzZU1pc2ZpcmVzLk5hbWUnLFxuICAgICAgICAgICAgaGludDogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuVXNlTWlzZmlyZXMuSGludCcsXG4gICAgICAgICAgICB0eXBlOiBCb29sZWFuLFxuICAgICAgICAgICAgY29uZmlnOiB0cnVlLFxuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2FtZS5zZXR0aW5ncy5yZWdpc3Rlcihtb2R1bGVOYW1lLCAnZmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQnLCB7XG4gICAgICAgICAgICBzY29wZTogJ3VzZXInLFxuICAgICAgICAgICAgbmFtZTogJ1NFVFRJTkdTLldFQVBPTl9SRUxPQUQuRmlsdGVyQW1tdW5pdGlvbkJ5RXF1aXBwZWQuTmFtZScsXG4gICAgICAgICAgICBoaW50OiAnU0VUVElOR1MuV0VBUE9OX1JFTE9BRC5GaWx0ZXJBbW11bml0aW9uQnlFcXVpcHBlZC5IaW50JyxcbiAgICAgICAgICAgIHR5cGU6IEJvb2xlYW4sXG4gICAgICAgICAgICBjb25maWc6IHRydWUsXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGVidWcoaG9va3M6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBDT05GSUcuZGVidWcuaG9va3MgPSBob29rcztcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRzogJywgQ09ORklHKTtcbiAgICAgICAgY29uc29sZS5sb2coJ0NPTkZJRy5ETkQ1RTogJywgKENPTkZJRyBhcyBhbnkpLkRORDVFKTtcbiAgICB9XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuICdjbGFzcyBNb2R1bGVNYW5hZ2VyJztcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBUZW1wbGF0ZU1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIGluaXQoKSB7XG4gICAgICAgIChmb3VuZHJ5LmFwcGxpY2F0aW9ucyBhcyBhbnkpLmhhbmRsZWJhcnMubG9hZFRlbXBsYXRlcyhcbiAgICAgICAgICAgIFRlbXBsYXRlTWFuYWdlci5wYXRoc1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgcGF0aHMoKSB7XG4gICAgICAgIGNvbnN0IHBhdGhzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge307XG4gICAgICAgIGNvbnN0IHRlbXBsYXRlUGF0aHMgPSAnbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL3JlbG9hZGFibGVXZWFwb25SZWxvYWRUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2Jhc2ljTWVzc2FnZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9TZWxlY3Rpb25EaWFsb2dUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FtbW9SZWZ1bmROb3RpY2VUZW1wbGF0ZS5oYnMsbW9kdWxlcy9mdnR0LXdlYXBvbi1yZWxvYWQvdGVtcGxhdGVzL2FjdGl2aXR5LWNhcmQuaGJzJy5zcGxpdCgnLCcpO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgdGVtcGxhdGVQYXRocykge1xuICAgICAgICAgICAgcGF0aHNbcGF0aC5yZXBsYWNlKCcuaGJzJywgJy5odG1sJyldID0gcGF0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aHM7XG4gICAgfVxuXG4gICAgc3RhdGljIG9uSG90UmVsb2FkKCkge1xuICAgICAgICBmb3IgKGNvbnN0IHRlbXBsYXRlIGluIF90ZW1wbGF0ZUNhY2hlKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKF90ZW1wbGF0ZUNhY2hlLCB0ZW1wbGF0ZSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBfdGVtcGxhdGVDYWNoZVt0ZW1wbGF0ZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAoZm91bmRyeS5hcHBsaWNhdGlvbnMgYXMgYW55KS5oYW5kbGViYXJzXG4gICAgICAgICAgICAubG9hZFRlbXBsYXRlcyh0aGlzLnBhdGhzKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgYXBwbGljYXRpb24gaW4gdWkud2luZG93cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdWkud2luZG93cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVpLndpbmRvd3NbYXBwbGljYXRpb25dLnJlbmRlcih0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFRlbXBsYXRlTWFuYWdlcic7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgRG5kQWN0b3I1ZSB9IGZyb20gJy4uL3R5cGVzL2RuZC50eXBlcyc7XG5pbXBvcnQgTW9kdWxlTWFuYWdlciBmcm9tICcuL01vZHVsZU1hbmFnZXInO1xuXG50eXBlIERpYWxvZ09wdGlvbnMgPSB7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBjb250ZW50Q2xhc3Nlcz86IHN0cmluZ1tdO1xuICAgIGNvbnRlbnQ6IHN0cmluZztcbiAgICBidXR0b25zOiB7XG4gICAgICAgIGFjdGlvbjogc3RyaW5nO1xuICAgICAgICBsYWJlbDogc3RyaW5nO1xuICAgICAgICBjYWxsYmFjazogKFxuICAgICAgICAgICAgZXZlbnQ6IFBvaW50ZXJFdmVudCB8IFN1Ym1pdEV2ZW50LFxuICAgICAgICAgICAgYnV0dG9uOiBIVE1MQnV0dG9uRWxlbWVudFxuICAgICAgICApID0+IGFueTtcbiAgICB9W107XG4gICAgb25TdWJtaXQ6IChkYXRhOiBhbnkpID0+IFByb21pc2U8dm9pZD47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVaU1hbmFnZXIge1xuICAgIHByaXZhdGUgX21vZHVsZU1hbmFnZXI6IE1vZHVsZU1hbmFnZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihtb2R1bGVNYW5hZ2VyOiBNb2R1bGVNYW5hZ2VyKSB7XG4gICAgICAgIHRoaXMuX21vZHVsZU1hbmFnZXIgPSBtb2R1bGVNYW5hZ2VyO1xuICAgIH1cblxuICAgIGluaXQoKSB7XG4gICAgICAgIC8vIEVNUFRZIEZPUiBOT1dcbiAgICB9XG5cbiAgICBnZXQgbW9kdWxlTWFuYWdlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZHVsZU1hbmFnZXI7XG4gICAgfVxuXG4gICAgYnVpbGREaWFsb2cob3B0aW9uczogRGlhbG9nT3B0aW9ucywgaWQ6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IGZvdW5kcnkuYXBwbGljYXRpb25zLmFwaS5EaWFsb2dWMih7XG4gICAgICAgICAgICB3aW5kb3c6IHtcbiAgICAgICAgICAgICAgICB0aXRsZTogb3B0aW9ucy50aXRsZSxcbiAgICAgICAgICAgICAgICBjb250ZW50Q2xhc3Nlczogb3B0aW9ucy5jb250ZW50Q2xhc3NlcyB8fCBbXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250ZW50OiBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgICAgICBidXR0b25zOiBvcHRpb25zLmJ1dHRvbnMsXG4gICAgICAgICAgICBzdWJtaXQ6IG9wdGlvbnMub25TdWJtaXQsXG4gICAgICAgICAgICBpZDogaWQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVpTm90aWZpY2F0aW9uKG1zZzogc3RyaW5nLCB0eXBlOiBzdHJpbmcgPSAnaW5mbycpIHtcbiAgICAgICAgaWYgKHVpLm5vdGlmaWNhdGlvbnMpIHtcbiAgICAgICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy5lcnJvcihtc2cpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICd3YXJuJzpcbiAgICAgICAgICAgICAgICAgICAgdWkubm90aWZpY2F0aW9ucy53YXJuKG1zZyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luZm8nOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHVpLm5vdGlmaWNhdGlvbnMuaW5mbyhtc2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VuZENoYXQoXG4gICAgICAgIHNwZWFrZXI6IERuZEFjdG9yNWUsXG4gICAgICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgZmxhdm9yPzogc3RyaW5nLFxuICAgICAgICBzb3VuZD86IHN0cmluZyxcbiAgICAgICAgd2hpc3Blcjogc3RyaW5nW10gPSBbXSxcbiAgICAgICAgdHlwZTogMCB8IDEgfCAyIHwgMyB8IDQgfCA1ID0gQ09OU1QuQ0hBVF9NRVNTQUdFX1RZUEVTLk9USEVSXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IENoYXREYXRhID0ge1xuICAgICAgICAgICAgc3BlYWtlcjogQ2hhdE1lc3NhZ2UuZ2V0U3BlYWtlcih7IGFjdG9yOiBzcGVha2VyIH0pLFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGZsYXZvcixcbiAgICAgICAgICAgIHNvdW5kLFxuICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgIHdoaXNwZXIsXG4gICAgICAgIH07XG4gICAgICAgIENoYXRNZXNzYWdlLmNyZWF0ZShDaGF0RGF0YSk7XG4gICAgfVxuXG4gICAgZ2V0TG9jYWxpemVkVHh0KFxuICAgICAgICBrZXk6IHN0cmluZyxcbiAgICAgICAgb3B0cz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0sXG4gICAgICAgIGZvcm1hdDogYm9vbGVhbiA9IGZhbHNlXG4gICAgKSB7XG4gICAgICAgIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIHJldHVybiAoZ2FtZSBhcyBhbnkpLmkxOG4uZm9ybWF0KGtleSwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChnYW1lIGFzIGFueSkuaTE4bi5sb2NhbGl6ZShrZXksIG9wdHMpO1xuICAgIH1cblxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gJ2NsYXNzIFVpTWFuYWdlcic7XG4gICAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsImltcG9ydCBNb2R1bGVNYW5hZ2VyIGZyb20gJy4vbW9kdWxlL21hbmFnZXJzL01vZHVsZU1hbmFnZXInO1xuaW1wb3J0IFRlbXBsYXRlTWFuYWdlciBmcm9tICcuL21vZHVsZS9tYW5hZ2Vycy9UZW1wbGF0ZU1hbmFnZXInO1xuXG5pbXBvcnQgbW9kdWxlSnNvbiBmcm9tICcuLi9tb2R1bGUuanNvbic7XG5cbkhvb2tzLm9uY2UoJ2luaXQnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coJ1dlYXBvbiBSZWxvYWQgfCBGb3VuZHJ5IFZUVCBNb2R1bGUnKTtcblxuICAgIGNvbnN0IHdlYXBvbl9yZWxvYWQgPSBuZXcgTW9kdWxlTWFuYWdlcihtb2R1bGVKc29uLmlkKTtcbiAgICB3ZWFwb25fcmVsb2FkLmluaXQoKTtcbn0pO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcpIHtcbiAgICBpZiAobW9kdWxlLmhvdCkge1xuICAgICAgICBtb2R1bGUuaG90LmFjY2VwdCgpO1xuXG4gICAgICAgIGlmIChtb2R1bGUuaG90LnN0YXR1cygpID09PSAnYXBwbHknKSB7XG4gICAgICAgICAgICBUZW1wbGF0ZU1hbmFnZXIub25Ib3RSZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IF9fd2VicGFja19wdWJsaWNfcGF0aF9fICsgXCJzdHlsZXMvbW9kdWxlLmNzc1wiOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==