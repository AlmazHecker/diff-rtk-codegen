import * as ts from "typescript";
import { extractQueryObject } from "./extractQueryObject";
import { Endpoint } from "../types/Endpoint";
import { extractObjectLiteral } from "./extractObjectLiteral";
import { errorLog } from "../utils/log";
import { getProperty, isObject } from "../utils/ast";

const collectEndpoints = (
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
          if (!isObject(configArg)) {
            throw errorLog(
              `Invalid or missing config object for endpoint: ${endpointName}`,
            );
          }

          const queryProp = getProperty(configArg, "query", true);

          if (!queryProp || !ts.isPropertyAssignment(queryProp)) {
            throw errorLog(
              `Skipping invalid or missing 'query' property for endpoint: ${endpointName}`,
            );
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

/**
 * Extract endpoint details (arguments and configurations) from the source file
 */
export const extractEndpoints = (injectedEndpointsNode: ts.Expression) => {
  if (!isObject(injectedEndpointsNode)) return;

  const endpointsProperty = getProperty(injectedEndpointsNode, "endpoints");

  // if endpoints syntax is incorrect
  if (!endpointsProperty || !ts.isPropertyAssignment(endpointsProperty)) return;

  // (build) => ({ ...endpoints })
  const endpointsFunction = endpointsProperty.initializer;
  if (!ts.isArrowFunction(endpointsFunction)) return;

  // ({ ...endpoints })
  const block = endpointsFunction.body;
  if (
    ts.isParenthesizedExpression(block) &&
    ts.isObjectLiteralExpression(block.expression)
  ) {
    // { ...endpoints }
    return collectEndpoints(block.expression);
  }
};
