// @ts-nocheck
import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

const apiFilePath = path.join(__dirname, "./api.ts");
const generatedFilePath = path.join(__dirname, "./generated.ts");

function readFile(filePath: string) {
   const fileContent = fs.readFileSync(filePath, "utf-8");
   return ts.createSourceFile(
      filePath,
      fileContent,
      ts.ScriptTarget.Latest,
      true
   );
}

function extractEndpointInfo(sourceFile: ts.SourceFile) {
   const endpoints: Record<string, any> = {};

   ts.forEachChild(sourceFile, (node) => {
      if (
         (ts.isCallExpression(node) &&
            node.expression.getText() === "build.mutation") ||
         node.expression?.getText?.() === "build.query"
      ) {
         const endpointName = node.parent?.name?.getText();
         const invalidatesTagsNode = node.arguments[1]?.properties?.find(
            (prop) => prop.name?.getText() === "invalidatesTags"
         );
         const providesTagsNode = node.arguments[1]?.properties?.find(
            (prop) => prop.name?.getText() === "providesTags"
         );

         endpoints[endpointName!] = {
            invalidatesTags: invalidatesTagsNode
               ? invalidatesTagsNode.initializer.getText()
               : undefined,
            providesTags: providesTagsNode
               ? providesTagsNode.initializer.getText()
               : undefined,
            responseType: node.arguments[0]?.type?.getText(),
            argType: node.arguments[1]?.properties
               ?.find((prop) => prop.name?.getText() === "query")
               ?.type?.getText(),
         };
      }
   });

   return endpoints;
}

function mergeEndpoints(
   apiEndpoints: Record<string, any>,
   generatedEndpoints: Record<string, any>
) {
   const mergedEndpoints = { ...apiEndpoints };

   for (const [key, generatedEndpoint] of Object.entries(generatedEndpoints)) {
      const apiEndpoint = apiEndpoints[key];

      if (apiEndpoint) {
         if (generatedEndpoint.responseType !== apiEndpoint.responseType) {
            mergedEndpoints[key].responseType = generatedEndpoint.responseType;
         }

         if (generatedEndpoint.argType !== apiEndpoint.argType) {
            mergedEndpoints[key].argType = generatedEndpoint.argType;
         }

         if (generatedEndpoint.argType && !apiEndpoint.argType) {
            mergedEndpoints[key].argType = generatedEndpoint.argType;
         }

         mergedEndpoints[key].invalidatesTags =
            apiEndpoint.invalidatesTags || generatedEndpoint.invalidatesTags;
         mergedEndpoints[key].providesTags =
            apiEndpoint.providesTags || generatedEndpoint.providesTags;
      } else {
         mergedEndpoints[key] = { ...generatedEndpoint };
      }
   }

   return mergedEndpoints;
}

function rebuildApiFile(
   mergedEndpoints: Record<string, any>,
   originalSource: ts.SourceFile
) {
   const printer = ts.createPrinter();
   const newStatements = [];

   ts.forEachChild(originalSource, (node) => {
      if (
         ts.isCallExpression(node) &&
         (node.expression.getText() === "build.mutation" ||
            node.expression?.getText?.() === "build.query")
      ) {
         const endpointName = node.parent?.name?.getText();
         if (mergedEndpoints[endpointName!]) {
            const { invalidatesTags, providesTags, responseType, argType } =
               mergedEndpoints[endpointName!];

            const updatedNode = ts.factory.updateCallExpression(
               node,
               node.expression,
               node.typeArguments,
               [
                  ts.factory.updateObjectLiteralExpression(node.arguments[0], [
                     ts.factory.createPropertyAssignment(
                        "query",
                        node.arguments[0].properties?.find(
                           (prop) => prop.name?.getText() === "query"
                        )?.initializer ||
                           node.arguments[0].properties![0].initializer
                     ),
                     ts.factory.createPropertyAssignment(
                        "response",
                        ts.factory.createKeywordTypeNode(
                           ts.SyntaxKind.AnyKeyword
                        ))
                  ]),
                  ts.factory.updateObjectLiteralExpression(node.arguments[1], [
                     invalidatesTags
                        ? ts.factory.createPropertyAssignment(
                             "invalidatesTags",
                             ts.factory.createArrayLiteralExpression([
                                ts.factory.createStringLiteral(invalidatesTags),
                             ])
                          )
                        : undefined,
                     providesTags
                        ? ts.factory.createPropertyAssignment(
                             "providesTags",
                             ts.factory.createArrayLiteralExpression([
                                ts.factory.createStringLiteral(providesTags),
                             ])
                          )
                        : undefined,
                  ]),
               ]
            );
            newStatements.push(updatedNode);
         }
      } else {
         newStatements.push(node);
      }
   });

   const resultFile = ts.factory.updateSourceFile(
      originalSource,
      newStatements
   );
   const newContent = printer.printFile(resultFile);

   fs.writeFileSync(apiFilePath, newContent, "utf-8");
}

function mergeApiFiles() {
   const apiSource = readFile(apiFilePath);
   const generatedSource = readFile(generatedFilePath);

   const apiEndpoints = extractEndpointInfo(apiSource);
   const generatedEndpoints = extractEndpointInfo(generatedSource);

   const mergedEndpoints = mergeEndpoints(apiEndpoints, generatedEndpoints);

   rebuildApiFile(mergedEndpoints, apiSource);

   console.log("API files merged successfully!");
}

mergeApiFiles();
