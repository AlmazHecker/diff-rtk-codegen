import * as ts from "typescript";

export function createTypesFromSourceFile(types: ts.Node[]): string[] {
  return types.map((type) => type.getText());
}
