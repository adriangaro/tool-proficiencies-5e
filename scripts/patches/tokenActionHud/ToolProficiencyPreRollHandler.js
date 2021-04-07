
import { PreRollHandler } from '/modules/token-action-hud/scripts/rollHandlers/preRollHandler.js';
import { MODULE_NAME } from '../../utils.js';

export class ToolProficienciesPreRollHandler extends PreRollHandler {
    constructor() {super();}

    /** @override */
    prehandleActionEvent(event, encodedValue) {
        let payload = encodedValue.split('|');
        
        if (payload.length != 3)
            return false;
        
        let macroType = payload[0];
        let tokenId = payload[1];
        let tool = payload[2];

        if (macroType != MODULE_NAME)
            return false;

        this._roolTool(event, tokenId, tool);
        return true;
    }

    _roolTool(event, tokenId, tool) {
        let actor = super.getActor(tokenId);

        actor.rollTool(tool);
    }
}