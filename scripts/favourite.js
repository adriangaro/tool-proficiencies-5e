import { MODULE_NAME, getToolImage, getItemCompendium } from "./utils.js";

export const addFavorites = async (app, html, data) => {
    const addFavs = async () => {
        let favContent = html.find('.favorites-target > .favorites');
        if (favContent.length == 0) {
            setTimeout(addFavs, 200);
            return;
        }
        const actor = app.object;
    

        const toolProficiencies = Object.values(actor.data.data.tools).filter(tool => tool.isFavorite);

        if (toolProficiencies.length == 0) return;

        const compendium = getItemCompendium();
        const index = compendium?.index;
    
        for (let toolData of toolProficiencies) {
            toolData.img = getToolImage(index, toolData.label);
        }
    
        let favHtml = $(await renderTemplate(`modules/${MODULE_NAME}/templates/tidy-fav-tool.hbs`, {
            toolProficiencies,
            MODULE_NAME
        }));
    
        toolProficiencies.forEach((tool) => {
            const row = favHtml.find(
              `[data-item-id="${tool.label}"]`
            );
            row.find(".item-name").click((event) => {
              actor.rollTool(tool.label);
            });

            row.find('.item-fav').click(ev => {
                actor.update({ [`flags.${MODULE_NAME}.${tool.label}.isFavorite`]: !tool.isFavorite });
            });
        });
        
        favContent.append(favHtml);
    }

    addFavs();
}

   