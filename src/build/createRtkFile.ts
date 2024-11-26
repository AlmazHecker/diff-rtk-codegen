import * as ts from "typescript";
import * as fs from "fs";
import { Api } from "../types/Api";
import { createApi } from "./createApi";
import { createTypesFromSourceFile } from "./createTypes";
import { createExportEndpoints } from "./createExportEndpoints";
import { createASTFromStatements } from "../utils/ast";

export const createRtkApi = (api: Api) => {
  const statements: ts.Statement[] = [
    createApi(api),
    createExportEndpoints(api.endpoints),
  ];

  const importDeclarations = api.imports.join("\n");
  const typeDeclarations = createTypesFromSourceFile(api.types).join("\n");

  const sourceFile = createASTFromStatements(statements);

  const printer = ts.createPrinter();
  const result = printer.printFile(sourceFile);
  fs.writeFileSync(
    "./bebra.ts",
    `${importDeclarations}\n${result}\n ${typeDeclarations}`,
    "utf-8",
  );

  return result;
};
