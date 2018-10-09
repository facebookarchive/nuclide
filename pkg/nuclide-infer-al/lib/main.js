"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.provideLint = provideLint;

var _atom = require("atom");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const requests = new _RxMin.Subject(); // Check for a new version every 10 minutes.

const DOWNLOAD_INTERVAL = 10 * 60 * 1000; // Display a "fetching" notification if it hasn't completed within 5s.

const DOWNLOAD_NOTIFICATION_DELAY = 5 * 1000;
let cachedVersionCheck = null;
let versionCheckTime = 0;

function getInferCommand() {
  return String(_featureConfig().default.get('nuclide-infer-al.pathToInfer'));
}

function checkVersion(cwd) {
  if (cachedVersionCheck == null || Date.now() - versionCheckTime > DOWNLOAD_INTERVAL) {
    versionCheckTime = Date.now();
    cachedVersionCheck = (0, _process().runCommand)(getInferCommand(), ['--version'], {
      cwd
    }) // Return true as long as there's no error.
    .mapTo(true).catch(err => {
      (0, _log4js().getLogger)('nuclide-infer-al').error('Error running infer --version:', err);
      atom.notifications.addError('Error running Infer', {
        description: String(err),
        dismissable: true
      });
      return _RxMin.Observable.of(false);
    }).race( // By using 'race', this won't show up if the version comes back first.
    _RxMin.Observable.timer(DOWNLOAD_NOTIFICATION_DELAY).do(() => {
      atom.notifications.addInfo('Fetching Infer...', {
        description: 'Fetching the latest version of Infer. This may take quite some time initially...',
        dismissable: true
      });
    }).concat(_RxMin.Observable.never()).ignoreElements()) // Share this and make it replayable.
    .publishReplay(1).refCount();
    return cachedVersionCheck;
  }

  return cachedVersionCheck;
}

function provideLint() {
  return {
    name: 'nuclide-infer-al',
    grammarScopes: ['source.infer.al'],
    scope: 'file',
    lintOnFly: false,

    lint(editor) {
      const src = editor.getPath();

      if (src == null || _nuclideUri().default.isRemote(src)) {
        return Promise.resolve([]);
      }

      const cwd = _nuclideUri().default.dirname(src);

      requests.next();
      return checkVersion(cwd).take(1).switchMap(success => {
        if (!success) {
          return _RxMin.Observable.of(null);
        }

        return (0, _process().runCommandDetailed)(getInferCommand(), ['--linters-def-file', src, '--no-default-linters', '--linters-validate-syntax-only'], {
          isExitError: () => false,
          cwd
        }).map(result => {
          if (result.exitCode === 0) {
            return [];
          } else {
            const json = JSON.parse(result.stdout);
            return json.map(e => ({
              name: 'Error',
              type: 'Error',
              html: '<pre>' + e.description + '</pre>',
              filePath: e.filename,
              range: new _atom.Range([e.line - 1, 0], [e.line, 0])
            }));
          }
        }).catch(err => {
          (0, _log4js().getLogger)('nuclide-infer-al').error('Error running Infer command: ', err);
          atom.notifications.addError('Error running Infer', {
            description: String(err),
            dismissable: true
          });
          return _RxMin.Observable.of(null);
        }) // Stop if we get a new request in the meantime.
        .takeUntil(requests);
      }).toPromise();
    }

  };
}