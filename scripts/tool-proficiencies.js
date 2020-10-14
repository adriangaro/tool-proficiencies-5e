import { d20Roll } from "/systems/dnd5e/module/dice.js";
import ActorSheet5eCharacter from '/systems/dnd5e/module/actor/sheets/character.js';

import { getToolProficiencies } from "./utils.js";

const MODULE_NAME = "tool-proficiencies-5e";

function i18n(key) {
  return game.i18n.localize(key);
}

Hooks.once("init", () => { });

Hooks.once("setup", () => {
  patchActor5ePrepareData();
  addActor5eRollTool();
  patchActorSheet5eCharacterRenderInner();
});

Hooks.once("ready", () => {
  const itemCompendiums = game.packs
    .filter((pack) => pack.entity === "Item")
    .reduce((choices, pack) => {
      choices[
        pack.collection
      ] = `[${pack.metadata.package}] ${pack.metadata.label}`;
      return choices;
    }, {});
  game.settings.register(MODULE_NAME, "tool-compendium", {
    name: "tool-proficiencies-5e.tool-compendium.name",
    hint: "tool-proficiencies-5e.tool-compendium.hint",
    scope: "world",
    config: true,
    type: String,
    isSelect: true,
    default: "dnd5e.items",
    choices: itemCompendiums,
  });
});

// Hooks.on("renderActorSheet5eCharacter", injectActorSheet);

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
});

function patchActor5ePrepareData() {
  const oldPrepareData = CONFIG.Actor.entityClass.prototype.prepareData;

  CONFIG.Actor.entityClass.prototype.prepareData = function () {
    try {
      oldPrepareData.call(this);
    } catch (e) { }

    const toolProficiencies = getToolProficiencies(this);
    const abilities = this.data.data.abilities;
    const prof = this.data.data.attributes.prof;
    toolProficiencies.forEach((tool) => {
      const toolData = this.getFlag(MODULE_NAME, tool) || {
        ability: "-",
        bonus: 0,
        expertise: false,
        modifier: "?",
        label: tool,
      };

      if (toolData.ability == "-") toolData.modifier = "?";
      else {
        let mod = abilities[toolData.ability].mod;
        let bonus = parseInt(Number(toolData.bonus));
        toolData.modifier = (
          prof +
          mod +
          bonus +
          (toolData.expertise ? prof : 0)
        ).toString();
      }
      this.setFlag(MODULE_NAME, tool, toolData);
    });
  };
}

async function openQueryDialog() {
  let confirmed = false;
  return new Promise((resolve, reject) => {
    new Dialog({
      title: "Choose which ability to use along the tool",
      content: `
            <form>
                <div class="form-group">
                    <label>Ability:</label>
                    <select id="ability-value" name="ability-value">
                        <option value="-">None</option>
                        <option value="str">Strength</option>
                        <option value="dex">Dexterity</option>
                        <option value="con">Constitution</option>
                        <option value="int">Intelligence</option>
                        <option value="wis">Wisdom</option>
                        <option value="cha">Charisma</option>
                    </select>
                </div>
            </form>
            `,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: "Roll",
          callback: () => confirmed = true
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => confirmed = false
        },
      },
      default: "Cancel",
      close: async (html) => {
        if (confirmed) {
          resolve(html.find("[name=ability-value]")[0].value);
        } else {
          reject("Roll cancelled");
        }
      },
    }).render(true);
  });
}


function addActor5eRollTool() {
  CONFIG.Actor.entityClass.prototype.rollTool = async function (
    tool,
    options = {}
  ) {
    const toolData = this.getFlag(MODULE_NAME, tool);

    const ability =
      !toolData || toolData.ability == "-"
        ? await openQueryDialog()
        : toolData.ability;
    const abilities = this.data.data.abilities;
    const mod = (ability == "-" ? 0 : abilities[ability].mod) || 0;
    const prof = this.data.data.attributes.prof || 0;
    const jota = this.getFlag("dnd5e", "jackOfAllTrades") || false;

    const bonuses = getProperty(this.data.data, "bonuses.abilities") || {};

    // Compose roll parts and data
    const parts = ["@mod"];
    const data = {
      mod:
        mod + (toolData
          ? toolData.expertise
            ? prof * 2
            : prof
          : jota * Math.floor(prof / 2)),
    };
    console.log(data);

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

    // Add provided extra roll parts now because they will get clobbered by mergeObject below
    if (options.parts?.length > 0) {
      parts.push(...options.parts);
    }

    // Reliable Talent applies to any skill check we have full or better proficiency in
    const reliableTalent = toolData && this.getFlag("dnd5e", "reliableTalent");

    // Roll and return
    const rollData = mergeObject(options, {
      parts: parts,
      data: data,
      title: tool,
      halflingLucky: this.getFlag("dnd5e", "halflingLucky"),
      reliableTalent: reliableTalent,
    });
    rollData.speaker =
      options.speaker || ChatMessage.getSpeaker({ actor: this });
    return d20Roll(rollData);
  };
}

async function patchActorSheet5eCharacterRenderInner() {
  console.log("Patching ActorSheet5eCharacter.prototype._renderInner");
  const old_renderInner = ActorSheet5eCharacter.prototype._renderInner;
  ActorSheet5eCharacter.prototype._renderInner = async function(data, options) {
    const html = await old_renderInner.call(this, data, options);
    try {
      await injectActorSheet(this.object, html);
    } catch (e) {}
    return html;
  }
}


async function injectActorSheet(actor, html) {
  const tabSelector = html.find(`nav.sheet-navigation.tabs`);
  const toolTabString = `<a class="item" data-group="primary" data-tab="toolsProficiencies">${i18n(
    "Tools"
  )}</a>`;
  tabSelector.append($(toolTabString));

  const sheetContainer = html.find(`.sheet-body`);
  const tabContainer = $(`<div class="tab" data-group="primary" data-tab="toolsProficiencies"></div>`);
  sheetContainer.append(tabContainer);
  

  const toolProficiencies = getToolProficiencies(actor).map((tool) =>
    actor.getFlag(MODULE_NAME, tool)
  );
  const compendium = await game.packs.find(
    (pack) =>
      pack.collection === game.settings.get(MODULE_NAME, "tool-compendium")
  );
  const index = compendium && (await compendium.getIndex());

  for (let toolData of toolProficiencies) {
    const item = index && index.find((i) => i.name == toolData.label);
    toolData.img = item
      ? (await compendium.getEntity(item._id)).img
      : "/systems/dnd5e/icons/items/equipment/gloves.png";
  }

  let template = await renderTemplate(
    `modules/${MODULE_NAME}/templates/tool-proficiencies.hbs`,
    {
      DND5E: CONFIG.DND5E,
      toolProficiencies,
      MODULE_NAME: MODULE_NAME
    }
  );
  tabContainer.append(template);

  toolProficiencies.forEach((tool) => {
    const row = html.find(
      `[data-tab="toolsProficiencies"] [data-item-id="${tool.label}"]`
    );
    row.find(".item-name").click((event) => {
      actor.rollTool(tool.label);
    });
  });
}
