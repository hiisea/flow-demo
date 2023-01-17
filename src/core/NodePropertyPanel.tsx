import { Node } from "@antv/x6";
import React, { useMemo } from "react";
import { Drawer } from "antd";
import { getConfig, BaseNodeModel } from "./base";

interface Props {
  sourceNode?: Node;
}

export const NodePropertyPanel: React.FC<Props> = React.memo(({ sourceNode }) => {
  const nodeMetas = getConfig("nodeMetas");
  const nodeModel = sourceNode?.getData() as BaseNodeModel | undefined;
  const PropertyForm = nodeModel && nodeMetas
    ? nodeMetas[nodeModel.type].propertyForm
    : undefined;
  const propertyForm = useMemo(()=>{
    if(PropertyForm && sourceNode && nodeModel){
      return <PropertyForm node={sourceNode} model={nodeModel} />
    }
    return null;
  },[PropertyForm, nodeModel, sourceNode])
  return (
    <Drawer title={nodeModel?.type} placement="right" open={!!PropertyForm} closable={false} mask={false}>
      {propertyForm}
    </Drawer>
  );
  // const nodeMetas = useMemo(() => getConfig("nodeMetas"), []);
  // const nodeModel = useMemo(() => sourceNode.getData() as BaseNodeModel, [sourceNode]);
  // const Property = nodeMetas[nodeModel.type].propertyForm;

  // return (
  //   <div style={{background: '#999'}}>{
  //       !!Property && <Property sourceNode={sourceNode} />
  //   }</div>
  // );
});
