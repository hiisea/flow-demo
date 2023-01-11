import { Node } from "@antv/x6";
import { Space, Button, Modal } from "antd";
import React, { memo, useMemo } from "react";
import { getConfig, BaseNodeModel } from "./base";

interface Props {
  sourceNode: Node;
  onSubmit: (nodeType: string) => void;
  onCancel: () => void;
}

const Component: React.FC<Props> = ({ sourceNode, onSubmit, onCancel }) => {
  const nodeMetas = useMemo(() => getConfig("nodeMetas"), []);
  const nodeModel = useMemo(
    () => sourceNode.getData() as BaseNodeModel,
    [sourceNode]
  );

  return (
    <>
      <Modal
        title={`上游节点：${nodeModel.name}`}
        open={true}
        onCancel={onCancel}
        footer={null}
      >
        <Space wrap>
          {Object.keys(nodeMetas).map((type) => {
            const nodeConfig = nodeMetas[type];
            if (nodeConfig.hidden) {
              return null;
            }
            return (
              <Button key={type} type="primary" onClick={() => onSubmit(type)}>
                {nodeConfig.name}
              </Button>
            );
          })}
        </Space>
      </Modal>
    </>
  );
};

export default memo(Component);
