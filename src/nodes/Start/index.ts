import {NodeConfig}  from '../../core';
import Node from './Node';

const nodeConfig: NodeConfig = {
  type: 'Start',
  name: '开始执行',
  hidden: true,
  nodeSize: { width: 200, height: 40 },
  component: Node,
}
export default nodeConfig;