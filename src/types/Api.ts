import { Endpoint } from "./Endpoint";
import * as ts from "typescript";

export type Api = {
  tagTypes: string[];
  endpoints: Record<string, Endpoint>;
  types: Record<string, ts.Node>;
};
