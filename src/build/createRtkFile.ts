import * as ts from "typescript";
import * as fs from "fs";
import { Api } from "../types/Api";
import { createApi } from "./createApi";
import { createTypes } from "./createTypes";

export const createRtkApi = (api: Api) => {
  const statements: ts.Statement[] = [];

  if (api.tagTypes?.length) {
    statements.push(createApi(api));
  }

  if (api.types) {
    statements.push(...createTypes(api));
  }

  const sourceFile = ts.factory.createSourceFile(
    statements,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  const printer = ts.createPrinter();
  const result = printer.printFile(sourceFile);
  fs.writeFileSync("./bebra.ts", result, "utf-8");

  return result;
};
