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

const HIDE_WARNING_KEY = 'atom-ide-ui.hideNuclideWarning';
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri


function displayNuclideWarning() {
  if (!atom.config.get(HIDE_WARNING_KEY)) {
    const notification = atom.notifications.addInfo('Atom IDE UI is bundled with Nuclide', {
      description: '`atom-ide-ui` will be deactivated in favor of Nuclide.<br>' + 'Please disable Nuclide if you only want to use `atom-ide-ui`.',
      dismissable: true,
      buttons: [{
        text: 'Disable Nuclide and reload',
        onDidClick() {
          atom.packages.disablePackage('nuclide');
          atom.reload();
          notification.dismiss();
        }
      }, {
        text: "Don't warn me again",
        onDidClick() {
          atom.config.set(HIDE_WARNING_KEY, true);
          notification.dismiss();
        }
      }]
    });
  }
}

if (!atom.packages.isPackageDisabled('nuclide') && atom.packages.getAvailablePackageNames().includes('nuclide')) {
  displayNuclideWarning();
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
  let disposables;
  const featureLoader = new (_FeatureLoader || _load_FeatureLoader()).default({
    pkgName: 'atom-ide-ui',
    config: {},
    features
  });
  featureLoader.load();
  module.exports = {
    config: featureLoader.getConfig(),
    activate() {
      disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(require('nuclide-commons-ui'), atom.packages.onDidActivatePackage(pkg => {
        if (pkg.name === 'nuclide') {
          displayNuclideWarning();
        }
      }));
      featureLoader.activate();
    },
    deactivate() {
      featureLoader.deactivate();
      if (disposables != null) {
        disposables.dispose();
        disposables = null;
      }
    },
    serialize() {
      featureLoader.serialize();
    }
  };
}