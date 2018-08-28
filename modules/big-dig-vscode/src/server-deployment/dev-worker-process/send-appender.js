"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.appender = appender;
exports.configure = configure;

function _send() {
  const data = _interopRequireDefault(require("./send"));

  _send = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
function appender() {
  return function (loggingEvent) {
    (0, _send().default)({
      tag: 'log',
      category: loggingEvent.categoryName,
      level: loggingEvent.level.toString().toLowerCase(),
      data: loggingEvent.data
    });
  };
}

function configure(config) {
  return appender();
}