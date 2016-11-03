'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

var _Inspector;

function _load_Inspector() {
  return _Inspector = _interopRequireDefault(require('./ui/Inspector'));
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let disposables = null;function activate() {
  disposables = new _atom.CompositeDisposable();
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

  disposables.add(api.registerFactory({
    id: 'nuclide-react-inspector',
    name: 'React Inspector',
    toggleCommand: 'nuclide-react-inspector:toggle',
    defaultLocation: 'pane',
    create: () => (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_reactForAtom.React.createElement((_Inspector || _load_Inspector()).default, null)),
    isInstance: item => item instanceof (_Inspector || _load_Inspector()).default
  }));
}