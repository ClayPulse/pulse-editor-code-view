import { AccessEnum, Agent } from "@pulse-editor/shared-utils";

export const codeEditorAgent: Agent = {
  name: "code-editor-agent",
  version: "0.0.1",
  description: "Code editor agent helps user code and/or modify programs.",
  systemPrompt: `\
You are a helpful code copilot who is helping a developer to code. \
You must review the code and complete instruction from the developer.
`,
  availableMethods: [
    {
      access: AccessEnum.private,
      name: "assistCoding",
      parameters: {
        fileContent: {
          name: "fileContent",
          type: "string",
          description: "The code file content.",
        },
        selectionInformationList: {
          name: "selectionInformationList",
          type: [
            {
              lineStart: {
                name: "lineStart",
                type: "number",
                description: "The start line number of the selection.",
              },
              lineEnd: {
                name: "lineEnd",
                type: "number",
                description: "The end line number of the selection.",
              },
              text: {
                name: "text",
                type: "string",
                description:
                  "The selected code blocks/lines. This might be extracted by OCR so not guaranteed to be accurate. Use it as a hint, and use the full code file for accurate reference.",
              },
            },
          ],
          description:
            "The information about the selected block and highlighted text.",
        },
        instruction: {
          name: "instruction",
          type: "string",
          description: "The instruction from the developer to modify the code.",
        },
        knowledge: {
          name: "knowledge",
          type: "string",
          description:
            "Additional knowledge that might be useful for the agent to understand user's instruction. \
This is to give the agent more context about the task so they don't hallucinate. "
        }
      },
      prompt: `\
You are provided with the code file, selected lines/blocks, and user's instruction. \
Finally, you must return in the specified JSON format.

Code file:
\`\`\`
{fileContent}
\`\`\`
Selected lines/blocks:
\`\`\`
{selectionInformationList}
\`\`\`
User's instruction:
\`\`\`
{instruction}
\`\`\`
Knowledge:
\`\`\`
{knowledge}
\`\`\`
`,
      returns: {
        updatedFile: {
          name: "updatedFile",
          type: "string",
          description: `The updated file content. This should include the entire file content, not just the modified lines.`,
        },
        explanation: {
          name: "explanation",
          type: "string",
          description:
            "An explanation of any changes. It must be in the same coding and/or natural language that the user uses in their instruction.",
        },
      },
    },
  ],
  LLMConfig: {
    provider: "openai",
    modelName: "gpt-4o",
    temperature: 0.95,
  },
};
