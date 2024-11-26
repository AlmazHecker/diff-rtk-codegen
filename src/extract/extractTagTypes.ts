import * as ts from "typescript";
import { errorLog } from "../utils/log";
import { getProperty, isArray, isObject } from "../utils/ast";

export const extractTagTypes = (enhanceEndpointsNode: ts.Expression) => {
  if (!isObject(enhanceEndpointsNode)) return;

  const tagTypesProperty = getProperty(enhanceEndpointsNode, "addTagTypes");

  const initializer = (tagTypesProperty as ts.PropertyAssignment).initializer;

  if (!isArray(initializer)) {
    throw errorLog("Initializer is not an array literal.");
  }

  return (initializer as ts.ArrayLiteralExpression).elements.map((el) => {
    return (el as ts.StringLiteral).text;
  });
};
