import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReactQRCode } from "@lglab/react-qr-code";

const html = renderToStaticMarkup(
  React.createElement(ReactQRCode, {
    level: "L",
    size: 264,
    value: "4uLU6hLS9Q9RgUdKQ9Vtqq",
    dataModulesSettings: { style: "rounded", color: "#201640" },
    finderPatternOuterSettings: { style: "rounded", color: "#ff2ec4" },
    finderPatternInnerSettings: { style: "circle", color: "#9b30ff" },
  })
);

console.log(html);
