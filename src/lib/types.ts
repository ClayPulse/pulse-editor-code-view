export type DrawnLine = {
  points: {
    x: number;
    y: number;
  }[];
};

export type Point = { x: number; y: number };

export type InlineSuggestionResult = {
  snippets: string[];
};

export type CodeCompletionInstruction = {
  text?: string;
  audio?: Blob;
};

export type CodeCompletionResult = {
  text: {
    codeCompletion: string;
    explanation: string;
  };
  audio?: Blob;
};
