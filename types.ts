
export enum VisualStyle {
  CINEMATIC = 'Cinematic Movie',
  MAKOTO_SHINKAI = 'Modern Makoto Shinkai Anime (Detailed Scenery, Vibrant Skies)',
  ANIME_GHIBLI = 'Anime (Studio Ghibli Style)',
  DARK_FANTASY_ANIME = 'Dark Fantasy Anime (Gothic, Dark Magic, Somber)',
  REALISTIC = 'Photorealistic / Hyper-realistic',
  CYBERPUNK = 'Cyberpunk Neon',
  D3_RENDER = 'Modern 3D Animation (Pixar-like)',
  SKETCH = 'Hand-drawn Pencil Sketch',
  OIL_PAINTING = 'Classic Oil Painting'
}

export enum MusicStyle {
  ORCHESTRAL = 'Orchestral / Epic',
  ELECTRONIC = 'Electronic / Synthwave',
  AMBIENT = 'Ambient / Nature',
  LOFI = 'Lo-fi / Chill',
  DARK_FANTASY = 'Dark Fantasy / Gothic',
  CINEMATIC = 'Modern Cinematic'
}

export enum Language {
  INDONESIAN = 'Indonesian',
  ENGLISH_US = 'English (US)',
  JAPANESE = 'Japanese',
  KOREAN = 'Korean'
}

export enum VideoType {
  SHORT = 'Short (15-60 seconds)',
  LONG = 'Long (2-5 minutes)'
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export interface PromptScene {
  sceneNumber: number;
  timeframe: string;
  visualPrompt: string;
  voiceOver: string;
  soundscape: string;
  continuityNotes: string;
}

export interface StoryGenerationResult {
  title: string;
  summary: string;
  characterReference: string;
  hook: string;
  body: string;
  climax: string;
  cta: string;
  thumbnailPrompt: string;
  tags: string[];
  hashtags: string[];
  scenes: PromptScene[];
}
