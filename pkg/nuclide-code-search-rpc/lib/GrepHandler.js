'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.search = search;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _handlerCommon;

function _load_handlerCommon() {
  return _handlerCommon = require('./handlerCommon');
}

var _parser;

function _load_parser() {
  return _parser = require('./parser');
}

function search(directory, regex) {
  const args = (regex.ignoreCase ? ['-i'] : []).concat([
  // recursive, always print filename, print line number, use regex
  '-rHn', '-E', '-e', regex.source, directory]);
  return (0, (_handlerCommon || _load_handlerCommon()).observeGrepLikeProcess)('grep', args, directory).flatMap(event => (0, (_parser || _load_parser()).parseGrepLine)(event, directory, regex));
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