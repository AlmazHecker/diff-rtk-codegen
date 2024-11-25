import * as ts from "typescript";
import { Api } from "../types/Api";
import { generateEndpoints } from "./createEndpoints";

export const createApi = (api: Api) => {
  const injectedRtkApi = ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          "injectedRtkApi",
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              createEnhanceEndpoints(api),
              "injectEndpoints",
            ),
            undefined,
            [
              ts.factory.createObjectLiteralExpression([
                generateEndpoints(api),
              ]),
            ],
          ),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

  return injectedRtkApi;
};

const createEnhanceEndpoints = (api: Api) => {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier("api"),
      "enhanceEndpoints",
    ),
    undefined,
    [
      ts.factory.createObjectLiteralExpression([
        ts.factory.createPropertyAssignment(
          "addTagTypes",
          ts.factory.createArrayLiteralExpression(
            api.tagTypes.map((tag) => ts.factory.createStringLiteral(tag)),
          ),
        ),
      ]),
    ],
  );
};
