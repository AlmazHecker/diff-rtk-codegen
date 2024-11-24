import * as path from "path";
import { getASTSource } from "./src/utils/file";
import { extractApi } from "./src/extract/extractApi";
import { mergeEndpoints } from "./src/merge/mergeEndpoints";
import { createRtkApi } from "./src/build/createRtkFile";

const apiFilePath = path.join(__dirname, "./test-data/api.ts");
const generatedFilePath = path.join(__dirname, "./test-data/generated.ts");

/**
 * Main function to merge API files
 */
function mergeApiFiles(overrides?: Record<string, any>) {
  const apiSource = getASTSource(apiFilePath);
  const generatedSource = getASTSource(generatedFilePath);

  const apiRtk = extractApi(apiSource);
  const generatedRtk = extractApi(generatedSource);

  const mergedApi = mergeEndpoints(apiRtk, generatedRtk, overrides);
  createRtkApi(mergedApi);

  console.log("API files merged successfully!");
}

mergeApiFiles();
