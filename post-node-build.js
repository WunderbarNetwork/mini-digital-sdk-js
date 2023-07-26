import { readFileSync, writeFileSync } from "fs";

const packageJson = readFileSync("package.json", "utf8");
const version = String(JSON.parse(packageJson).version);

const filePath = "lib/node/util/Config.js";
const fileContent = readFileSync(filePath, "utf8");

// Replace the value of __BUILD_PACKAGE_VERSION__ using a regular expression
const updatedContent = fileContent.replace(/__BUILD_PACKAGE_VERSION__/, `${version}`);

// Write the updated content back to the file
writeFileSync(filePath, updatedContent, "utf8");
