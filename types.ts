export interface StoryboardCut {
  cutNumber: number;
  visualDescription: string;
  sourceFileName: string;
  subtitles: string;
  narration: string;
  imagePrompt: string; // Internal prompt used for image generation
}

export interface StoryboardResponse {
  title: string;
  synopsis: string;
  cuts: StoryboardCut[];
}

export interface StoryboardBrief {
  topic: string; // General topic/title
  purpose: string; // Content purpose
  targetAudience: string; // Target learner/level
  keyConcepts: string; // Key concepts to cover
  narrativeFlow: string; // e.g., Intro -> Problem -> Concept -> Example -> Outro
  cutCount: string; // Estimated duration/cut count
  constraints: string; // Restrictions (e.g., no violence, keep character consistent)
  conceptSettings: string; // Character/Concept board details (Text fallback)
  conceptFile?: {
    name: string;
    data: string; // Base64 string without prefix
    mimeType: string;
  } | null;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_IMAGES = 'GENERATING_IMAGES',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

// Augment the window object to support AI Studio's key management
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}