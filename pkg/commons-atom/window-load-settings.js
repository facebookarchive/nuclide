'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWindowLoadSettings = getWindowLoadSettings;
exports.setWindowLoadSettings = setWindowLoadSettings;

var _electron = require('electron');

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

if (!(_electron.remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

/**
 * Equivalents of https://github.com/atom/atom/blob/master/src/get-window-load-settings.js
 */

function getWindowLoadSettings(browserWindow = _electron.remote.getCurrentWindow()) {
  // $FlowIgnore: add to defs when it comes.
  const { loadSettingsJSON } = browserWindow;
  return loadSettingsJSON != null ? // Atom 1.17+ only.
  JSON.parse(loadSettingsJSON) : // Atom 1.16.
  browserWindow.loadSettings || {};
}

function setWindowLoadSettings(settings, browserWindow = _electron.remote.getCurrentWindow()) {
  if (browserWindow.loadSettings) {
    browserWindow.loadSettings = settings;
  } else {
    // Atom 1.17+ only.
    // $FlowIgnore: add to defs when it comes.
    browserWindow.loadSettingsJSON = JSON.stringify(settings);
  }
}