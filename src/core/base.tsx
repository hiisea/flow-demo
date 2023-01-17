import { FC } from "react";
import { Graph, Node } from "@antv/x6";
import ChoiceConfig from "../nodes/Choice";
import SwitchConfig from "../nodes/Switch";
import LoopConfig from "../nodes/Loop";
import StartConfig from "../nodes/Start";
import EndConfig from "../nodes/End";
import ReturnConfig from "../nodes/Return";
import DataProcessingConfig from "../nodes/DataProcessing";
export interface BaseNodeModel {
  id: string;
  type: string;
  name: string;
}
export interface INode {
  id: string;
  shape: string;
  width: number;
  height: number;
  data: BaseNodeModel;
  version: number;
}

export interface IEdge {
  id: string;
  source: { cell: string; port: string };
  target: { cell: string; port: string };
  shape: string;
}

export type NodePropertyForm = FC<{
  node: Node;
  model: BaseNodeModel;
}>;
export type NodeComponent = FC<{ node: Node }>;
export interface NodeOptions {
  type: string;
  name: string;
  component: NodeComponent;
  nodeSize: {
    width?: number;
    height?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  };
  propertyForm?: NodePropertyForm;
  hidden?: boolean;
  preventDeletion?: boolean;
  afterCreate?: (node: Node, graph: Graph) => void;
  tools?: any[];
}

export type NodeConfig = NodeOptions;

export interface NodeMetas {
  [type: string]: NodeConfig;
}
export interface Config {
  nodeMetas: NodeMetas;
}

const config: Config = {
  nodeMetas: {},
};

export function getConfig<T extends keyof Config>(key: T): Config[T] {
  return config[key];
}
export async function loadConfig(): Promise<Config> {
  config.nodeMetas = {
    Root: {
      type: "Root",
      name: "Root",
      component: () => null,
      nodeSize: {},
      hidden: true,
    },
    Choice: ChoiceConfig,
    Switch: SwitchConfig,
    Loop: LoopConfig,
    Start: StartConfig,
    End: EndConfig,
    Return: ReturnConfig,
    DataProcessing: DataProcessingConfig,
  };
  return config;
}
