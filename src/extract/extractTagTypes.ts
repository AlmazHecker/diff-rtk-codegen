import * as ts from "typescript";
import { errorLog } from "../utils/log";

export const extractTagTypes = (node: ts.CallExpression) => {
  const enhanceEndpointsNode = node.arguments[0];
  if (
    !enhanceEndpointsNode ||
    !ts.isObjectLiteralExpression(enhanceEndpointsNode)
  ) {
    return;
  }
  // rtkApi.tagTypes = extractTagTypes(enhanceEndpointsNode);

  const tagTypesProperty = enhanceEndpointsNode.properties.find(
    (prop) => prop.name && prop.name.getText() === "addTagTypes",
  );
  if (tagTypesProperty && "initializer" in tagTypesProperty) {
    const initializer = tagTypesProperty.initializer;
    if (initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
      return (initializer as ts.ArrayLiteralExpression).elements.map((el) => {
        return (el as ts.StringLiteral).text;
      });
    } else {
      throw errorLog("Initializer is not an array literal.");
    }
  }
};
