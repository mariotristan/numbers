// Shop data: Bruno's closet, stickers (Fluent Emoji art) and earned badges.
export const SLOTS = ["hat", "glasses", "neck", "held"];
export const STICKER_PRICE = 10;

const C = (id, slot, price, en, es) => ({ id, slot, price, name: { en, es } });

export const CLOSET = [
  C("wizard-hat", "hat", 20, "Wizard hat", "Sombrero de mago"),
  C("astronaut-helmet", "hat", 40, "Astronaut helmet", "Casco de astronauta"),
  C("party-hat", "hat", 25, "Party hat", "Gorro de fiesta"),
  C("sunglasses", "glasses", 15, "Sunglasses", "Lentes de sol"),
  C("star-glasses", "glasses", 25, "Star glasses", "Lentes de estrella"),
  C("cape", "neck", 30, "Cape", "Capa"),
  C("bow-tie", "neck", 15, "Bow tie", "Corbatín"),
  C("scarf", "neck", 20, "Scarf", "Bufanda"),
  C("magic-wand", "held", 35, "Magic wand", "Varita mágica"),
  C("pencil", "held", 15, "Pencil", "Lápiz"),
  C("balloon", "held", 20, "Balloon", "Globo"),
  C("telescope", "held", 60, "Telescope", "Telescopio"),
];

const S = (id, emoji, fluent, en, es) => ({ id, emoji, fluent, name: { en, es }, price: STICKER_PRICE });

export const STICKERS = [
  S("rocket", "🚀", "Rocket", "Rocket", "Cohete"),
  S("t-rex", "🦖", "T-Rex", "T-Rex", "T-Rex"),
  S("pizza", "🍕", "Pizza", "Pizza", "Pizza"),
  S("rainbow", "🌈", "Rainbow", "Rainbow", "Arcoíris"),
  S("unicorn", "🦄", "Unicorn", "Unicorn", "Unicornio"),
  S("robot", "🤖", "Robot", "Robot", "Robot"),
  S("glowing-star", "🌟", "Glowing star", "Glowing star", "Estrella brillante"),
  S("soccer-ball", "⚽", "Soccer ball", "Soccer ball", "Balón de fútbol"),
  S("ice-cream", "🍦", "Soft ice cream", "Ice cream", "Helado"),
  S("cat", "🐱", "Cat face", "Cat", "Gato"),
  S("dog", "🐶", "Dog face", "Dog", "Perro"),
  S("octopus", "🐙", "Octopus", "Octopus", "Pulpo"),
  S("butterfly", "🦋", "Butterfly", "Butterfly", "Mariposa"),
  S("doughnut", "🍩", "Doughnut", "Doughnut", "Dona"),
  S("teddy-bear", "🧸", "Teddy bear", "Teddy bear", "Osito de peluche"),
  S("ringed-planet", "🪐", "Ringed planet", "Ringed planet", "Planeta con anillos"),
  S("volcano", "🌋", "Volcano", "Volcano", "Volcán"),
  S("guitar", "🎸", "Guitar", "Guitar", "Guitarra"),
  S("artist-palette", "🎨", "Artist palette", "Paint palette", "Paleta de pintura"),
  S("kite", "🪁", "Kite", "Kite", "Cometa"),
  S("panda", "🐼", "Panda", "Panda", "Panda"),
  S("dolphin", "🐬", "Dolphin", "Dolphin", "Delfín"),
  S("sunflower", "🌻", "Sunflower", "Sunflower", "Girasol"),
  S("trophy", "🏆", "Trophy", "Trophy", "Trofeo"),
];

const B = (id, emoji, fluent, en, es, hintEn, hintEs) => ({
  id, emoji, fluent, name: { en, es }, hint: { en: hintEn, es: hintEs },
});

export const BADGES = [
  B("first-perfect", "🥇", "1st place medal", "First perfect round", "Primera ronda perfecta",
    "Get 10 out of 10 in a round.", "Saca 10 de 10 en una ronda."),
  B("grade-2", "🥈", "2nd place medal", "2nd grade done", "2.º grado completo",
    "Pass level 7.", "Pasa el nivel 7."),
  B("grade-3", "🥉", "3rd place medal", "3rd grade done", "3.er grado completo",
    "Pass level 12.", "Pasa el nivel 12."),
  B("grade-4", "🏅", "Sports medal", "4th grade done", "4.º grado completo",
    "Pass level 14.", "Pasa el nivel 14."),
  B("coins-100", "💰", "Money bag", "100 coins earned", "100 monedas ganadas",
    "Earn 100 coins in total.", "Gana 100 monedas en total."),
  B("rounds-10", "🎉", "Party popper", "10 rounds played", "10 rondas jugadas",
    "Play 10 rounds.", "Juega 10 rondas."),
];

export function getItem(id) {
  return CLOSET.find((i) => i.id === id) ?? STICKERS.find((s) => s.id === id) ?? null;
}
