import { readFileSync } from "fs";
import { safeJsonParse } from "./utils.js";
import isEmpty from "lodash.isempty";
import isEqual from "lodash.isequal";

const schema = Object.freeze({
    token: typeof String,
    channels: typeof Array,
    members: typeof Array
});

const load = (configPath) => {
    const configFileContent = readFileSync(configPath, "utf-8");
    const configJson = safeJsonParse(configFileContent);

    if (isEmpty(configJson)) {
        throw `config.json is malformed: ${configFileContent}`;
    }

    Object.entries(schema).forEach((property, type) => {
        if (!configJson.hasOwnProperty(property) && isEqual(typeof configJson[property], type)) {
            throw `[config.json] Missing or malformed property: ${property}`
        }
    })

    return configJson;
}

export default {
    load
}
