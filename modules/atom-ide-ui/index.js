'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _path = _interopRequireDefault(require('path'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _FeatureLoader;

function _load_FeatureLoader() {
  return _FeatureLoader = _interopRequireDefault(require('nuclide-commons-atom/FeatureLoader'));
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
 * 
 * @format
 */

/* eslint-disable nuclide-internal/no-commonjs */

if (atom.packages.getAvailablePackageNames().includes('nuclide')) {
  atom.notifications.addWarning('Duplicate package: `atom-ide-ui`', {
    description: '`atom-ide-ui` is already included as part of `nuclide`.<br>' + 'Please uninstall `atom-ide-ui` to avoid conflicts.',
    dismissable: true
  });
} else {
  const featureDir = _path.default.join(__dirname, 'pkg');
  const features = _fs.default.readdirSync(featureDir).map(item => {
    const dirname = _path.default.join(featureDir, item);
    try {
      const pkgJson = _fs.default.readFileSync(_path.default.join(dirname, 'package.json'), 'utf8');
      return {
        dirname,
        pkg: JSON.parse(pkgJson)
      };
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }).filter(Boolean);
  const disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  const featureLoader = new (_FeatureLoader || _load_FeatureLoader()).default({
    pkgName: 'atom-ide-ui',
    config: {},
    features
  });
  featureLoader.load();
  module.exports = {
    config: featureLoader.getConfig(),
    activate() {
      disposables.add(require('nuclide-commons-ui'));
      featureLoader.activate();
    },
    deactivate() {
      featureLoader.deactivate();
      disposables.dispose();
    },
    serialize() {
      featureLoader.serialize();
    }
  };
}
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri