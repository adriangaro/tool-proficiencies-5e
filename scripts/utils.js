
import { toolType } from "./data.js";

export const MODULE_NAME = "tool-proficiencies-5e";

export const getToolProficiencies = (actor) => {
  actor = migrateActorProficiencies(actor);
  return mergeObject({}, actor.data.flags[MODULE_NAME]?.tools);
}

export const getModifier = (tool, actor) => {
  const abilities = actor.data.data.abilities;
  const prof = actor.data.data.attributes.prof;

  let bonus = parseInt(Number(tool.bonus)) || 0;
  if (tool.ability == "-") return (bonus + Math.floor(tool.prof * Number(prof))).toString();
  else {
    let mod = abilities[tool.ability].mod;
    return (
      mod +
      bonus +
      Math.floor(tool.prof * Number(prof))
    ).toString();
  }
  
}

export const getChatData = (actor, tool) => {
  const toolData = actor.data.data.tools[tool];
  const defaultToolData = CONFIG.DND5E.toolProficienciesData[tool];

  const properties = [];

  properties.push(CONFIG.DND5E.proficiencyLevels[toolData.prof]);
  if (toolData.ability != "-") {
    properties.push(CONFIG.DND5E.abilities[toolData.abilities]);
  }
  properties.push(i18n(CONFIG.DND5E.toolTypes[defaultToolData.type]));

  return {
    description: defaultToolData.description,
    properties
  }
}

export const getToolData = (actor) => {
  return Object.entries(mergeObject({}, actor.data.data.tools)).filter(([k, v]) => {
    return k in CONFIG.DND5E.toolProficienciesData
  }).map(([k, v]) => {
    v.key = k;
    v.name = CONFIG.DND5E.toolProficienciesData[k].name;
    v.description = CONFIG.DND5E.toolProficienciesData[k].description;
    v.type = CONFIG.DND5E.toolProficienciesData[k].type;
    v.isFavorite = Boolean(actor.data.flags[MODULE_NAME].tools[k].isFavorite);
    v.img = CONFIG.DND5E.toolProficienciesData[k].img;
    return v;
  });
}

export function i18n(key) {
  return game.i18n.localize(key);
}

export function isModuleActive(id) {
  let module = game.modules.get(id);
  return module && module.active;
}


export function getItemCompendium() {
  return game.packs.find(
    (pack) => pack.collection == game.settings.get(MODULE_NAME, "tool-compendium")
  );
}

const toolTypeLookup = {
  "other": "/systems/dnd5e/icons/items/equipment/gloves.jpg",
  "artisan": "/systems/dnd5e/icons/items/inventory/hammer.jpg",
  "instrument": "/systems/dnd5e/icons/items/inventory/lute.jpg",
  "gaming": "/systems/dnd5e/icons/items/inventory/dice.jpg",
  "vehicle": "/systems/dnd5e/icons/items/inventory/horseshoe.jpg"
}

export function getToolImage(compendiumIndex, tool) {
  return compendiumIndex?.find(item => item.name == tool.name)?.img || toolTypeLookup[tool.type] || "/systems/dnd5e/icons/items/equipment/gloves.jpg";
}

export function getToolKeyFromName(name) {
  return Object.entries(CONFIG.DND5E.toolProficiencies).find(([key, value]) => value == name)?.[0];
}

export function getToolNameFromKey(key) {
  return CONFIG.DND5E.toolProficiencies[key];
}

export async function updateToolProficiencies(allToolData) {
  const compendium = getItemCompendium();
  const index = await compendium?.getIndex();
  CONFIG.DND5E.toolTypes = toolType;
  CONFIG.DND5E.toolProficienciesData = allToolData.reduce((p, tool) => {
    tool.img = getToolImage(index, tool);
    p[tool.key] = tool;
    return p;
  }, {});
  CONFIG.DND5E.toolProficiencies = allToolData.reduce((p, tool) => {
    p[tool.key] = tool.name;
    return p;
  }, {});

  window.Tools5e.updatedToolsAt = Date.now();
  game.actors.entities.filter(a => a.sheet.rendered).forEach(a => a.sheet.render(true));
}

export function migrateActorProficiencies(actor) {
  // Early bailout
  if (!CONFIG.DND5E.toolProficienciesData) return actor;

  let tools = actor.data.flags[MODULE_NAME];
  let migrated = false;
  if (!tools?.version) {
    tools = migrateLegacyToolsProficiencies(actor, tools);
    migrated = true;
  }

  Object.keys(CONFIG.DND5E.toolProficienciesData).forEach((k) => {
    if (!(k in tools.tools)) {
      migrated = true;
      tools.tools[k] = {
        ability: "-",
        bonus: "",
        prof: actor?.data?.data?.traits?.toolProf?.value?.includes(k) ? 1 : 0
      }
    }
  });
  
  if (migrated) {
    actor.data.flags[MODULE_NAME] = tools;
    actor.update(actor.data);
  }
  return actor;
}

export function migrateFromVanillaTools(actor) {
  const toolsProfs = Array.from(new Set(actor.data.data.traits.toolProf ? actor.data.data.traits.toolProf.value.map(v => CONFIG.DND5E.toolProficiencies[v]).filter(v => v!= null).concat(actor.data.data.traits.toolProf.custom ? actor.data.data.traits.toolProf.custom.split(";").map(t => t.trim()) : []) : [])); 
  return toolsProfs.reduce((p, v) => {
    p[v] = {
      ability: "-",
      bonus: "",
      prof: 1
    }
    return p;
  }, {});
}

export function migrateLegacyToolsProficiencies(actor, tools) {
  if (!tools) {
    tools = migrateFromVanillaTools(actor);
  }
  const existingTools = Object.entries(tools || {}).filter(([k, v]) => getToolKeyFromName(k));
  // const customTools = Object.entries(tools || {}).filter(([k, v]) => !getToolKeyFromName(k)).reduce((p, [k, v]) => {
  //   p[k] = {
  //     ability: v.ability || "-",
  //     bonus: v.bonus || "",
  //     prof: v.prof || 0
  //   }
  //   return p;
  // }, {});

  const toolData = Object.keys(CONFIG.DND5E.toolProficiencies).reduce((p, t) => {
    p[t] = {
      ability: "-",
      bonus: "",
      prof: 0
    }
    return p;
  }, {});

  existingTools.forEach(([k, v]) => {
    toolData[getToolKeyFromName(k)] = {
      ability: v.ability || "-",
      bonus: v.bonus || "",
      prof: v.prof || 0
    }
  });

  const flags = {
    version: 1,
    tools: toolData,
    // customTools
  }
  return flags;
}

export const clearActorToolFlags = (actor) => {
  return actor.update({ "flags.-=tool-proficiencies-5e": null });
}

export const addToolProficiency = (key, name, type, description) => {
  const tools = mergeObject([], game.settings.get(MODULE_NAME, 'tool-list'));
  tools.push({
    key, name, type, description
  });
  game.settings.set(MODULE_NAME, 'tool-list', tools);

}

export const removeToolProficiency = key => {
  const tools = mergeObject([], game.settings.get(MODULE_NAME, 'tool-list'));
  tools.splice(tools.findIndex(t => t.key == key), 1);
  game.settings.set(MODULE_NAME, 'tool-list', tools);
}

export const checkActor = (actor) => {
  if (window.Tools5e.updatedToolsAt && actor.data.flags[MODULE_NAME].updated != window.Tools5e.updatedToolsAt) {
    migrateActorProficiencies(actor);
    actor.data.flags[MODULE_NAME].updated = window.Tools5e.updatedToolsAt;
    actor.prepareData();
  }
}