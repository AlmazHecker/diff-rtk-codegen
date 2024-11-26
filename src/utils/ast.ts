import * as ts from "typescript";
import * as fs from "fs";
import { errorLog } from "./log";

export const getASTFromFilePath = (filePath: string): ts.SourceFile => {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
  );
};

export const createASTFromStatements = (statements: ts.Statement[]) => {
  return ts.factory.createSourceFile(
    statements,
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );
};

export const getNodeText = (node: ts.Node) => node.getText();

export const isType = (node: ts.Node) => {
  return ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node);
};

export const getProperty = (
  node: ts.ObjectLiteralExpression,
  propertyName: string,
  throwIfNotFound: boolean = false,
) => {
  const property = node.properties.find(
    (prop) => prop.name && prop.name.getText() === propertyName,
  );

  if (!property && throwIfNotFound) {
    throw errorLog(`Property ${propertyName} not found!`);
  }

  return property;
};

export const isArray = (
  node: ts.Expression,
): node is ts.ArrayLiteralExpression => {
  return node.kind === ts.SyntaxKind.ArrayLiteralExpression;
};

export const isObject = (
  node: ts.Expression,
): node is ts.ObjectLiteralExpression => {
  return node.kind === ts.SyntaxKind.ObjectLiteralExpression;
};
