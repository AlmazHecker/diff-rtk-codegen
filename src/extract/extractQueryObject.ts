import * as ts from "typescript";
import { extractObjectLiteral } from "./extractObjectLiteral";
import { errorLog } from "../utils/log";

export type QueryObject = Record<
  string,
  string | Record<string, string> | ts.PropertyAccessExpression
>;

/**
 * Extract the return value of the query function (which is an object literal)
 */
export const extractQueryObject = (
  queryFunction: ts.Expression,
): QueryObject => {
  if (ts.isArrowFunction(queryFunction)) {
    const body = queryFunction.body;
    if (
      ts.isParenthesizedExpression(body) &&
      ts.isObjectLiteralExpression(body.expression)
    ) {
      return extractObjectLiteral(body.expression);
    }

    errorLog("Error: The query function does not return an object literal.");
    return {};
  }

  if (
    ts.isFunctionExpression(queryFunction) &&
    ts.isBlock(queryFunction.body)
  ) {
    const returnStatement = queryFunction.body.statements.find(
      ts.isReturnStatement,
    );
    if (
      returnStatement?.expression &&
      ts.isObjectLiteralExpression(returnStatement.expression)
    ) {
      return extractObjectLiteral(returnStatement.expression);
    }
  }

  errorLog(
    "Warning: Query function body doesn't return a valid object literal.",
  );
  return {};
};
