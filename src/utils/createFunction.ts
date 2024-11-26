import * as ts from "typescript";
import { traverseAndHandleLiterals } from "./traverseAndHandleLiterals";

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
