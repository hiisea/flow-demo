import { FC, memo, useCallback, useMemo } from "react";
import classnames from "classnames";
import { MenuProps, Dropdown } from "antd";
import { Graph, Node, CellView } from "@antv/x6";
import "@antv/x6-react-shape";
import { BaseNodeModel, getConfig } from "./base";
import { createNode, deleteNode } from "./funs";

const MenuTrigger: "click"[] = ["click"];
interface Props {
  node?: Node;
}

const DagNodeBase: FC<Props> = ({ node }) => {
  const model = node!.getData() as BaseNodeModel;
  const nodeMetas = getConfig("nodeMetas");
  const nodeType = model.type;
  const nodeConfig = nodeMetas[nodeType];
  const menuItems = useMemo(() => {
    return Object.keys(nodeMetas).map((type) => {
      const nodeConfig = nodeMetas[type];
      if (nodeConfig.hidden) {
        return null;
      }
      return { label: "+ " + nodeConfig.name, key: type };
    });
  }, []);
  const onMenuClick: MenuProps["onClick"] = useCallback(
    (e) => {
      const nodeType: string = e.key;
      createNode(node?.model as any, node!, nodeType);
    },
    [node]
  );
  const menu = useMemo(() => {
    return { items: menuItems, onClick: onMenuClick };
  }, []);
  console.log(nodeType, nodeConfig.propertyForm)
  return (
    <>
      <div className={classnames("xdag-node", `xdag-${model.type}`, {'xdag-options': nodeConfig.propertyForm})}>
        <nodeConfig.component node={node!} />
      </div>
      {nodeType !== 'End' && nodeType !== 'Return' && <Dropdown menu={menu} trigger={MenuTrigger}>
        <div className={classnames("xdag-plus-node", `xdag-${model.type}`)} />
      </Dropdown>}
    </>
  );
};

export const DagNode = memo(DagNodeBase, (prev, next) => {
  console.log('shouldComponentUpdate', Boolean(next.node?.hasChanged("data")));
  return !next.node?.hasChanged("data");
});

// export class DagNode extends Component<Props> {
//   menu: any;
//   shouldComponentUpdate() {
//     console.log('shouldComponentUpdate', Boolean(this.props.node?.hasChanged("version")))
//     return Boolean(this.props.node?.hasChanged("version"));
//   }
//   render() {
//     const model = this.props.node!.getData() as BaseNodeModel;
//     const nodeMetas = getConfig("nodeMetas");
//     const nodeType = model.type;
//     const nodeConfig = nodeMetas[nodeType];
//     if (!this.menu) {
//       const menuItems = Object.keys(nodeMetas).map((type) => {
//         const nodeConfig = nodeMetas[type];
//         if (nodeConfig.hidden) {
//           return null;
//         }
//         return { label: "+ " + nodeConfig.name, key: type };
//       });
//       this.menu = {
//         items: menuItems,
//         onClick: (e: any) => {
//           const nodeType: string = e.key;
//           const node = this.props.node!;
//           createNode(node.model as any, node, nodeType);
//         },
//       };
//     }
//     console.log(nodeType, nodeConfig.propertyForm);
//     return (
//       <>
//         <div
//           className={classnames("xdag-node", `xdag-${model.type}`, {
//             "xdag-options": nodeConfig.propertyForm,
//           })}
//         >
//           <nodeConfig.component node={this.props.node!} />
//         </div>
//         {nodeType !== "End" && nodeType !== "Return" && (
//           <Dropdown menu={this.menu} trigger={MenuTrigger}>
//             <div
//               className={classnames("xdag-plus-node", `xdag-${model.type}`)}
//             />
//           </Dropdown>
//         )}
//       </>
//     );
//   }
// }

Graph.registerRouter(
  "dag",
  (vertices, args, view) => {
    const sourceAnchor = view.sourceAnchor;
    const targetAnchor = view.targetAnchor;
    return [
      { x: sourceAnchor.x, y: targetAnchor.y - 50 },
      { x: targetAnchor.x, y: targetAnchor.y - 50 },
    ];
  },
  true
);
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
        strokeWidth: 2,
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
Graph.registerNodeTool("delete-node", {
  inherit: "button",
  markup: [
    {
      tagName: "circle",
      selector: "body",
      attrs: {
        r: 8,
        fill: "#fe854f",
        stroke: "#cf6434",
        strokeWidth: 1,
        cursor: "pointer",
      },
    },
    {
      tagName: "text",
      selector: "label",
      textContent: "x",
      attrs: {
        fill: "#fff",
        fontSize: 12,
        fontWeight: "bold",
        textAnchor: "middle",
        pointerEvents: "none",
        y: "0.25em",
      },
    },
  ],
  onClick({ view, cell }: { view: CellView; cell: Node }) {
    deleteNode(view.graph, cell);
  },
});
