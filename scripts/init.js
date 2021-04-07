import { patchActorSheet5eCharacterRenderInner } from './patches/actorSheet.js';
import { patchActor5ePrepareData, addActor5eRollTool } from './patches/actor.js'
import { patchItemEntityAndSheet } from './patches/item.js'
import { isModuleActive, migrateActorProficiencies, MODULE_NAME, updateToolProficiencies, clearActorToolFlags, addToolProficiency, removeToolProficiency } from './utils.js';
import ToolProficiencies5eSettings from './settings.js';

import { addFavorites } from './favourite.js';


Hooks.once("init", () => { });

Hooks.once("setup", () => {
  if (isModuleActive("token-action-hud")) {
    import('./patches/tokenActionHud/index.js').then(({patchTokenActionHud}) => {
      patchTokenActionHud();
    })
  }
});

Hooks.once("ready", () => {
  window.Tools5e = {
    migrateActorProficiencies,
    clearActorToolFlags,
    addToolProficiency,
    removeToolProficiency,
    updateToolProficiencies
  };

  ToolProficiencies5eSettings.init();
  updateToolProficiencies(game.settings.get(MODULE_NAME, 'tool-list'));

  patchActor5ePrepareData();
  addActor5eRollTool();
  patchActorSheet5eCharacterRenderInner();
  patchItemEntityAndSheet();
});



Hooks.on("renderTidy5eSheet", (app, html, data) => {
	addFavorites(app, html, data);
});
