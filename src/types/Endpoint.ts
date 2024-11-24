import * as ts from "typescript";
import { QueryObject } from "../extract/extractQueryObject";

export type Endpoint = {
  node: ts.PropertyAssignment;
  queryObject: QueryObject;
  type: "build.mutation" | "build.query";

  // Additional args of the endpoints object
  args: Record<string, unknown>;
  typeArguments: ts.NodeArray<ts.TypeNode>;
};
