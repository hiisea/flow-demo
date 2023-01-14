import { Model } from "./Model";
import { NodeComponent } from "../../core";

const Component: NodeComponent = ({ node }) => {
  const model = node.getData() as Model;

  return <>{`${model.type}-${model.name}-${model.id.split("-").pop()}`}</>;
};

export default Component;
