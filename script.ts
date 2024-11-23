// @ts-nocheck
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";
import { CallExpression } from "typescript";

const apiFilePath = path.join(__dirname, "./test-data/api.ts");
const generatedFilePath = path.join(__dirname, "./test-data/generated.ts");

/**
 * Reads a file and parses it as a TypeScript SourceFile
 */
function readFile(filePath: string): ts.SourceFile {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return ts.createSourceFile(
    filePath,
    fileContent,
    ts.ScriptTarget.Latest,
    true,
  );
}

/**
 * Extract endpoint details (arguments and configurations) from the source file
 */
function extractEndpointInfo(sourceFile: ts.SourceFile) {
  const endpoints: Record<string, any> = {};

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression)
    ) {
      const expressionText = node.expression.getText();

      if (
        expressionText === "build.mutation" ||
        expressionText === "build.query"
      ) {
        const endpointName = (
          node.parent as ts.PropertyDeclaration
        )?.name?.getText();

        const configArg = node.arguments[0];
        if (!configArg || !ts.isObjectLiteralExpression(configArg)) {
          console.warn(
            `Skipping invalid or missing config object for endpoint: ${endpointName}`,
          );
          return;
        }

        const queryProp = configArg.properties.find(
          (prop) => prop.name && prop.name.getText() === "query",
        );

        if (!queryProp || !ts.isPropertyAssignment(queryProp)) {
          console.warn(
            `Skipping invalid or missing 'query' property for endpoint: ${endpointName}`,
          );
          return;
        }

        const queryFunction = queryProp.initializer;
        if (
          !ts.isArrowFunction(queryFunction) &&
          !ts.isFunctionExpression(queryFunction)
        ) {
          console.warn(
            `Expected a function for 'query' in endpoint: ${endpointName}`,
          );
          return;
        }

        const queryObject = extractQueryObject(queryFunction);

        endpoints[endpointName!] = {
          node,
          queryObject,
          type: expressionText,
        };
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return endpoints;
}

/**
 * Extract the return value of the query function (which is an object literal)
 */
function extractQueryObject(
  queryFunction: ts.ArrowFunction | ts.FunctionExpression,
) {
  const queryObject: Record<string, any> = {};

  if (ts.isArrowFunction(queryFunction)) {
    const body = queryFunction.body;

    if (ts.isParenthesizedExpression(body)) {
      if (ts.isObjectLiteralExpression(body.expression)) {
        const returnExpression = body.expression;

        returnExpression.properties.forEach((prop) => {
          const propName = prop.name?.getText();
          const propValue = prop.initializer;

          if (propName && propValue) {
            if (ts.isObjectLiteralExpression(propValue)) {
              queryObject[propName] = extractObjectLiteral(propValue);
            } else {
              queryObject[propName] = propValue.getText();
            }
          }
        });
      }
    } else if (ts.isObjectLiteralExpression(body)) {
      const returnExpression = body;

      returnExpression.properties.forEach((prop) => {
        const propName = prop.name?.getText();
        const propValue = prop.initializer;

        if (propName && propValue) {
          if (ts.isObjectLiteralExpression(propValue)) {
            queryObject[propName] = extractObjectLiteral(propValue);
          } else {
            queryObject[propName] = propValue.getText();
          }
        }
      });
    } else {
      console.warn("Unexpected query function body structure");
    }
  } else if (
    ts.isFunctionExpression(queryFunction) &&
    ts.isBlock(queryFunction.body)
  ) {
    const returnStatement = queryFunction.body.statements.find((stmt) =>
      ts.isReturnStatement(stmt),
    );
    if (returnStatement && returnStatement.expression) {
      const returnExpression = returnStatement.expression;
      if (ts.isObjectLiteralExpression(returnExpression)) {
        returnExpression.properties.forEach((prop) => {
          const propName = prop.name?.getText();
          const propValue = prop.initializer;

          if (propName && propValue) {
            if (ts.isObjectLiteralExpression(propValue)) {
              queryObject[propName] = extractObjectLiteral(propValue);
            } else {
              queryObject[propName] = propValue.getText();
            }
          }
        });
      }
    }
  }

  return queryObject;
}

/**
 * Helper function to extract properties from object literal expressions
 */
function extractObjectLiteral(objectLiteral: ts.ObjectLiteralExpression) {
  const obj: Record<string, any> = {};
  objectLiteral.properties.forEach((prop) => {
    const propName = prop.name?.getText();
    const propValue = prop.initializer;

    if (propName && propValue) {
      if (ts.isObjectLiteralExpression(propValue)) {
        obj[propName] = extractObjectLiteral(propValue);
      } else {
        obj[propName] = propValue.getText();
      }
    }
  });
  return obj;
}

/**
 * Merges two endpoint definitions
 * - Adds new properties
 * - Retains custom properties from the original API
 * - Removes deleted APIs
 */
function mergeEndpoints(
  apiEndpoints: Record<string, any>,
  generatedEndpoints: Record<string, any>,
  overrides?: Record<string, any>,
) {
  const mergedEndpoints: Record<string, any> = {};

  for (const [key, generatedEndpoint] of Object.entries(generatedEndpoints)) {
    const apiEndpoint = apiEndpoints[key];

    mergedEndpoints[key] = apiEndpoint
      ? {
          ...generatedEndpoint,
          ...apiEndpoint,
          args: {
            ...generatedEndpoint.args,
            ...apiEndpoint.args,
          },
          query: mergeQueryFunction(
            generatedEndpoint.queryObject,
            apiEndpoint.queryObject,
          ),
        }
      : generatedEndpoint;
  }

  if (overrides) {
    for (const [key, override] of Object.entries(overrides)) {
      if (mergedEndpoints[key]) {
        mergedEndpoints[key].args.responseType = override.responseType;
        mergedEndpoints[key].args.argType = override.argType;
      }
    }
  }

  return mergedEndpoints;
}

/**
 * Merges two query functions, extracting and combining their query arguments and bodies.
 */
function mergeQueryFunction(
  generatedQuery: Function | undefined,
  apiQuery: Function | undefined,
) {
  if (!generatedQuery && !apiQuery) return undefined;

  if (generatedQuery && apiQuery) {
    const generatedQueryBody = extractQueryObject(generatedQuery);
    const apiQueryBody = extractQueryObject(apiQuery);

    return (queryArg: any) => ({
      ...generatedQueryBody(queryArg),
      ...apiQueryBody(queryArg),
    });
  }

  return generatedQuery || apiQuery;
}

/**
 * Rebuilds the API file with updated endpoints
 */
/**
 * Rebuilds the API file with updated endpoints
 */
function rebuildApiFile(
  mergedEndpoints: Record<string, any>,
  originalSource: ts.SourceFile,
) {
  const printer = ts.createPrinter();
  const newStatements: ts.Statement[] = [];

  ts.forEachChild(originalSource, (node) => {
    if (
      ts.isCallExpression(node) &&
      ["build.mutation", "build.query"].includes(node.expression.getText())
    ) {
      const endpointName = (
        node.parent as ts.PropertyDeclaration
      )?.name?.getText();

      if (mergedEndpoints[endpointName!]) {
        const { args, query, queryObject } = mergedEndpoints[endpointName!];

        const updatedNode = ts.factory.updateCallExpression(
          node,
          node.expression,
          node.typeArguments,
          [
            node.arguments[0],
            ts.factory.createObjectLiteralExpression(
              [
                ...Object.entries(args || {}).map(([key, value]) => {
                  return ts.factory.createPropertyAssignment(
                    key,
                    typeof value === "string"
                      ? ts.factory.createStringLiteral(value)
                      : ts.factory.createIdentifier(value),
                  );
                }),

                query
                  ? ts.factory.createPropertyAssignment("query", query)
                  : undefined,

                queryObject
                  ? ts.factory.createPropertyAssignment(
                      "query",
                      ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [],
                        undefined,
                        ts.factory.createToken(
                          ts.SyntaxKind.EqualsGreaterThanToken,
                        ),
                        ts.factory.createBlock([
                          ts.factory.createReturnStatement(
                            ts.factory.createObjectLiteralExpression(
                              Object.entries(queryObject).map(([key, value]) =>
                                ts.factory.createPropertyAssignment(
                                  key,
                                  typeof value === "string"
                                    ? ts.factory.createStringLiteral(value)
                                    : ts.factory.createIdentifier(value),
                                ),
                              ),
                              true,
                            ),
                          ),
                        ]),
                      ),
                    )
                  : undefined,
              ].filter(Boolean),
              true,
            ),
          ],
        );

        newStatements.push(updatedNode);
        delete mergedEndpoints[endpointName!];
      }
    } else {
      newStatements.push(node);
    }
  });

  for (const [key, { args, query, queryObject, type }] of Object.entries(
    mergedEndpoints,
  )) {
    if (!args && !query && !queryObject) {
      console.warn(`Skipping empty or invalid endpoint: ${key}`);
      continue;
    }

    newStatements.push(
      ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              key,
              undefined,
              undefined,
              ts.factory.createCallExpression(
                ts.factory.createIdentifier(type),
                undefined,
                [
                  ts.factory.createObjectLiteralExpression(
                    [
                      ...Object.entries(args || {}).map(([argKey, argValue]) =>
                        ts.factory.createPropertyAssignment(
                          argKey,
                          typeof argValue === "string"
                            ? ts.factory.createStringLiteral(argValue)
                            : ts.factory.createIdentifier(argValue),
                        ),
                      ),
                      queryObject
                        ? ts.factory.createPropertyAssignment(
                            "query",
                            ts.factory.createArrowFunction(
                              undefined,
                              undefined,
                              [],
                              undefined,
                              ts.factory.createToken(
                                ts.SyntaxKind.EqualsGreaterThanToken,
                              ),
                              ts.factory.createBlock([
                                ts.factory.createReturnStatement(
                                  ts.factory.createObjectLiteralExpression(
                                    Object.entries(queryObject).map(
                                      ([key, value]) =>
                                        ts.factory.createPropertyAssignment(
                                          key,
                                          typeof value === "string"
                                            ? ts.factory.createStringLiteral(
                                                value,
                                              )
                                            : ts.factory.createIdentifier(
                                                value,
                                              ),
                                        ),
                                    ),
                                    true,
                                  ),
                                ),
                              ]),
                            ),
                          )
                        : undefined,
                    ].filter(Boolean),
                    true,
                  ),
                ],
              ),
            ),
          ],
          ts.NodeFlags.Const,
        ),
      ),
    );
  }

  const resultFile = ts.factory.updateSourceFile(originalSource, newStatements);
  const newContent = printer.printFile(resultFile);

  fs.writeFileSync("./bebra.ts", newContent, "utf-8");
}

/**
 * Main function to merge API files
 */
function mergeApiFiles(overrides?: Record<string, any>) {
  const apiSource = readFile(apiFilePath);
  const generatedSource = readFile(generatedFilePath);

  const apiEndpoints = extractEndpointInfo(apiSource);
  const generatedEndpoints = extractEndpointInfo(generatedSource);

  const mergedEndpoints = mergeEndpoints(
    apiEndpoints,
    generatedEndpoints,
    overrides,
  );

  rebuildApiFile(mergedEndpoints, apiSource);

  console.log("API files merged successfully!");
}

mergeApiFiles();
