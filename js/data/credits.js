// Third-party artwork. The Settings screen and CREDITS.md (scripts/credits-md.js) read this list.
// There are no sound files: every sound effect is synthesized in js/audio.js.
export const CREDITS = [
  {
    id: "fluent-emoji",
    title: "Microsoft Fluent Emoji (3D)",
    author: "Microsoft",
    use: { en: "Sticker and badge pictures", es: "Imágenes de stickers e insignias" },
    source: "https://github.com/microsoft/fluentui-emoji",
    license: "MIT",
    licenseFile: "art/LICENSE-fluentui-emoji.txt",
    note: "Converted to 256×256 WebP by scripts/fetch-art.sh.",
  },
  {
    id: "phosphor-icons",
    title: "Phosphor Icons 2.1.1",
    author: "Phosphor Icons",
    use: { en: "Button icons", es: "Íconos de los botones" },
    source: "https://phosphoricons.com/",
    license: "MIT",
    licenseFile: "art/LICENSE-phosphor-icons.txt",
    note: "Inlined as SVG in js/icons-data.js by scripts/build-icons.js.",
  },
];
