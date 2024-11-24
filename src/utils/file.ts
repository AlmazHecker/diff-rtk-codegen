import * as ts from "typescript";
import * as fs from "fs";

/**
 * Получает контент файла и конвертирует его в AST
 */
export const getASTSource = (filePath: string): ts.SourceFile => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
  );
};
