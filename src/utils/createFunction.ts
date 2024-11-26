// import * as ts from "typescript";
//
// export const createFunction = (
//   func: ts.ArrowFunction | ts.FunctionExpression,
// ) => {
//   // if (ts.isBlock(record.body)) {
//   //   // Traverse the statements in the function body
//   //   const returnStatement = record.body.statements.find((statement) =>
//   //     ts.isReturnStatement(statement),
//   //   );
//   //
//   //   console.log(returnStatement.expression.kind, "asdf");
//   // }
//
//   return ts.factory.createArrowFunction(
//     undefined,
//     undefined,
//     [],
//     undefined,
//     ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
//     ts.factory.createStringLiteral("variable"),
//   );
//   // return record;
// };

import * as ts from "typescript";

export const createFunction = (
  func: ts.ArrowFunction | ts.FunctionExpression,
) => {
  if (ts.isArrowFunction(func)) {
    // Handling Arrow Function
    console.log("This is an arrow function");

    // Extracting relevant properties
    const parameters = func.parameters; // Array of parameters
    const returnType = func.type; // Return type (if any)
    const body = func.body; // Function body

    let returnExpression: ts.Expression;

    // If the body is a block, search for the return statement
    if (ts.isBlock(body)) {
      const returnStatement = body.statements.find(ts.isReturnStatement);
      if (returnStatement) {
        const expr = returnStatement.expression;

        // Check if the return expression is a number or string literal
        if (
          ts.isLiteralExpression(expr) &&
          (ts.isStringLiteral(expr) || ts.isNumericLiteral(expr))
        ) {
          returnExpression = ts.isStringLiteral(expr)
            ? ts.factory.createStringLiteral(expr.text) // Rebuild string literal
            : ts.factory.createNumericLiteral(expr.text); // Rebuild number literal
        } else {
          // Use the original return statement as is
          returnExpression = expr;
        }
      } else {
        throw new Error("No return statement found in arrow function body.");
      }
    } else {
      // If the body is not a block (i.e., it's a single expression function)
      const expr = body;

      // Check if the return expression is a number or string literal
      if (
        ts.isLiteralExpression(expr) &&
        (ts.isStringLiteral(expr) || ts.isNumericLiteral(expr))
      ) {
        returnExpression = ts.isStringLiteral(expr)
          ? ts.factory.createStringLiteral(expr.text) // Rebuild string literal
          : ts.factory.createNumericLiteral(expr.text); // Rebuild number literal
      } else {
        // Use the original return expression as is
        returnExpression = expr;
      }
    }

    // Creating a new Arrow Function with the return expression
    return ts.factory.createArrowFunction(
      undefined, // Modifiers, if any
      undefined, // Async keyword (if it's async)
      parameters, // Parameters of the function
      returnType, // Return type of the function
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken), // '=>'
      returnExpression, // The return expression extracted from the original function
    );
  } else if (ts.isFunctionExpression(func)) {
    // Handling Function Expression
    console.log("This is a function expression");

    // Extracting relevant properties
    const parameters = func.parameters; // Array of parameters
    const returnType = func.type; // Return type (if any)
    const body = func.body; // Function body

    let returnExpression: ts.Expression;

    // If the body is a block, search for the return statement
    if (ts.isBlock(body)) {
      const returnStatement = body.statements.find(ts.isReturnStatement);
      if (returnStatement) {
        const expr = returnStatement.expression;

        // Check if the return expression is a number or string literal
        if (
          ts.isLiteralExpression(expr) &&
          (ts.isStringLiteral(expr) || ts.isNumericLiteral(expr))
        ) {
          returnExpression = ts.isStringLiteral(expr)
            ? ts.factory.createStringLiteral(expr.text) // Rebuild string literal
            : ts.factory.createNumericLiteral(expr.text); // Rebuild number literal
        } else {
          // Use the original return statement as is
          returnExpression = expr;
        }
      } else {
        throw new Error(
          "No return statement found in function expression body.",
        );
      }
    } else {
      // If the body is not a block (i.e., it's a single expression function)
      const expr = body;

      // Check if the return expression is a number or string literal
      if (
        ts.isLiteralExpression(expr) &&
        (ts.isStringLiteral(expr) || ts.isNumericLiteral(expr))
      ) {
        returnExpression = ts.isStringLiteral(expr)
          ? ts.factory.createStringLiteral(expr.text) // Rebuild string literal
          : ts.factory.createNumericLiteral(expr.text); // Rebuild number literal
      } else {
        // Use the original return expression as is
        returnExpression = expr;
      }
    }

    // Creating a new Function Expression with the return expression
    return ts.factory.createFunctionExpression(
      undefined, // Modifiers, if any
      undefined, // Async keyword (if it's async)
      undefined, // Name of the function (if any)
      undefined, // Type parameters (if any)
      parameters, // Parameters of the function
      returnType, // Return type of the function
      ts.factory.createBlock([
        ts.factory.createReturnStatement(returnExpression),
      ]), // Wrap in a return statement block
    );
  }

  // Return null if neither arrow function nor function expression
  return null;
};
