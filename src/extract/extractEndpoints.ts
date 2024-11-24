import * as ts from "typescript";
import { extractQueryObject } from "./extractQueryObject";
import { Endpoint } from "../types/Endpoint";
import { extractObjectLiteral } from "./extractObjectLiteral";
import { errorLog } from "../utils/log";

/**
 * Extract endpoint details (arguments and configurations) from the source file
 */
export const extractEndpoints = (
  endpointsBase: ts.ObjectLiteralExpression,
): Record<string, Endpoint> => {
  const endpoints: Record<string, Endpoint> = {};

  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node)) {
      const endpointName = node.name.getText();
      const value = node.initializer;
      if (
        ts.isCallExpression(value) &&
        ts.isPropertyAccessExpression(value.expression)
      ) {
        const expressionText = value.expression.getText();

        if (
          expressionText === "build.mutation" ||
          expressionText === "build.query"
        ) {
          const configArg = value.arguments[0];
          if (!configArg || !ts.isObjectLiteralExpression(configArg)) {
            errorLog(
              `Skipping invalid or missing config object for endpoint: ${endpointName}`,
            );
            return;
          }

          const queryProp = configArg.properties.find(
            (p) => p.name && p.name.getText() === "query",
          );

          if (!queryProp || !ts.isPropertyAssignment(queryProp)) {
            errorLog(
              `Skipping invalid or missing 'query' property for endpoint: ${endpointName}`,
            );
            return;
          }

          const queryFunction = queryProp.initializer;
          const queryObject = extractQueryObject(queryFunction);

          endpoints[endpointName] = {
            node,
            queryObject,
            type: expressionText,
            args: extractObjectLiteral(configArg, {}, { query: "query" }),
            typeArguments: value.typeArguments,
          };
        }
      }
    }
  }
  ts.forEachChild(endpointsBase, visit);

  return endpoints;
};
