"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = showAtomLinterWarning;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
const LINTER_PACKAGE = 'linter';

function observePackageIsEnabled() {
  return _RxMin.Observable.merge(_RxMin.Observable.of(atom.packages.isPackageActive(LINTER_PACKAGE)), (0, _event().observableFromSubscribeFunction)(atom.packages.onDidActivatePackage.bind(atom.packages)).filter(pkg => pkg.name === LINTER_PACKAGE).mapTo(true), (0, _event().observableFromSubscribeFunction)(atom.packages.onDidDeactivatePackage.bind(atom.packages)).filter(pkg => pkg.name === LINTER_PACKAGE).mapTo(false));
}

function disableLinter() {
  atom.packages.disablePackage(LINTER_PACKAGE);
}

function disableDiagnostics() {
  _featureConfig().default.set('use.atom-ide-diagnostics-ui', false);
}

function showAtomLinterWarning() {
  const packageName = _featureConfig().default.getPackageName();

  return new (_UniversalDisposable().default)(observePackageIsEnabled().distinctUntilChanged().switchMap(enabled => {
    if (!enabled) {
      return _RxMin.Observable.empty();
    }

    const notification = atom.notifications.addInfo('Choose a linter UI', {
      description: 'You have both `linter` and `atom-ide-diagnostics` enabled, which will both ' + 'display lint results for Linter-based packages.\n\n' + 'To avoid duplicate results, please disable one of the packages.' + (packageName === 'nuclide' ? '\n\nNote that Flow and Hack errors are not compatible with `linter`.' : ''),
      dismissable: true,
      buttons: [{
        text: 'Disable Linter',

        onDidClick() {
          disableLinter();
        }

      }, {
        text: 'Disable Diagnostics',

        onDidClick() {
          disableDiagnostics();
          atom.notifications.addInfo('Re-enabling Diagnostics', {
            description: 'To re-enable diagnostics, please enable "Diagnostics" under the "Enabled Features" ' + `section in \`${packageName}\` settings.`
          });
        }

      }]
    });
    return _RxMin.Observable.create(() => ({
      unsubscribe() {
        notification.dismiss();
      }

    }));
  }).subscribe());
}