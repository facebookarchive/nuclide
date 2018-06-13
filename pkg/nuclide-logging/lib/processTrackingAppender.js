'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appender = undefined;
exports.configure = configure;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _string;

function _load_string() {
  return _string = require('../../../modules/nuclide-commons/string');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
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

const SAMPLE_RATE = 10;

function configure() {
  return ({ data, level }) => {
    if (level === (_log4js || _load_log4js()).levels.INFO) {
      const arg = data[0];
      if (arg instanceof (_process || _load_process()).ProcessLoggingEvent) {
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackSampled)('process-exit', SAMPLE_RATE, {
          command: (0, (_string || _load_string()).shorten)(arg.command, 100, '...'),
          duration: arg.duration
        });
      }
    }
  };
}

const appender = exports.appender = configure;