'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeDeepLinks = observeDeepLinks;
exports.sendDeepLink = sendDeepLink;
exports.getHasSentDeepLink = getHasSentDeepLink;

var _electron = _interopRequireDefault(require('electron'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { ipcRenderer, remote } = _electron.default; /**
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
  throw new Error('must be in renderer process');
}

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

const CHANNEL = 'nuclide-url-open';

let hasSentDeepLink = false;

function observeDeepLinks() {
  return _rxjsBundlesRxMinJs.Observable.fromEvent(ipcRenderer, CHANNEL, (event, data) => data);
}

function sendDeepLink(browserWindow, path, params) {
  if (browserWindow === remote.getCurrentWindow()) {
    hasSentDeepLink = true;
  }

  browserWindow.webContents.send(CHANNEL, { message: path, params });
  browserWindow.focus();
}

function getHasSentDeepLink() {
  return hasSentDeepLink;
}