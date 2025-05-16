import { ExtensionConfig, ExtensionTypeEnum } from "@pulse-editor/shared-utils";
import packageJson from "./package.json" with { type: "json" };
import { inlineSuggestionAgent } from "./src/lib/agents/inline-suggestion-agent";
import { codeEditorAgent } from "./src/lib/agents/code-editor-agent";
import { codingAgentCommandInfo } from "./src/lib/commands";


/**
 * Pulse Editor Extension Config
 *
 */
const config: ExtensionConfig = {
  // Do not use hyphen character '-' in the id. 
  // The id should be the same as the package name in package.json.
  id: packageJson.name,
  displayName: packageJson.displayName,
  description: packageJson.description,
  version: packageJson.version,
  author: "ClayPulse",
  extensionType: ExtensionTypeEnum.FileView,
  fileTypes: ["txt", "json", "py", "cpp", "c", "tsx", "ts", "js", "jsx"],
  agents: [
    inlineSuggestionAgent,
    codeEditorAgent,
  ],
  commandsInfoList: [codingAgentCommandInfo],
};

export default config;
