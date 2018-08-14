"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getModifierKeysFromMouseEvent = getModifierKeysFromMouseEvent;
exports.getModifierKeyFromKeyboardEvent = getModifierKeyFromKeyboardEvent;

function _types() {
  const data = require("./types");

  _types = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const KEYNAME_TO_PROPERTY = {
  Meta: _types().ModifierKeys.META,
  Shift: _types().ModifierKeys.SHIFT,
  Alt: _types().ModifierKeys.ALT,
  Control: _types().ModifierKeys.CTRL
};

function getModifierKeysFromMouseEvent(e) {
  const keys = new Set();

  if (e.metaKey) {
    keys.add(_types().ModifierKeys.META);
  }

  if (e.shiftKey) {
    keys.add(_types().ModifierKeys.SHIFT);
  }

  if (e.altKey) {
    keys.add(_types().ModifierKeys.ALT);
  }

  if (e.ctrlKey) {
    keys.add(_types().ModifierKeys.CTRL);
  }

  return keys;
}

function getModifierKeyFromKeyboardEvent(e) {
  return KEYNAME_TO_PROPERTY[e.key];
}