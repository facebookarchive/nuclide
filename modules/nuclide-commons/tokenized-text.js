'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.keyword = keyword;
exports.className = className;
exports.constructor = constructor;
exports.method = method;
exports.param = param;
exports.string = string;
exports.whitespace = whitespace;
exports.plain = plain;
exports.type = type;
function keyword(value) {
  return _buildToken('keyword', value);
} /**
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

function className(value) {
  return _buildToken('class-name', value);
}

function constructor(value) {
  return _buildToken('constructor', value);
}

function method(value) {
  return _buildToken('method', value);
}

function param(value) {
  return _buildToken('param', value);
}

function string(value) {
  return _buildToken('string', value);
}

function whitespace(value) {
  return _buildToken('whitespace', value);
}

function plain(value) {
  return _buildToken('plain', value);
}

function type(value) {
  return _buildToken('type', value);
}

function _buildToken(kind, value) {
  return { kind, value };
}