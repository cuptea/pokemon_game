# Pokemon Quiz Sources

This quiz lane uses an official-first source policy.

Primary source set:
- `https://www.pokemon.com/us/pokedex/bulbasaur`
- `https://www.pokemon.com/us/pokedex`

Allowed secondary cross-check set:
- `https://bulbapedia.bulbagarden.net/wiki/Move`
- `https://bulbapedia.bulbagarden.net/wiki/Category%3AMoves`

Implementation rules:
- Species facts, listed abilities, listed weaknesses, and listed types come from official Pokemon.com Pokedex pages.
- Bulbapedia is only used for move-category taxonomy in cases where the official Pokedex pages are not the right source.
- Entries avoid anime-only facts, rumors, unsupported trivia, or generation-specific edge cases that would make the answer ambiguous.
- Each quiz entry in `src/data/pokemonQuiz.ts` carries its source URLs so tests and future curation stay auditable.

Current official page set used in the repo:
- Bulbasaur: `https://www.pokemon.com/us/pokedex/bulbasaur`
- Charmander: `https://www.pokemon.com/us/pokedex/charmander?TB_iframe=true&height=921.6&width=921.6`
- Gastly: `https://www.pokemon.com/it/pokedex/gastly`
- Mudkip: `https://www.pokemon.com/br/pokedex/mudkip`
- Porygon: `https://www.pokemon.com/uk/pokedex/porygon`
- Staryu: `https://www.pokemon.com/uk/pokedex/staryu`

Current Bulbapedia move pages used in the repo:
- Thunderbolt: `https://bulbapedia.bulbagarden.net/wiki/Thunderbolt_%28move%29`
- Flamethrower: `https://bulbapedia.bulbagarden.net/wiki/Flamethrower_%28move%29`
- Quick Attack: `https://bulbapedia.bulbagarden.net/wiki/Quick_Attack`
- Growl: `https://bulbapedia.bulbagarden.net/wiki/Growl_%28move%29`
