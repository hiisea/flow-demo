import {NodeConfig}  from '../../core';
import Node from './Node';
import PropertyForm from './PropertyForm';

const nodeConfig: NodeConfig = {
  type: 'DataProcessing',
  name: '数据加工',
  nodeSize: { width: 250, height: 40 },
  component: Node,
  propertyForm: PropertyForm
}
export default nodeConfig;