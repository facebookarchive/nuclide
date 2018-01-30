'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.search = search;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _parser;

function _load_parser() {
  return _parser = require('./parser');
}

function search(directory, regex) {
  // Javascript escapes the slash when constructing the regexp,
  // but Rust's regex library is picky about extra escapes:
  // see https://github.com/rust-lang/regex/issues/93#issuecomment-196022003
  const source = regex.source.replace('\\/', '/');
  return (0, (_process || _load_process()).observeProcess)('rg', (regex.ignoreCase ? ['--ignore-case'] : []).concat([
  // no colors, show line number, search hidden files,
  // show column number, one result per line
  '--color', 'never', '--line-number', '--hidden', '--column', '--no-heading', '-e', source, directory])).flatMap(event => (0, (_parser || _load_parser()).parseAgAckRgLine)(event));
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */