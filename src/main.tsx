import "./tailwind.css";
import React, { useEffect } from "react";
import CodeEditorView from "./component/code-editor-view";

export default function Main() {
  useEffect(() => {
    console.log("Extension loaded");

    return () => {
      console.log("Extension unloaded");
    };
  }, []);

  return <CodeEditorView />;
}
