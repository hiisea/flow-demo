import {NodeOptions, createNode}  from '../../core';
import Node from './Node';

const nodeOptions: NodeOptions = {
  type: 'Loop',
  name: '循环执行',
  component: Node,
  nodeSize: {paddingTop:0, paddingBottom: 0 },
  tools: [],
  afterCreate: (node, graph) => {
    const startNode = createNode(graph, node, "Start", {name: '循环开始'});
    createNode(graph, startNode, "End", {name: '循环结束'});
  }
}
export default nodeOptions;