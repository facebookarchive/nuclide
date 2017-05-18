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

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const KEYNAME_TO_PROPERTY = {
  Meta: (_types || _load_types()).ModifierKeys.META,
  Shift: (_types || _load_types()).ModifierKeys.SHIFT,
  Alt: (_types || _load_types()).ModifierKeys.ALT,
  Control: (_types || _load_types()).ModifierKeys.CTRL
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

function getModifierKeysFromMouseEvent(e) {
  let keys = new (_immutable || _load_immutable()).default.Set();
  if (e.metaKey) {
    keys = keys.add((_types || _load_types()).ModifierKeys.META);
  }
  if (e.shiftKey) {
    keys = keys.add((_types || _load_types()).ModifierKeys.SHIFT);
  }
  if (e.altKey) {
    keys = keys.add((_types || _load_types()).ModifierKeys.ALT);
  }
  if (e.ctrlKey) {
    keys = keys.add((_types || _load_types()).ModifierKeys.CTRL);
  }

  return keys;
}

function getModifierKeyFromKeyboardEvent(e) {
  return KEYNAME_TO_PROPERTY[e.key];
}