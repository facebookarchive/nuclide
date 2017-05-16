'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchAttachStore = undefined;

var _atom = require('atom');

var _LaunchAttachDispatcher;

function _load_LaunchAttachDispatcher() {
  return _LaunchAttachDispatcher = require('./LaunchAttachDispatcher');
}

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

const ATTACH_TARGET_LIST_CHANGE_EVENT = 'ATTACH_TARGET_LIST_CHANGE_EVENT';

class LaunchAttachStore {

  constructor(dispatcher) {
    this._dispatcher = dispatcher;
    this._dispatcherToken = this._dispatcher.register(this._handleActions.bind(this));
    this._emitter = new _atom.Emitter();
    this._attachTargetInfos = [];
  }

  dispose() {
    this._dispatcher.unregister(this._dispatcherToken);
  }

  onAttachTargetListChanged(callback) {
    return this._emitter.on(ATTACH_TARGET_LIST_CHANGE_EVENT, callback);
  }

  _handleActions(action) {
    switch (action.actionType) {
      case (_LaunchAttachDispatcher || _load_LaunchAttachDispatcher()).ActionTypes.UPDATE_ATTACH_TARGET_LIST:
        this._attachTargetInfos = action.attachTargetInfos;
        this._emitter.emit(ATTACH_TARGET_LIST_CHANGE_EVENT);
        break;
    }
  }

  getAttachTargetInfos() {
    return this._attachTargetInfos;
  }
}
exports.LaunchAttachStore = LaunchAttachStore;