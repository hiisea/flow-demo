import { FC } from "react";
import { Node, StringExt } from "@antv/x6";
import ChoiceConfig from "../nodes/Choice";
import LoopConfig from "../nodes/Loop";
import SwitchConfig from "../nodes/Switch";
import DataProcessingConfig from "../nodes/DataProcessing";

export interface BaseNodeModel {
  id: string;
  type: string;
  name: string;
}
export type NodeOptionsForm = FC<{
  sourceNode: Node;
  onSubmit: (options: { [key: string]: any }) => void;
  onCancel: () => void;
}>;
export type NodePropertyForm = FC<{
  sourceNode: Node;
}>;
export type NodeComponent = FC<{ node: Node }>;
export interface NodeConfig {
  type: string;
  name: string;
  component: NodeComponent;
  nodeSize: { width: number; height: number };
  propertyForm?: NodePropertyForm;
  hidden?: boolean;
}
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
    Choice: ChoiceConfig,
    Switch: SwitchConfig,
    Loop: LoopConfig,
    DataProcessing: DataProcessingConfig,
  };
  return config;
}
export async function loadData(): Promise<{ nodes: Array<any> }> {
  const id = "DataProcessing-" + StringExt.uuid() + "-0";
  return {
    nodes: [
      {
        id,
        shape: "dag-node",
        width: 250,
        height: 40,
        x: 10,
        y: 10,
        zIndex: 2,
        data: {
          id,
          type: "DataProcessing",
          name: "数据加工",
        },
      },
    ],
  };
}
