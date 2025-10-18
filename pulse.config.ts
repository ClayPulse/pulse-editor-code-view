import { AppConfig, AppTypeEnum } from "@pulse-editor/shared-utils";
import packageJson from "./package.json" with { type: "json" };
import { preRegisteredActions } from "./pregistered-actions";
import { inlineSuggestionAgent } from "./src/lib/agents/inline-suggestion-agent";
import { codeEditorAgent } from "./src/lib/agents/code-editor-agent";
import { vibeCodeAgent } from "./src/lib/agents/vibe-code-agent";

/**
 * Pulse Editor Extension Config
 *
 */
const config: AppConfig = {
  // Do not use hyphen character '-' in the id. 
  // The id should be the same as the package name in package.json.
  id: packageJson.name,
  version: packageJson.version,
  libVersion: packageJson.dependencies["@pulse-editor/shared-utils"],
  displayName: packageJson.displayName,
  description: packageJson.description,
  appType: AppTypeEnum.FileView,
  visibility: "public",
  recommendedHeight: 360,
  recommendedWidth: 640,
  thumbnail: "assets/thumbnail.png",
  preRegisteredActions: Object.values(preRegisteredActions),
   fileTypes: ["txt", "json", "py", "cpp", "c", "tsx", "ts", "js", "jsx", "html", "markdown", "md", "yml", "gitignore"],
  agents: [
    inlineSuggestionAgent,
    codeEditorAgent,
    vibeCodeAgent,
  ],
};

export default config;
