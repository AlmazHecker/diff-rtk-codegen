import { mergeQueryObjects } from "./mergeQueryObjects";
import { Api } from "../types/Api";

/**
 * Merges two endpoint definitions
 * - Adds new properties
 * - Retains custom properties from the original API
 * - Removes deleted APIs
 */
export const mergeEndpoints = (apiRtk: Api, generatedRtk: Api): Api => {
  const mergedApi: Api = {
    tagTypes: apiRtk.tagTypes,
    endpoints: {},
    types: generatedRtk.types,
    imports: apiRtk.imports,
  };

  const mergedEndpoints = mergedApi.endpoints;

  const apiEndpoints = apiRtk.endpoints;
  const generatedEndpoints = generatedRtk.endpoints;

  for (const [key, generatedEndpoint] of Object.entries(generatedEndpoints)) {
    const apiEndpoint = apiEndpoints[key];

    mergedEndpoints[key] = apiEndpoint
      ? {
          ...generatedEndpoint,
          ...apiEndpoint,
          queryObject: mergeQueryObjects(
            generatedEndpoint.queryObject,
            apiEndpoint.queryObject,
          ),

          args: { ...generatedEndpoint.args, ...apiEndpoint.args },
        }
      : generatedEndpoint;
  }

  return mergedApi;
};
