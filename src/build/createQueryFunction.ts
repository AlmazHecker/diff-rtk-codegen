import * as ts from "typescript";
import { Endpoint } from "../types/Endpoint";

// values from query: { ... }
type RecordType = Record<string, unknown> | string;

const createObjectLiteralFromRecord = (record: RecordType) => {
  if (typeof record === "string") {
    return ts.factory.createStringLiteral(record);
  }

  return ts.factory.createObjectLiteralExpression(
    Object.entries(record).map(([key, value]) => {
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

export const createQueryFunction = (endpoint: Endpoint) => {
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
      ts.factory.createObjectLiteralExpression([
        ...Object.entries(endpoint.queryObject).map(([key, value]) => {
          return ts.factory.createPropertyAssignment(
            key,
            createObjectLiteralFromRecord(value as Record<string, any>),
          );
        }),
      ]),
    ),
  );
};
