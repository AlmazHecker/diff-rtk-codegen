import { Endpoint } from "./Endpoint";
import * as ts from "typescript";

export type Api = {
  tagTypes: string[];
  imports: string[];
  endpoints: Record<string, Endpoint>;
  types: ts.Node[];
};
