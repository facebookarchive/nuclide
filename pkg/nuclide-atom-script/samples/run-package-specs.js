'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _electron = _interopRequireDefault(require('electron'));

var _path = _interopRequireDefault(require('path'));

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

/* eslint-disable no-console */

const { ipcRenderer, remote } = _electron.default;
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri

if (!(ipcRenderer != null && remote != null)) {
  throw new Error('Invariant violation: "ipcRenderer != null && remote != null"');
}

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args) {
    if (typeof args[0] !== 'string') {
      console.error(`Usage: atom-script ${__filename} <spec file>`);
      return 1;
    }

    const initialWindows = remote.BrowserWindow.getAllWindows();

    const packageSpecPath = _path.default.resolve(args[0]);
    ipcRenderer.send('run-package-specs', packageSpecPath);

    // Wait for the window to load
    yield new Promise(function (resolve) {
      return setTimeout(resolve, 1000);
    });

    const testWindow = remote.BrowserWindow.getAllWindows().find(function (browserWindow) {
      return !initialWindows.includes(browserWindow);
    });

    if (testWindow == null) {
      console.error('Could not find spec browser window.');
      return 1;
    }

    // If we don't wait for the spec window to close before finishing, we cause
    // the window to close.
    yield new Promise(function (resolve) {
      testWindow.once('close', function () {
        resolve();
      });
    });

    return 0;
  });

  function runCommand(_x) {
    return _ref.apply(this, arguments);
  }

  return runCommand;
})();