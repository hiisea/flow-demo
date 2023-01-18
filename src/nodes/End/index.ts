import {NodeOptions}  from '../../core';
import Node from './Node';

const nodeOptions: NodeOptions = {
  type: 'End',
  name: '结束',
  component: Node,
  nodeSize: { width: 150, height: 35 },
  hidden: true,
  preventDeletion: true,
  fixed: true,
}
export default nodeOptions;