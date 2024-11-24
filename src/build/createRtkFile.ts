import * as ts from "typescript";
import * as fs from "fs";
import { Api } from "../types/Api";
import { createApi } from "./createApi";
import { createTypesFromSourceFile } from "./createTypes";

export const createRtkApi = (api: Api) => {
  const statements: ts.Statement[] = [createApi(api)];

  const typeDeclarations = createTypesFromSourceFile(api.types).join("\n");

  const newSourceFile = ts.factory.createSourceFile(
    statements,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  const printer = ts.createPrinter();
  const result = printer.printFile(newSourceFile);
  fs.writeFileSync("./bebra.ts", `${result}\n ${typeDeclarations}`, "utf-8");

  return result;
};
