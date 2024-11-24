import * as ts from "typescript";

/**
 * Helper function to extract properties from object literal expressions
 */
export const extractObjectLiteral = (
  objectLiteral: ts.ObjectLiteralExpression,
  obj: Record<string, any> = {},
  ignoreKeys: Record<string, string> = {},
) => {
  objectLiteral.properties.forEach((prop) => {
    const propName = prop.name?.getText();

    if (propName in ignoreKeys) {
      return;
    }

    let propValue: ts.Expression = undefined;
    if ("initializer" in prop) {
      propValue = prop.initializer;
    }

    // if (!propName || !propValue) return;

    if (propName && propValue) {
      if (ts.isObjectLiteralExpression(propValue)) {
        obj[propName] = extractObjectLiteral(propValue);
      } else if (ts.isArrayLiteralExpression(propValue)) {
        obj[propName] = propValue.elements.reduce<string[]>((acc, el) => {
          if (ts.isStringLiteral(el)) acc.push(el.text);
          return acc;
        }, []);
      } else {
        if (ts.isStringLiteral(propValue)) {
          obj[propName] = propValue.text;
        } else if (ts.isTemplateLiteral(propValue)) {
          obj[propName] = propValue.getText().slice(1, -1);
        } else {
          obj[propName] = propValue.getText();
        }
      }
    }
  });
  return obj;
};
