import * as ts from "typescript";
import { Api } from "../types/Api";
import { extractEndpoints } from "./extractEndpoints";
import { extractTagTypes } from "./extractTagTypes";

/**
 * Extract endpoint details (arguments and configurations) from the source file
 */
export const extractApi = (sourceFile: ts.SourceFile): Api => {
  const rtkApi: Api = {
    tagTypes: [],
    endpoints: {},
    types: {},
  };

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression)
    ) {
      const expressionText = node.expression.name.escapedText;
      if (expressionText === "enhanceEndpoints") {
        const enhanceEndpointsNode = node.arguments[0];
        if (
          enhanceEndpointsNode &&
          ts.isObjectLiteralExpression(enhanceEndpointsNode)
        ) {
          rtkApi.tagTypes = extractTagTypes(enhanceEndpointsNode);
        }
      }
      if (expressionText === "injectEndpoints") {
        const injectedEndpointsNode = node.arguments[0];
        if (
          injectedEndpointsNode &&
          ts.isObjectLiteralExpression(injectedEndpointsNode)
        ) {
          // Extract the endpoints property from the injectedEndpoints argument
          const endpointsProperty = injectedEndpointsNode.properties.find(
            (prop) => prop.name && prop.name.getText() === "endpoints",
          );

          if (endpointsProperty && ts.isPropertyAssignment(endpointsProperty)) {
            const endpointsFunction = endpointsProperty.initializer;
            if (ts.isArrowFunction(endpointsFunction)) {
              const block = endpointsFunction.body;
              if (
                ts.isParenthesizedExpression(block) &&
                ts.isObjectLiteralExpression(block.expression)
              ) {
                rtkApi.endpoints = extractEndpoints(block.expression);
              }
            }
          }
        }
      }
    }

    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      rtkApi.types[node.name.escapedText as string] = node;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return rtkApi;
};
