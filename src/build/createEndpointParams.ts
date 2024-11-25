import * as ts from "typescript";
import { Endpoint } from "../types/Endpoint";

export const createEndpointParams = (endpoint: Endpoint) => {
  const dynamicArgs = Object.entries(endpoint.args).map(([key, value]) => {
    return ts.factory.createPropertyAssignment(
      key,
      ts.factory.createArrayLiteralExpression(
        Array.isArray(value)
          ? value.map((item) => ts.factory.createStringLiteral(item))
          : undefined,
      ),
    );
  });

  return dynamicArgs;
};
