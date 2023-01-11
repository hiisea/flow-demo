import { Model } from "./Model";
import { NodeComponent } from "../../core";

const Component: NodeComponent = ({ node }) => {
  const model = node.getData() as Model;

  return <div className="xcustom-plus-switch" data-event="node:createSwitchNode">+ 添加条件</div>;
};

export default Component;
