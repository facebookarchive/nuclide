Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * Activates all nuclide and fb atom packages that do not defer their own activation until a
 * certain command or hook is executed.
 *
 * @returns A promise that resolves to an array of strings, which are the names of all the packages
 *   that this function activates.
 */

var activateAllPackages = _asyncToGenerator(function* () {
  // These are packages we want to activate, including some which come bundled with atom,
  // or ones widely used in conjunction with nuclide.
  var whitelist = ['autocomplete-plus', 'hyperclick', 'status-bar', 'tool-bar'];

  // TODO(jonaldislarry) These package(s) cannot be activated manually -- t9243542.
  ['nuclide-fuzzy-filename-provider'].forEach(function (name) {
    return (0, (_libMain2 || _libMain()).__testUseOnly_removeFeature)(name);
  });

  var packageNames = atom.packages.getAvailablePackageNames().filter(function (name) {
    var pack = atom.packages.loadPackage(name);
    if (pack == null) {
      return false;
    }
    var isActivationDeferred = pack.hasActivationCommands() || pack.hasActivationHooks();
    var isLanguagePackage = name.startsWith('language-');
    var inWhitelist = whitelist.indexOf(name) >= 0;
    return (isLanguagePackage || inWhitelist) && !isActivationDeferred;
  });

  // Ensure 3rd-party packages are not installed via the 'atom-package-deps' package when the
  // 'nuclide' package is activated. It makes network requests that never return in a test env.
  (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.set('installRecommendedPackages', false);

  // Include the path to the nuclide package.
  packageNames.push((_path2 || _path()).default.dirname(require.resolve('../../../package.json')));
  yield Promise.all(packageNames.map(function (pack) {
    return atom.packages.activatePackage(pack);
  }));
  return atom.packages.getActivePackages().map(function (pack) {
    return pack.name;
  });
});

exports.activateAllPackages = activateAllPackages;
exports.deactivateAllPackages = deactivateAllPackages;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _libMain2;

function _libMain() {
  return _libMain2 = require('../../../lib/main');
}

function deactivateAllPackages() {
  atom.packages.deactivatePackages();
  atom.packages.unloadPackages();
}