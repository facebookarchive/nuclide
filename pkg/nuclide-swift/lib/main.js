Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeTaskRunnerServiceApi = consumeTaskRunnerServiceApi;
exports.consumeOutputService = consumeOutputService;
exports.serialize = serialize;
exports.createAutocompleteProvider = createAutocompleteProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _taskrunnerSwiftPMTaskRunner2;

function _taskrunnerSwiftPMTaskRunner() {
  return _taskrunnerSwiftPMTaskRunner2 = require('./taskrunner/SwiftPMTaskRunner');
}

var _disposables = null;
var _taskRunner = null;
var _initialState = null;

function activate(rawState) {
  (0, (_assert2 || _assert()).default)(_disposables == null);
  _initialState = rawState;
  _disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
    _taskRunner = null;
  }), new (_atom2 || _atom()).Disposable(function () {
    _initialState = null;
  }));
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(_disposables != null);
  _disposables.dispose();
  _disposables = null;
}

function consumeTaskRunnerServiceApi(serviceApi) {
  (0, (_assert2 || _assert()).default)(_disposables != null);
  _disposables.add(serviceApi.register(_getTaskRunner()));
}

function consumeOutputService(service) {
  (0, (_assert2 || _assert()).default)(_disposables != null);
  _disposables.add(service.registerOutputProvider({
    messages: _getTaskRunner().getOutputMessages(),
    id: 'swift'
  }));
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
    getSuggestions: function getSuggestions(request) {
      return _getTaskRunner().getAutocompletionProvider().getAutocompleteSuggestions(request);
    }
  };
}

function _getTaskRunner() {
  if (_taskRunner == null) {
    (0, (_assert2 || _assert()).default)(_disposables != null);
    _taskRunner = new (_taskrunnerSwiftPMTaskRunner2 || _taskrunnerSwiftPMTaskRunner()).SwiftPMTaskRunner(_initialState);
    _disposables.add(_taskRunner);
  }
  return _taskRunner;
}