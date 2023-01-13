import { Cell, Graph, Node, StringExt } from "@antv/x6";
import { getConfig } from "./base";
import { Dagre, DagreConfig } from "./dagre";
import debounce from "lodash.debounce";

//g.setNode("swilliams",  { label: "Saul Williams", width: 160, height: 100 });
// g.setNode("bpitt",      { label: "Brad Pitt",     width: 108, height: 100 });
// g.setNode("hford",      { label: "Harrison Ford", width: 168, height: 100 });
// g.setNode("lwilson",    { label: "Luke Wilson",   width: 144, height: 100 });
// g.setNode("kbacon",     { label: "Kevin Bacon",   width: 121, height: 100 });

// Add edges to the graph.
//g.setEdge("kspacey",   "swilliams");
// g.setEdge("swilliams", "kbacon");
// g.setEdge("bpitt",     "kbacon");
// g.setEdge("hford",     "lwilson");
// g.setEdge("lwilson",   "kbacon");

let uid = 1;

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

function layoutSize(
  parentNode: Node,
  posMap: { [key: string]: { x: number; y: number } }
) {
  const g = new Dagre();
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
  let width = DagreConfig.marginx;
  let height = DagreConfig.marginy;
  childrenNodes.forEach((node) => {
    const size = node.getSize();
    const posOrigin = g.getLayout(node.id);
    const pos = {
      x: posOrigin.x - size.width / 2,
      y: posOrigin.y - size.height / 2,
    };
    width = Math.max(width, pos.x + size.width + DagreConfig.marginx);
    height = Math.max(height, pos.y + size.height + DagreConfig.marginy);
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
  const zIndex = sourceNode.getZIndex() || 2;
  if (!indexMap[sourceNode.id]) {
    indexMap[sourceNode.id] = [zIndex];
  }
  const vIndex: number[] = [...indexMap[sourceNode.id]];
  const eIndex = vIndex.pop() as number;
  const outEdges = graph.getOutgoingEdges(sourceNode) || [];
  outEdges.forEach((edge) => {
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
      const a1 = [...a[1]];
      const b1 = [...b[1]];
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
    console.log(cell.id, "zindex", indexMap[cell.id] + 1);
    cell.setZIndex(indexMap[cell.id] + 1);
  });
  layoutSize(root, posMap);
  //console.log(JSON.stringify(posMap, null, "  "));
  layoutPosition(root, posMap);
}, 10);

export function createNode(
  graph: Graph,
  sourceNode: Node,
  newNodeType: string,
  newNodeData: Record<string, any> = {},
): Node {
  const nodeMetas = getConfig("nodeMetas");
  const { nodeSize, type, name } = nodeMetas[newNodeType];
  const id = `${newNodeType}-${uid++}`;
  const targetNode = graph.addNode({
    id,
    shape: "dag-node",
    x: 0,
    y: 0,
    width: nodeSize.width,
    height: nodeSize.height,
    data: {
      id,
      type,
      name,
      ...newNodeData,
    },
    tools: [
      {
        name: "button-remove",
        args: {
          x: 12,
          y: 15,
        },
      },
      // {
      //   name: "button",
      //   args: {
      //     x: '50%',
      //     y: '0%',
      //     offset: { x: -44, y: 10},
      //     markup: [
      //       {
      //         tagName: "rect",
      //         selector: "body",
      //         attrs: {
      //           width: 90,
      //           height: 30,
      //           rx: 6,
      //           ry: 6,
      //           stroke: "#fe854f",
      //           strokeWidth: 1,
      //           fill: "white",
      //           cursor: "pointer",
      //         },
      //       },
      //       {
      //         tagName: 'text',
      //         selector: 'label',
      //         textContent: '+ 添加条件',
      //         attrs: {
      //           fill: '#fe854f',
      //           fontSize: 15,
      //           textAnchor: 'middle',
      //           pointerEvents: 'none',
      //           x: 0,
      //           dy: '0.3em',
      //         },
      //       },
      //     ],
      //   },
      // },
    ],
  });
  if (newNodeType === "Switch" || newNodeType === "Start") {
    const targetEdge1 = graph.addEdge({
      shape: "dag-edge",
      source: {
        cell: sourceNode,
        port: "in",
      },
      target: {
        cell: targetNode,
        port: "in",
      },
    });
    const targetEdge2 = graph.addEdge({
      shape: "dag-edge",
      source: {
        cell: targetNode,
        port: "out",
      },
      target: {
        cell: sourceNode,
        port: "out",
      },
    });
    sourceNode.addChild(targetNode);
    sourceNode.addChild(targetEdge1);
    sourceNode.addChild(targetEdge2);
    //updateLayout(graph);
    return targetNode;
  }
  const [originEdge] = (graph.getOutgoingEdges(sourceNode) || []).filter(
    (edge) => {
      return (edge.source as any).port === "out";
    }
  );
  //const originNextNode = originEdge?.getTargetNode();
  //console.log("node", originNextNode);
  const targetEdge = graph.addEdge({
    //id: `${sourceNode.id}->${targetNode.id}`,
    shape: "dag-edge",
    source: {
      cell: sourceNode,
      port: "out",
    },
    target: {
      cell: targetNode,
      port: "in",
    },
  });
  if (originEdge) {
    originEdge.setSource({ cell: targetNode.id, port: "out" });
  }
  const parent = sourceNode.getParent();
  if (parent) {
    parent.addChild(targetNode);
    parent.addChild(targetEdge);
  }
  //updateLayout(graph);
  if (newNodeType === "Choice") {
    createNode(graph, targetNode, "Switch");
    createNode(graph, targetNode, "Switch");
  }else if (newNodeType === "Loop") {
    createNode(graph, targetNode, "Start", {name: '开始循环'});
  }
  return targetNode;
}
export function initGraph(container: any, data: { nodes: Array<any> }) {
  const graph: Graph = new Graph({
    container,
    selecting: {
      enabled: true,
    },
    panning: true,
    interacting: {
      nodeMovable: true,
    },
    connecting: {
      allowBlank: false,
      router: {
        name: "er",
        args: {
          offset: "center",
          direction: "V",
        },
      },
    },
  });
  graph.fromJSON(data);
  updateLayout(graph);
  graph.on("node:added", () => {
    console.log(11111);
    updateLayout(graph)
  });
  graph.on("node:removed", () => {
    updateLayout(graph);
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
