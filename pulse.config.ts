import { ExtensionConfig, ExtensionTypeEnum } from "@pulse-editor/shared-utils";
import packageJson from "./package.json" with { type: "json" };

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
};

export default config;
