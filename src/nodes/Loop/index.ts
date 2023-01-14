import {NodeOptions, createNode}  from '../../core';
import Node from './Node';

const nodeOptions: NodeOptions = {
  type: 'Loop',
  name: '循环体',
  component: Node,
  nodeSize: {width: 200, height:100, paddingBottom: 80 },
  afterCreate: (node, graph) => {
    createNode(graph, node, "Start", {name: '开始循环'});
  }
}
export default nodeOptions;