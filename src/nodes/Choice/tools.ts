import { Node, CellView } from "@antv/x6";
import { createNode } from "../../core";
const tools = [
  {
    name: "button",
    args: {
      x: "50%",
      y: "0%",
      offset: { x: -44, y: 0 },
      markup: [
        {
          tagName: "rect",
          selector: "body",
          attrs: {
            width: 90,
            height: 30,
            rx: 6,
            ry: 6,
            fill: "#47ae70",
            cursor: "pointer",
          },
        },
        {
          tagName: "text",
          selector: "label",
          textContent: "+ 添加条件",
          attrs: {
            x: 45,
            y: 19,
            fill: "#fff",
            fontSize: 14,
            textAnchor: "middle",
            textVerticalAnchor: "middle",
            pointerEvents: "none",
          },
        },
      ],
      onClick({ view, cell }: { view: CellView; cell: Node }) {
        createNode(view.graph, cell, "Switch", { name: "条件判断" });
      },
    },
  },
];

export default tools;