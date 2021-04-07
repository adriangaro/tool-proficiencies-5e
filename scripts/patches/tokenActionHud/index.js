import { Dnd5eSystemManager } from "/modules/token-action-hud/scripts/managers/dnd5e.js";
import { ToolProficiencyActionListExtender } from "./ToolProficiencyActionListExtender.js";
import { ToolProficienciesPreRollHandler } from "./ToolProficiencyPreRollHandler.js";


export const patchTokenActionHud = () => {
    const oldGetActionHandler5e = Dnd5eSystemManager.prototype.doGetActionHandler;
    Dnd5eSystemManager.prototype.doGetActionHandler = function(filterManager, categoryManager) {
        const ret = oldGetActionHandler5e.call(this, filterManager, categoryManager);
        ret.addFurtherActionHandler(new ToolProficiencyActionListExtender());
        return ret;
    }
    
    const oldGetRollHandler = Dnd5eSystemManager.prototype.doGetRollHandler;

    Dnd5eSystemManager.prototype.doGetRollHandler = function(handlerId) {
        const handler = oldGetRollHandler.call(this, handlerId);
        handler.addPreRollHandler(new ToolProficienciesPreRollHandler());
        return handler;
    }
}