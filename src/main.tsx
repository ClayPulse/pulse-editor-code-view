import "./tailwind.css";
import React from "react";
import { ReceiveFileProvider } from "@pulse-editor/react-api";
import ViewIndex from "./component/view-index";

export default function Main() {
  return (
    <ReceiveFileProvider>
      <ViewIndex />
    </ReceiveFileProvider>
  );
}
