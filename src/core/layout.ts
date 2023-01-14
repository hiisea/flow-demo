import dagre from "dagre";

type OutputNodeData = {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
};
type InputNodeData = {
  id: string;
  width: number;
  height: number;
};
type OutputEdgeData = { source: string; target: string };

export const DagreConfig = {
  //ranker: "longest-path",
  // marginx: 40,
  // marginy: 60,
  //rankdir: 'LR'
};

export class Dagre2 {
  private graph: any;
  private outputNodes?: OutputNodeData[];
  private outputEdges?: OutputEdgeData[];
  private outputNodesMap?: Record<string, OutputNodeData>;

  constructor() {
    var graph = new dagre.graphlib!.Graph() as any;
    graph.setGraph(DagreConfig);
    graph.setDefaultEdgeLabel(function () {
      return {};
    });
    this.graph = graph;
  }

  setNode(data: InputNodeData) {
    this.graph.setNode(data.id, {
      width: data.width,
      height: data.height,
    });
  }

  setEdge(source: string, target: string) {
    this.graph.setEdge(source, target);
  }

  getLayout(): { nodes: OutputNodeData[]; edges: OutputEdgeData[] };
  getLayout(id: string): OutputNodeData;
  getLayout(id?: string): any {
    if (!this.outputNodes) {
      dagre.layout(this.graph);
      this.outputNodes = this.graph
        .nodes()
        .map((id: string) => ({ id, ...this.graph.node(id) }));
      this.outputEdges = this.graph
        .edges()
        .map((edge: any) => ({ source: edge.v, target: edge.w }));
      this.outputNodesMap = this.outputNodes!.reduce((obj, cur) => {
        obj[cur.id] = cur;
        return obj;
      }, {} as any);
    }
    if (id) {
      return this.outputNodesMap![id];
    }
    return { nodes: this.outputNodes, edges: this.outputEdges };
  }
}

type InternalNode = InputNodeData & {
  x?: number;
  y?: number;
  next?: string;
  prev?: string;
  group?: string[];
  groupWidth?: number;
};
export class Dagre {
  private inputNodes: InputNodeData[] = [];
  private inputEdges: { source: string; target: string }[] = [];
  private outputNodesMap?: Record<string, OutputNodeData>;

  constructor(private grapX: number = 50, private grapY: number = 50) {}

  setNode(data: InputNodeData) {
    this.inputNodes.push({ ...data });
  }

  setEdge(source: string, target: string) {
    this.inputEdges.push({ source, target });
  }

  getLayout(): Record<string, OutputNodeData>;
  getLayout(id: string): OutputNodeData;
  getLayout(id?:string):any {
    if (!this.outputNodesMap) {
      const nodeMap = this.inputNodes.reduce((obj, cur) => {
        obj[cur.id] = cur;
        return obj;
      }, {} as { [id: string]: InternalNode });
      this.inputEdges.forEach((edge) => {
        nodeMap[edge.source].next = edge.target;
        nodeMap[edge.target].prev = edge.source;
      });
      const groups: Array<{ ids: string[]; width: number }> = [];
      this.inputNodes.forEach((node: InternalNode) => {
        if (!node.prev) {
          groups.push({ ids: [node.id], width: node.width });
        }
      });
      groups.forEach((group) => {
        const widths: number[] = [group.width];
        let nextNodeId = nodeMap[group.ids[0]].next;
        while (nextNodeId) {
          const nextNode = nodeMap[nextNodeId];
          widths.push(nextNode.width);
          group.ids.push(nextNodeId);
          nextNodeId = nextNode.next;
        }
        group.width = Math.max(...widths);
      });
      let dx = 0;
      groups.forEach((group) => {
        let dy = 0;
        const groupWidth = group.width;
        group.ids.forEach((id) => {
          const node = nodeMap[id];
          node.x = dx + (groupWidth - node.width) / 2;
          node.y = dy;
          dy += node.height+this.grapY;
        });
        dx += groupWidth+this.grapX;
      });
      this.outputNodesMap = Object.keys(nodeMap).reduce((obj, id) => {
        const { width, height, x = 0, y = 0 } = nodeMap[id];
        obj[id] = { id, width, height, x, y };
        return obj;
      }, {} as Record<string, OutputNodeData>);
    }
    if (id) {
      return this.outputNodesMap[id];
    }
    return this.outputNodesMap;
  }
}

const dagre1 = new Dagre();

dagre1.setNode({
  id: "a",
  width: 200,
  height: 40,
});
dagre1.setNode({
  id: "b",
  width: 200,
  height: 40,
});
dagre1.setNode({
  id: "c",
  width: 200,
  height: 40,
});
dagre1.setNode({
  id: "a1",
  width: 100,
  height: 40,
});
dagre1.setNode({
  id: "b1",
  width: 300,
  height: 40,
});
dagre1.setNode({
  id: "b2",
  width: 100,
  height: 40,
});
dagre1.setEdge("a", "a1");
dagre1.setEdge("b", "b1");
dagre1.setEdge("b1", "b2");

console.log("====darge1=====");
console.log(JSON.stringify(dagre1.getLayout(), null, "  "));

// export class Dagre2 {
//   private graph: DagreLayout;
//   private inputNodes: InputNodeData[] = [];
//   private inputEdges: { source: string; target: string }[] = [];
//   private outputNodes?: OutputNodeData[];
//   private outputEdges?: OutputEdgeData[];

//   constructor() {
//     var graph = new DagreLayout({
//       type: "dagre",
//       //rankdir: "TB",
//       // align: 'UL',
//       ranksep: 50,
//       nodesep: 50,
//       //sortByCombo: true,
//       // controlPoints: true,
//     });
//     this.graph = graph;
//   }

//   setNode(data: InputNodeData) {
//     this.inputNodes.push({ id: data.id, size:{width: data.width, height: data.height} } as any);
//   }

//   setEdge(source: string, target: string) {
//     this.inputEdges.push({ source, target });
//   }

//   getLayout() {
//     if (!this.outputNodes) {
//       const { nodes = [], edges = [] } = this.graph.layout({
//         nodes: this.inputNodes,
//         edges: this.inputEdges,
//       });
//       this.outputNodes = nodes.map((node: any) => ({
//         id: node.id,
//         width: node.size.width,
//         height: node.size.height,
//         x: node.x,
//         y: node.y,
//       }));
//       this.outputEdges = edges;
//     }
//     return { nodes: this.outputNodes, edges: this.outputEdges };
//   }
// }
