"use strict";

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _FeatureLoader() {
  const data = _interopRequireDefault(require("../FeatureLoader"));

  _FeatureLoader = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
const FEATURE_PACKAGE_PATH = _path.default.join(__dirname, '../__mocks__/fixtures', 'feature-package');

const ALWAYS_ENABLED = 'always';
const featurePkg = JSON.parse(_fs.default.readFileSync(_path.default.join(FEATURE_PACKAGE_PATH, 'package.json')).toString());

const featureName = _path.default.basename(FEATURE_PACKAGE_PATH);

const ROOT_PACKAGE_DIRNAME = 'root-package';

const ROOT_PACKAGE_PATH = _path.default.join(__dirname, '../__mocks__/fixtures', ROOT_PACKAGE_DIRNAME);

const rootName = _path.default.basename(ROOT_PACKAGE_PATH);

describe('FeatureLoader', () => {
  let loader;
  beforeEach(() => {
    loader = new (_FeatureLoader().default)({
      path: ROOT_PACKAGE_PATH,
      pkgName: rootName,
      features: [{
        path: FEATURE_PACKAGE_PATH,
        pkg: featurePkg
      }]
    });
    atom.packages.loadPackage(ROOT_PACKAGE_PATH);
  });
  describe('load', () => {
    beforeEach(() => {
      jest.spyOn(atom.packages, 'loadPackage').mockImplementation(() => {});
      atom.config.set(`${rootName}.use.${featureName}`, ALWAYS_ENABLED);
      loader.load();
      atom.packages.emitter.emit('did-load-package', {
        name: ROOT_PACKAGE_DIRNAME
      });
    });
    it('sets a description including provided and consumed services', () => {
      var _loader$getConfig, _loader$getConfig$use, _loader$getConfig$use2, _loader$getConfig$use3;

      expect((_loader$getConfig = loader.getConfig()) === null || _loader$getConfig === void 0 ? void 0 : (_loader$getConfig$use = _loader$getConfig.use) === null || _loader$getConfig$use === void 0 ? void 0 : (_loader$getConfig$use2 = _loader$getConfig$use.properties) === null || _loader$getConfig$use2 === void 0 ? void 0 : (_loader$getConfig$use3 = _loader$getConfig$use2[featureName]) === null || _loader$getConfig$use3 === void 0 ? void 0 : _loader$getConfig$use3.description).toEqual('Hyperclick UI<br/>**Provides:** _hyperclick.observeTextEditor_<br/>**Consumes:** _hyperclick_');
    });
    it("merges the feature config into the passed config's feature properties", () => {
      var _loader$getConfig2, _loader$getConfig2$fe;

      expect((_loader$getConfig2 = loader.getConfig()) === null || _loader$getConfig2 === void 0 ? void 0 : (_loader$getConfig2$fe = _loader$getConfig2[featureName]) === null || _loader$getConfig2$fe === void 0 ? void 0 : _loader$getConfig2$fe.properties).toEqual(featurePkg.atomConfig);
    });
    it.skip('loads the feature package when the root package loads', () => {
      expect(atom.packages.loadPackage).toHaveBeenCalledWith(FEATURE_PACKAGE_PATH);
    });
  });
  describe('activate', () => {
    it.skip('activates the feature package right away if enabled', () => {
      jest.spyOn(atom.packages, 'activatePackage').mockImplementation(() => {});
      loader.load();
      atom.config.set(`${rootName}.use.${featureName}`, ALWAYS_ENABLED);
      atom.packages.emitter.emit('did-load-package', {
        name: ROOT_PACKAGE_DIRNAME
      });
      loader.activate();
      expect(atom.packages.activatePackage).toHaveBeenCalledWith(FEATURE_PACKAGE_PATH);
    });
  });
  describe('activating, deactivating, then activating again', () => {
    it.skip('actives, deactivates, then activates feature packages', () => {
      jest.spyOn(atom.packages, 'activatePackage').mockImplementation(() => {});
      jest.spyOn(atom.packages, 'deactivatePackage').mockImplementation(() => {});
      loader.load();
      atom.config.set(`${rootName}.use.${featureName}`, ALWAYS_ENABLED);
      atom.packages.emitter.emit('did-load-package', {
        name: ROOT_PACKAGE_DIRNAME
      });
      loader.activate();
      expect(atom.packages.activatePackage).toHaveBeenCalledWith(FEATURE_PACKAGE_PATH);
      loader.deactivate();
      expect(atom.packages.deactivatePackage).toHaveBeenCalledWith(featureName, true);
      loader.activate();
      expect(atom.packages.activatePackage).toHaveBeenCalledWith(FEATURE_PACKAGE_PATH);
    });
  });
});