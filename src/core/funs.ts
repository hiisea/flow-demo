import { Cell, Graph, Node, Edge, StringExt } from "@antv/x6";
import dagre from "dagre";
import { getConfig } from "./base";

var g = new dagre.graphlib.Graph();
g.setGraph({});
g.setDefaultEdgeLabel(function () {
  return {};
});

g.setNode("kspacey", { label: "Kevin Spacey", width: 200, height: 40 });
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

dagre.layout(g);

g.nodes().forEach(function (v: any) {
  console.log("Node " + v + ": " + JSON.stringify(g.node(v)));
});

let uid = 1;
const MARGIN_X = 40;
const MARGIN_Y = 80;

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

function layoutSize(parentNode: Node) {
  const g = new dagre.graphlib.Graph() as any;
  g.setGraph({ marginx: MARGIN_X, marginy: MARGIN_Y });
  g.setDefaultEdgeLabel(function () {
    return {};
  });
  const children = parentNode.getChildren() || [];
  const childrenNodes: Node[] = [];
  children.forEach((cell) => {
    if (cell.isNode()) {
      childrenNodes.push(cell);
      if (cell.getChildren()) {
        layoutSize(cell);
      }
      const size = cell.getSize();
      g.setNode(cell.id, { ...size });
    } else {
      const edge = {
        source: (cell as any).source.cell,
        target: (cell as any).target.cell,
      };
      if(edge.source !== parentNode.id && edge.target !== parentNode.id){
        g.setEdge(edge.source, edge.target);
      }
    }
  });
  dagre.layout(g);
  let width = MARGIN_X;
  let height = MARGIN_Y;
  childrenNodes.forEach((node) => {
    const size = node.getSize();
    const posOrigin = g.node(node.id);
    const pos = {
      x: posOrigin.x - size.width / 2,
      y: posOrigin.y - size.height / 2,
    };
    width = Math.max(width, pos.x + size.width + MARGIN_X);
    height = Math.max(height, pos.y + size.height + MARGIN_Y);
    node.setAttrs({
      body: {
        pos: [pos.x, pos.y].join(","),
      },
    });
  });
  parentNode.setSize({ width, height });
}

function layoutPosition(parentNode: Node) {
  const children = parentNode.getChildren() || [];
  children.forEach((cell) => {
    if (cell.isNode()) {
      const parentPos = parentNode.getPosition();
      const pos: any = (cell.getAttrs().body.pos as any)
        .split(",")
        .map((n: string) => parseInt(n));
      cell.setPosition({
        x: parentPos.x + pos[0],
        y: parentPos.y + pos[1],
      });
      if (cell.getChildren()) {
        layoutPosition(cell);
      }
    }
  });
}

export function updateLayout(graph: Graph) {
  const children: Cell[] = [];
  graph.getCells().forEach((node) => {
    if (!node.hasParent()) {
      children.push(node);
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
  layoutSize(root);
  layoutPosition(root);
  //   graph.getNodes().forEach((node) => {
  //     const size = node.getSize();
  //     const pos: any = (node.getAttrs().body.pos as any)
  //       .split(",")
  //       .map((n: string) => parseInt(n));
  //     node.setPosition({
  //       x: pos[0] - size.width / 2,
  //       y: pos[1] - size.height / 2,
  //     });
  //   });
  //   const g = new dagre.graphlib.Graph() as any;
  //   g.setGraph({ marginx: 20, marginy: 20 });
  //   g.setDefaultEdgeLabel(function () {
  //     return {};
  //   });
  //   graph.getNodes().forEach((node) => {
  //     const size = node.getSize();
  //     g.setNode(node.id, size);
  //     console.log(node.id, node.getChildren());
  //   });
  //   graph.getEdges().forEach((edge) => {
  //     g.setEdge((edge.source as any).cell, (edge.target as any).cell);
  //   });
  //   dagre.layout(g);
}

export function createNode(
  graph: Graph,
  sourceNode: Node,
  newNodeType: string
): Node {
  const nodeMetas = getConfig("nodeMetas");
  const { nodeSize, type, name } = nodeMetas[newNodeType];
  const id = `${newNodeType}-${StringExt.uuid()}-${uid++}`;
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
    },
  });
  if (newNodeType === "Switch") {
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
    updateLayout(graph);
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
    originEdge.setSource({cell: targetNode, port: 'out'});
  }
  const parent = sourceNode.getParent();
  if (parent) {
    parent.addChild(targetNode);
    parent.addChild(targetEdge);
  }
  updateLayout(graph);
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
