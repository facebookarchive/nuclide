"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeTaskRunnerServiceApi = consumeTaskRunnerServiceApi;
exports.serialize = serialize;
exports.createAutocompleteProvider = createAutocompleteProvider;

function _SwiftPMTaskRunner() {
  const data = require("./taskrunner/SwiftPMTaskRunner");

  _SwiftPMTaskRunner = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
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
let _disposables = null;
let _taskRunner = null;
let _initialState = null;

function activate(rawState) {
  if (!(_disposables == null)) {
    throw new Error("Invariant violation: \"_disposables == null\"");
  }

  _initialState = rawState;
  _disposables = new (_UniversalDisposable().default)(() => {
    _taskRunner = null;
  }, () => {
    _initialState = null;
  });
}

function deactivate() {
  if (!(_disposables != null)) {
    throw new Error("Invariant violation: \"_disposables != null\"");
  }

  _disposables.dispose();

  _disposables = null;
}

function consumeTaskRunnerServiceApi(serviceApi) {
  if (!(_disposables != null)) {
    throw new Error("Invariant violation: \"_disposables != null\"");
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
    analytics: {
      eventName: 'nuclide-swift',
      shouldLogInsertedSuggestion: false
    },
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
      throw new Error("Invariant violation: \"_disposables != null\"");
    }

    _taskRunner = new (_SwiftPMTaskRunner().SwiftPMTaskRunner)(_initialState);

    _disposables.add(_taskRunner);
  }

  return _taskRunner;
}