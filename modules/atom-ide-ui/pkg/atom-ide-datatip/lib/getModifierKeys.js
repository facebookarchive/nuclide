'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getModifierKeysFromMouseEvent = getModifierKeysFromMouseEvent;
exports.getModifierKeyFromKeyboardEvent = getModifierKeyFromKeyboardEvent;

var _;

function _load_() {
  return _ = require('..');
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const KEYNAME_TO_PROPERTY = {
  Meta: (_ || _load_()).ModifierKeys.META,
  Shift: (_ || _load_()).ModifierKeys.SHIFT,
  Alt: (_ || _load_()).ModifierKeys.ALT,
  Control: (_ || _load_()).ModifierKeys.CTRL
};

function getModifierKeysFromMouseEvent(e) {
  const keys = new Set();
  if (e.metaKey) {
    keys.add((_ || _load_()).ModifierKeys.META);
  }
  if (e.shiftKey) {
    keys.add((_ || _load_()).ModifierKeys.SHIFT);
  }
  if (e.altKey) {
    keys.add((_ || _load_()).ModifierKeys.ALT);
  }
  if (e.ctrlKey) {
    keys.add((_ || _load_()).ModifierKeys.CTRL);
  }

  return keys;
}

function getModifierKeyFromKeyboardEvent(e) {
  return KEYNAME_TO_PROPERTY[e.key];
}