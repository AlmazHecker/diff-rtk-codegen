import * as ts from "typescript";
import { Endpoint } from "../types/Endpoint";
import { capitalizeFirstLetter } from "../utils/string";

export const createExportEndpoints = (
  endpoints: Record<string, Endpoint>,
): ts.Statement => {
  const bindingElements = Object.entries(endpoints).map(([name, endpoint]) => {
    const formattedName = capitalizeFirstLetter(name); // Capitalize the first letter of the name
    const hookType = endpoint.type === "build.mutation" ? "Mutation" : "Query";
    const hookName = `use${formattedName}${hookType}`;

    return ts.factory.createBindingElement(
      undefined,
      undefined,
      ts.factory.createIdentifier(hookName),
      undefined,
    );
  });

  return ts.factory.createVariableStatement(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createObjectBindingPattern(bindingElements),
          undefined,
          undefined,
          ts.factory.createIdentifier("injectedRtkApi"),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  );
};
