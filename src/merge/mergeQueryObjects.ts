import { QueryObject } from "../extract/extractQueryObject";
import * as ts from "typescript";

export const mergeQueryObjects = (
  generatedQuery: QueryObject,
  apiQuery: QueryObject,
): QueryObject => {
  if (!generatedQuery) return apiQuery || {}; // If generatedQuery is undefined, return apiQuery
  if (!apiQuery) return generatedQuery; // If apiQuery is undefined, return generatedQuery

  const mergedQuery: Record<string, any> = { ...apiQuery };

  Object.keys(generatedQuery).forEach((key) => {
    // If apiQuery doesn't have the key, add it from generatedQuery
    if (!(key in apiQuery)) {
      mergedQuery[key] = generatedQuery[key];
    } else {
      if ((generatedQuery[key] as ts.PropertyAccessExpression).kind === 211) {
        return;
      }

      // If the key exists in both, do a recursive merge
      if (
        typeof generatedQuery[key] === "object" &&
        generatedQuery[key] !== null &&
        !Array.isArray(generatedQuery[key])
      ) {
        mergedQuery[key] = mergeQueryObjects(
          generatedQuery[key] as QueryObject,
          apiQuery[key] as QueryObject,
        );
      }
    }
  });

  return mergedQuery;
};
