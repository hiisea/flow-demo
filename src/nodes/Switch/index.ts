import {NodeOptions}  from '../../core';
import Node from './Node';
import PropertyForm from './PropertyForm';

const nodeOptions: NodeOptions = {
  type: 'Switch',
  name: '分支',
  component: Node,
  nodeSize: { width: 200, height: 40 },
  hidden: true,
  propertyForm: PropertyForm
}
export default nodeOptions;