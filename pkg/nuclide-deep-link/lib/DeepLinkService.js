'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _maxBy2;

function _load_maxBy() {
  return _maxBy2 = _interopRequireDefault(require('lodash/maxBy'));
}

exports._openInNewWindow = _openInNewWindow;

var _electron = _interopRequireDefault(require('electron'));

var _url = _interopRequireDefault(require('url'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _deepLink;

function _load_deepLink() {
  return _deepLink = require('../../commons-atom/deep-link');
}

var _SharedObservableCache;

function _load_SharedObservableCache() {
  return _SharedObservableCache = _interopRequireDefault(require('../../commons-node/SharedObservableCache'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
                                                                                                                                                                                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                              * the root directory of this source tree.
                                                                                                                                                                                                                              *
                                                                                                                                                                                                                              * 
                                                                                                                                                                                                                              * @format
                                                                                                                                                                                                                              */

const { ipcRenderer, remote } = _electron.default;

if (!(ipcRenderer != null && remote != null)) {
  throw new Error('Invariant violation: "ipcRenderer != null && remote != null"');
}

// This function relies on each step being synchronous.
// May break in future Atom versions.


function _openInNewWindow(uri) {
  const windows = remote.BrowserWindow.getAllWindows();

  // First, open a new window.
  // There's no explicit API but we'll send the standard command.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'application:new-window');

  const newWindows = remote.BrowserWindow.getAllWindows();

  if (!(newWindows.length > windows.length)) {
    throw new Error('Expected new window to appear');
  }

  // We'll assume the highest ID is new. (Electron IDs are auto-incrementing.)
  // (This is also non-null because the invariant above guarantees > 0).


  const newWindow = (0, (_maxBy2 || _load_maxBy()).default)(newWindows, w => w.id);
  // Atom's definition of 'window:loaded' waits for all packages to load.
  // Thus, it's safe to send the URI after this point.
  // https://github.com/atom/atom/blob/910fbeee31d67eb711ec0771e7c26fa408c091eb/static/index.js#L106
  newWindow.once('window:loaded', () => {
    // Needs to match sendURIMessage:
    // https://github.com/atom/atom/blob/d2d3ad9fb8a4aadb2fe0e53edf7d95bd109fc0f7/src/main-process/atom-window.js#L286
    newWindow.send('uri-message', uri);
  });
}

function isWindowBlank(lastDeepLinkUptime) {
  // A window is considered empty if:
  // 1) it has no open projects
  // 2) it has no visible modal panels
  // 3) no deep link was opened recently
  const BLANK_DEEP_LINK_EXPIRY = 3;
  return atom.project.getPaths().length === 0 && !atom.workspace.getModalPanels().some(x => x.isVisible()) && (lastDeepLinkUptime == null || process.uptime() - lastDeepLinkUptime > BLANK_DEEP_LINK_EXPIRY);
}

class DeepLinkService {

  constructor() {
    this._observers = new Map();
    this._pendingEvents = new Map();
    this._observables = new (_SharedObservableCache || _load_SharedObservableCache()).default(path => {
      return _rxjsBundlesRxMinJs.Observable.create(observer => {
        this._observers.set(path, observer);
        return () => this._observers.delete(path);
      }).share();
    });

    let lastDeepLinkUptime = null;
    this._disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_deepLink || _load_deepLink()).observeDeepLinks)().subscribe(({ message, params }) => {
      // This is a special feature that mimics the browser's target=_blank.
      // Opens up a new Atom window and sends it back to the Atom URI handler.
      // If the current window is already 'blank' then we'll use the current one, though.
      if (params.target === '_blank' && !isWindowBlank(lastDeepLinkUptime)) {
        // Can't recurse indefinitely!
        const { target } = params,
              paramsWithoutTarget = _objectWithoutProperties(params, ['target']);
        _openInNewWindow(_url.default.format({
          protocol: 'atom:',
          slashes: true,
          host: 'nuclide',
          pathname: message,
          query: paramsWithoutTarget
        }));
        return;
      }
      const path = message.replace(/\/+$/, '');
      const observer = this._observers.get(path);
      if (observer != null) {
        observer.next(params);
      }
      lastDeepLinkUptime = process.uptime();
    }), () => this._observers.forEach(observer => observer.complete()));
  }

  dispose() {
    this._disposable.dispose();
  }

  subscribeToPath(path, callback) {
    const result = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._observables.get(path).subscribe(callback));

    return result;
  }

  sendDeepLink(browserWindow, path, params) {
    (0, (_deepLink || _load_deepLink()).sendDeepLink)(browserWindow, path, params);
    browserWindow.focus();
  }
}
exports.default = DeepLinkService;