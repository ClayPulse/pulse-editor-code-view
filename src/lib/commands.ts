import { ExtensionCommandInfo } from "@pulse-editor/shared-utils";

export const codingAgentCommandInfo: ExtensionCommandInfo = {
  name: "codingUsingFileContent",
  description: "Generate or modify code using file content",
  parameters: {
    userMessage: {
      name: "userMessage",
      type: "string",
      description: "The message to send to the agent.",
    },
  },
};


