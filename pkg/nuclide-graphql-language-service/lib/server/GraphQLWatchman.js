'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQLWatchman = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _fbWatchman;

function _load_fbWatchman() {
  return _fbWatchman = _interopRequireDefault(require('fb-watchman'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class GraphQLWatchman {
  constructor() {
    this._client = new (_fbWatchman || _load_fbWatchman()).default.Client();
  }

  checkVersion() {
    return new Promise((resolve, reject) => {
      this._client.capabilityCheck({
        optional: [],
        required: ['relative_roots', 'cmd-watch-project']
      }, (error, response) => {
        if (error) {
          reject(error);
        } else {
          // From the Watchman docs, response is something like:
          // {'version': '3.8.0', 'capabilities': {'relative_root': true}}.
          resolve();
        }
      });
    });
  }

  listFiles(entryPath, options = {}) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { watch, relative_path } = yield _this.watchProject(entryPath);
      const result = yield _this.runCommand('query', watch, Object.assign({
        expression: ['allof', ['match', '*.graphql'], ['exists']],
        // Providing `path` will let watchman use path generator, and will perform
        // a tree walk with respect to the relative_root and path provided.
        // Path generator will do less work unless the root path of the repository
        // is passed in as an entry path.
        fields: ['name', 'size', 'mtime'],
        relative_root: relative_path
      }, options));
      return result.files;
    })();
  }

  runCommand(...args) {
    return new Promise((resolve, reject) => this._client.command(args, (error, response) => {
      if (error) {
        reject(error);
      }
      resolve(response);
    })).catch(error => {
      throw new Error(error);
    });
  }

  watchProject(directoryPath) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this2.runCommand('watch-project', directoryPath);

      return response;
    })();
  }

  subscribe(entryPath, callback) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { watch, relative_path } = yield _this3.watchProject(entryPath);

      // Subscribe to the relative path
      yield _this3.runCommand('subscribe', watch, relative_path, {
        expression: ['allof', ['match', '*.graphql']],
        fields: ['name', 'exists', 'size', 'mtime'],
        relative_root: relative_path
      });

      _this3._client.on('subscription', function (result) {
        if (result.subscription !== relative_path) {
          return;
        }
        callback(result);
      });
    })();
  }

  dispose() {
    this._client.end();
    this._client = null;
  }
}
exports.GraphQLWatchman = GraphQLWatchman;