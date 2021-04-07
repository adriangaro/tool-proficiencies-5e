
import { MODULE_NAME, updateToolProficiencies } from './utils.js';
import { extendedToolsData, toolType } from './data.js';
export default class ToolProficiencies5eSettings extends FormApplication {
	static init() {
        console.log()
        const itemCompendiums = game.data.packs
        .filter((pack) => pack.entity === "Item")
        .reduce((choices, pack) => {
          choices[
            `${pack["package"]}.${pack.name}`
          ] = `[${pack.package}] ${pack.label}`;
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

        game.settings.register(MODULE_NAME, "tool-list", {
            name: "tool-proficiencies-5e.tool-list.name",
            hint: "tool-proficiencies-5e.tool-list.hint",
            scope: "world",
            config: false,
            type: Object,
            default: extendedToolsData,
            onChange: updateToolProficiencies
        });

		game.settings.registerMenu(MODULE_NAME, 'tool-menu', {
            name: '',
            label: game.i18n.localize("tool-proficiencies-5e.tool-menu.label"),
            icon: 'fas fa-cog',
            type: ToolProficiencies5eSettings,
            restricted: true
        });
    }

	// settings template
	static get defaultOptions() {
		return {
			...super.defaultOptions,
			template: `modules/${MODULE_NAME}/templates/settings.hbs`,
			height: 500,
			title: game.i18n.localize("tool-proficiencies-5e.ModuleName"),
			width: 600,
			classes: ["tool-proficiencies-5e", "settings"],
			submitOnClose: true
		}
	}

	constructor(object = {}, options) {
		super({tools: mergeObject([], game.settings.get(MODULE_NAME, 'tool-list')).map(v => {
            v.open = false;
            return v;
        })}, options);
	}

	_getHeaderButtons() {
		let btns = super._getHeaderButtons();
		btns[0].label = "Close";
		return btns;
	}		

	getData(options) {
		let data = super.getData(options);
        data.types = toolType;
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);

        html.find('.toggle').on('click', (e) => {
            this.submit({ preventClose: true }).then(() => {  
                const index = e.target.dataset.index;
                const open = e.target.dataset.open == "true";
                this.object.tools.forEach(tool => {
                    tool.open = false;
                });
                this.object.tools[index].open = !open;
                this.render()
            });
        });
        html.find('.delete').on('click', (e) => {
            confirmDialog(`Delete ${this.object.tools[e.target.dataset.index].name}?`, confirm => {
                if (confirm) {
                    this.submit({ preventClose: true }).then(() => {  
                        const index = e.target.dataset.index;
                        this.object.tools.splice(index, 1);
                        this.render();
                    });
                }
            })
            
        });
        html.find('#add-tool').on('click', (e) => {
            this.submit({ preventClose: true }).then(() => {  
                this.object.tools.push({
                    key: "",
                    name: "",
                    type: "other",
                    description: "<p>Insert tool text here</p>"
                });
                this.render();
            });
        });

        html.find('[name=submit]').on('click', (e) => {
            e.preventDefault();
            this.submit().then(_ => game.settings.set(MODULE_NAME, 'tool-list', this.object.tools));
        });

        html.find('[name=reset]').on('click', (e) => {
            e.preventDefault();
            confirmDialog("Reset?", confirm => {
                if (confirm) {
                    this.object.tools = mergeObject([], game.settings.get(MODULE_NAME, 'tool-list')).map(v => {
                        v.open = false;
                        return v;
                    });
                    this.render();
                }
            });
        });

        html.find('[name=import]').on('click', (e) => {
            e.preventDefault();
            let confirmed = false;
            new Dialog({
                title: "Import Tools",
                content: `
                 <form>
                  <div class="form-group stacked">
                   <label>JSON:</label>
                   <textarea id="import-value" name="import-value"></textarea>
                  </div>
                 </form>
                 `,
                buttons: {
                    one: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Import",
                        callback: () => confirmed = true
                    },
                    two: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => confirmed = false
                    }
                },
                default: "Cancel",
                close: async html => {
                    if (confirmed) {
                        const j = JSON.parse(html.find('[name=import-value]')[0].value);
                        this.object.tools = j;
                        this.render();
                    }
                }
            }).render(true);
        });

        html.find('[name=export]').on('click', (e) => {
            e.preventDefault();
            new Dialog({
                title: "Export Tools",
                content: `
                 <form>
                  <div class="form-group stacked">
                   <label>JSON:</label>
                   <textarea id="export-value" name="export-value" readonly>${JSON.stringify(this.object.tools)}</textarea>
                  </div>
                 </form>
                 `,
                buttons: {
                    two: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel"
                    }
                },
                default: "Cancel",
            }).render(true);
        });
	}

	_updateObject(ev, formData) {
		this.object.tools = Object.values(expandObject(formData)?.tools || {}).map(v => {
            delete v.open;
            return v;
        });
	}	
}

const confirmDialog = (title, callback) => {
    let confirmed = false;
    new Dialog({
        title,
        content: ``,
        buttons: {
            one: {
                icon: '<i class="fas fa-check"></i>',
                label: "Confirm",
                callback: () => confirmed = true
            },
            two: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel",
                callback: () => confirmed = false
            }
        },
        default: "Cancel",
        close: async html => {
            callback(confirmed);
        }
    }).render(true);
}