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

function search(params) {
  const { regex, limit } = params;
  const searchSources = params.recursive ? [params.directory] : params.files;
  if (searchSources.length === 0) {
    return _rxjsBundlesRxMinJs.Observable.empty();
  }
  const args = (regex.ignoreCase ? ['-i'] : []).concat(limit != null ? ['-m', String(limit)] : []).concat([
  // recursive, always print filename, print line number with null byte,
  // use extended regex
  '-rHn', '--null', '-E', '-e', regex.source]).concat(searchSources);
  return (0, (_handlerCommon || _load_handlerCommon()).observeGrepLikeProcess)('grep', args).flatMap(event => (0, (_parser || _load_parser()).parseGrepLine)(event, regex, 'grep'));
}