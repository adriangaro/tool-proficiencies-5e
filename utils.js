const toolProfCodeMapping = {
    disg: "Disguise Kit",
    forg: "Forgery Kit",
    herb: "Herbalism Kit",
    navg: "Navigator's Tools",
    pois: "Poisoner's Kit",
    thief: "Thieves' Tools",
  };
  

export const getToolProficiencies = (actor) => {
    return actor.data.data.traits.toolProf ? actor.data.data.traits.toolProf.value.map(v => toolProfCodeMapping[v]).filter(v => v!= null).concat(actor.data.data.traits.toolProf.custom.split(";")) : []; 
}
