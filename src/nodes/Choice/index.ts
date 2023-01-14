import { Node, CellView } from "@antv/x6";
import { NodeOptions, createNode } from "../../core";
import Component from "./Node";

const nodeOptions: NodeOptions = {
  type: "Choice",
  name: "条件判断",
  component: Component,
  nodeSize: { width: 250, height: 100, paddingTop: 80, paddingBottom:80 },
  tools: [
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
  ],
  afterCreate: (node, graph) => {
    createNode(graph, node, "Switch", { name: "条件判断" });
    createNode(graph, node, "Switch", { name: "条件判断" });
  },
};
export default nodeOptions;
