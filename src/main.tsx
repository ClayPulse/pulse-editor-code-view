import React, { useEffect } from "react";
import "./tailwind.css";
import CodeEditorView from "./component/code-editor-view";
import config from "../pulse.config";

export const Config = config;

export default function Main() {
  useEffect(() => {
    console.log("Extension loaded");

    return () => {
      console.log("Extension unloaded");
    };
  }, []);
  return <CodeEditorView />;
}
