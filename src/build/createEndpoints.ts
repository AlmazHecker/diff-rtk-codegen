import * as ts from "typescript";
import { Api } from "../types/Api";
import {
  createObjectLiteralFromRecord,
  createQueryFunction,
} from "./createQueryFunction";
import { Endpoint } from "../types/Endpoint";

export const generateEndpoints = (api: Api) => {
  return ts.factory.createPropertyAssignment(
    "endpoints",
    ts.factory.createArrowFunction(
      undefined,
      undefined,
      [
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          "build",
          undefined,
          undefined,
          undefined,
        ),
      ],
      undefined,
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      ts.factory.createParenthesizedExpression(
        ts.factory.createObjectLiteralExpression(
          Object.entries(api.endpoints).map(([name, endpoint]) =>
            generateEndpoint(name, endpoint),
          ),
        ),
      ),
    ),
  );
};

// Generates an individual endpoint (with or without generics)
const generateEndpoint = (name: string, endpoint: Endpoint) => {
  return ts.factory.createPropertyAssignment(
    name,
    ts.factory.createCallExpression(
      ts.factory.createIdentifier(endpoint.type),
      endpoint.typeArguments.length > 0 ? endpoint.typeArguments : undefined,
      [generatePropertyAssignment(endpoint)],
    ),
  );
};

// Generates the property assignments for query, method, body, and invalidatesTags
const generatePropertyAssignment = (endpoint: Endpoint) => {
  const dynamicArgs: ts.PropertyAssignment[] = [];

  Object.entries(endpoint.args).forEach(([key, value]) => {
    dynamicArgs.push(
      ts.factory.createPropertyAssignment(
        key,
        createObjectLiteralFromRecord(value),
      ),
    );
  });

  return ts.factory.createObjectLiteralExpression([
    createQueryFunction(endpoint.queryObject),
    ...dynamicArgs,
  ]);
};
