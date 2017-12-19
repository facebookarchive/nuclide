'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LanguageAdditionalLogFilesProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LanguageAdditionalLogFilesProvider {

  constructor(name, connectionToLanguageService) {
    this.id = 'als';

    this._name = name;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('additional-log-files', '0.0.0', new LanguageAdditionalLogFilesProvider(name, connectionToLanguageService));
  }

  getAdditionalLogFiles(deadline) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const resultsForConnection = (() => {
        var _ref = (0, _asyncToGenerator.default)(function* (prefix, connection) {
          const service = yield _this._connectionToLanguageService.get(connection);
          const subResults = yield service.getAdditionalLogFiles(deadline - 1000);
          return subResults.map(function (log) {
            return Object.assign({}, log, { title: prefix + log.title });
          });
        });

        return function resultsForConnection(_x, _x2) {
          return _ref.apply(this, arguments);
        };
      })();

      const connections = Array.from(_this._connectionToLanguageService.keys());
      const results = yield Promise.all(connections.map(function (connection) {
        const prefix = `[${_this._name}]` + (connection == null ? '' : connection.getRemoteHostname() + ':');
        return (0, (_promise || _load_promise()).timeoutAfterDeadline)(deadline, resultsForConnection(prefix, connection)).catch(function (e) {
          return [{
            title: `${prefix}language_service`,
            data: (0, (_string || _load_string()).stringifyError)(e)
          }];
        });
      }));
      return (0, (_collection || _load_collection()).arrayFlatten)(results);
    })();
  }
}
exports.LanguageAdditionalLogFilesProvider = LanguageAdditionalLogFilesProvider; /**
                                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                                  * All rights reserved.
                                                                                  *
                                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                                  * the root directory of this source tree.
                                                                                  *
                                                                                  * 
                                                                                  * @format
                                                                                  */