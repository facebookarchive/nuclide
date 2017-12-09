"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
Object.defineProperty(exports, "__esModule", { value: true });
const Q = require("q");
const vscode = require("vscode");
const path = require("path");
const fileSystem_1 = require("../common/node/fileSystem");
class JsConfigHelper {
    // We're not going to create tsconfig.json - we just need this property to
    // check for existense of tsconfig.json and cancel setup if it's present
    static get tsConfigPath() {
        return path.join(vscode.workspace.rootPath, "tsconfig.json");
    }
    static get jsConfigPath() {
        return path.join(vscode.workspace.rootPath, "jsconfig.json");
    }
    /**
     * Constructs a JSON object from jsconfig.json. Will create the file if needed.
     */
    static createJsConfigIfNotPresent() {
        let fileSystem = new fileSystem_1.FileSystem();
        return Q.all([fileSystem.exists(JsConfigHelper.jsConfigPath), fileSystem.exists(JsConfigHelper.tsConfigPath)])
            .spread((hasJsConfig, hasTsConfig) => {
            if (hasJsConfig || hasTsConfig) {
                return Q.resolve(void 0);
            }
            return fileSystem.writeFile(JsConfigHelper.jsConfigPath, JSON.stringify(JsConfigHelper.defaultJsConfig, null, 4));
        });
    }
}
JsConfigHelper.defaultJsConfig = {
    compilerOptions: {
        allowJs: true,
        allowSyntheticDefaultImports: true,
    },
    exclude: ["node_modules"],
};
exports.JsConfigHelper = JsConfigHelper;

//# sourceMappingURL=tsconfigHelper.js.map
