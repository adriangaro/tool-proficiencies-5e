import { MODULE_NAME, getToolProficiencies, getModifier } from "../utils.js";
import { d20Roll } from "/systems/dnd5e/module/dice.js";
import { libWrapper } from '../libWrapperShim.js';

export function patchActor5ePrepareData() {
  console.log("Patching CONFIG.Actor.entityClass.prototype.prepareData");
  libWrapper.register(MODULE_NAME, 'CONFIG.Actor.entityClass.prototype.prepareData', function (wrapper) {
    try {
      wrapper();
    } catch (e) {console.error(e);}

    const toolProficiencies = getToolProficiencies(this);
    const jota = this.getFlag("dnd5e", "jackOfAllTrades");

    Object.keys(toolProficiencies).forEach(key => {
      if (jota && toolProficiencies[key].prof == 0) {
        toolProficiencies[key].prof = 0.5;
      }
      toolProficiencies[key].modifier = getModifier(toolProficiencies[key], this);
    });
    this.data.data.tools = toolProficiencies;
  }, 'WRAPPER');
}

export function getToolDataPartsAndData(actor, tool, ability, options) {
  const toolData = actor.data.data.tools[tool] || {
    ability: "-",
    prof: 0,
    bonus: ""
  };
  const prof = actor.data.data.attributes.prof || 0;

  ability = ability ?? options?.item?.ability ?? toolData.ability;

  const abilities = actor.data.data.abilities;
  const mod = (ability == "-" ? 0 : abilities[ability].mod) || 0;

  const bonuses = getProperty(actor.data.data, "bonuses.abilities") || {};

  // Compose roll parts and data
  const parts = ["@mod", "@prof"];
  const data = mergeObject({
    prof: Math.floor(toolData.prof * Number(prof)),
    item: {
      ability
    },
    abilities: abilities
  }, options.data || {}, {
    overwrite: true,
    insertValues: true
  });

  data.mod = mod

  if (data.prof < 0) {
    data.prof = Math.floor(toolData.prof * Number(prof));
  }

  if (data.item.ability == '') {
    data.item.ability = ability;
  }

  // Ability test bonus
  if (bonuses.check) {
    data["checkBonus"] = bonuses.check;
    parts.push("@checkBonus");
  }

  // Skill check bonus
  if (bonuses.skill) {
    data["skillBonus"] = bonuses.skill;
    parts.push("@skillBonus");
  }

  if (toolData.bonus) {
    data["globalToolBonus"] = toolData.bonus;
    parts.push("@globalToolBonus");
  }

  if (data.item.bonus) {
    data["toolBonus"] = data.item.bonus;
    parts.push("@toolBonus");
  }

  // Add provided extra roll parts now because they will get clobbered by mergeObject below
  if (options.parts?.length > 0) {
    parts.push(...options.parts);
  }
  return [toolData, parts, data];
}


export function addActor5eRollTool() {
  CONFIG.Actor.entityClass.prototype.rollTool = function (
    tool,
    ability = null,
    options = {}
  ) {
    const [toolData, parts, data] = getToolDataPartsAndData(this, tool, ability, options);

    // Reliable Talent applies to any skill check we have full or better proficiency in
    const reliableTalent = toolData?.prof && this.getFlag("dnd5e", "reliableTalent");

    // Roll and return
    const rollData = mergeObject(options, {
      parts: parts,
      data: data,
      template: `modules/${MODULE_NAME}/templates/tool-roll-dialog.hbs`,
      title: CONFIG.DND5E.toolProficienciesData[tool]?.name ?? (options?.name ? options.name + " (No Tool Type)" : null) ?? "Unknown Tool",
      dialogOptions: {
        width: 400,
        top: options.event ? options.event.clientY - 80 : null,
        left: window.innerWidth - 710,
      },
      halflingLucky: this.getFlag("dnd5e", "halflingLucky"),
      reliableTalent: reliableTalent
    });
    rollData.speaker =
      options.speaker || ChatMessage.getSpeaker({ actor: this });
    return d20Roll(rollData);
  };
  
}
