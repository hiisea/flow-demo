import { Node } from "@antv/x6";
import React, { memo, useMemo } from "react";


interface Props {
  sourceNode: Node;
}

const Component: React.FC<Props> = ({ sourceNode }) => {
  return (
    <div>aaaa</div>
  );
};

export default memo(Component);
