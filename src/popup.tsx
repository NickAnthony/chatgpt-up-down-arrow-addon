import React from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  return (
    <>
      <div style={{ width: "250px" }}>
        <h3>ChatGPT Up/Down arrow add on.</h3>
        <strong>
          <code>Up Arrow</code>
        </strong>{" "}
        loads the previous message.
        <br />
        <strong>
          <code>Down Arrow</code>
        </strong>{" "}
        load the next message.
        <br />
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
