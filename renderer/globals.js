export const utenti = [
  "angelo",
  "simone",
  "angelica",
  "antonio",
  "bruno",
  "daniela",
  "dora",
  "elena",
  "marianna",
  "martina",
  "paolo",
  "vera",
  "admin",
];

export const aree_di_lavoro = [
  { nome: "fondi", icona: "sole", enabled: false, categoria:"1" },
  { nome: "tacchi", icona: "heel", enabled: false, categoria:"1" },
  { nome: "ceppi", icona: "shoe-base", enabled: true, categoria:"1" },
  { nome: "materiali", icona: "material", enabled: false, categoria:"1" },
  { nome: "accessori", icona: "accessory", enabled: false, categoria:"1" },

  { nome: "lab prototipia", icona: "prototype", enabled: false, categoria:"2" },
  { nome: "lab 3d", icona: "threeD", enabled: false, categoria:"2" },
  { nome: "lab rendering", icona: "render", enabled: false, categoria:"2" },

  { nome: "aziende", icona: "company", enabled: true, categoria:"3" },
  { nome: "persone", icona: "contacts", enabled: false, categoria:"3" },

  { nome: "archivio calzature", icona: "main-archive", enabled: false, categoria:"4" },
  { nome: "archivio disegno", icona: "drawings-archive", enabled: false, categoria:"4" },
  { nome: "archivio storico", icona: "archive", enabled: false, categoria:"4" },
];

export const menu_ceppi = [
  { nome: "inserimento", icona: "add_2", url: "ceppi/inserimento.html" },
  { nome: "ricerca", icona: "search", url: "ceppi/ricerca.html" },
];

export const menu_aziende = [
  { nome: "inserimento", icona: "add_2", url: "aziende/inserimento.html" },
  { nome: "ricerca", icona: "search", url: "aziende/ricerca.html" },
];
