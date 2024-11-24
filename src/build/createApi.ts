import * as ts from "typescript";
import { Api } from "../types/Api";
import { generateEndpoints } from "./createEndpoints";

const generateInjectEndpoints = (api: Api) => {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createCallExpression(
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
      ),
      "injectEndpoints",
    ),
    undefined,
    [ts.factory.createObjectLiteralExpression([generateEndpoints(api)])],
  );
};

export const createApi = (api: Api) => {
  const injectedRtkApi = ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          "injectedRtkApi",
          undefined,
          undefined,
          generateInjectEndpoints(api),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );

  return injectedRtkApi;
};
