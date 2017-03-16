'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _Inspector;

function _load_Inspector() {
  return _Inspector = _interopRequireDefault(require('./ui/Inspector'));
}

var _Inspector2;

function _load_Inspector2() {
  return _Inspector2 = require('./ui/Inspector');
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let disposables = null; /**
                         * Copyright (c) 2015-present, Facebook, Inc.
                         * All rights reserved.
                         *
                         * This source code is licensed under the license found in the LICENSE file in
                         * the root directory of this source tree.
                         *
                         * 
                         */

function activate() {
  disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
}

function deactivate() {
  if (!(disposables != null)) {
    throw new Error('Invariant violation: "disposables != null"');
  }

  disposables.dispose();
  disposables = null;
}

function consumeWorkspaceViewsService(api) {
  if (!(disposables != null)) {
    throw new Error('Invariant violation: "disposables != null"');
  }

  disposables.add(api.addOpener(uri => {
    if (uri === (_Inspector2 || _load_Inspector2()).WORKSPACE_VIEW_URI) {
      return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.default.createElement((_Inspector || _load_Inspector()).default, null));
    }
  }), () => api.destroyWhere(item => item instanceof (_Inspector || _load_Inspector()).default), atom.commands.add('atom-workspace', 'nuclide-react-inspector:toggle', event => {
    api.toggle((_Inspector2 || _load_Inspector2()).WORKSPACE_VIEW_URI, event.detail);
  }));
}