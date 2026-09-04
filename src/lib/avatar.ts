export interface AvatarOptions {
  skinTone: 'fair' | 'peach' | 'olive' | 'caramel' | 'warm_brown' | 'deep_brown';
  hairStyle: 'short' | 'wavy' | 'curly' | 'long' | 'bun' | 'braids' | 'hijab' | 'bald';
  hairColor: 'black' | 'dark_brown' | 'blonde' | 'auburn' | 'silver' | 'lilac' | 'blue';
  clothingStyle: 'tshirt' | 'hoodie' | 'collar' | 'sweater' | 'jacket';
  clothingColor: 'purple' | 'teal' | 'emerald' | 'coral' | 'yellow' | 'black' | 'white';
  accessory: 'none' | 'round_glasses' | 'square_glasses' | 'sunglasses' | 'beanie' | 'cap' | 'headphones';
  expression: 'smile' | 'grin' | 'wink' | 'calm';
  backgroundColor: 'lavender' | 'mint' | 'sky' | 'peach' | 'rose' | 'slate';
}

export const SKIN_TONES: Record<AvatarOptions['skinTone'], { label: string; fill: string; shadow: string }> = {
  fair: { label: 'Fair', fill: '#FDDFC7', shadow: '#EABCA1' },
  peach: { label: 'Peach', fill: '#F8C8A5', shadow: '#E4A881' },
  olive: { label: 'Olive', fill: '#DEB088', shadow: '#C89367' },
  caramel: { label: 'Caramel', fill: '#BE8759', shadow: '#A16A3C' },
  warm_brown: { label: 'Warm Brown', fill: '#8C5632', shadow: '#6E3F1F' },
  deep_brown: { label: 'Deep Brown', fill: '#5C3418', shadow: '#43220C' },
};

export const HAIR_COLORS: Record<AvatarOptions['hairColor'], { label: string; fill: string; highlight: string }> = {
  black: { label: 'Jet Black', fill: '#1E1E24', highlight: '#3D3D48' },
  dark_brown: { label: 'Dark Brown', fill: '#442C21', highlight: '#634435' },
  blonde: { label: 'Blonde', fill: '#E6BE75', highlight: '#F4D89A' },
  auburn: { label: 'Auburn', fill: '#8D3B23', highlight: '#AE553B' },
  silver: { label: 'Silver Grey', fill: '#94A3B8', highlight: '#CBD5E1' },
  lilac: { label: 'Pastel Lilac', fill: '#A78BFA', highlight: '#C4B5FD' },
  blue: { label: 'Cobalt Blue', fill: '#3B82F6', highlight: '#60A5FA' },
};

export const CLOTHING_COLORS: Record<AvatarOptions['clothingColor'], { label: string; fill: string; dark: string }> = {
  purple: { label: 'Krow Purple', fill: '#635BFF', dark: '#4E45E4' },
  teal: { label: 'Ocean Teal', fill: '#0D9488', dark: '#0F766E' },
  emerald: { label: 'Emerald', fill: '#10B981', dark: '#059669' },
  coral: { label: 'Coral Red', fill: '#F43F5E', dark: '#E11D48' },
  yellow: { label: 'Warm Amber', fill: '#F59E0B', dark: '#D97706' },
  black: { label: 'Midnight', fill: '#1E293B', dark: '#0F172A' },
  white: { label: 'Cloud White', fill: '#F1F5F9', dark: '#E2E8F0' },
};

export const BG_COLORS: Record<AvatarOptions['backgroundColor'], { label: string; fill: string; ring: string }> = {
  lavender: { label: 'Lavender', fill: '#EDE9FE', ring: '#DDD6FE' },
  mint: { label: 'Mint', fill: '#D1FAE5', ring: '#A7F3D0' },
  sky: { label: 'Sky Blue', fill: '#E0F2FE', ring: '#BAE6FD' },
  peach: { label: 'Soft Peach', fill: '#FFEDD5', ring: '#FED7AA' },
  rose: { label: 'Rose', fill: '#FFE4E6', ring: '#FECDD3' },
  slate: { label: 'Cool Slate', fill: '#E2E8F0', ring: '#CBD5E1' },
};

export const HAIR_STYLES: { id: AvatarOptions['hairStyle']; label: string }[] = [
  { id: 'short', label: 'Short Crop' },
  { id: 'wavy', label: 'Wavy Part' },
  { id: 'curly', label: 'Curly / Afro' },
  { id: 'long', label: 'Long Straight' },
  { id: 'bun', label: 'High Bun' },
  { id: 'braids', label: 'Braids' },
  { id: 'hijab', label: 'Hijab / Wrap' },
  { id: 'bald', label: 'Clean / Bald' },
];

export const CLOTHING_STYLES: { id: AvatarOptions['clothingStyle']; label: string }[] = [
  { id: 'tshirt', label: 'Crewneck Tee' },
  { id: 'hoodie', label: 'Comfy Hoodie' },
  { id: 'collar', label: 'Collared Polo' },
  { id: 'sweater', label: 'Knit Sweater' },
  { id: 'jacket', label: 'Zip Jacket' },
];

export const ACCESSORIES: { id: AvatarOptions['accessory']; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'round_glasses', label: 'Round Glasses' },
  { id: 'square_glasses', label: 'Square Glasses' },
  { id: 'sunglasses', label: 'Sunglasses' },
  { id: 'beanie', label: 'Beanie' },
  { id: 'cap', label: 'Baseball Cap' },
  { id: 'headphones', label: 'Headphones' },
];

export const EXPRESSIONS: { id: AvatarOptions['expression']; label: string }[] = [
  { id: 'smile', label: 'Friendly Smile' },
  { id: 'grin', label: 'Joyful Grin' },
  { id: 'wink', label: 'Playful Wink' },
  { id: 'calm', label: 'Calm & Confident' },
];

export function getDefaultAvatarOptions(): AvatarOptions {
  return {
    skinTone: 'peach',
    hairStyle: 'wavy',
    hairColor: 'dark_brown',
    clothingStyle: 'tshirt',
    clothingColor: 'purple',
    accessory: 'none',
    expression: 'smile',
    backgroundColor: 'lavender',
  };
}

export function getRandomAvatarOptions(): AvatarOptions {
  const skins: AvatarOptions['skinTone'][] = ['fair', 'peach', 'olive', 'caramel', 'warm_brown', 'deep_brown'];
  const hairs: AvatarOptions['hairStyle'][] = ['short', 'wavy', 'curly', 'long', 'bun', 'braids', 'hijab', 'bald'];
  const hairColors: AvatarOptions['hairColor'][] = ['black', 'dark_brown', 'blonde', 'auburn', 'silver', 'lilac', 'blue'];
  const clothes: AvatarOptions['clothingStyle'][] = ['tshirt', 'hoodie', 'collar', 'sweater', 'jacket'];
  const clothColors: AvatarOptions['clothingColor'][] = ['purple', 'teal', 'emerald', 'coral', 'yellow', 'black', 'white'];
  const accs: AvatarOptions['accessory'][] = ['none', 'none', 'round_glasses', 'square_glasses', 'sunglasses', 'beanie', 'cap', 'headphones'];
  const exprs: AvatarOptions['expression'][] = ['smile', 'grin', 'wink', 'calm'];
  const bgs: AvatarOptions['backgroundColor'][] = ['lavender', 'mint', 'sky', 'peach', 'rose', 'slate'];

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return {
    skinTone: pick(skins),
    hairStyle: pick(hairs),
    hairColor: pick(hairColors),
    clothingStyle: pick(clothes),
    clothingColor: pick(clothColors),
    accessory: pick(accs),
    expression: pick(exprs),
    backgroundColor: pick(bgs),
  };
}

export function generateAvatarSvg(opts: AvatarOptions): string {
  const skin = SKIN_TONES[opts.skinTone] || SKIN_TONES.peach;
  const hair = HAIR_COLORS[opts.hairColor] || HAIR_COLORS.dark_brown;
  const cloth = CLOTHING_COLORS[opts.clothingColor] || CLOTHING_COLORS.purple;
  const bg = BG_COLORS[opts.backgroundColor] || BG_COLORS.lavender;

  // Metadata to allow restoring options when re-opening editor
  const metaComment = `<!--META:${JSON.stringify(opts)}-->`;

  // Back hair layer (for styles that drape behind shoulders)
  let backHairSvg = '';
  if (opts.hairStyle === 'long') {
    backHairSvg = `
      <path d="M42 100 C30 115 28 170 34 200 C38 205 60 205 62 180 C64 140 60 115 62 100 Z" fill="${hair.fill}" />
      <path d="M158 100 C170 115 172 170 166 200 C162 205 140 205 138 180 C136 140 140 115 138 100 Z" fill="${hair.fill}" />
    `;
  } else if (opts.hairStyle === 'bun') {
    backHairSvg = `
      <circle cx="100" cy="38" r="24" fill="${hair.fill}" />
      <circle cx="100" cy="38" r="18" fill="${hair.highlight}" opacity="0.3" />
    `;
  } else if (opts.hairStyle === 'braids') {
    backHairSvg = `
      <path d="M46 110 C40 135 42 175 48 200 C53 203 62 198 60 175 C58 145 60 120 62 110 Z" fill="${hair.fill}" />
      <path d="M154 110 C160 135 158 175 152 200 C147 203 138 198 140 175 C142 145 140 120 138 110 Z" fill="${hair.fill}" />
    `;
  }

  // Torso / Clothing
  let clothingSvg = '';
  if (opts.clothingStyle === 'tshirt') {
    clothingSvg = `
      <!-- Shoulders & Torso -->
      <path d="M38 200 C38 165 65 148 82 145 L88 158 C92 165 108 165 112 158 L118 145 C135 148 162 165 162 200 Z" fill="${cloth.fill}" />
      <!-- Collar -->
      <path d="M88 147 C94 158 106 158 112 147" stroke="${cloth.dark}" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <!-- Krow Volunteer subtle badge -->
      <circle cx="75" cy="180" r="4.5" fill="#FFFFFF" opacity="0.8" />
      <path d="M73.5 178.5 L76.5 180 L73.5 181.5 Z" fill="${cloth.fill}" />
    `;
  } else if (opts.clothingStyle === 'hoodie') {
    clothingSvg = `
      <!-- Hoodie Torso -->
      <path d="M36 200 C36 162 65 144 82 142 C88 152 112 152 118 142 C135 144 164 162 164 200 Z" fill="${cloth.fill}" />
      <!-- Hood edge -->
      <path d="M78 140 C84 162 116 162 122 140 C114 166 86 166 78 140 Z" fill="${cloth.dark}" />
      <!-- Strings -->
      <path d="M92 158 L92 178 M108 158 L108 178" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.9" />
      <circle cx="92" cy="179" r="1.5" fill="${cloth.dark}" />
      <circle cx="108" cy="179" r="1.5" fill="${cloth.dark}" />
    `;
  } else if (opts.clothingStyle === 'collar') {
    clothingSvg = `
      <!-- Polo Torso -->
      <path d="M38 200 C38 164 64 148 80 144 L100 156 L120 144 C136 148 162 164 162 200 Z" fill="${cloth.fill}" />
      <!-- Left Collar Flap -->
      <polygon points="80,144 100,166 94,148" fill="${cloth.dark}" />
      <!-- Right Collar Flap -->
      <polygon points="120,144 100,166 106,148" fill="${cloth.dark}" />
      <!-- Center Placket -->
      <rect x="97" y="162" width="6" height="26" fill="${cloth.dark}" rx="1" />
      <circle cx="100" cy="170" r="1.2" fill="#FFFFFF" />
      <circle cx="100" cy="179" r="1.2" fill="#FFFFFF" />
    `;
  } else if (opts.clothingStyle === 'sweater') {
    clothingSvg = `
      <!-- Knit Sweater Torso -->
      <path d="M38 200 C38 163 65 146 84 144 C90 151 110 151 116 144 C135 146 162 163 162 200 Z" fill="${cloth.fill}" />
      <!-- Ribbed V-Neck / Crew -->
      <path d="M84 144 C90 153 110 153 116 144" stroke="${cloth.dark}" stroke-width="5" fill="none" />
      <path d="M84 144 C90 153 110 153 116 144" stroke="#FFFFFF" stroke-width="1" stroke-dasharray="2 2" fill="none" opacity="0.4" />
    `;
  } else {
    // Jacket & Tee
    clothingSvg = `
      <!-- Inner Tee -->
      <path d="M38 200 C38 165 65 148 82 145 L100 162 L118 145 C135 148 162 165 162 200 Z" fill="#FFFFFF" />
      <!-- Left Jacket -->
      <path d="M38 200 C38 165 62 146 82 144 L92 200 Z" fill="${cloth.fill}" />
      <!-- Right Jacket -->
      <path d="M162 200 C162 165 138 146 118 144 L108 200 Z" fill="${cloth.fill}" />
      <!-- Lapels -->
      <polygon points="82,144 94,166 84,175 76,146" fill="${cloth.dark}" />
      <polygon points="118,144 106,166 116,175 124,146" fill="${cloth.dark}" />
    `;
  }

  // Face Expression (Eyes, Eyebrows, Mouth)
  let expressionSvg = '';
  if (opts.expression === 'grin') {
    expressionSvg = `
      <!-- Eyebrows -->
      <path d="M78 86 Q86 80 94 86" stroke="#2B1A12" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M106 86 Q114 80 122 86" stroke="#2B1A12" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <!-- Eyes Open -->
      <circle cx="86" cy="96" r="4" fill="#20150F" />
      <circle cx="87.5" cy="94.5" r="1.3" fill="#FFFFFF" />
      <circle cx="114" cy="96" r="4" fill="#20150F" />
      <circle cx="115.5" cy="94.5" r="1.3" fill="#FFFFFF" />
      <!-- Big Grin with Teeth -->
      <path d="M88 114 Q100 128 112 114 Z" fill="#FFFFFF" stroke="#8F3B3B" stroke-width="2" stroke-linejoin="round" />
      <!-- Blush -->
      <ellipse cx="78" cy="108" rx="5" ry="3" fill="#FF8A8A" opacity="0.4" />
      <ellipse cx="122" cy="108" rx="5" ry="3" fill="#FF8A8A" opacity="0.4" />
    `;
  } else if (opts.expression === 'wink') {
    expressionSvg = `
      <!-- Eyebrows -->
      <path d="M78 86 Q86 80 94 84" stroke="#2B1A12" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M106 84 Q114 80 122 86" stroke="#2B1A12" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <!-- Left Eye Open -->
      <circle cx="86" cy="96" r="4" fill="#20150F" />
      <circle cx="87.5" cy="94.5" r="1.3" fill="#FFFFFF" />
      <!-- Right Eye Winking -->
      <path d="M109 97 Q114 92 119 97" stroke="#20150F" stroke-width="3" stroke-linecap="round" fill="none" />
      <!-- Cheerful Smile -->
      <path d="M91 115 Q100 123 109 115" stroke="#7A3030" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <!-- Blush -->
      <ellipse cx="78" cy="108" rx="5" ry="3" fill="#FF8A8A" opacity="0.45" />
      <ellipse cx="122" cy="108" rx="5" ry="3" fill="#FF8A8A" opacity="0.45" />
    `;
  } else if (opts.expression === 'calm') {
    expressionSvg = `
      <!-- Eyebrows -->
      <path d="M79 87 L93 85" stroke="#2B1A12" stroke-width="2.5" stroke-linecap="round" />
      <path d="M107 85 L121 87" stroke="#2B1A12" stroke-width="2.5" stroke-linecap="round" />
      <!-- Eyes Confident -->
      <circle cx="86" cy="96" r="3.8" fill="#20150F" />
      <circle cx="87" cy="95" r="1.2" fill="#FFFFFF" />
      <circle cx="114" cy="96" r="3.8" fill="#20150F" />
      <circle cx="115" cy="95" r="1.2" fill="#FFFFFF" />
      <!-- Subtle Gentle Smile -->
      <path d="M93 116 Q100 120 107 116" stroke="#7A3030" stroke-width="2.2" stroke-linecap="round" fill="none" />
    `;
  } else {
    // Standard Friendly Smile
    expressionSvg = `
      <!-- Eyebrows -->
      <path d="M78 86 Q86 81 94 85" stroke="#2B1A12" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M106 85 Q114 81 122 86" stroke="#2B1A12" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <!-- Eyes Open -->
      <circle cx="86" cy="96" r="4" fill="#20150F" />
      <circle cx="87.5" cy="94.5" r="1.4" fill="#FFFFFF" />
      <circle cx="114" cy="96" r="4" fill="#20150F" />
      <circle cx="115.5" cy="94.5" r="1.4" fill="#FFFFFF" />
      <!-- Warm Smile -->
      <path d="M90 115 Q100 124 110 115" stroke="#7A3030" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <!-- Blush -->
      <ellipse cx="78" cy="108" rx="4.5" ry="2.5" fill="#FF8A8A" opacity="0.35" />
      <ellipse cx="122" cy="108" rx="4.5" ry="2.5" fill="#FF8A8A" opacity="0.35" />
    `;
  }

  // Front Hair Layer
  let frontHairSvg = '';
  if (opts.hairStyle === 'short') {
    frontHairSvg = `
      <path d="M68 85 C66 60 78 48 100 48 C122 48 134 60 132 85 C130 76 122 68 116 72 C110 76 102 70 96 74 C90 78 80 72 74 76 C70 78 68 82 68 85 Z" fill="${hair.fill}" />
      <path d="M85 52 C95 50 112 50 120 54 C120 54 115 62 102 60 C92 58 85 52 85 52 Z" fill="${hair.highlight}" opacity="0.35" />
    `;
  } else if (opts.hairStyle === 'wavy') {
    frontHairSvg = `
      <path d="M66 88 C62 58 75 44 100 44 C125 44 138 58 134 88 C134 78 126 66 116 70 C108 73 98 64 88 68 C80 71 70 76 66 88 Z" fill="${hair.fill}" />
      <path d="M66 84 C62 96 64 115 67 122 C69 114 70 102 70 94 Z" fill="${hair.fill}" />
      <path d="M134 84 C138 96 136 115 133 122 C131 114 130 102 130 94 Z" fill="${hair.fill}" />
      <path d="M82 48 C94 46 114 48 124 54 C116 58 98 56 86 54 Z" fill="${hair.highlight}" opacity="0.4" />
    `;
  } else if (opts.hairStyle === 'curly') {
    frontHairSvg = `
      <!-- Afro / Curly volume -->
      <circle cx="72" cy="62" r="16" fill="${hair.fill}" />
      <circle cx="90" cy="50" r="17" fill="${hair.fill}" />
      <circle cx="110" cy="50" r="17" fill="${hair.fill}" />
      <circle cx="128" cy="62" r="16" fill="${hair.fill}" />
      <circle cx="64" cy="80" r="15" fill="${hair.fill}" />
      <circle cx="136" cy="80" r="15" fill="${hair.fill}" />
      <circle cx="64" cy="98" r="14" fill="${hair.fill}" />
      <circle cx="136" cy="98" r="14" fill="${hair.fill}" />
      <path d="M72 82 C72 65 82 56 100 56 C118 56 128 65 128 82 C122 76 112 72 100 72 C88 72 78 76 72 82 Z" fill="${hair.fill}" />
    `;
  } else if (opts.hairStyle === 'long') {
    frontHairSvg = `
      <path d="M66 90 C64 56 75 44 100 44 C125 44 136 56 134 90 C130 75 122 65 114 68 C104 72 96 66 88 68 C80 70 70 76 66 90 Z" fill="${hair.fill}" />
      <path d="M66 90 C62 108 58 135 60 155 C64 140 68 120 70 100 Z" fill="${hair.fill}" />
      <path d="M134 90 C138 108 142 135 140 155 C136 140 132 120 130 100 Z" fill="${hair.fill}" />
    `;
  } else if (opts.hairStyle === 'bun') {
    frontHairSvg = `
      <path d="M68 85 C66 60 78 48 100 48 C122 48 134 60 132 85 C126 74 116 68 100 68 C84 68 74 74 68 85 Z" fill="${hair.fill}" />
      <path d="M70 82 C68 94 70 104 71 108 C72 102 73 92 74 84 Z" fill="${hair.fill}" />
      <path d="M130 82 C132 94 130 104 129 108 C128 102 127 92 126 84 Z" fill="${hair.fill}" />
    `;
  } else if (opts.hairStyle === 'braids') {
    frontHairSvg = `
      <path d="M68 85 C66 60 78 48 100 48 C122 48 134 60 132 85 C124 74 114 68 100 68 C86 68 76 74 68 85 Z" fill="${hair.fill}" />
      <!-- Braids falling in front -->
      <path d="M66 85 C60 105 58 135 62 165 C65 160 68 130 70 95 Z" fill="${hair.fill}" />
      <path d="M134 85 C140 105 142 135 138 165 C135 160 132 130 130 95 Z" fill="${hair.fill}" />
      <!-- Braid bands -->
      <rect x="60" y="152" width="6" height="3" fill="#F59E0B" rx="1" />
      <rect x="134" y="152" width="6" height="3" fill="#F59E0B" rx="1" />
    `;
  } else if (opts.hairStyle === 'hijab') {
    frontHairSvg = `
      <!-- Hijab Head Wrap -->
      <path d="M64 100 C58 55 72 38 100 38 C128 38 142 55 136 100 C134 120 136 145 146 168 C130 176 110 170 100 162 C90 170 70 176 54 168 C64 145 66 120 64 100 Z" fill="${hair.fill}" />
      <!-- Inner framing face -->
      <path d="M72 82 C72 68 84 62 100 62 C116 62 128 68 128 82 C128 114 122 134 100 134 C78 134 72 114 72 82 Z" fill="${skin.fill}" />
      <!-- Re-draw face elements on top of cutout -->
      <!-- Shadow under chin fold -->
      <path d="M85 134 Q100 142 115 134" stroke="${hair.highlight}" stroke-width="2" fill="none" opacity="0.6" />
    `;
  } else {
    // Bald
    frontHairSvg = ``;
  }

  // Accessories
  let accessorySvg = '';
  if (opts.accessory === 'round_glasses') {
    accessorySvg = `
      <!-- Round Glasses -->
      <circle cx="86" cy="96" r="12" stroke="#1E293B" stroke-width="2.5" fill="rgba(255,255,255,0.2)" />
      <circle cx="114" cy="96" r="12" stroke="#1E293B" stroke-width="2.5" fill="rgba(255,255,255,0.2)" />
      <path d="M98 96 L102 96" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" />
      <path d="M74 95 L68 93" stroke="#1E293B" stroke-width="2" />
      <path d="M126 95 L132 93" stroke="#1E293B" stroke-width="2" />
      <!-- Glare -->
      <path d="M81 91 L85 87" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />
      <path d="M109 91 L113 87" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" opacity="0.8" />
    `;
  } else if (opts.accessory === 'square_glasses') {
    accessorySvg = `
      <!-- Square Glasses -->
      <rect x="74" y="86" width="23" height="20" rx="4" stroke="#1E293B" stroke-width="2.5" fill="rgba(255,255,255,0.18)" />
      <rect x="103" y="86" width="23" height="20" rx="4" stroke="#1E293B" stroke-width="2.5" fill="rgba(255,255,255,0.18)" />
      <path d="M97 94 L103 94" stroke="#1E293B" stroke-width="2.5" />
      <path d="M74 93 L68 92" stroke="#1E293B" stroke-width="2" />
      <path d="M126 93 L132 92" stroke="#1E293B" stroke-width="2" />
      <!-- Glare -->
      <path d="M77 90 L83 90" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
      <path d="M106 90 L112 90" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.7" />
    `;
  } else if (opts.accessory === 'sunglasses') {
    accessorySvg = `
      <!-- Cool Sunglasses -->
      <path d="M73 88 L98 88 C98 102 92 108 85 108 C78 108 73 102 73 88 Z" fill="#0F172A" />
      <path d="M102 88 L127 88 C127 102 122 108 115 108 C108 108 102 102 102 88 Z" fill="#0F172A" />
      <path d="M98 90 L102 90" stroke="#0F172A" stroke-width="3" />
      <path d="M73 90 L68 89" stroke="#0F172A" stroke-width="2.5" />
      <path d="M127 90 L132 89" stroke="#0F172A" stroke-width="2.5" />
      <!-- Gradient sheen reflection -->
      <path d="M76 91 L88 105" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" opacity="0.7" />
      <path d="M105 91 L117 105" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" opacity="0.7" />
    `;
  } else if (opts.accessory === 'beanie') {
    accessorySvg = `
      <!-- Beanie Hat -->
      <path d="M66 75 C64 45 80 34 100 34 C120 34 136 45 134 75 Z" fill="#EF4444" />
      <!-- Folded rim -->
      <rect x="64" y="68" width="72" height="13" rx="4" fill="#DC2626" />
      <path d="M68 74 L132 74" stroke="#B91C1C" stroke-width="1.5" stroke-dasharray="2 2" />
      <!-- Top pompom -->
      <circle cx="100" cy="32" r="6" fill="#FCA5A5" />
    `;
  } else if (opts.accessory === 'cap') {
    accessorySvg = `
      <!-- Baseball Cap -->
      <path d="M66 74 C66 48 80 40 100 40 C120 40 134 48 134 74 Z" fill="#635BFF" />
      <!-- Cap Visor -->
      <path d="M62 72 Q100 64 146 72 Q100 78 62 72 Z" fill="#4E45E4" />
      <!-- Top button -->
      <circle cx="100" cy="40" r="3" fill="#3730A3" />
    `;
  } else if (opts.accessory === 'headphones') {
    accessorySvg = `
      <!-- Over-ear Headphones Band -->
      <path d="M64 96 C56 50 72 32 100 32 C128 32 144 50 136 96" stroke="#1E293B" stroke-width="5" fill="none" stroke-linecap="round" />
      <!-- Left Ear Cup -->
      <rect x="58" y="86" width="10" height="24" rx="5" fill="#3B82F6" stroke="#1E293B" stroke-width="2" />
      <!-- Right Ear Cup -->
      <rect x="132" y="86" width="10" height="24" rx="5" fill="#3B82F6" stroke="#1E293B" stroke-width="2" />
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  ${metaComment}
  <defs>
    <clipPath id="avatar-clip">
      <circle cx="100" cy="100" r="94" />
    </clipPath>
  </defs>

  <!-- Background Circle with Outer Ring -->
  <circle cx="100" cy="100" r="98" fill="${bg.ring}" />
  <circle cx="100" cy="100" r="94" fill="${bg.fill}" />

  <g clip-path="url(#avatar-clip)">
    <!-- Back Hair Layer -->
    ${backHairSvg}

    <!-- Torso / Clothes -->
    ${clothingSvg}

    <!-- Neck & Shadow -->
    <rect x="91" y="120" width="18" height="24" fill="${skin.fill}" />
    <path d="M91 120 C91 126 109 126 109 120 Z" fill="${skin.shadow}" />

    <!-- Ears -->
    <circle cx="70" cy="98" r="8" fill="${skin.fill}" />
    <circle cx="70" cy="98" r="4.5" fill="${skin.shadow}" opacity="0.6" />
    <circle cx="130" cy="98" r="8" fill="${skin.fill}" />
    <circle cx="130" cy="98" r="4.5" fill="${skin.shadow}" opacity="0.6" />

    <!-- Head / Face -->
    <ellipse cx="100" cy="98" rx="29" ry="33" fill="${skin.fill}" />

    <!-- Nose -->
    <path d="M100 97 L98 106 L102 106" stroke="${skin.shadow}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <!-- Facial Expression (Eyes, Eyebrows, Mouth, Blush) -->
    ${expressionSvg}

    <!-- Front Hair Layer -->
    ${frontHairSvg}

    <!-- Accessories (Glasses, Hat, Headphones) -->
    ${accessorySvg}
  </g>
</svg>`;
}

export function getDefaultAvatarSvg(): string {
  return generateAvatarSvg(getDefaultAvatarOptions());
}

export function getAvatarDataUrl(options?: AvatarOptions): string {
  const opts = options || getDefaultAvatarOptions();
  const svg = generateAvatarSvg(opts);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function parseAvatarOptions(avatarUrl?: string | null): AvatarOptions | null {
  if (!avatarUrl || !avatarUrl.startsWith('data:image/svg+xml')) return null;
  try {
    const decoded = decodeURIComponent(avatarUrl);
    const match = decoded.match(/<!--META:(.*?)-->/);
    if (match && match[1]) {
      return JSON.parse(match[1]) as AvatarOptions;
    }
  } catch (e) {
    // Ignore parse error
  }
  return null;
}
