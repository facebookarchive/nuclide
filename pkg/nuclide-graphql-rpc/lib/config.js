'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getGraphQLConfig = exports.GRAPHQL_CONFIG_FILE_NAME = exports.logger = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getGraphQLConfig = exports.getGraphQLConfig = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (configDir) {
    const rawGraphQLConfig = yield (_fsPromise || _load_fsPromise()).default.readFile((_nuclideUri || _load_nuclideUri()).default.join(configDir, GRAPHQL_CONFIG_FILE_NAME));
    const configJSON = rawGraphQLConfig.toString();
    try {
      const graphqlrc = JSON.parse(configJSON);
      return new (_GraphQLConfig || _load_GraphQLConfig()).GraphQLRC(graphqlrc, configDir);
    } catch (error) {
      throw new Error(error);
    }
  });

  return function getGraphQLConfig(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.findGraphQLConfigDir = findGraphQLConfigDir;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _GraphQLConfig;

function _load_GraphQLConfig() {
  return _GraphQLConfig = require('../../nuclide-graphql-language-service/lib/config/GraphQLConfig');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GRAPHQL_LOGGER_CATEGORY = 'nuclide-graphql'; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    */

const logger = exports.logger = (0, (_nuclideLogging || _load_nuclideLogging()).getCategoryLogger)(GRAPHQL_LOGGER_CATEGORY);

const GRAPHQL_CONFIG_FILE_NAME = exports.GRAPHQL_CONFIG_FILE_NAME = '.graphqlrc';

function findGraphQLConfigDir(fileUri) {
  return (_fsPromise || _load_fsPromise()).default.findNearestFile(GRAPHQL_CONFIG_FILE_NAME, fileUri);
}