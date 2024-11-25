import { Api } from "../types/Api";
import * as ts from "typescript";

const factory = ts.factory;

export const createImportApi = (api: Api) => {
  return [
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            factory.createIdentifier("baseApi"),
            factory.createIdentifier("api"),
          ),
        ]),
      ),
      factory.createStringLiteral("../../../shared/api/baseApi"),
      undefined,
    ),
  ];
};
