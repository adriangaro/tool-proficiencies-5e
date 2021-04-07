import { MODULE_NAME, getToolData, getToolKeyFromName } from "../utils.js";
import { libWrapper } from '../libWrapperShim.js';
import ItemSheet5e from '/systems/dnd5e/module/item/sheet.js';

export function patchItemEntityAndSheet() {
    console.log("Patching CONFIG.Item.entityClass.prototype.prepareData");
    libWrapper.register(MODULE_NAME, 'CONFIG.Item.entityClass.prototype.prepareData', function (wrapper) {
        wrapper();
        const itemData = this.data;
        const data = itemData.data;
        if (itemData.type == "tool" && !("bonus" in itemData.data)) {
            data.toolType = getToolKeyFromName(Object.values(CONFIG.DND5E.toolProficiencies).find(v => this.name.includes(v)));
            // Swap from defaults
            if (data.proficient == 0 && (data.ability == "int" || data.ability[0] == "int")) {
                data.proficient = -1;
                data.ability = "";
            }
        }
        // console.error(itemData, data);
    }, 'WRAPPER');

    console.log("Patching CONFIG.Item.entityClass.prototype.rollToolCheck");
    libWrapper.register(MODULE_NAME, 'CONFIG.Item.entityClass.prototype.rollToolCheck', function (options) {
        return this.actor.rollTool(this.data.data.toolType, undefined, options = mergeObject(options, { data: this.getRollData(), name: this.name }));
    }, 'OVERRIDE');

    globalThis.ItemSheet5e = ItemSheet5e;
    console.log("Patching ItemSheet5e.prototype.template");
    libWrapper.register(MODULE_NAME, "ItemSheet5e.prototype.template", function (wrapped) {
        if (this.item.data.type == 'tool') {
            return `modules/${MODULE_NAME}/templates/item-tool-override.hbs`;
        }
        return wrapped();
    });
}