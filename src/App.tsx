import React from "react";
import { Graph, Cell, Node } from "@antv/x6";
import { Button, Layout, Space } from "antd";
import {
  loadConfig,
  initGraph,
  updateLayout,
  loadData,
  NodePropertyPanel,
} from "./core";
import "./core/index.css";
import "./index.css";

const { Header, Content } = Layout;

export interface State {
  curNodeOnSelected?: Node;
}

export default class Component extends React.Component<{}, State> {
  private container!: HTMLDivElement;
  private graph!: Graph;
  state: State = {};

  private refContainer = (container: HTMLDivElement) => {
    this.container = container;
  };

  private getData = () => {
    const data = this.graph.toJSON();
    console.log(data);
  };

  componentDidMount() {
    Promise.all([loadConfig(), loadData()]).then(([config, data]) => {
      this.graph = initGraph(this.container, data);
      this.graph.on("node:selected", (args: { cell: Cell; node: Node }) => {
        this.setState({ curNodeOnSelected: args.node });
      });
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
            <Space>
              <Button onClick={this.getData}>获取数据</Button>
              <Button onClick={() => updateLayout(this.graph)}>重新布局</Button>
            </Space>
          </Header>
          <Content ref={this.refContainer}></Content>
        </Layout>
        <NodePropertyPanel sourceNode={this.state.curNodeOnSelected} />
      </>
    );
  }
}
