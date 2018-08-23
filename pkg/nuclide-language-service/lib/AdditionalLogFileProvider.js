"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LanguageAdditionalLogFilesProvider = void 0;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

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
      return subResults.map(log => Object.assign({}, log, {
        title: prefix + log.title
      }));
    };

    const connections = Array.from(this._connectionToLanguageService.keys());
    const results = await Promise.all(connections.map(connection => {
      const prefix = `[${this._name}]` + (connection == null ? '' : connection.getRemoteHostname() + ':');
      return (0, _promise().timeoutAfterDeadline)(deadline, resultsForConnection(prefix, connection)).catch(e => [{
        title: `${prefix}language_service`,
        data: (0, _string().stringifyError)(e)
      }]);
    }));
    return (0, _collection().arrayFlatten)(results);
  }

}

exports.LanguageAdditionalLogFilesProvider = LanguageAdditionalLogFilesProvider;