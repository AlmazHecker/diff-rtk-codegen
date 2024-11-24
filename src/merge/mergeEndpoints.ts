import { Endpoint } from "../types/Endpoint";
import { mergeQueryObjects } from "./mergeQueryObjects";
import { Api } from "../types/Api";

/**
 * Merges two endpoint definitions
 * - Adds new properties
 * - Retains custom properties from the original API
 * - Removes deleted APIs
 */
export const mergeEndpoints = (
  apiRtk: Api,
  generatedRtk: Api,
  overrides?: Record<string, any>,
): Api => {
  const mergedApi: Api = {
    tagTypes: apiRtk.tagTypes,
    endpoints: {},
    types: generatedRtk.types,
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

          args: {
            ...generatedEndpoint.args,
            ...apiEndpoint.args,
          },
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

  return mergedApi;
};
