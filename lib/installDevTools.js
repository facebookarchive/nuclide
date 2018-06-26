'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = installDevTools;

var _electron = _interopRequireDefault(require('electron'));

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../modules/nuclide-commons/nuclideUri'));
}

var _fs = _interopRequireDefault(require('fs'));

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../modules/nuclide-commons/UniversalDisposable'));
}

var _ReactPerfMonitor;

function _load_ReactPerfMonitor() {
  return _ReactPerfMonitor = _interopRequireDefault(require('./ReactPerfMonitor'));
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

const extensionIDsToLoad = [
// React DevTools
'fmkadmapgofadopljbjfkapdkoienihi'];

// eslint-disable-next-line no-console
const log = console.debug || console.log;

let installed;
function installDevTools() {
  const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(new (_ReactPerfMonitor || _load_ReactPerfMonitor()).default());

  if (installed) {
    return disposable;
  }

  const chromeHome = getChromeHomeDir();
  const profileDirs = getProfileDirs(chromeHome);
  (0, (_nullthrows || _load_nullthrows()).default)(_electron.default.webFrame).registerURLSchemeAsBypassingCSP('chrome-extension');
  const remote = (0, (_nullthrows || _load_nullthrows()).default)(_electron.default.remote);

  for (const extensionID of extensionIDsToLoad) {
    remote.BrowserWindow.removeDevToolsExtension(extensionID);
    const extensionVersions = getVersionDirsForExtension(profileDirs, extensionID);

    if (extensionVersions == null || extensionVersions.length === 0) {
      log(`Unable to load extension ${extensionID}. Make sure it is installed in one of your Chrome profiles.`);
      continue;
    }

    const namesWithTimes = extensionVersions.map(dirname => Object.assign({}, _fs.default.statSync(dirname), {
      dirname
    }));

    const latest = namesWithTimes.sort((a, b) => a.mtimeMs - b.mtimeMs)[0];
    let latestManifest;
    try {
      latestManifest = JSON.parse(_fs.default.readFileSync((_nuclideUri || _load_nuclideUri()).default.join(latest.dirname, 'manifest.json'), 'utf-8'));
    } catch (e) {
      log(`Unable to read or parse a valid manifest for extension ${extensionID}`);
    }

    if (latest != null && latestManifest != null) {
      remote.BrowserWindow.addDevToolsExtension(latest.dirname);
      log(`Successfully loaded Chrome extension "${latestManifest.name}"`);
    }
  }

  installed = true;
  return disposable;
}

function getChromeHomeDir() {
  switch (process.platform) {
    case 'darwin':
      return (_nuclideUri || _load_nuclideUri()).default.join(_os.default.homedir(), 'Library', 'Application Support', 'Google', 'Chrome');
    case 'win32':
      if (!(process.env.LOCALAPPDATA != null)) {
        throw new Error('Invariant violation: "process.env.LOCALAPPDATA != null"');
      }

      return (_nuclideUri || _load_nuclideUri()).default.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data');
    default:
      return (_nuclideUri || _load_nuclideUri()).default.join(_os.default.homedir(), '.config', 'google-chrome');
  }
}

function getProfileDirs(chromeHome) {
  const profileDirs = [(_nuclideUri || _load_nuclideUri()).default.join(chromeHome, 'Default')];

  let done;
  let profileNum = 1;
  while (!done) {
    try {
      const profilePath = (_nuclideUri || _load_nuclideUri()).default.join(chromeHome, `Profile ${profileNum}`);
      _fs.default.statSync(profilePath);
      profileDirs.push(profilePath);
      profileNum++;
    } catch (e) {
      done = true;
    }
  }

  return profileDirs;
}

function getVersionDirsForExtension(profileDirs, extensionID) {
  for (const profileDir of profileDirs) {
    const extensionPath = (_nuclideUri || _load_nuclideUri()).default.join(profileDir, 'Extensions', extensionID);
    try {
      return _fs.default.readdirSync(extensionPath).filter(base => !base.startsWith('.')) // Remove .DS_Store and others
      .map(base => (_nuclideUri || _load_nuclideUri()).default.join(extensionPath, base));
    } catch (e) {}
  }
}