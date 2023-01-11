import { Node } from "@antv/x6";
import React, { memo, useMemo } from "react";
import { getConfig, BaseNodeModel } from "./base";

interface Props {
  sourceNode: Node;
}

const Component: React.FC<Props> = ({ sourceNode }) => {
  const nodeMetas = useMemo(() => getConfig("nodeMetas"), []);
  const nodeModel = useMemo(() => sourceNode.getData() as BaseNodeModel, [sourceNode]);
  const Property = nodeMetas[nodeModel.type].propertyForm;

  return (
    <div style={{background: '#999'}}>{
        !!Property && <Property sourceNode={sourceNode} />
    }</div>
  );
};

export default memo(Component);
