// I didn't find good solution...
// This function traverses whole function body and checks for string or number literals
// and then it just ... recreates them
// fuck typescript compiler.
import * as ts from "typescript";

export const traverseAndHandleLiterals = <T extends ts.Node>(node: T): T => {
  const visit: ts.Visitor = (child) => {
    if (ts.isStringLiteral(child)) {
      return ts.factory.createStringLiteral(child.text);
    }
    if (ts.isNumericLiteral(child)) {
      return ts.factory.createNumericLiteral(child.text);
    }

    return ts.visitEachChild(child, visit, undefined);
  };

  return ts.visitNode(node, visit) as T;
};
