import * as ts from "typescript";

/**
 * Extracts import statements from a given node.
 * This will return an array of objects representing the import statements.
 */
export const extractImport = (node: ts.Node): string => {
  return node.getText();
};
