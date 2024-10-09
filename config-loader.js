import { readFileSync } from "fs";
import { safeJsonParse } from "./utils.js";
import isEmpty from "lodash.isempty";

const expectedProperties = ["token", "channelName"];

export const loadConfig = (configPath) => {
    const configFileContent = readFileSync(configPath, "utf-8");
    const configJson = safeJsonParse(configFileContent);

    if (isEmpty(configJson)) {
        throw `config.json is malformed: ${configFileContent}`;
    }

    expectedProperties.forEach((property) => {
        if (!configJson.hasOwnProperty(property)) {
            throw `config.json is missing required property: ${property}`
        }
    });

    return configJson;
}
