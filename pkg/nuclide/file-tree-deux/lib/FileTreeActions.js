'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeDispatcher = require('./FileTreeDispatcher');

import type {Dispatcher} from 'flux';

var ActionType = {
  SET_ROOT_DIRECTORIES: 'SET_ROOT_DIRECTORIES',
};

var instance: FileTreeActions;

/*
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */
class FileTreeActions {
  _dispatcher: Dispatcher;

  static ActionType: Object = ActionType;

  static getInstance(): FileTreeActions {
    if (!instance) {
      instance = new FileTreeActions();
    }
    return instance;
  }

  constructor() {
    this._dispatcher = FileTreeDispatcher.getInstance();
  }

  setRootDirectories(directories: Array<atom$Directory>): void {
    this._dispatcher.dispatch({
      actionType: ActionType.SET_ROOT_DIRECTORIES,
      directories,
    });
  }
}

module.exports = FileTreeActions;
