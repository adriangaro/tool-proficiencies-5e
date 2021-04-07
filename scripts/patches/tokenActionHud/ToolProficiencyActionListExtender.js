import { MODULE_NAME, getItemCompendium, getToolImage, getToolData } from "../../utils.js";
import { ActionListExtender } from '/modules/token-action-hud/scripts/actions/actionListExtender.js';
import { DND5E } from "/systems/dnd5e/module/config.js";

export class ToolProficiencyActionListExtender extends ActionListExtender {
    constructor() { super(); }

    /** @override */
    extendActionList(actionList, multipleTokens) {
        if (multipleTokens)
            return;
            
        let tokenId = actionList.tokenId;
        let actorId = actionList.actorId;

        if (!actorId)
            return;

        let actor = game.actors.get(actorId);

        if (!(actor))
            return;

        
        const toolData = getToolData(actor)

        let toolsCategory = this.initializeEmptyCategory('toolsProficiencies');
        toolsCategory.name = this.i18n(`${MODULE_NAME}.Tools`);


        Object.keys(CONFIG.DND5E.toolTypes).forEach(type => {
            let subcategory = this.initializeEmptySubcategory();
            const tools = toolData.filter(t => t.type == type && t.prof >= 1);
            tools.forEach(tool => {
                let encodedValue = [MODULE_NAME, tokenId, tool.key].join('|');
                let toolAction = {name: tool.name, id: tool.key, encodedValue: encodedValue, img: tool.img};
                subcategory.actions.push(toolAction);
            })
            this._combineSubcategoryWithCategory(toolsCategory, this.i18n(CONFIG.DND5E.toolTypes[type]), subcategory);
        });

       
        
        this._combineCategoryWithList(actionList, toolsCategory.name, toolsCategory, true);
    }
}