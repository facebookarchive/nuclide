"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
exports.clearSettings = clearSettings;


const defaultSettings = {
  singleThreadStepping: true
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

let settings = defaultSettings;

function getSettings() {
  return settings;
}

function updateSettings(newSettings) {
  for (const key in newSettings) {
    settings[key] = newSettings[key];
  }
}

function clearSettings() {
  settings = defaultSettings;
}