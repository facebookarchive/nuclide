"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configure = configure;
exports.appender = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
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
  return ({
    data,
    level
  }) => {
    if (level === _log4js().levels.INFO) {
      const arg = data[0];

      if (arg instanceof _process().ProcessLoggingEvent) {
        (0, _nuclideAnalytics().trackSampled)('process-exit', SAMPLE_RATE, {
          command: (0, _string().shorten)(arg.command, 100, '...'),
          duration: arg.duration
        });
      }
    }
  };
}

const appender = configure;
exports.appender = appender;