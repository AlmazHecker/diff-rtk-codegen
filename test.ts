import * as ts from "typescript";

// Create the function expression
const anonymousFunction = ts.factory.createArrowFunction(
  undefined, // modifiers, e.g., export, async, etc. (none in this case)
  undefined, // asterisk for generator function (none)
  [], // parameters (empty in this case)
  undefined, // type parameters (none)
  undefined, // type of the return value (none, so undefined)
  ts.factory.createBlock(
    [
      // body of the function
      ts.factory.createReturnStatement(
        ts.factory.createStringLiteral("Hello, World!"),
      ), // return statement
    ],
    true, // true means this is a block with braces
  ),
);

const functionExpressionStatement =
  ts.factory.createExpressionStatement(anonymousFunction);

// Create a source file to wrap it
const sourceFile = ts.factory.createSourceFile(
  [functionExpressionStatement], // filename
  ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
  ts.NodeFlags.None, // TypeScript source
);

// Convert the function expression to a string
const printer = ts.createPrinter();
const result = printer.printNode(
  ts.EmitHint.Unspecified,
  anonymousFunction,
  sourceFile,
);

console.log(result);
