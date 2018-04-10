"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
class VersionUtils {
    static convertToSemver(version) {
        const versionParts = (version || '').split('.').filter(item => item.length > 0);
        while (versionParts.length < 3) {
            versionParts.push('0');
        }
        return versionParts.join('.');
    }
    static compareVersion(versionA, versionB) {
        try {
            versionA = VersionUtils.convertToSemver(versionA);
            versionB = VersionUtils.convertToSemver(versionB);
            return semver.gt(versionA, versionB) ? 1 : 0;
        }
        catch (_a) {
            return 0;
        }
    }
}
exports.VersionUtils = VersionUtils;
//# sourceMappingURL=versionUtils.js.map