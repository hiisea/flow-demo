import { NodeOptions } from "../../core";
import Node from './Node';
import PropertyForm from './PropertyForm';

const nodeOptions: NodeOptions = {
  type: 'DataProcessing',
  name: '数据加工',
  component: Node,
  nodeSize: {width: 250, height:40 },
  propertyForm: PropertyForm
}
export default nodeOptions;