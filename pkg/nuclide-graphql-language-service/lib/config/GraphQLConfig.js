'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQLConfig = exports.GraphQLRC = exports.getGraphQLConfig = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getGraphQLConfig = exports.getGraphQLConfig = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (configDir) {
    const rawGraphQLConfig = yield new Promise(function (resolve, reject) {
      return _fs.default.readFile(_path.default.join(configDir, '.graphqlrc'), 'utf8', function (error, response) {
        if (error) {
          // eslint-disable-next-line no-console
          console.error('.graphqlrc file is not available in the provided config ' + `directory: ${configDir}\nPlease check the config directory ` + 'path and try again.');
          reject(new Error());
        }
        resolve(response);
      });
    });
    try {
      const graphqlrc = JSON.parse(rawGraphQLConfig);
      return new GraphQLRC(graphqlrc, configDir);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Parsing JSON in .graphqlrc file has failed.');
      throw new Error(error);
    }
  });

  return function getGraphQLConfig(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _path = _interopRequireDefault(require('path'));

var _fs = _interopRequireDefault(require('fs'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
const CONFIG_LIST_NAME = 'build-configs'; /**
                                           * Copyright (c) 2015-present, Facebook, Inc.
                                           * All rights reserved.
                                           *
                                           * This source code is licensed under the license found in the LICENSE file in
                                           * the root directory of this source tree.
                                           *
                                           * 
                                           */

const SCHEMA_PATH = 'schema-file';
const CUSTOM_VALIDATION_RULES_MODULE_PATH = 'custom-validation-rules';

class GraphQLRC {

  constructor(graphqlrc, root) {
    this._graphqlrc = graphqlrc;
    this._rootDir = root;
    this._configs = {};
    if (this._graphqlrc[CONFIG_LIST_NAME]) {
      Object.keys(this._graphqlrc[CONFIG_LIST_NAME]).forEach(name => {
        this._configs[name] = new GraphQLConfig(name, this._graphqlrc[CONFIG_LIST_NAME][name], this._rootDir);
      });
    }
  }

  getConfigDir() {
    return this._rootDir;
  }

  getConfigNames() {
    return Object.keys(this._graphqlrc[CONFIG_LIST_NAME]);
  }

  getConfig(name) {
    const config = this._configs[name];
    if (config === undefined) {
      throw new Error(`Config ${name} not defined. Choose one of: ` + Object.keys(this._graphqlrc[CONFIG_LIST_NAME]).join(', '));
    }
    return config;
  }

  getConfigByFilePath(filePath) {
    const name = this.getConfigNames().find(configName => this.getConfig(configName).isFileInInputDirs(filePath));

    return name ? this._configs[name] : null;
  }
}

exports.GraphQLRC = GraphQLRC;
class GraphQLConfig {

  constructor(name, config, rootDir) {
    this._name = name;
    this._rootDir = rootDir;
    this._config = config;
  }

  getRootDir() {
    return this._rootDir;
  }

  getName() {
    return this._name;
  }

  getConfig() {
    return this._config;
  }

  getInputDirs() {
    return this._config['input-dirs'] ? this._config['input-dirs'] : [];
  }

  getExcludeDirs() {
    return this._config['exclude-dirs'] ? this._config['exclude-dirs'] : [];
  }

  isFileInInputDirs(fileName) {
    if (!this.getInputDirs()) {
      return false;
    }
    return this.getInputDirs().some(dirPath => fileName.indexOf(dirPath) !== -1);
  }

  getSchemaPath() {
    return this._config[SCHEMA_PATH] || null;
  }

  getCustomValidationRulesModulePath() {
    const modulePath = this._config[CUSTOM_VALIDATION_RULES_MODULE_PATH];
    if (!modulePath) {
      return null;
    }
    return this._normalizePath(modulePath);
  }

  _normalizePath(modulePath) {
    let resolvedPath;
    if (modulePath.startsWith('~')) {
      // home directory
      const homeDirPath = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME;
      resolvedPath = _path.default.join(homeDirPath || '', modulePath.slice(1));
    } else if (modulePath.startsWith('./')) {
      // relative local directory
      resolvedPath = _path.default.join(this._rootDir, modulePath);
    } else {
      // `/` or an actual module name (node_modules)
      resolvedPath = modulePath;
    }

    return resolvedPath;
  }
}
exports.GraphQLConfig = GraphQLConfig;