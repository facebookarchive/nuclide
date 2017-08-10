'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electron = _interopRequireDefault(require('electron'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _SharedObservableCache;

function _load_SharedObservableCache() {
  return _SharedObservableCache = _interopRequireDefault(require('../../commons-node/SharedObservableCache'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { ipcRenderer } = _electron.default; /**
                                            * Copyright (c) 2015-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the license found in the LICENSE file in
                                            * the root directory of this source tree.
                                            *
                                            * 
                                            * @format
                                            */

if (!(ipcRenderer != null)) {
  throw new Error('Invariant violation: "ipcRenderer != null"');
}

const CHANNEL = 'nuclide-url-open';

class DeepLinkService {

  constructor() {
    this._observers = new Map();
    this._observables = new (_SharedObservableCache || _load_SharedObservableCache()).default(path => {
      return _rxjsBundlesRxMinJs.Observable.create(observer => {
        this._observers.set(path, observer);
        return () => this._observers.delete(path);
      }).share();
    });

    this._disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // These events will be sent from lib/url-main.js.
    // TODO: Use real Atom URI handler from
    // https://github.com/atom/atom/pull/11399.
    _rxjsBundlesRxMinJs.Observable.fromEvent(ipcRenderer, CHANNEL, (event, data) => data).subscribe(({ message, params }) => {
      const path = message.replace(/\/+$/, '');
      const observer = this._observers.get(path);
      if (observer != null) {
        observer.next(params);
      }
    }), () => this._observers.forEach(observer => observer.complete()));
  }

  dispose() {
    this._disposable.dispose();
  }

  subscribeToPath(path, callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._observables.get(path).subscribe(callback));
  }

  sendDeepLink(browserWindow, path, params) {
    browserWindow.webContents.send(CHANNEL, { message: path, params });
    browserWindow.focus();
  }
}
exports.default = DeepLinkService;