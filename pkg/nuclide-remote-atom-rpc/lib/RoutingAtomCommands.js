'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.RoutingAtomCommands = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));




















var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _promise;
function _load_promise() {return _promise = require('nuclide-commons/promise');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

/**
                                                                                                                                                                               * Timeout to use when making a getProjectState() RPC.
                                                                                                                                                                               * Note this is less than the server's default timeout of 60s.
                                                                                                                                                                               */ /**
                                                                                                                                                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                   * All rights reserved.
                                                                                                                                                                                   *
                                                                                                                                                                                   * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                   * the root directory of this source tree.
                                                                                                                                                                                   *
                                                                                                                                                                                   * 
                                                                                                                                                                                   * @format
                                                                                                                                                                                   */const GET_PROJECT_STATES_TIMEOUT_MS = 10 * 1000; /**
                                                                                                                                                                                                                                       * Implementation of MultiConnectionAtomCommands that routes requests
                                                                                                                                                                                                                                       * to the appropriate connection from the underlying CommandServer.
                                                                                                                                                                                                                                       */class RoutingAtomCommands {constructor(server) {this._server = server;}

  getConnectionCount() {
    return Promise.resolve(this._server.getConnectionCount());
  }

  openFile(
  filePath,
  line,
  column,
  isWaiting)
  {
    const commands = this._server.getAtomCommandsByPath(filePath);
    if (commands != null) {
      return commands.openFile(filePath, line, column, isWaiting);
    } else {
      return _rxjsBundlesRxMinJs.Observable.throw(Error('No connected Atom windows')).publish();
    }
  }

  openRemoteFile(
  uri,
  line,
  column,
  isWaiting)
  {
    const commands = this._server.getAtomCommandsByPath(uri);
    if (commands != null) {
      return commands.openRemoteFile(uri, line, column, isWaiting);
    } else {
      return _rxjsBundlesRxMinJs.Observable.throw(Error('No connected Atom windows')).publish();
    }
  }

  addProject(projectPath, newWindow) {
    const commands = this._server.getAtomCommandsByPath(projectPath);
    if (commands != null) {
      return commands.addProject(projectPath, newWindow);
    } else {
      throw new Error('No connected Atom windows');
    }
  }

  getProjectStates() {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const projectStates = [];
      for (const connection of _this._server.getConnections()) {
        // Just in case the connection is no longer valid, we wrap it with a
        // timeout less than Nuclide RPC's default of 60s. We swallow any
        // errors and return an empty ProjectState if this happens.
        projectStates.push(
        (0, (_promise || _load_promise()).timeoutPromise)(
        connection.getAtomCommands().getProjectState(),
        GET_PROJECT_STATES_TIMEOUT_MS).
        catch(function (error) {return {
            rootFolders: [] };}));


      }
      const resolvedProjectStates = yield Promise.all(projectStates);
      return [].concat(...resolvedProjectStates);})();
  }

  addNotification(notification) {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      const promises = [];
      for (const connection of _this2._server.getConnections()) {
        promises.push(connection.getAtomCommands().addNotification(notification));
      }
      yield Promise.all(promises);})();
  }

  dispose() {}}exports.RoutingAtomCommands = RoutingAtomCommands;