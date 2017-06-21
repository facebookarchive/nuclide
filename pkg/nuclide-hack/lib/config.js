'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = exports.SHOW_TYPE_COVERAGE_CONFIG_PATH = exports.HACK_CONFIG_PATH = undefined;
exports.getConfig = getConfig;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HACK_CONFIG_PATH = exports.HACK_CONFIG_PATH = 'nuclide-hack'; /**
                                                                     * Copyright (c) 2015-present, Facebook, Inc.
                                                                     * All rights reserved.
                                                                     *
                                                                     * This source code is licensed under the license found in the LICENSE file in
                                                                     * the root directory of this source tree.
                                                                     *
                                                                     * 
                                                                     * @format
                                                                     */

const SHOW_TYPE_COVERAGE_CONFIG_PATH = exports.SHOW_TYPE_COVERAGE_CONFIG_PATH = HACK_CONFIG_PATH + '.showTypeCoverage';

function getConfig() {
  return (_featureConfig || _load_featureConfig()).default.getWithDefaults(HACK_CONFIG_PATH, {
    hhClientPath: '',
    logLevel: 'INFO'
  });
}

const LOGGER_CATEGORY = 'nuclide-hack';
const logger = exports.logger = (0, (_log4js || _load_log4js()).getLogger)(LOGGER_CATEGORY);

function initializeLogging() {
  const config = getConfig();
  logger.setLevel(config.logLevel);
}

initializeLogging();