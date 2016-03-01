'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const Actions = {
  SET_DEBUGGER_PROCESS: 'SET_DEBUGGER_PROCESS',
  SET_ERROR: 'SET_ERROR',
  ADD_SERVICE: 'ADD_SERVICE',
  REMOVE_SERVICE: 'REMOVE_SERVICE',
  SET_PROCESS_SOCKET: 'SET_PROCESS_SOCKET',
  DEBUGGER_MODE_CHANGE: 'DEBUGGER_MODE_CHANGE',
  ADD_DEBUGGER_PROVIDER: 'ADD_DEBUGGER_PROVIDER',
  REMOVE_DEBUGGER_PROVIDER: 'REMOVE_DEBUGGER_PROVIDER',
  UPDATE_CONNECTIONS: 'UPDATE_CONNECTIONS',
};

module.exports = {
  Actions,
};
