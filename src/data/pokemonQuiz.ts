export type PokemonQuizSourceKind = "official" | "bulbapedia";

export type PokemonQuizSource = {
  kind: PokemonQuizSourceKind;
  label: string;
  url: string;
  note: string;
};

export type PokemonQuizEntry = {
  id: string;
  prompt: string;
  correctAnswer: string;
  wrongAnswers: [string, string];
  weight: number;
  references: readonly PokemonQuizSource[];
};

const officialSources = {
  bulbasaur: {
    kind: "official",
    label: "Pokemon.com Pokedex: Bulbasaur",
    url: "https://www.pokemon.com/us/pokedex/bulbasaur",
    note: "Official Pokedex page listing Bulbasaur's type, abilities, and weaknesses.",
  },
  charmander: {
    kind: "official",
    label: "Pokemon.com Pokedex: Charmander",
    url: "https://www.pokemon.com/us/pokedex/charmander?TB_iframe=true&height=921.6&width=921.6",
    note: "Official Pokedex page listing Charmander's type, abilities, and weaknesses.",
  },
  gastly: {
    kind: "official",
    label: "Pokemon.com Pokedex: Gastly",
    url: "https://www.pokemon.com/it/pokedex/gastly",
    note: "Official Pokedex page listing Gastly's type, ability, and weaknesses.",
  },
  mudkip: {
    kind: "official",
    label: "Pokemon.com Pokedex: Mudkip",
    url: "https://www.pokemon.com/br/pokedex/mudkip",
    note: "Official Pokedex page listing Mudkip's type, ability, and weaknesses.",
  },
  porygon: {
    kind: "official",
    label: "Pokemon.com Pokedex: Porygon",
    url: "https://www.pokemon.com/uk/pokedex/porygon",
    note: "Official Pokedex page listing Porygon's type, abilities, and weaknesses.",
  },
  staryu: {
    kind: "official",
    label: "Pokemon.com Pokedex: Staryu",
    url: "https://www.pokemon.com/uk/pokedex/staryu",
    note: "Official Pokedex page listing Staryu's type, abilities, and weaknesses.",
  },
} as const satisfies Record<string, PokemonQuizSource>;

const bulbapediaSources = {
  thunderbolt: {
    kind: "bulbapedia",
    label: "Bulbapedia: Thunderbolt (move)",
    url: "https://bulbapedia.bulbagarden.net/wiki/Thunderbolt_%28move%29",
    note: "Used only for move-category taxonomy where the official Pokedex pages do not apply.",
  },
  flamethrower: {
    kind: "bulbapedia",
    label: "Bulbapedia: Flamethrower (move)",
    url: "https://bulbapedia.bulbagarden.net/wiki/Flamethrower_%28move%29",
    note: "Used only for move-category taxonomy where the official Pokedex pages do not apply.",
  },
  quickAttack: {
    kind: "bulbapedia",
    label: "Bulbapedia: Quick Attack (move)",
    url: "https://bulbapedia.bulbagarden.net/wiki/Quick_Attack",
    note: "Used only for move-category taxonomy where the official Pokedex pages do not apply.",
  },
  growl: {
    kind: "bulbapedia",
    label: "Bulbapedia: Growl (move)",
    url: "https://bulbapedia.bulbagarden.net/wiki/Growl_%28move%29",
    note: "Used only for move-category taxonomy where the official Pokedex pages do not apply.",
  },
} as const satisfies Record<string, PokemonQuizSource>;

export const pokemonQuizEntries: readonly PokemonQuizEntry[] = [
  {
    id: "pk-bulbasaur-type",
    prompt: "According to the official Pokedex, what type is Bulbasaur?",
    correctAnswer: "Grass / Poison",
    wrongAnswers: ["Grass / Fairy", "Bug / Poison"],
    weight: 1.15,
    references: [officialSources.bulbasaur],
  },
  {
    id: "pk-bulbasaur-ability",
    prompt: "Which ability is listed for Bulbasaur on Pokemon.com?",
    correctAnswer: "Overgrow",
    wrongAnswers: ["Blaze", "Torrent"],
    weight: 1.05,
    references: [officialSources.bulbasaur],
  },
  {
    id: "pk-bulbasaur-weakness",
    prompt: "Which of these is listed as a Bulbasaur weakness on the official Pokedex?",
    correctAnswer: "Fire",
    wrongAnswers: ["Electric", "Fairy"],
    weight: 1.05,
    references: [officialSources.bulbasaur],
  },
  {
    id: "pk-charmander-type",
    prompt: "According to the official Pokedex, what type is Charmander?",
    correctAnswer: "Fire",
    wrongAnswers: ["Electric", "Fire / Dragon"],
    weight: 1.15,
    references: [officialSources.charmander],
  },
  {
    id: "pk-charmander-ability",
    prompt: "Which ability is listed for Charmander on Pokemon.com?",
    correctAnswer: "Blaze",
    wrongAnswers: ["Static", "Overgrow"],
    weight: 1.05,
    references: [officialSources.charmander],
  },
  {
    id: "pk-charmander-weakness",
    prompt: "Which of these is listed as a Charmander weakness on the official Pokedex?",
    correctAnswer: "Ground",
    wrongAnswers: ["Grass", "Psychic"],
    weight: 1.05,
    references: [officialSources.charmander],
  },
  {
    id: "pk-gastly-type",
    prompt: "According to the official Pokedex, what type is Gastly?",
    correctAnswer: "Ghost / Poison",
    wrongAnswers: ["Ghost", "Dark / Poison"],
    weight: 1.1,
    references: [officialSources.gastly],
  },
  {
    id: "pk-gastly-ability",
    prompt: "Which ability is listed for Gastly on Pokemon.com?",
    correctAnswer: "Levitate",
    wrongAnswers: ["Pressure", "Static"],
    weight: 1.05,
    references: [officialSources.gastly],
  },
  {
    id: "pk-mudkip-type",
    prompt: "According to the official Pokedex, what type is Mudkip?",
    correctAnswer: "Water",
    wrongAnswers: ["Water / Ground", "Ice"],
    weight: 1.05,
    references: [officialSources.mudkip],
  },
  {
    id: "pk-mudkip-ability",
    prompt: "Which ability is listed for Mudkip on Pokemon.com?",
    correctAnswer: "Torrent",
    wrongAnswers: ["Sturdy", "Blaze"],
    weight: 1.05,
    references: [officialSources.mudkip],
  },
  {
    id: "pk-porygon-type",
    prompt: "According to the official Pokedex, what type is Porygon?",
    correctAnswer: "Normal",
    wrongAnswers: ["Electric", "Normal / Psychic"],
    weight: 1.05,
    references: [officialSources.porygon],
  },
  {
    id: "pk-porygon-ability",
    prompt: "Which ability is listed for Porygon on Pokemon.com?",
    correctAnswer: "Download",
    wrongAnswers: ["Levitate", "Torrent"],
    weight: 1,
    references: [officialSources.porygon],
  },
  {
    id: "pk-staryu-ability",
    prompt: "Which ability is listed for Staryu on Pokemon.com?",
    correctAnswer: "Illuminate",
    wrongAnswers: ["Overgrow", "Flash Fire"],
    weight: 1,
    references: [officialSources.staryu],
  },
  {
    id: "pk-staryu-weakness",
    prompt: "Which of these is listed as a Staryu weakness on the official Pokedex?",
    correctAnswer: "Electric",
    wrongAnswers: ["Poison", "Bug"],
    weight: 1,
    references: [officialSources.staryu],
  },
  {
    id: "pk-thunderbolt-category",
    prompt: "In Bulbapedia's move taxonomy, what category is Thunderbolt?",
    correctAnswer: "Special",
    wrongAnswers: ["Physical", "Status"],
    weight: 0.95,
    references: [bulbapediaSources.thunderbolt],
  },
  {
    id: "pk-flamethrower-category",
    prompt: "In Bulbapedia's move taxonomy, what category is Flamethrower?",
    correctAnswer: "Special",
    wrongAnswers: ["Physical", "Status"],
    weight: 0.95,
    references: [bulbapediaSources.flamethrower],
  },
  {
    id: "pk-quick-attack-category",
    prompt: "In Bulbapedia's move taxonomy, what category is Quick Attack?",
    correctAnswer: "Physical",
    wrongAnswers: ["Special", "Status"],
    weight: 0.95,
    references: [bulbapediaSources.quickAttack],
  },
  {
    id: "pk-growl-category",
    prompt: "In Bulbapedia's move taxonomy, what category is Growl?",
    correctAnswer: "Status",
    wrongAnswers: ["Special", "Physical"],
    weight: 0.95,
    references: [bulbapediaSources.growl],
  },
];

