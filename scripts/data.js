export const extendedToolsData = [
    {
      key: 'alchemist',
      name: "Alchemist's Supplies",
      type: "artisan",
    },
    {
      key: "brewer",
      name: "Brewer's Supplies",
      type: "artisan",
    },
    {
      key: "caligrapher",
      name: "Calligrapher's Supplies",
      type: "artisan",
    },
    {
      key: "carpenter",
      name: "Carpenter's Tools",
      type: "artisan",
    },
    {
      key: "cartographer",
      name: "Cartographer's Tools",
      type: "artisan",
    },
    {
      key: 'cobbler',
      name: "Cobbler's Tools",
      type: "artisan",
    },
    {
      key: "cook",
      name: "Cook's Utensils",
      type: "artisan",
    },
    {
      key: "glassblower",
      name: "Glassblower's Tools",
      type: "artisan",
    },
    {
      key: "jeweler",
      name: "Jeweler's Tools",
      type: "artisan",
    },
    {
      key: "leatherworker",
      name: "Leatherworker's Tools",
      type: "artisan",
    },
    {
      key: "mason",
      name: "Mason's Tools",
      type: "artisan",
    },
    {
      key: 'painter',
      name: "Painter's Supplies",
      type: "artisan",
    },
    {
      key: 'potter',
      name: "Potter's Tools",
      type: "artisan",
    },
    {
      key: 'smith',
      name: "Smith's Tools",
      type: 'artisan',
    },
    {
      key: 'tinker',
      name: "Tinker's Tools",
      type: "artisan",
    },
    {
      key: "weaver",
      name: "Weaver's Tools",
      type: "artisan",
    },
    {
      key: "woodcarver",
      name: "Woodcarver's Tools",
      type: "artisan",
    },
    {
      key: "disguise",
      name: "Disguise Kit",
      type: "other",
    },
    {
      key: "forgery",
      name: "Forgery Kit",
      type: "other",
    },
    {
      key: 'dice',
      name: "Dice Set",
      type: 'gaming',
    },
    {
      key: "cards",
      name: "Playing Card Set",
      type: 'gaming',
    },
    {
      key: 'herbalism',
      name: "Herbalism Kit",
      type: "other",
    },
    {
      key: "navigator",
      name: "Navigator's Tools",
      type: "other",
    },
    {
      key: "poisoner",
      name: "Poisoner's Kit",
      type: "other", 
    },
    {
      key: "thieves",
      name: "Thieves' Tools",
      type: "other",
    },
    {
      key: "bagpipes",
      name: "Bagpipes",
      type: "instrument"
    },
    {
      key: "drum",
      name: "Drum",
      type: "instrument"
    },
    {
      key: "dulcimer",
      name: "Dulcimer",
      type: "instrument"
    },
    {
      key: "flute",
      name: "Flute",
      type: "instrument"
    },
    {
      key: "lute",
      name: "Lute",
      type: "instrument"
    },
    {
      key: "horn",
      name: "Horn",
      type: "instrument"
    },
    {
      key: "panflute",
      name: "Pan Flute",
      type: "instrument"
    },
    {
      key: "shawm",
      name: "Shawm",
      type: "instrument"
    },
    {
      key: "lyre",
      name: "Lyre",
      type: "instrument"
    },
    {
      key: "viol",
      name: "Viol",
      type: "instrument"
    },
    {
      key: "three-dragon-ante",
      name: "Three-Dragon Ante Set",
      type: "gaming",
    },
    {
      key: "dragonchess",
      name: "Dragonchess Set",
      type: "gaming",
    },
    {
      key: "birdpipes",
      name: "Birdpipes",
      type: "instrument",
    },
    {
      key: "glaur",
      name: "Glaur",
      type: "instrument",
    },
    { 
      key: "handdrum", 
      name: "Hand Drum", 
      type: "instrument",
    },
    {
      key: "longhorn",
      name: "Longhorn",
      type: "instrument",
    },
    { 
      key: "songhorn", 
      name: "Songhorn", 
      type: "instrument",
    },
    {
      key: "tantan",
      name: "Tantan",
      type: "instrument",
    },
    {
      key: "thelarr",
      name: "Thelarr",
      type: "instrument",
    },
    {
      key: "tocken",
      name: "Tocken",
      type: "instrument",
    },
    {
      key: "wargong",
      name: "Wargong",
      type: "instrument",
    },
    {
      key: "yarting",
      name: "Yarting",
      type: "instrument",
    },
    {
      key: "zulkoon",
      name: "Zulkoon",
      type: "instrument",
    },
    {
      key: "whistle-stick",
      name: "Whistle-Stick",
      type: "instrument", 
    },
    {
      key: "vehicle-land",
      name: "Land Vehicle",
      type: "vehicle"
    },
    {
      key: "vehicle-water",
      name: "Water Vehicle",
      type: "vehicle"
    }
];

export const toolType = [ "other", "artisan", "vehicle", "instrument", "gaming"].reduce((p, c) => {
  p[c] = `tool-proficiencies-5e.types.${c}`;
  return p;
}, {});

extendedToolsData.forEach(tool => {
  tool.default = true;
});

console.warn(extendedToolsData);