import { Cell, Graph, Node } from "@antv/x6";
import { getConfig, INode, IEdge } from "./base";
import { DagreLayout } from "./layout";
import "./DagNode";

let nid = 1;

// function listToTree(nodeList: Node[]) {
//   //const root: {node: Node, children: Node[]} = {node: nodeList[0], children:[]};
//   const rootNode = nodeList.shift() as Node;
//   const map = new Map<Node, Node[]>();
//   map.set(rootNode, []);
//   nodeList.forEach((node) => {
//     const parentNode: Node = node.getParent() || rootNode;
//     if (!map.has(parentNode)) {
//       map.set(parentNode, []);
//     }
//     map.get(parentNode)!.push(node);
//   });
// }

function addEdge(
  graph: Graph,
  source: [string, string],
  target: [string, string],
  options?: any
) {
  return graph.addEdge({
    id: `${source[0]}->${target[0]}`,
    shape: "dag-edge",
    source: {
      cell: source[0],
      port: source[1],
    },
    target: {
      cell: target[0],
      port: target[1],
    },
    ...options,
  });
}
function layoutSize(
  parentNode: Node,
  posMap: { [key: string]: { x: number; y: number } }
) {
  const g = new DagreLayout();
  const children = parentNode.getChildren() || [];
  const childrenNodes: Node[] = [];
  children.forEach((cell) => {
    if (cell.isNode()) {
      childrenNodes.push(cell);
      if (cell.getChildren()) {
        layoutSize(cell, posMap);
      }
      const size = cell.getSize();
      g.setNode({ id: cell.id, ...size });
    } else {
      const edge = {
        source: (cell as any).source.cell,
        target: (cell as any).target.cell,
      };
      if (edge.source !== parentNode.id && edge.target !== parentNode.id) {
        g.setEdge(edge.source, edge.target);
      }
    }
  });

  //   console.log("========");
  //   if (parentNode.id && parentNode.id.startsWith("Choice")) {
  //     g.nodes().forEach(function (v: any) {
  //       console.log("Node " + v + ": " + JSON.stringify(g.node(v)));
  //     });
  //     g.edges().forEach(function (e: any) {
  //       console.log(
  //         "Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e))
  //       );
  //     });
  //   }
  const nodeMetas = getConfig("nodeMetas");
  const parentType = parentNode.getData().type;
  const { nodeSize } = nodeMetas[parentType];
  const {
    paddingTop = 50,
    paddingBottom = 50,
    paddingLeft = 40,
    paddingRight = 40,
  } = nodeSize;
  let width = 0;
  let height = 0;
  childrenNodes.forEach((node) => {
    const size = node.getSize();
    const posOrigin = g.getLayout(node.id);
    const pos = {
      x: paddingLeft + posOrigin.x,
      y: paddingTop + posOrigin.y,
    };
    width = Math.max(width, pos.x + size.width + paddingRight);
    height = Math.max(height, pos.y + size.height + paddingBottom);
    //node.setProp("pos", [pos.x, pos.y], { silent: true });
    posMap[node.id] = { ...pos };
  });
  //console.log(parentNode.id, 'size', g.graph(), { width, height })
  parentNode.setSize({ width, height });
}

function layoutPosition(
  parentNode: Node,
  posMap: { [key: string]: { x: number; y: number } }
) {
  const children = parentNode.getChildren() || [];
  children.forEach((cell) => {
    if (cell.isNode()) {
      const parentPos = parentNode.getPosition();
      //const pos: [number, number] = cell.getProp("pos");
      const pos = posMap[cell.id];
      cell.setPosition({
        x: parentPos.x + pos.x,
        y: parentPos.y + pos.y,
      });
      if (cell.getChildren()) {
        layoutPosition(cell, posMap);
      }
    }
  });
}

function layoutIndex(
  graph: Graph,
  sourceNode: Node,
  indexMap: { [key: string]: number[] }
) {
  let zIndex = sourceNode.getZIndex() || 1;
  zIndex = zIndex === 1 ? 2 : zIndex;
  if (!indexMap[sourceNode.id]) {
    indexMap[sourceNode.id] = [zIndex];
  }
  const vIndex: number[] = [...indexMap[sourceNode.id]];
  const eIndex = vIndex.pop() as number;
  (graph.getOutgoingEdges(sourceNode) || []).forEach((edge) => {
    // const eid = [
    //   (edge.source as any).cell,
    //   "->",
    //   (edge.target as any).cell,
    // ].join(" ");
    const eid = edge.id;
    if ((edge.source as any).port === "out") {
      //console.log(eid, " = ", zIndex - 1);
      //edge.setZIndex(zIndex - 1);
      indexMap[eid] = [...vIndex, eIndex - 1];
    } else {
      //console.log(eid, " = ", zIndex + 1);
      //edge.setZIndex(zIndex + 1);
      indexMap[eid] = [...vIndex, eIndex, 1];
    }
    const nextNode = edge.getTargetNode() as Node;
    if (sourceNode.getParent() !== nextNode) {
      if (nextNode.getParent() === sourceNode) {
        indexMap[nextNode.id] = [...vIndex, eIndex, 2];
      } else {
        indexMap[nextNode.id] = [...vIndex, eIndex + 2];
      }
      //console.log(nextNode.id, "=", zIndex + 2);
      //nextNode.setZIndex(zIndex + 2);
      layoutIndex(graph, nextNode, indexMap);
    } else {
      //console.log("忽略", nextNode.id);
    }
  });
}

function debounce<T extends Function>(callbak: T, timeout = 0) {
  let timer: NodeJS.Timeout | null = null;
  return ((...args: any[]) => {
    if (!timer) {
      const graph = args[0] as Graph;
      //graph.freeze();
      graph.view.viewport.style.visibility = "hidden";
      timer = setTimeout(() => {
        callbak(...args);
        //graph.unfreeze();
        graph.view.viewport.style.visibility = "visible";
        timer = null;
      }, timeout);
    }
  }) as any;
}
export const updateLayout: (graph: Graph) => void = debounce((graph: Graph) => {
  console.log("====update=====");
  const children: Cell[] = [];
  let rootNode: Node;
  graph.getCells().forEach((node) => {
    if (!node.hasParent()) {
      children.push(node);
      if (!rootNode && node.isNode()) {
        rootNode = node;
      }
    }
  });
  const root: Node = {
    getData() {
      return {
        type: "Root",
      };
    },
    setSize() {
      return;
    },
    getPosition() {
      return { x: 0, y: 0 };
    },
    getChildren() {
      return children;
    },
  } as any;
  const indexData: { [key: string]: number[] } = {},
    posMap: { [key: string]: { x: number; y: number } } = {};
  layoutIndex(graph, rootNode!, indexData);
  const indexMap = Object.entries(indexData)
    .sort((a, b) => {
      const a1: number[] = [...a[1]];
      const b1: number[] = [...b[1]];
      let c = a1.shift() || 0;
      let d = b1.shift() || 0;
      while (c || d) {
        if (c !== d) {
          return c - d;
        } else {
          c = a1.shift() || 0;
          d = b1.shift() || 0;
        }
      }
      return 0;
    })
    .reduce((obj, cur, index) => {
      obj[cur[0]] = index;
      return obj;
    }, {} as any);
  graph.getCells().forEach((cell) => {
    //console.log(cell.id, "zindex", indexMap[cell.id] + 1);
    cell.setZIndex(indexMap[cell.id] + 1);
  });
  layoutSize(root, posMap);
  //console.log(JSON.stringify(posMap, null, "  "));
  layoutPosition(root, posMap);
}, 0);

export function createNode(
  graph: Graph,
  sourceNode: Node,
  newNodeType: string,
  newNodeData: Record<string, any> = {}
): Node {
  const nodeMetas = getConfig("nodeMetas");
  const {
    nodeSize,
    type,
    name,
    tools = [],
    afterCreate,
  } = nodeMetas[newNodeType];
  const newNodeId = `${newNodeType}-${nid++}`;
  const newNode = graph.addNode({
    id: newNodeId,
    shape: "dag-node",
    width: nodeSize.width,
    height: nodeSize.height,
    data: {
      id: newNodeId,
      type,
      name: name+'-'+nid,
      ...newNodeData,
    },
    tools,
  });

  if (newNodeType === "Switch" || newNodeType === "Start") {
    const targetEdge1 = addEdge(
      graph,
      [sourceNode.id, "in"],
      [newNode.id, "in"],
      {
        router: newNodeType === "Start" ? "normal" : "dag",
        attrs: {
          line: {
            targetMarker: newNodeType === "Start" ? null : "block",
          },
        },
      }
    );
    const targetEdge2 = addEdge(
      graph,
      [newNode.id, "out"],
      [sourceNode.id, "out"],
      {
        attrs: {
          line: {
            targetMarker: newNodeType === "Switch" ? null : "block",
          },
        },
      }
    );
    sourceNode.addChild(newNode);
    sourceNode.addChild(targetEdge1);
    sourceNode.addChild(targetEdge2);
    //updateLayout(graph);
    return newNode;
  }
  const [originEdge] = (graph.getOutgoingEdges(sourceNode) || []).filter(
    (edge) => {
      return (edge.source as any).port === "out";
    }
  );
  const newEdge = addEdge(graph, [sourceNode.id, "out"], [newNode.id, "in"]);
  if (originEdge) {
    const originParent = originEdge.getParent();
    const originTarget = originEdge.target as { cell: string; port: string };
    originEdge.remove();
    const newOriginEdge = addEdge(
      graph,
      [newNode.id, "out"],
      [originTarget.cell, originTarget.port]
    );
    if (originParent) {
      originParent.addChild(newOriginEdge);
    }
  }
  const parent = sourceNode.getParent();
  if (parent) {
    parent.addChild(newNode);
    parent.addChild(newEdge);
  }
  afterCreate && afterCreate(newNode, graph);
  return newNode;
}
function getPrevNode(
  graph: Graph,
  node: Node
):
  | {
      cell: string;
      port: string;
    }
  | undefined {
  const [prevNode] = (graph.getIncomingEdges(node) || [])
    .filter((edge) => {
      return (edge.target as any).port === "in";
    })
    .map((edge) => edge.source as { cell: string; port: string });
  return prevNode;
}
function getNextNode(
  graph: Graph,
  node: Node
):
  | {
      cell: string;
      port: string;
    }
  | undefined {
  const [nextNode] = (graph.getOutgoingEdges(node) || [])
    .filter((edge) => {
      return (edge.source as any).port === "out";
    })
    .map((edge) => edge.target as { cell: string; port: string });
  return nextNode;
}
export function deleteNode(graph: Graph, node: Node) {
  let nextNode = getNextNode(graph, node);
  const prevNode = getPrevNode(graph, node);
  if (node.getData().type === "Switch") {
    while (nextNode) {
      let nextNodeIns = graph.getCellById(nextNode.cell) as Node;
      if (node.getParent() === nextNodeIns) {
        nextNode = undefined;
      } else {
        nextNode = getNextNode(graph, nextNodeIns);
        nextNodeIns.remove();
      }
    }
    node.remove();
  } else {
    node.remove();
    if (prevNode && nextNode) {
      addEdge(
        graph,
        [prevNode.cell, prevNode.port],
        [nextNode.cell, nextNode.port]
      );
    }
  }
}
export function selectNode(graph: Graph, node: Node | null) {
  graph.resetSelection(node ? [node] : undefined);
}
export function initGraph(container: any, data: { nodes: Array<any> }) {
  const graph: Graph = new Graph({
    container,
    grid:true,
    //scroller: true,
    selecting: {
      enabled: true,
    },
    panning: true,
    interacting: {
      nodeMovable: false,
    },
    connecting: {
      allowBlank: false,
      router: {
        name: "dag",
        args: {
          padding: 20,
          startDirections: ["bottom"],
          endDirections: ["top"],
        },
      },
    },
  });
  graph.fromJSON(data);
  updateLayout(graph);
  graph.on("node:added", () => {
    updateLayout(graph);
  });
  graph.on("node:removed", () => {
    updateLayout(graph);
  });
  graph.on("node:selected", (args: { cell: Cell; node: Node }) => {
    const nodeMetas = getConfig("nodeMetas");
    const nodeType: string = args.node.getData().type;
    const nodeConfig = nodeMetas[nodeType];
    const zIndex = args.node.getZIndex();
    if (
      zIndex !== 2 &&
      !nodeConfig.preventDeletion &&
      !args.node.hasTool("delete-node")
    ) {
      args.node.addTools([
        {
          name: "delete-node",
          args: {
            x: "100%",
            y: 14,
            offset: {
              x: -15,
              y: 0,
            },
          },
        },
      ]);
    }
  });
  graph.on("node:unselected", (args: { cell: Cell; node: Node }) => {
    args.cell.removeTool("delete-node");
  });
  graph.on("node:createSwitchNode", ({ node }: { node: Node }) => {
    createNode(graph, node, "Switch");
  });
  // graph.on("cell:mouseenter", ({ cell }) => {
  //   if (cell.isNode()) {
  //     cell.addTools([
  //       {
  //         name: "button-remove",
  //         args: {
  //           x: 12,
  //           y: 15,
  //         },
  //       },
  //       {
  //         name: 'button',
  //         args: {
  //           markup: [
  //             {
  //               tagName: 'rect',
  //               selector: 'button',
  //               attrs: {
  //                 x: -15,
  //                 y: -20,
  //                 width: 30,
  //                 height: 30,
  //                 //fill: '#FF0000',
  //                 fill: 'transparent',
  //               },
  //             },
  //             {
  //               tagName: 'circle',
  //               selector: 'border',
  //               attrs: {
  //                 r: 10,
  //                 stroke: '#fe854f',
  //                 'stroke-width': 2,
  //                 fill: 'white',
  //                 cursor: 'pointer',
  //                 event: 'node:aaa',
  //               },
  //             },
  //             {
  //               tagName: 'text',
  //               selector: 'icon',
  //               textContent: '+',
  //               attrs: {
  //                 fill: '#fe854f',
  //                 'font-size': 10,
  //                 'text-anchor': 'middle',
  //                 'pointer-events': 'none',
  //                 y: '0.3em',
  //                 event: 'node:aaa',
  //               },
  //             },
  //           ],
  //           x: '50%',
  //           y: '100%',
  //           offset: {
  //             x: -8,
  //             y:12
  //           },
  //           // onClick(aaa:any) {
  //           //   console.log(aaa)
  //           // }
  //         },
  //       },
  //     ]);
  //   }
  // });
  // graph.on("cell:mouseleave", ({ cell }) => {
  //   cell.removeTools();
  // });
  return graph;
}
export async function loadData(): Promise<{ nodes: INode[]; edges: IEdge[] }> {
  const id = "DataProcessing-0";
  return {
    nodes: [
      {
        id,
        shape: "dag-node",
        width: 250,
        height: 40,
        version: 0,
        data: {
          id,
          type: "DataProcessing",
          name: "数据加工-0",
        },
      },
      {
        id: "Return-0",
        shape: "dag-node",
        width: 200,
        height: 40,
        version: 0,
        data: {
          id,
          type: "Return",
          name: "结束",
        },
      },
    ],
    edges: [
      {
        id: "DataProcessing-0->Return-0",
        source: {
          cell: "DataProcessing-0",
          port: "out",
        },
        target: {
          cell: "Return-0",
          port: "in",
        },
        shape: "dag-edge",
      },
    ],
  };
}
