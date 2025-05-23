import { ExtensionCommandInfo } from "@pulse-editor/shared-utils";

export const codingAgentCommandInfo: ExtensionCommandInfo = {
  name: "coding-using-file-content",
  description: "Generate or modify code using file content",
  parameters: {
    userMessage: {
      name: "userMessage",
      type: "string",
      description: "The message to send to the agent.",
    },
    knowledge: {
      name: "knowledge",
      type: "string",
      description:
        "Additional knowledge that might be useful for the agent to understand user's instruction. \
This is to give the agent more context about the task so they don't hallucinate. "
    }
  },
};


