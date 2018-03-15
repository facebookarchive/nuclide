// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const types_1 = require("../types");
function registerTypes(serviceManager) {
    serviceManager.addSingleton(types_1.IDebugConfigurationProvider, __1.PythonDebugConfigurationProvider);
    serviceManager.addSingleton(types_1.IDebugConfigurationProvider, __1.PythonV2DebugConfigurationProvider);
}
exports.registerTypes = registerTypes;
//# sourceMappingURL=serviceRegistry.js.map