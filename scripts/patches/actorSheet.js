import { i18n, MODULE_NAME, getChatData, getToolData, checkActor } from "../utils.js";
import { libWrapper } from "../libWrapperShim.js";
import { tidy5eToolCard } from '../compat/tidy5e.js';

export async function patchActorSheet5eCharacterRenderInner() {
  console.log("Patching ActorSheet5eCharacter.prototype._renderInner");
  libWrapper.register(MODULE_NAME, 'game.dnd5e.applications.ActorSheet5eCharacter.prototype._renderInner', async function (
    wrapper,
    data,
    options
  ) {
    const html = await wrapper(data, options);
    try {
      let isTidy = false;
      try {
        const { Tidy5eSheet } = await import("/modules/tidy5e-sheet/scripts/tidy5e-sheet.js");
        isTidy = this instanceof Tidy5eSheet;
      } catch(e) {}
      console.log(isTidy);
      await injectActorSheet(this, this.object, html, isTidy);
    } catch (e) {console.error(e);}
    return html;
  }, 'WRAPPER');
}

async function injectActorSheet(sheet, actor, html, isTidy5e) {
  checkActor(actor);
  sheet._filters.tools = sheet._filters.tools ?? new Set(["1", "2"]);
  const tabSelector = html.find( `nav.tabs`);
  const toolTabString = `<a class="item" data-group="primary" data-tab="toolsProficiencies">${i18n(
    `${MODULE_NAME}.Tools`
  )}</a>`;
  tabSelector.append($(toolTabString));

  const sheetContainer = html.find(`.sheet-body`);
  const tabContainer = $(
    `<div class="tab" data-group="primary" data-tab="toolsProficiencies"></div>`
  );
  sheetContainer.append(tabContainer);
  let toolData = getToolData(actor);

  toolData = toolData.filter((tool) => {
    if (!(tool.key in CONFIG.DND5E.toolProficiencies)) return false;
    if (sheet._filters.tools.size == 0) return true;
    return sheet._filters.tools.has(tool.prof.toString());
  });

  const sections = Object.keys(CONFIG.DND5E.toolTypes).map(type => {
    return [
      type, 
      toolData.filter(t => t.type == type)
    ];
  }).reduce((p, [k, v]) => {
      p[k] = {
        items: v,
        label: CONFIG.DND5E.toolTypes[k]
      };
      return p;
  }, {});

  let template = await renderTemplate(
    `modules/${MODULE_NAME}/templates/tool-proficiencies.hbs`,
    {
      config: CONFIG.DND5E,
      sections,
      MODULE_NAME: MODULE_NAME,
      isTidy5e,
      owner: actor.owner
    }
  );
  tabContainer.append(template);

  tabContainer.find('.item .item-name.rollable h4').click(event => _onItemSummary(actor, event));

  toolData.forEach((tool) => {
    const row = html.find(
      `[data-tab="toolsProficiencies"] [data-tool-id="${tool.key}"]`
    );
    row.find(".item-image").click(async (event) => {
      actor.rollTool(tool.key);
    });

    let isFav = tool.isFavorite;
    if (isTidy5e) {
      let favBtn = $(`<a class="item-control item-fav ${isFav ? 'active' : ''}" data-fav="${isFav}" title="${isFav ? game.i18n.localize("TIDY5E.RemoveFav") : game.i18n.localize("TIDY5E.AddFav")}"><i class="${isFav ? "fas fa-bookmark" : "far fa-bookmark"}"></i><span class="control-label">${isFav ? game.i18n.localize("TIDY5E.RemoveFav") : game.i18n.localize("TIDY5E.AddFav")}</span></a>`);
      favBtn.click(ev => {
        actor.update({ [`flags.${MODULE_NAME}.tools.${tool.key}.isFavorite`]: !isFav });
      });
      html.find(`.item[data-tool-id="${tool.key}"]`).find('.item-controls').append(favBtn);

    }
  });
  if (isTidy5e) {
    const { tidy5eContextMenu } = await import('/modules/tidy5e-sheet/scripts/app/context-menu.js');
    tidy5eContextMenu(tabContainer);
    tidy5eToolCard(html, actor);
  }
}


const _onItemSummary = (actor, event) => {
  event.preventDefault();
    let li = $(event.currentTarget).parents(".item");
    const chatData = getChatData(actor, li.data("tool-id"));
    // Toggle summary
    if ( li.hasClass("expanded") ) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      let div = $(`<div class="item-summary">${chatData.description}</div>`);
      let props = $(`<div class="item-properties"></div>`);
      chatData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
      div.append(props);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
}

// const _initializeFilterItemList = (actor, ul) => {
//   const set = actor.data.flags[MODULE_NAME]?.filters ?? [];
//   const filters = ul.querySelectorAll(".filter-item");
//   for ( let li of filters ) {
//     if ( set.includes(li.dataset.filter) ) li.classList.add("active");
//   }
// }

// const _onToggleFilter = (actor, event) => {
//   const set = actor.data.flags[MODULE_NAME]?.filters ?? [];
//   const filter = event.target.dataset.filter;
//   if (set.includes(filter)) {
//     set.splice(set.findIndex(f => f == filter), 1);
//   } else {
//     set.push(filter);
//   }
//   actor.update({ [`flags.${MODULE_NAME}.filters`]: filters });
// }