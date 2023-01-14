import React from "react";
import classnames from "classnames";
import { Graph, Node } from "@antv/x6";
import "@antv/x6-react-shape";
import { BaseNodeModel, getConfig } from "./base";

export const DagNode = React.memo(
  ({ node }: { node?: Node }) => {
    if (!node) {
      return null;
    }
    const model = node.getData() as BaseNodeModel;
    const nodeMetas = getConfig("nodeMetas");
    const nodeConfig = nodeMetas[model.type];
    return (
      <>
        <div className={classnames("xdag-node", `xdag-${model.type}`)}>
          <nodeConfig.component node={node} />
        </div>
        <div data-event="node:createNextNode" className="xdag-plus-dag" />
      </>
    );
  },
  (prev, next) => {
    return Boolean(next.node?.hasChanged("data"));
  }
);

// export class DagNode extends React.Component<{ node?: Node }> {
//   shouldComponentUpdate() {
//     return Boolean(this.props.node?.hasChanged('data'))
//   }

//   render() {
//     const node = this.props.node!;
//     const model = node.getData() as BaseNodeModel;
//     const nodeMetas = getConfig("nodeMetas");
//     const nodeConfig = nodeMetas[model.type];

//     return (
//       <div
//         className={classnames("xdag-dag-node", `xdag-node-${model.type}`)}
//       >
//         <nodeConfig.component node={node} />
//         <div data-event="node:createNextNode" className="xdag-plus-dag" />
//       </div>
//     );
//   }
// }

Graph.registerEdge(
  "dag-edge",
  {
    inherit: "edge",
    connector: {
      name: "rounded",
      args: { radius: 10 },
    },
    attrs: {
      line: {
        stroke: "#666",
        strokeWidth: 1,
      },
    },
  },
  true
);

Graph.registerNode(
  "dag-node",
  {
    inherit: "react-shape",
    width: 180,
    height: 36,
    component: <DagNode />,
    ports: {
      groups: {
        in: {
          position: "top",
          attrs: {
            circle: {
              r: 0.1,
              magnet: true,
              stroke: "#C2C8D5",
              strokeWidth: 1,
              fill: "#fff",
              style: {
                visibility: "hidden",
              },
            },
          },
        },
        out: {
          position: "bottom",
          attrs: {
            circle: {
              r: 0.1,
              magnet: true,
              stroke: "#C2C8D5",
              strokeWidth: 1,
              fill: "#fff",
              style: {
                visibility: "hidden",
              },
            },
          },
        },
      },
      items: [
        {
          id: "in",
          group: "in",
          attrs: {
            circle: {
              pid: "in",
            },
          },
        },
        {
          id: "out",
          group: "out",
          attrs: {
            circle: {
              pid: "out",
            },
          },
        },
      ],
    },
  },
  true
);
