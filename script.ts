import * as path from "path";
import { getASTFromFilePath } from "./src/utils/ast";
import { extractApi } from "./src/extract/extractApi";
import { mergeEndpoints } from "./src/merge/mergeEndpoints";
import { createRtkApi } from "./src/build/createRtkFile";

const apiFilePath = path.join(__dirname, "./test-data/api.ts");
const generatedFilePath = path.join(__dirname, "./test-data/generated.ts");

/**
 * Main function to merge API files
 */
function mergeApiFiles() {
  const apiSource = getASTFromFilePath(apiFilePath);
  const generatedSource = getASTFromFilePath(generatedFilePath);

  const apiRtk = extractApi(apiSource);
  const generatedRtk = extractApi(generatedSource);

  const mergedApi = mergeEndpoints(apiRtk, generatedRtk);
  createRtkApi(mergedApi);

  console.log("API files merged successfully!");
}

mergeApiFiles();
