import * as ts from "typescript";

export function createTypesFromSourceFile(
  types: Record<string, ts.Node>,
): string[] {
  const typeDeclarations: string[] = [];

  for (let [typeName, typeNode] of Object.entries(types)) {
    typeDeclarations.push(typeNode.getText());
  }

  return typeDeclarations;
}
