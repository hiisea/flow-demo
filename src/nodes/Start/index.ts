import {NodeOptions}  from '../../core';
import Node from './Node';

const nodeOptions: NodeOptions = {
  type: 'Start',
  name: '开始',
  component: Node,
  nodeSize: { width: 150, height: 35 },
  hidden: true,
  preventDeletion: true,
}
export default nodeOptions;