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
  weight?: number;
};
type OutputEdgeData = { source: string; target: string };

export const DagreConfig = {
  //ranker: "longest-path",
  marginx: 40,
  marginy: 80,
}

export class Dagre {
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

  getLayout(): {nodes: OutputNodeData[], edges: OutputEdgeData[]};
  getLayout(id:string): OutputNodeData;
  getLayout(id?:string) :any {
    if (!this.outputNodes) {
      dagre.layout(this.graph);
      this.outputNodes = this.graph
        .nodes()
        .map((id: string) => ({ id, ...this.graph.node(id) }));
      this.outputEdges = this.graph
        .edges()
        .map((edge: any) => ({ source: edge.v, target: edge.w }));
      this.outputNodesMap = this.outputNodes!.reduce((obj, cur)=>{
        obj[cur.id] = cur;
        return obj;
      }, {} as any);
    }
    if(id){
      return this.outputNodesMap![id];
    }
    return { nodes: this.outputNodes, edges: this.outputEdges };
  }
}

const dagre1 = new Dagre();

dagre1.setNode({
  id: "Switch-2",
  width: 200,
  height: 40,
  weight: 3,
});
dagre1.setNode({
  id: "Switch-3",
  width: 200,
  height: 40,
  weight: 2,
});
dagre1.setNode({
  id: "Switch-4",
  width: 200,
  height: 40,
  weight: 1,
});
dagre1.setNode({
  id: "DataProcessing-5",
  width: 250,
  height: 40,
});
dagre1.setNode({
  id: "DataProcessing-6",
  width: 250,
  height: 40,
});
dagre1.setNode({
  id: "DataProcessing-7",
  width: 250,
  height: 40,
});
dagre1.setNode({
  id: "DataProcessing-8",
  width: 250,
  height: 40,
});
dagre1.setNode({
  id: "DataProcessing-9",
  width: 250,
  height: 40,
});
dagre1.setNode({
  id: "DataProcessing-10",
  width: 250,
  height: 40,
});
dagre1.setEdge("Switch-2", "DataProcessing-5");
dagre1.setEdge("DataProcessing-5", "DataProcessing-9");
dagre1.setEdge("Switch-3", "DataProcessing-6");
dagre1.setEdge("Switch-4", "DataProcessing-7");
dagre1.setEdge("DataProcessing-7", "DataProcessing-8");
dagre1.setEdge("DataProcessing-8", "DataProcessing-10");

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
