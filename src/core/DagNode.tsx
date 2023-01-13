import React from "react";
import classnames from "classnames";
import { Graph, Node } from "@antv/x6";
import { BaseNodeModel, getConfig } from "./base";
import "@antv/x6-react-shape";

// export const MyComponent = memo(
//   ({ node, text }: { node?: ReactShape; text: string }) => {
//     return // ...
//   },
//   (prev, next) => {
//     return Boolean(next.node?.hasChanged('data'))
//   },
// )

export class DagNode extends React.Component<{ node?: Node }> {
  shouldComponentUpdate() {
    const { node } = this.props;
    if (node) {
      if (node.hasChanged("data")) {
        return true;
      }
    }
    return false;
  }

  render() {
    const node = this.props.node!;
    const model = node.getData() as BaseNodeModel;
    const nodeMetas = getConfig("nodeMetas");
    const nodeConfig = nodeMetas[model.type];

    return (
      <div
        className={`dag-node`}
        style={{
          width: "100%",
          height: "100%",
          textAlign: "center",
          lineHeight: "30px",
          boxSizing: "border-box",
          border: "2px solid #000",
          background: "#FFF"
        }}
      >
        <nodeConfig.component node={node} />
        <i data-event="node:createNextNode" className="xcustom-plus-dag" />
      </div>
    );
  }
}

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
        stroke: "#C2C8D5",
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
