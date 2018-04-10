"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const registry_1 = require("../../common/platform/registry");
const utils_1 = require("../../common/utils");
const CheckPythonInterpreterRegEx = utils_1.IS_WINDOWS ? /^python(\d+(.\d+)?)?\.exe$/ : /^python(\d+(.\d+)?)?$/;
function lookForInterpretersInDirectory(pathToCheck) {
    return utils_1.fsReaddirAsync(pathToCheck)
        .then(subDirs => subDirs.filter(fileName => CheckPythonInterpreterRegEx.test(path.basename(fileName))))
        .catch(err => {
        console.error('Python Extension (lookForInterpretersInDirectory.fsReaddirAsync):', err);
        return [];
    });
}
exports.lookForInterpretersInDirectory = lookForInterpretersInDirectory;
function fixInterpreterDisplayName(item) {
    if (!item.displayName) {
        const arch = registry_1.getArchitectureDislayName(item.architecture);
        const version = typeof item.version === 'string' ? item.version : '';
        item.displayName = ['Python', version, arch].filter(namePart => namePart.length > 0).join(' ').trim();
    }
    return item;
}
exports.fixInterpreterDisplayName = fixInterpreterDisplayName;
function isMacDefaultPythonPath(p) {
    return p === 'python' || p === '/usr/bin/python';
}
exports.isMacDefaultPythonPath = isMacDefaultPythonPath;
//# sourceMappingURL=helpers.js.map