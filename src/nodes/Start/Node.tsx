import { Model } from "./Model";
import { NodeComponent } from "../../core";

const Component: NodeComponent = ({ node }) => {

  const model = node.getData() as Model;

  return <div>{`${model.name}`}</div>;
};

export default Component;
