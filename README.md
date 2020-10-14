# tool-proficiencies-5e

## What it does

This module adds a new tab to the actor sheet which allows the user to roll any tools proficiencies declared on their character sheet.

For macros and other modules, the Actor class has a new function which is 'rollTool' which allows you to roll any tool check even if the actor doesn't have proficiency.

# Versions

- **0.1.1** 
  - Implemented tab injection into character actor sheets.
  - In this tab you will see all tools you have proficiencies, even cusotm added ones in the tool proficiencies section (the input marked with `Special`).
  - An exception to this are `Artisan's Tools`, `Gaming Set` and `Vehicles (Land and Water)` as encompass a group of tools instead of the tool themselves. If a tool can't be marked as proeficient using the checkbox, add them into the input box labeled Special in the proficiency modal.
  - The tools tab will show all your tools with which you are proficient and it allows you to customize the proficiency, eg. if you have expertise in it (useful for artificers), if you have a custom bonus (ie. maybe some magical item tool) or which attribute to use when rolling the tool (if none is selected, you are queried when rolling).
  - The tools can be rolled by clicking on their icon.
  - The tools will automatically take the icon of the item with the same name as the tools in the configured compendium in settings.
  - Patched `Actor5e.prorotype.prepareData` to add necesary flags on actor.
  - Added `rollTool` function to `Actor5e.prototype`. It can accept any tool as a string. If the actor doesn't have proficiency in the tool you passed, it will roll without proficiency (or half proficiency if you have Jack of all trades). `rollTool` behaves similarly to `rollSkill`.

