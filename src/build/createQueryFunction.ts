import * as ts from "typescript";
import { Endpoint } from "../types/Endpoint";
import { QueryObject } from "../extract/extractQueryObject";
import { createFunction } from "../utils/createFunction";

// values from query: { ... }
// type RecordType = ts.Node | Record<string, unknown> | string;

export const createObjectLiteralFromRecord = (record: QueryObject[1]) => {
  // @ts-ignore
  if (ts.isFunctionExpression(record) || ts.isArrowFunction(record)) {
    return createFunction(record);
  }

  if (typeof record === "string") {
    return ts.factory.createStringLiteral(record);
  }

  if (record.kind === 211) {
    // console.log("bobr", record.getText());
    return record;
  }
  if (Array.isArray(record)) {
    return ts.factory.createArrayLiteralExpression(
      record.map((item) => ts.factory.createStringLiteral(item)),
    );
  }

  return ts.factory.createObjectLiteralExpression(
    Object.entries(record).map(([key, value]) => {
      if (value.kind === 211) {
        return ts.factory.createPropertyAssignment(key, value);
      }
      if (typeof value === "string") {
        return ts.factory.createPropertyAssignment(
          key,
          ts.factory.createStringLiteral(value),
        );
      }

      if (typeof value === "object") {
        return ts.factory.createPropertyAssignment(
          key,
          createObjectLiteralFromRecord(value as Record<string, any>),
        );
      }

      return ts.factory.createPropertyAssignment(
        key,
        ts.factory.createStringLiteral(String(value)),
      );
    }),
  );
};

export const createQueryFunction = (queryObject: QueryObject) => {
  return ts.factory.createPropertyAssignment(
    "query",
    ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          "queryArg",
          undefined,
          undefined,
          undefined,
        ),
      ],
      undefined,
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      ts.factory.createParenthesizedExpression(
        ts.factory.createObjectLiteralExpression([
          ...Object.entries(queryObject).map(([key, value]) => {
            return ts.factory.createPropertyAssignment(
              key,
              createObjectLiteralFromRecord(value as Record<string, any>),
            );
          }),
        ]),
      ),
    ),
  );
};
