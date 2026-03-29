import { getCurrentLanguage, type SupportedLanguage } from "../game/i18n";

export type PokemonQuizSourceKind = "official" | "bulbapedia";

export type PokemonQuizSource = {
  kind: PokemonQuizSourceKind;
  label: string;
  url: string;
  note: string;
};

type LocalizedString = Record<SupportedLanguage, string>;

export type PokemonQuizLocalizedEntry = {
  id: string;
  prompt: LocalizedString;
  correctAnswer: LocalizedString;
  wrongAnswers: [LocalizedString, LocalizedString];
  weight: number;
  references: readonly PokemonQuizSource[];
};

export type PokemonQuizEntry = {
  id: string;
  prompt: string;
  correctAnswer: string;
  wrongAnswers: [string, string];
  weight: number;
  references: readonly PokemonQuizSource[];
};

const text = (en: string, zh: string, de: string): LocalizedString => ({ en, zh, de });

const officialSources = {
  bulbasaur: {
    kind: "official",
    label: "Pokemon.com Pokedex: Bulbasaur",
    url: "https://www.pokemon.com/us/pokedex/bulbasaur",
    note: "Official Pokedex page listing Bulbasaur's type, weaknesses, and evolution line.",
  },
  charmander: {
    kind: "official",
    label: "Pokemon.com Pokedex: Charmander",
    url: "https://www.pokemon.com/us/pokedex/charmander",
    note: "Official Pokedex page listing Charmander's type, weaknesses, and evolution line.",
  },
  squirtle: {
    kind: "official",
    label: "Pokemon.com Pokedex: Squirtle",
    url: "https://www.pokemon.com/us/pokedex/squirtle",
    note: "Official Pokedex page listing Squirtle's type, weaknesses, and evolution line.",
  },
  pikachu: {
    kind: "official",
    label: "Pokemon.com Pokedex: Pikachu",
    url: "https://www.pokemon.com/us/pokedex/pikachu",
    note: "Official Pokedex page listing Pikachu's type and evolution line.",
  },
  gastly: {
    kind: "official",
    label: "Pokemon.com Pokedex: Gastly",
    url: "https://www.pokemon.com/us/pokedex/gastly",
    note: "Official Pokedex page listing Gastly's type and evolution line.",
  },
  litwick: {
    kind: "official",
    label: "Pokemon.com Pokedex: Litwick",
    url: "https://www.pokemon.com/us/pokedex/litwick",
    note: "Official Pokedex page listing Litwick's type, weaknesses, and evolution line.",
  },
  eevee: {
    kind: "official",
    label: "Pokemon.com Pokedex: Eevee",
    url: "https://www.pokemon.com/us/pokedex/eevee",
    note: "Official Pokedex page listing Eevee's type and evolutions.",
  },
} as const satisfies Record<string, PokemonQuizSource>;

const bulbapediaSources = {
  thunderbolt: {
    kind: "bulbapedia",
    label: "Bulbapedia: Thunderbolt (move)",
    url: "https://bulbapedia.bulbagarden.net/wiki/Thunderbolt_%28move%29",
    note: "Used for Thunderbolt's move type and category.",
  },
  flamethrower: {
    kind: "bulbapedia",
    label: "Bulbapedia: Flamethrower (move)",
    url: "https://bulbapedia.bulbagarden.net/wiki/Flamethrower_%28move%29",
    note: "Used for Flamethrower's move type and category.",
  },
  quickAttack: {
    kind: "bulbapedia",
    label: "Bulbapedia: Quick Attack (move)",
    url: "https://bulbapedia.bulbagarden.net/wiki/Quick_Attack",
    note: "Used for Quick Attack's move type and category.",
  },
  growl: {
    kind: "bulbapedia",
    label: "Bulbapedia: Growl (move)",
    url: "https://bulbapedia.bulbagarden.net/wiki/Growl_%28move%29",
    note: "Used for Growl's move type and category.",
  },
} as const satisfies Record<string, PokemonQuizSource>;

const localizedPokemonQuizEntries: readonly PokemonQuizLocalizedEntry[] = [
  {
    id: "pk-bulbasaur-type",
    prompt: text(
      "What type is Bulbasaur?",
      "妙蛙种子的属性是什么？",
      "Welchen Typ hat Bulbasaur?",
    ),
    correctAnswer: text("Grass / Poison", "草 / 毒", "Pflanze / Gift"),
    wrongAnswers: [
      text("Grass / Fairy", "草 / 妖精", "Pflanze / Fee"),
      text("Bug / Poison", "虫 / 毒", "Kaefer / Gift"),
    ],
    weight: 1.2,
    references: [officialSources.bulbasaur],
  },
  {
    id: "pk-bulbasaur-evolution",
    prompt: text(
      "Which Pokemon does Bulbasaur evolve into first?",
      "妙蛙种子第一次进化会变成哪只宝可梦？",
      "Zu welchem Pokemon entwickelt sich Bulbasaur zuerst?",
    ),
    correctAnswer: text("Ivysaur", "妙蛙草", "Bisaknosp"),
    wrongAnswers: [
      text("Venusaur", "妙蛙花", "Bisaflor"),
      text("Charmander", "小火龙", "Glumanda"),
    ],
    weight: 1.15,
    references: [officialSources.bulbasaur],
  },
  {
    id: "pk-bulbasaur-weakness",
    prompt: text(
      "Which of these is a listed weakness of Bulbasaur?",
      "下面哪一种是妙蛙种子的弱点？",
      "Welche dieser Typen ist eine genannte Schwaeche von Bulbasaur?",
    ),
    correctAnswer: text("Fire", "火", "Feuer"),
    wrongAnswers: [
      text("Electric", "电", "Elektro"),
      text("Fairy", "妖精", "Fee"),
    ],
    weight: 1.05,
    references: [officialSources.bulbasaur],
  },
  {
    id: "pk-charmander-type",
    prompt: text(
      "What type is Charmander?",
      "小火龙的属性是什么？",
      "Welchen Typ hat Charmander?",
    ),
    correctAnswer: text("Fire", "火", "Feuer"),
    wrongAnswers: [
      text("Fire / Dragon", "火 / 龙", "Feuer / Drache"),
      text("Electric", "电", "Elektro"),
    ],
    weight: 1.2,
    references: [officialSources.charmander],
  },
  {
    id: "pk-charmander-evolution",
    prompt: text(
      "Which Pokemon does Charmander evolve into first?",
      "小火龙第一次进化会变成哪只宝可梦？",
      "Zu welchem Pokemon entwickelt sich Charmander zuerst?",
    ),
    correctAnswer: text("Charmeleon", "火恐龙", "Glutexo"),
    wrongAnswers: [
      text("Charizard", "喷火龙", "Glurak"),
      text("Wartortle", "卡咪龟", "Schillok"),
    ],
    weight: 1.1,
    references: [officialSources.charmander],
  },
  {
    id: "pk-squirtle-type",
    prompt: text(
      "What type is Squirtle?",
      "杰尼龟的属性是什么？",
      "Welchen Typ hat Squirtle?",
    ),
    correctAnswer: text("Water", "水", "Wasser"),
    wrongAnswers: [
      text("Water / Ice", "水 / 冰", "Wasser / Eis"),
      text("Ground", "地面", "Boden"),
    ],
    weight: 1.2,
    references: [officialSources.squirtle],
  },
  {
    id: "pk-squirtle-evolution",
    prompt: text(
      "Which Pokemon does Squirtle evolve into first?",
      "杰尼龟第一次进化会变成哪只宝可梦？",
      "Zu welchem Pokemon entwickelt sich Squirtle zuerst?",
    ),
    correctAnswer: text("Wartortle", "卡咪龟", "Schillok"),
    wrongAnswers: [
      text("Blastoise", "水箭龟", "Turtok"),
      text("Ivysaur", "妙蛙草", "Bisaknosp"),
    ],
    weight: 1.1,
    references: [officialSources.squirtle],
  },
  {
    id: "pk-squirtle-weakness",
    prompt: text(
      "Which of these is a listed weakness of Squirtle?",
      "下面哪一种是杰尼龟的弱点？",
      "Welche dieser Typen ist eine genannte Schwaeche von Squirtle?",
    ),
    correctAnswer: text("Electric", "电", "Elektro"),
    wrongAnswers: [
      text("Fire", "火", "Feuer"),
      text("Steel", "钢", "Stahl"),
    ],
    weight: 1.05,
    references: [officialSources.squirtle],
  },
  {
    id: "pk-pikachu-type",
    prompt: text(
      "What type is Pikachu?",
      "皮卡丘的属性是什么？",
      "Welchen Typ hat Pikachu?",
    ),
    correctAnswer: text("Electric", "电", "Elektro"),
    wrongAnswers: [
      text("Normal", "一般", "Normal"),
      text("Electric / Fairy", "电 / 妖精", "Elektro / Fee"),
    ],
    weight: 1.15,
    references: [officialSources.pikachu],
  },
  {
    id: "pk-pikachu-evolution",
    prompt: text(
      "Which Pokemon does Pikachu evolve into?",
      "皮卡丘会进化成哪只宝可梦？",
      "Zu welchem Pokemon entwickelt sich Pikachu?",
    ),
    correctAnswer: text("Raichu", "雷丘", "Raichu"),
    wrongAnswers: [
      text("Pichu", "皮丘", "Pichu"),
      text("Electabuzz", "电击兽", "Elektek"),
    ],
    weight: 1.1,
    references: [officialSources.pikachu],
  },
  {
    id: "pk-gastly-type",
    prompt: text(
      "What type is Gastly?",
      "鬼斯的属性是什么？",
      "Welchen Typ hat Gastly?",
    ),
    correctAnswer: text("Ghost / Poison", "幽灵 / 毒", "Geist / Gift"),
    wrongAnswers: [
      text("Ghost", "幽灵", "Geist"),
      text("Dark / Poison", "恶 / 毒", "Unlicht / Gift"),
    ],
    weight: 1.15,
    references: [officialSources.gastly],
  },
  {
    id: "pk-gastly-evolution",
    prompt: text(
      "Which Pokemon does Gastly evolve into first?",
      "鬼斯第一次进化会变成哪只宝可梦？",
      "Zu welchem Pokemon entwickelt sich Gastly zuerst?",
    ),
    correctAnswer: text("Haunter", "鬼斯通", "Alpollo"),
    wrongAnswers: [
      text("Gengar", "耿鬼", "Gengar"),
      text("Muk", "臭臭泥", "Sleimok"),
    ],
    weight: 1.1,
    references: [officialSources.gastly],
  },
  {
    id: "pk-litwick-type",
    prompt: text(
      "What type is Litwick?",
      "烛光灵的属性是什么？",
      "Welchen Typ hat Litwick?",
    ),
    correctAnswer: text("Ghost / Fire", "幽灵 / 火", "Geist / Feuer"),
    wrongAnswers: [
      text("Fire", "火", "Feuer"),
      text("Ghost / Psychic", "幽灵 / 超能力", "Geist / Psycho"),
    ],
    weight: 1.1,
    references: [officialSources.litwick],
  },
  {
    id: "pk-litwick-evolution",
    prompt: text(
      "Which Pokemon does Litwick evolve into first?",
      "烛光灵第一次进化会变成哪只宝可梦？",
      "Zu welchem Pokemon entwickelt sich Litwick zuerst?",
    ),
    correctAnswer: text("Lampent", "灯火幽灵", "Laternecto"),
    wrongAnswers: [
      text("Chandelure", "水晶灯火灵", "Skelabra"),
      text("Gastly", "鬼斯", "Nebulak"),
    ],
    weight: 1.05,
    references: [officialSources.litwick],
  },
  {
    id: "pk-eevee-type",
    prompt: text(
      "What type is Eevee?",
      "伊布的属性是什么？",
      "Welchen Typ hat Eevee?",
    ),
    correctAnswer: text("Normal", "一般", "Normal"),
    wrongAnswers: [
      text("Fairy", "妖精", "Fee"),
      text("Normal / Psychic", "一般 / 超能力", "Normal / Psycho"),
    ],
    weight: 1.05,
    references: [officialSources.eevee],
  },
  {
    id: "pk-eevee-evolution",
    prompt: text(
      "Which of these is one of Eevee's evolutions?",
      "下面哪一只是伊布的进化形？",
      "Welche dieser Entwicklungen gehoert zu Eevee?",
    ),
    correctAnswer: text("Vaporeon", "水伊布", "Aquana"),
    wrongAnswers: [
      text("Wartortle", "卡咪龟", "Schillok"),
      text("Dragonair", "哈克龙", "Dragonir"),
    ],
    weight: 1.05,
    references: [officialSources.eevee],
  },
  {
    id: "pk-thunderbolt-type",
    prompt: text(
      "What type of move is Thunderbolt?",
      "十万伏特是什么属性的招式？",
      "Welchen Typ hat die Attacke Donnerblitz?",
    ),
    correctAnswer: text("Electric", "电", "Elektro"),
    wrongAnswers: [
      text("Water", "水", "Wasser"),
      text("Normal", "一般", "Normal"),
    ],
    weight: 1,
    references: [bulbapediaSources.thunderbolt],
  },
  {
    id: "pk-thunderbolt-category",
    prompt: text(
      "What move category does Thunderbolt belong to?",
      "十万伏特属于哪种招式分类？",
      "Zu welcher Angriffskategorie gehoert Donnerblitz?",
    ),
    correctAnswer: text("Special", "特殊", "Spezial"),
    wrongAnswers: [
      text("Physical", "物理", "Physisch"),
      text("Status", "变化", "Status"),
    ],
    weight: 1,
    references: [bulbapediaSources.thunderbolt],
  },
  {
    id: "pk-flamethrower-type",
    prompt: text(
      "What type of move is Flamethrower?",
      "喷射火焰是什么属性的招式？",
      "Welchen Typ hat die Attacke Flammenwurf?",
    ),
    correctAnswer: text("Fire", "火", "Feuer"),
    wrongAnswers: [
      text("Dragon", "龙", "Drache"),
      text("Electric", "电", "Elektro"),
    ],
    weight: 1,
    references: [bulbapediaSources.flamethrower],
  },
  {
    id: "pk-flamethrower-category",
    prompt: text(
      "What move category does Flamethrower belong to?",
      "喷射火焰属于哪种招式分类？",
      "Zu welcher Angriffskategorie gehoert Flammenwurf?",
    ),
    correctAnswer: text("Special", "特殊", "Spezial"),
    wrongAnswers: [
      text("Physical", "物理", "Physisch"),
      text("Status", "变化", "Status"),
    ],
    weight: 1,
    references: [bulbapediaSources.flamethrower],
  },
  {
    id: "pk-quick-attack-type",
    prompt: text(
      "What type of move is Quick Attack?",
      "电光一闪是什么属性的招式？",
      "Welchen Typ hat die Attacke Ruckzuckhieb?",
    ),
    correctAnswer: text("Normal", "一般", "Normal"),
    wrongAnswers: [
      text("Flying", "飞行", "Flug"),
      text("Electric", "电", "Elektro"),
    ],
    weight: 0.95,
    references: [bulbapediaSources.quickAttack],
  },
  {
    id: "pk-quick-attack-category",
    prompt: text(
      "What move category does Quick Attack belong to?",
      "电光一闪属于哪种招式分类？",
      "Zu welcher Angriffskategorie gehoert Ruckzuckhieb?",
    ),
    correctAnswer: text("Physical", "物理", "Physisch"),
    wrongAnswers: [
      text("Special", "特殊", "Spezial"),
      text("Status", "变化", "Status"),
    ],
    weight: 0.95,
    references: [bulbapediaSources.quickAttack],
  },
  {
    id: "pk-growl-type",
    prompt: text(
      "What type of move is Growl?",
      "叫声是什么属性的招式？",
      "Welchen Typ hat die Attacke Heuler?",
    ),
    correctAnswer: text("Normal", "一般", "Normal"),
    wrongAnswers: [
      text("Dark", "恶", "Unlicht"),
      text("Psychic", "超能力", "Psycho"),
    ],
    weight: 0.9,
    references: [bulbapediaSources.growl],
  },
  {
    id: "pk-growl-category",
    prompt: text(
      "What move category does Growl belong to?",
      "叫声属于哪种招式分类？",
      "Zu welcher Angriffskategorie gehoert Heuler?",
    ),
    correctAnswer: text("Status", "变化", "Status"),
    wrongAnswers: [
      text("Physical", "物理", "Physisch"),
      text("Special", "特殊", "Spezial"),
    ],
    weight: 0.9,
    references: [bulbapediaSources.growl],
  },
];

export function getPokemonQuizEntries(
  language: SupportedLanguage = getCurrentLanguage(),
): readonly PokemonQuizEntry[] {
  return localizedPokemonQuizEntries.map((entry) => ({
    id: entry.id,
    prompt: entry.prompt[language],
    correctAnswer: entry.correctAnswer[language],
    wrongAnswers: [
      entry.wrongAnswers[0][language],
      entry.wrongAnswers[1][language],
    ],
    weight: entry.weight,
    references: entry.references,
  }));
}

export const pokemonQuizEntries: readonly PokemonQuizEntry[] = getPokemonQuizEntries("en");
