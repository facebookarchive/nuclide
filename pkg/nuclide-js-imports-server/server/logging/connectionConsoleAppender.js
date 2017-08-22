'use strict';

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

function appender(config) {
  const { connection } = config;

  // eslint-disable-next-line flowtype/no-weak-types
  return loggingEvent => {
    connection.console.log((_log4js || _load_log4js()).layouts.basicLayout(loggingEvent));
  };
}

// eslint-disable-next-line nuclide-internal/no-commonjs

// $FlowFixMe: type layouts
module.exports.configure = module.exports.appender = appender;