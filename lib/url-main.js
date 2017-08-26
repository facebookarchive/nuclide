'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__test__ = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _electron = _interopRequireDefault(require('electron'));

var _path = _interopRequireDefault(require('path'));

var _querystring = _interopRequireDefault(require('querystring'));

var _url = _interopRequireDefault(require('url'));

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _windowLoadSettings;

function _load_windowLoadSettings() {
  return _windowLoadSettings = require('../pkg/commons-atom/window-load-settings');
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

/**
 * This is a temporary hack to hook into atom://nuclide URIs until
 * https://github.com/atom/atom/pull/11399 is merged into Atom.
 *
 * This uses the urlMain package hook to decode the opened URL and sends it back
 * to an open Nuclide window via an Electron IPC message.
 * This is then intercepted by a Nuclide package and dispatched to subscribers.
 *
 * If no window is currently open, we try to restore the previous Atom state.
 * NOTE: If we decide to just exit here, this permanently destroys the previous
 * window state(s). This is the primary problem with this hack, but luckily
 * it's possible to directly read the previous application state.
 *
 * You can additionally provide a `target=_blank` param to the URL to force
 * the link to be opened in a new, blank window. The exact semantics are:
 *
 * - If you have a blank window open, the link will open in there.
 * - If you have a non-blank window open, the link will be opened in a new, blank window.
 * - If you have no windows open, the link will open in a blank window, and
 *   all previously non-empty windows will be restored.
 */

/* global localStorage */

const { remote } = _electron.default;
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri

if (!(remote != null)) {
  throw new Error('for Flow');
}

const CHANNEL = 'nuclide-url-open';

// Contains initialPaths for each previously-running Atom window.
// Atom can handle retrieving the more detailed state by itself.
function getApplicationState(home) {
  // $FlowIgnore
  const StorageFolder = require(_path.default.join((0, (_windowLoadSettings || _load_windowLoadSettings()).getWindowLoadSettings)().resourcePath, 'src/storage-folder.js'));
  return new StorageFolder(home).load('application.json');
}

// This is the function that Atom normally calls to initialize a new window.
// By calling it, we can simulate starting up a regular Atom window.
function getAtomInitializerScript() {
  return _path.default.join((0, (_windowLoadSettings || _load_windowLoadSettings()).getWindowLoadSettings)().resourcePath, 'src/initialize-application-window.js');
}

function initAtomWindow(blobStore, initialPaths) {
  const initScript = getAtomInitializerScript();

  // Modify some of the load settings to match a real Atom window.
  const loadSettings = (0, (_windowLoadSettings || _load_windowLoadSettings()).getWindowLoadSettings)();
  // Replace the initialization script so reloading works.
  loadSettings.windowInitializationScript = initScript;
  // Inherit the initialPaths from the first state.
  // We need to set this before initializing Atom to restore the state.
  loadSettings.initialPaths = initialPaths;
  // When launched from an existing window, loadSettings lacks an environment.
  if (loadSettings.env == null) {
    loadSettings.env = process.env;
  }
  (0, (_windowLoadSettings || _load_windowLoadSettings()).setWindowLoadSettings)(loadSettings);

  // Start up a real Atom instance in the current window.
  // Note that the `atom` global becomes accessible synchronously.
  // $FlowIgnore
  require(initScript)(blobStore);
}

// Read the previous window state and create Atom windows as appropriate.
// If newWindow is set, leave the current window empty.
function restoreWindows(blobStore, newWindow) {
  var _ref3, _ref4;

  // flowlint-next-line sketchy-null-string:off
  if (!process.env.ATOM_HOME) {
    throw new Error('ATOM_HOME not found');
  }

  const windowStates = getApplicationState(process.env.ATOM_HOME) || [];

  const windowsToRestore = newWindow ? // The current window will replace any previously blank windows.
  windowStates.filter(state => {
    var _ref, _ref2;

    return (_ref = state) != null ? (_ref2 = _ref.initialPaths) != null ? _ref2.length : _ref2 : _ref;
  }) : windowStates.slice(1);
  const windowInitialPaths = newWindow ? [] : ((_ref3 = windowStates) != null ? (_ref4 = _ref3[0]) != null ? _ref4.initialPaths : _ref4 : _ref3) || [];

  initAtomWindow(blobStore, windowInitialPaths);

  for (const windowState of windowsToRestore) {
    const initialPaths = windowState.initialPaths || [];
    atom.open({ initialPaths, pathsToOpen: initialPaths, newWindow: true });
  }
}

const LOCK_KEY = CHANNEL + '.lock';
const LOCK_TIMEOUT = 10000;

function acquireLock() {
  // localStorage.set/getItem is not truly atomic, so this is not actually sound.
  // However, it should be fast enough to cover the use case of human clicks.
  const lockTime = localStorage.getItem(LOCK_KEY);
  if (lockTime != null && Date.now() - parseInt(lockTime, 10) < LOCK_TIMEOUT) {
    return false;
  }
  localStorage.setItem(LOCK_KEY, String(Date.now()));
  return true;
}

function releaseLock() {
  localStorage.removeItem(LOCK_KEY);
}

function hasPaths(browserWindow) {
  var _ref5, _ref6;

  return ((_ref5 = (0, (_windowLoadSettings || _load_windowLoadSettings()).getWindowLoadSettings)(browserWindow)) != null ? (_ref6 = _ref5.initialPaths) != null ? _ref6[0] : _ref6 : _ref5) != null;
}

// This function gets called by the Atom package-level URL handler.
// Normally this is expected to set up the Atom application window.

exports.default = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (blobStore) {
    const currentWindow = remote.getCurrentWindow();
    try {
      const { urlToOpen } = (0, (_windowLoadSettings || _load_windowLoadSettings()).getWindowLoadSettings)();
      const { host, pathname, query } = _url.default.parse(urlToOpen);

      if (!(host === 'nuclide' && pathname != null && pathname !== '')) {
        throw new Error(`Invalid URL ${urlToOpen}`);
      }

      const message = pathname.substr(1);
      const params = _querystring.default.parse(query || '');

      // Prefer the focused window, but any existing window.
      // The parent window is used for testing only.
      const existingWindow = currentWindow.getParentWindow() || remote.BrowserWindow.getFocusedWindow() || remote.BrowserWindow.getAllWindows().filter(function (x) {
        return x.id !== currentWindow.id;
      })[0];

      const newWindow = params.target === '_blank';
      if (existingWindow == null || newWindow && hasPaths(existingWindow)) {
        // Prevent multiple windows from being opened when URIs are opened too quickly.
        if (!acquireLock()) {
          throw new Error('Another URI is already being opened.');
        }

        if (existingWindow == null) {
          // Restore the user's previous windows.
          // The real Atom initialization script will be run in the current window.
          restoreWindows(blobStore, newWindow);
        } else {
          initAtomWindow(blobStore, []);
        }

        // Wait for Nuclide to activate (so the event below gets handled).
        yield new Promise(function (resolve) {
          atom.packages.onDidActivateInitialPackages(resolve);
        });

        currentWindow.webContents.send(CHANNEL, { message, params });
        releaseLock();
      } else {
        existingWindow.webContents.send(CHANNEL, { message, params });
        // Atom has various handlers that block window closing.
        currentWindow.destroy();
      }
    } catch (err) {
      remote.dialog.showErrorBox('Could not open URL', err.stack);
      releaseLock();
      currentWindow.destroy();
    }
  });

  function initialize(_x) {
    return _ref7.apply(this, arguments);
  }

  return initialize;
})();

// Exported for testing.


const __test__ = exports.__test__ = {
  getApplicationState,
  getAtomInitializerScript,
  acquireLock,
  releaseLock
};