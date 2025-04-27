import { AccessEnum, Agent } from "@pulse-editor/shared-utils";

export const InlineSuggestionAgent: Agent = {
  name: "inline-suggestion",
  version: "v0.0.1",
  description:
    "Inline Suggestion agent provides code completion snippets for coding tasks.",
  systemPrompt: `You are a helpful code copilot who helps a software developer to code. \
You will fill in the middle of the code where "<FILL>" is indicated. `,
  LLMConfig: {
    provider: "openai",
    modelName: "gpt-4o-mini",
    temperature: 0.7,
  },
  availableMethods: [
    {
      access: AccessEnum.private,
      name: "predictLine",
      parameters: {
        fileContentWithIndicator: {
          type: "string",
          description: "The code to predict the next line of",
        },
      },
      prompt: `/
You must make sure your code snippet(s) are related and continue the code before it. \
E.g. if the developer spells "ap" and you suggest "apple", it is continuing the word.

You must also make sure the indentation and line breaks are correct. \
If your snippet contains multiple lines, each line must end with a new line character; \
if "<FILL>" appears at the end of a line and the code before "<FILL>" is a complete line, \
your code snippet(s) must start with a line break. E.g. "\\nconsole.log('hello world');".

If the previous code before "<FILL>" is a comment, you can suggest a code snippet that \
is related to the comment. \

Code file:
\`\`\`
{fileContentWithIndicator}
\`\`\`

Review the above code, then provide one inline snippet indicated \
at "<FILL>".
`,
      returns: {
        snippet: {
          type: "string",
          description:
            "Suggestion using the same programming language as the code file.",
        },
      },
    },
  ],
};

export interface InlineSuggestionAgentReturns {
  snippet: string;
}
