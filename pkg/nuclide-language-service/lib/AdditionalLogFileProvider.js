'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LanguageAdditionalLogFilesProvider = undefined;

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _string;

function _load_string() {
  return _string = require('../../../modules/nuclide-commons/string');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

class LanguageAdditionalLogFilesProvider {

  constructor(name, connectionToLanguageService) {
    this.id = 'als';

    this._name = name;
    this._connectionToLanguageService = connectionToLanguageService;
  }

  static register(name, connectionToLanguageService) {
    return atom.packages.serviceHub.provide('additional-log-files', '0.0.0', new LanguageAdditionalLogFilesProvider(name, connectionToLanguageService));
  }

  async getAdditionalLogFiles(deadline) {
    const resultsForConnection = async (prefix, connection) => {
      const service = await this._connectionToLanguageService.get(connection);
      const subResults = await service.getAdditionalLogFiles(deadline - 1000);
      return subResults.map(log => Object.assign({}, log, { title: prefix + log.title }));
    };

    const connections = Array.from(this._connectionToLanguageService.keys());
    const results = await Promise.all(connections.map(connection => {
      const prefix = `[${this._name}]` + (connection == null ? '' : connection.getRemoteHostname() + ':');
      return (0, (_promise || _load_promise()).timeoutAfterDeadline)(deadline, resultsForConnection(prefix, connection)).catch(e => [{
        title: `${prefix}language_service`,
        data: (0, (_string || _load_string()).stringifyError)(e)
      }]);
    }));
    return (0, (_collection || _load_collection()).arrayFlatten)(results);
  }
}
exports.LanguageAdditionalLogFilesProvider = LanguageAdditionalLogFilesProvider; /**
                                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                                  * All rights reserved.
                                                                                  *
                                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                                  * the root directory of this source tree.
                                                                                  *
                                                                                  *  strict-local
                                                                                  * @format
                                                                                  */