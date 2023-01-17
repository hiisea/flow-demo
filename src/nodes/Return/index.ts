import {NodeOptions}  from '../../core';
import Node from './Node';

const nodeOptions: NodeOptions = {
  type: 'Return',
  name: '结束',
  component: Node,
  nodeSize: { width: 200, height: 40 },
  hidden: true,
  preventDeletion: true,
}
export default nodeOptions;