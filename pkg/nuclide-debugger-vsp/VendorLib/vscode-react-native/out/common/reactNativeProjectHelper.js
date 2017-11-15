"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
Object.defineProperty(exports, "__esModule", { value: true });
const Q = require("q");
const semver = require("semver");
const fs = require("fs");
const path = require("path");
const commandExecutor_1 = require("./commandExecutor");
class ReactNativeProjectHelper {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
    }
    getReactNativeVersion() {
        return new commandExecutor_1.CommandExecutor(this.projectRoot).getReactNativeVersion();
    }
    /**
     * Ensures that we are in a React Native project
     * Otherwise, displays an error message banner
     */
    isReactNativeProject() {
        if (!this.projectRoot || !fs.existsSync(path.join(this.projectRoot, "package.json"))) {
            return Q(false);
        }
        return this.getReactNativeVersion().
            then(version => {
            return !!(version);
        });
    }
    validateReactNativeVersion() {
        return this.getReactNativeVersion().then(version => {
            if (semver.gte(version, "0.19.0")) {
                return Q.resolve(void 0);
            }
            else {
                return Q.reject(new RangeError(`Project version = ${version}`));
            }
        });
    }
}
exports.ReactNativeProjectHelper = ReactNativeProjectHelper;

//# sourceMappingURL=reactNativeProjectHelper.js.map
