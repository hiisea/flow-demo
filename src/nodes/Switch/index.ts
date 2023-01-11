import {NodeConfig}  from '../../core';
import Node from './Node';
import PropertyForm from './PropertyForm';

const nodeConfig: NodeConfig = {
  type: 'Switch',
  name: '条件分支',
  hidden: true,
  nodeSize: { width: 200, height: 40 },
  component: Node,
  propertyForm: PropertyForm
}
export default nodeConfig;