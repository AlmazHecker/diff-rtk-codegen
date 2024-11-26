import * as ts from "typescript";

export function createFunction(
  value: ts.FunctionExpression | ts.ArrowFunction,
): ts.FunctionExpression | ts.ArrowFunction {
  const parameters = value.parameters.map((param) =>
    ts.factory.createParameterDeclaration(
      param.modifiers,
      param.dotDotDotToken,
      param.name,
      param.questionToken,
      param.type,
      traverseAndHandleLiterals(param.initializer),
    ),
  );

  const body = ts.isBlock(value.body)
    ? traverseAndHandleLiterals(value.body)
    : ts.factory.createBlock(
        [
          ts.factory.createReturnStatement(
            traverseAndHandleLiterals(value.body),
          ),
        ],
        true,
      );

  if (ts.isArrowFunction(value)) {
    return ts.factory.createArrowFunction(
      value.modifiers,
      value.typeParameters,
      parameters,
      value.type,
      value.equalsGreaterThanToken,
      body,
    );
  }

  return ts.factory.createFunctionExpression(
    value.modifiers,
    value.asteriskToken,
    value.name,
    value.typeParameters,
    parameters,
    value.type,
    body,
  );
}

// I didn't find good solution...
// This function traverses whole function body and checks for string or number literals
// and then it just ... recreates them
// fuck typescript compiler.
function traverseAndHandleLiterals<T extends ts.Node>(node: T): T {
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
}
