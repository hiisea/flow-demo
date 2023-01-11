import React from "react";
import { Graph, Cell, Node, StringExt } from "@antv/x6";

import { Button, Layout } from "antd";
import {
  getConfig,
  NodeOptionsForm,
  loadConfig,
  loadData,
  BaseNodeModel,
} from "./base";
import { initGraph, createNode, updateLayout } from "./funs";
import NewNodeSelector from "./NewNodeSelector";
import NodeProperty from "./NodeProperty";
import "./DagNode";
import "./index.css";



// g.setNode("kspacey",    { label: "Kevin Spacey",  width: 144, height: 100 });
// g.setNode("swilliams",  { label: "Saul Williams", width: 160, height: 100 });
// g.setNode("bpitt",      { label: "Brad Pitt",     width: 108, height: 100 });
// g.setNode("hford",      { label: "Harrison Ford", width: 168, height: 100 });
// g.setNode("lwilson",    { label: "Luke Wilson",   width: 144, height: 100 });
// g.setNode("kbacon",     { label: "Kevin Bacon",   width: 121, height: 100 });

// // Add edges to the graph.
// g.setEdge("kspacey",   "swilliams");
// g.setEdge("swilliams", "kbacon");
// g.setEdge("bpitt",     "kbacon");
// g.setEdge("hford",     "lwilson");
// g.setEdge("lwilson",   "kbacon");

// dagre.layout(g);

// g.nodes().forEach(function(v:any) {
//   console.log("Node " + v + ": " + JSON.stringify(g.node(v)));
// });
// g.edges().forEach(function(e:any) {
//  console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)));
// });

const { Header, Sider, Content } = Layout;

export interface State {
  curNodeOnSelected?: Node;
  curNodeOnCreate?: Node;
}

export default class Component extends React.Component<{}, State> {
  private container!: HTMLDivElement;
  private graph!: Graph;
  state: State = {};

  private refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  // private createSwitchNode(parentNode: Node){
  //   const newNodeType = 'Switch';
  //   const nodeMetas = getConfig("nodeMetas");
  //   const { nodeSize, type, name } = nodeMetas[newNodeType];
  //   const id = `${newNodeType}-${StringExt.uuid()}-${uid++}`;
  //   const position = parentNode.getPosition()
  //   const child = this.graph.addNode({
  //     id,
  //     shape: "dag-node",
  //     x: position.x,
  //     y: position.y,
  //     width: nodeSize.width,
  //     height: nodeSize.height,
  //     data: {
  //       id,
  //       type,
  //       name,
  //     },
  //   })
  //   this.graph.addEdge({
  //     shape: "dag-edge",
  //     source: {
  //       cell: parentNode,
  //       port: "in",
  //     },
  //     target: {
  //       cell: child,
  //       port: "in",
  //     },
  //   })
  //   parentNode.addChild(child);
  // }
  // private createNode(
  //   sourceNode: Node,
  //   newNodeType: string,
  //   newNodeOptions: { [key: string]: any }
  // ) {
  //   const [originEdge] = this.graph.getOutgoingEdges(sourceNode) || [];
  //   console.log("edge", originEdge);
  //   const originNextNode = originEdge?.getTargetNode();
  //   console.log("node", originNextNode);
  //   const position = this.computeNewNodePosition(sourceNode);
  //   const nodeMetas = getConfig("nodeMetas");
  //   const { nodeSize, type, name } = nodeMetas[newNodeType];
  //   const id = `${newNodeType}-${StringExt.uuid()}-${uid++}`;
  //   const targetNode = this.graph.addNode({
  //     id,
  //     shape: "dag-node",
  //     x: position.x,
  //     y: position.y,
  //     width: nodeSize.width,
  //     height: nodeSize.height,
  //     data: {
  //       id,
  //       type,
  //       name,
  //       ...newNodeOptions,
  //     },
  //   });
  //   this.graph.addEdge({
  //     //id: `${sourceNode.id}->${targetNode.id}`,
  //     shape: "dag-edge",
  //     source: {
  //       cell: sourceNode,
  //       port: "out",
  //     },
  //     target: {
  //       cell: targetNode,
  //       port: "in",
  //     },
  //   });
  //   if (originEdge) {
  //     originEdge.setSource(targetNode);
  //   }
  //   const parent = sourceNode.getParent();
  //   if(parent){
  //     parent.addChild(targetNode);
  //   }
  //   this.updateLayout();
  // }
  private onNodeSelectorCancel = () => {
    this.setState({ curNodeOnCreate: undefined });
  };
  private onNodeSelectorSubmit = (nodeType: string) => {
    const sourceNode = this.state.curNodeOnCreate!;
    this.setState({ curNodeOnCreate: undefined });
    createNode(this.graph, sourceNode, nodeType);
  };
  
  
  private getData = () => {
    const data = this.graph.toJSON();
    console.log(data);
  };
  
  componentDidMount() {
    Promise.all([loadConfig(), loadData()]).then(([config, data]) => {
      this.graph = initGraph(this.container, data);
      this.graph.on("node:createNextNode", ({ node }: { node: Node }) => {
        this.setState({ curNodeOnCreate: node });
      });
      this.graph.on("node:createSwitchNode", ({ node }: { node: Node }) => {
        createNode(this.graph, node, 'Switch');
      });
      this.graph.on(
        "node:selected",
        (args: {
          cell: Cell;
          node: Node;
          //options: Model.SetOptions
        }) => {
          this.setState({ curNodeOnSelected: args.node });
        }
      );
      this.graph.on("node:unselected", (args: { cell: Cell; node: Node }) => {
        this.setState({ curNodeOnSelected: undefined });
      });
    });
  }
  render() {
    return (
      <>
        <Layout style={{ height: "100vh", display: "flex" }}>
          <Header>
            <Button onClick={this.getData}>获取数据</Button>
            <Button onClick={()=>updateLayout(this.graph)}>重新布局</Button>
          </Header>
          <Layout>
            <Content ref={this.refContainer}></Content>
            <Sider>
              {!!this.state.curNodeOnSelected && (
                <NodeProperty sourceNode={this.state.curNodeOnSelected} />
              )}
            </Sider>
          </Layout>
        </Layout>
        {!!this.state.curNodeOnCreate && (
          <NewNodeSelector
            sourceNode={this.state.curNodeOnCreate}
            onSubmit={this.onNodeSelectorSubmit}
            onCancel={this.onNodeSelectorCancel}
          />
        )}
      </>
    );
  }
}
