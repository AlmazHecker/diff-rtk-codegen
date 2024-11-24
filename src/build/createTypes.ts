import * as ts from "typescript";
import { Api } from "../types/Api";

export const createTypes = (api: Api): ts.Statement[] => {
  const typeDeclarations: ts.Statement[] = [];

  for (const [typeName, typeNode] of Object.entries(api.types)) {
    if (isStringLiteralArray(typeNode)) {
      // Create the custom type for string literal union array
      const typeDeclaration = createLiteralArrayType(typeName, typeNode);
      typeDeclarations.push(typeDeclaration);
    } else {
      // Just pass other types directly as aliases
      const typeAlias = ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(typeName),
        undefined,
        typeNode,
      );
      typeDeclarations.push(typeAlias);
    }
  }

  return typeDeclarations;
};

// Helper to check if it's a string literal union inside an array
const isStringLiteralArray = (typeNode: ts.TypeNode): boolean => {
  if (ts.isArrayTypeNode(typeNode)) {
    const elementType = typeNode.elementType;
    if (ts.isUnionTypeNode(elementType)) {
      // Check if every element in the union is a string literal
      return elementType.types.every(
        (type) =>
          ts.isLiteralTypeNode(type) && ts.isStringLiteral(type.literal),
      );
    }
  }
  return false;
};

// Helper to create the array type with string literal unions
const createLiteralArrayType = (
  typeName: string,
  typeNode: ts.TypeNode,
): ts.Statement => {
  if (
    !ts.isArrayTypeNode(typeNode) ||
    !ts.isUnionTypeNode(typeNode.elementType)
  ) {
    throw new Error("Expected an array of string literal unions.");
  }

  const unionTypeNode = ts.factory.createUnionTypeNode(
    typeNode.elementType.types.filter(
      (literalType) =>
        ts.isLiteralTypeNode(literalType) &&
        ts.isStringLiteral(literalType.literal),
    ),
  );

  const arrayTypeNode = ts.factory.createArrayTypeNode(unionTypeNode);

  return ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(typeName),
    undefined,
    arrayTypeNode,
  );
};
