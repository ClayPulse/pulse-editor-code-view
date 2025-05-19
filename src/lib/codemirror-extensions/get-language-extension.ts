import { Extension } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";

export function getLanguageExtension(filename: string): Extension | undefined {
  if (filename.endsWith(".js")) {
    return javascript();
  } else if (filename.endsWith(".ts")) {
    return javascript({ typescript: true });
  } else if (filename.endsWith(".jsx")) {
    return javascript({ jsx: true });
  } else if (filename.endsWith(".tsx")) {
    return javascript({ jsx: true, typescript: true });
  } else if (filename.endsWith(".py")) {
    return python();
  } else if (filename.endsWith(".md") || filename.endsWith(".markdown")) {
    return markdown();
  } else if (filename.endsWith(".json")) {
    return json();
  } else if (filename.endsWith(".html")) {
    return html();
  } else if (filename.endsWith(".css")) {
    return css();
  }

  return undefined;
}
