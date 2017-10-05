'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdditionalLogFileProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
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
 * @format
 */

class AdditionalLogFileProvider {

  constructor(connectionToLanguageService) {
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(connectionToLanguageService) {
    return atom.packages.serviceHub.provide('additional-log-files', '0.0.0', new AdditionalLogFileProvider(connectionToLanguageService));
  }

  getAdditionalLogFiles() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const connections = Array.from(_this._connectionToLanguageService.keys());
      const results = yield Promise.all(connections.map((() => {
        var _ref = (0, _asyncToGenerator.default)(function* (connection) {
          const service = yield _this._connectionToLanguageService.get(connection);
          const subResults = yield service.getAdditionalLogFiles();
          const prefix = connection == null ? '' : connection.getRemoteHostname() + ':';
          return subResults.map(function (log) {
            return Object.assign({}, log, { title: prefix + log.title });
          });
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })()));
      return (0, (_collection || _load_collection()).arrayFlatten)(results);
    })();
  }
}
exports.AdditionalLogFileProvider = AdditionalLogFileProvider;