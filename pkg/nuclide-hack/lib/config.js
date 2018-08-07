"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;
exports.logger = exports.SHOW_TYPE_COVERAGE_CONFIG_PATH = exports.HACK_CONFIG_PATH = void 0;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const HACK_CONFIG_PATH = 'nuclide-hack';
exports.HACK_CONFIG_PATH = HACK_CONFIG_PATH;
const SHOW_TYPE_COVERAGE_CONFIG_PATH = HACK_CONFIG_PATH + '.showTypeCoverage';
exports.SHOW_TYPE_COVERAGE_CONFIG_PATH = SHOW_TYPE_COVERAGE_CONFIG_PATH;

function getConfig() {
  return _featureConfig().default.getWithDefaults(HACK_CONFIG_PATH, {
    hhClientPath: '',
    legacyHackIde: false,
    logLevel: 'INFO'
  });
}

const LOGGER_CATEGORY = 'nuclide-hack';
const logger = (0, _log4js().getLogger)(LOGGER_CATEGORY);
exports.logger = logger;

function initializeLogging() {
  const config = getConfig();
  logger.setLevel(config.logLevel);
}

initializeLogging();