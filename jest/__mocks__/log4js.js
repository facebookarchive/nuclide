"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */

const logger = {
  debug: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  info: jest.fn(),
  isLevelEnabled: jest.fn(),
  // $FlowFixMe
  level: jest.fn(),
  log: jest.fn(),
  mark: jest.fn(),
  removeLevel: jest.fn(),
  setLevel: jest.fn(),
  trace: jest.fn(),
  warn: jest.fn()
};

const getLogger = exports.getLogger = name => logger;

const log4js = {
  getLogger,
  // $FlowFixMe
  configure: jest.fn()
};

exports.default = log4js;