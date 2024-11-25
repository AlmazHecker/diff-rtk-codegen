import * as ts from "typescript";
import { Api } from "../types/Api";
import { extractEndpoints } from "./extractEndpoints";
import { extractTagTypes } from "./extractTagTypes";
import { extractImport } from "./extractImport";

/**
 * Extract endpoint details (arguments and configurations) from the source file
 */
export const extractApi = (sourceFile: ts.SourceFile): Api => {
  const rtkApi: Api = {
    tagTypes: [],
    endpoints: {},
    types: [],
    imports: [],
  };

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      rtkApi.imports.push(extractImport(node));
    }
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
      rtkApi.types.push(node);
    }
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression)
    ) {
      const expressionText = node.expression.name.escapedText;
      if (expressionText === "enhanceEndpoints") {
        rtkApi.tagTypes = extractTagTypes(node);
      }
      if (expressionText === "injectEndpoints") {
        rtkApi.endpoints = extractEndpoints(node);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return rtkApi;
};
