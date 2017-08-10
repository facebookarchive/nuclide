'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeTaskRunnerServiceApi = consumeTaskRunnerServiceApi;
exports.serialize = serialize;
exports.createAutocompleteProvider = createAutocompleteProvider;

var _atom = require('atom');

var _SwiftPMTaskRunner;

function _load_SwiftPMTaskRunner() {
  return _SwiftPMTaskRunner = require('./taskrunner/SwiftPMTaskRunner');
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

let _disposables = null;
let _taskRunner = null;
let _initialState = null;

function activate(rawState) {
  if (!(_disposables == null)) {
    throw new Error('Invariant violation: "_disposables == null"');
  }

  _initialState = rawState;
  _disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
    _taskRunner = null;
  }), new _atom.Disposable(() => {
    _initialState = null;
  }));
}

function deactivate() {
  if (!(_disposables != null)) {
    throw new Error('Invariant violation: "_disposables != null"');
  }

  _disposables.dispose();
  _disposables = null;
}

function consumeTaskRunnerServiceApi(serviceApi) {
  if (!(_disposables != null)) {
    throw new Error('Invariant violation: "_disposables != null"');
  }

  _disposables.add(serviceApi.register(_getTaskRunner()));
}

function serialize() {
  if (_taskRunner != null) {
    return _taskRunner.serialize();
  }
}

function createAutocompleteProvider() {
  return {
    selector: '.source.swift',
    inclusionPriority: 1,
    disableForSelector: '.source.swift .comment',
    getSuggestions(request) {
      return _getTaskRunner().getAutocompletionProvider().getAutocompleteSuggestions(request);
    }
  };
}

function _getTaskRunner() {
  if (_taskRunner == null) {
    if (!(_disposables != null)) {
      throw new Error('Invariant violation: "_disposables != null"');
    }

    _taskRunner = new (_SwiftPMTaskRunner || _load_SwiftPMTaskRunner()).SwiftPMTaskRunner(_initialState);
    _disposables.add(_taskRunner);
  }
  return _taskRunner;
}