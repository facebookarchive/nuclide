"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const versionUtils_1 = require("../../client/common/versionUtils");
suite('Version Utils', () => {
    test('Must handle invalid versions', () => __awaiter(this, void 0, void 0, function* () {
        const version = 'ABC';
        assert.equal(versionUtils_1.VersionUtils.convertToSemver(version), `${version}.0.0`, 'Version is incorrect');
    }));
    test('Must handle null, empty and undefined', () => __awaiter(this, void 0, void 0, function* () {
        assert.equal(versionUtils_1.VersionUtils.convertToSemver(''), '0.0.0', 'Version is incorrect for empty string');
        assert.equal(versionUtils_1.VersionUtils.convertToSemver(null), '0.0.0', 'Version is incorrect for null value');
        assert.equal(versionUtils_1.VersionUtils.convertToSemver(undefined), '0.0.0', 'Version is incorrect for undefined value');
    }));
    test('Must be able to compare versions correctly', () => __awaiter(this, void 0, void 0, function* () {
        assert.equal(versionUtils_1.VersionUtils.compareVersion('', '1'), 0, '1. Comparison failed');
        assert.equal(versionUtils_1.VersionUtils.compareVersion('1', '0.1'), 1, '2. Comparison failed');
        assert.equal(versionUtils_1.VersionUtils.compareVersion('2.10', '2.9'), 1, '3. Comparison failed');
        assert.equal(versionUtils_1.VersionUtils.compareVersion('2.99.9', '3'), 0, '4. Comparison failed');
    }));
});
//# sourceMappingURL=versionUtils.test.js.map