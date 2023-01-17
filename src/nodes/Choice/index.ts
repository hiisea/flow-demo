
import { NodeOptions, createNode } from "../../core";
import Component from "./Node";
import tools from "./tools";

const nodeOptions: NodeOptions = {
  type: "Choice",
  name: "条件判断",
  component: Component,
  nodeSize: { width: 250, height: 100, paddingTop: 65, paddingBottom:100 },
  tools,
  afterCreate: (node, graph) => {
    createNode(graph, node, "Switch", { name: "条件判断" });
    createNode(graph, node, "Switch", { name: "条件判断" });
  },
};
export default nodeOptions;
