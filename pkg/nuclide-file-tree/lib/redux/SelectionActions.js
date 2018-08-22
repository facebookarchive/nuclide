"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.select = select;
exports.unselect = unselect;
exports.focus = focus;
exports.unfocus = unfocus;
exports.clearSelected = clearSelected;
exports.clearFocused = clearFocused;
exports.CLEAR_FOCUSED = exports.CLEAR_SELECTED = exports.UNFOCUS = exports.FOCUS = exports.UNSELECT = exports.SELECT = void 0;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const SELECT = 'SELECTION:SELECT';
exports.SELECT = SELECT;
const UNSELECT = 'SELECTION:UNSELECT';
exports.UNSELECT = UNSELECT;
const FOCUS = 'SELECTION:FOCUS';
exports.FOCUS = FOCUS;
const UNFOCUS = 'SELECTION:UNFOCUS';
exports.UNFOCUS = UNFOCUS;
const CLEAR_SELECTED = 'SELECTION:CLEAR_SELECTED';
exports.CLEAR_SELECTED = CLEAR_SELECTED;
const CLEAR_FOCUSED = 'SELECTION:CLEAR_FOCUSED';
exports.CLEAR_FOCUSED = CLEAR_FOCUSED;

function select(node) {
  return {
    type: SELECT,
    node
  };
}

function unselect(node) {
  return {
    type: UNSELECT,
    node
  };
}

function focus(node) {
  return {
    type: FOCUS,
    node
  };
}

function unfocus(node) {
  return {
    type: UNFOCUS,
    node
  };
}

function clearSelected() {
  return {
    type: CLEAR_SELECTED
  };
}

function clearFocused() {
  return {
    type: CLEAR_FOCUSED
  };
}