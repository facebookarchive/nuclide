'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getModifierKeysFromMouseEvent = getModifierKeysFromMouseEvent;
exports.getModifierKeyFromKeyboardEvent = getModifierKeyFromKeyboardEvent;

var _types;

function _load_types() {
  return _types = require('./types');
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
  Meta: (_types || _load_types()).ModifierKeys.META,
  Shift: (_types || _load_types()).ModifierKeys.SHIFT,
  Alt: (_types || _load_types()).ModifierKeys.ALT,
  Control: (_types || _load_types()).ModifierKeys.CTRL
};

function getModifierKeysFromMouseEvent(e) {
  const keys = new Set();
  if (e.metaKey) {
    keys.add((_types || _load_types()).ModifierKeys.META);
  }
  if (e.shiftKey) {
    keys.add((_types || _load_types()).ModifierKeys.SHIFT);
  }
  if (e.altKey) {
    keys.add((_types || _load_types()).ModifierKeys.ALT);
  }
  if (e.ctrlKey) {
    keys.add((_types || _load_types()).ModifierKeys.CTRL);
  }

  return keys;
}

function getModifierKeyFromKeyboardEvent(e) {
  return KEYNAME_TO_PROPERTY[e.key];
}