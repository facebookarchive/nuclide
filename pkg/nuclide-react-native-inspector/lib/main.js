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
exports.consumeWorkspaceViewsService = consumeWorkspaceViewsService;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomViewableFromReactElement2;

function _commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement2 = require('../../commons-atom/viewableFromReactElement');
}

var _uiInspector2;

function _uiInspector() {
  return _uiInspector2 = _interopRequireDefault(require('./ui/Inspector'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var disposables = null;

function activate() {
  disposables = new (_atom2 || _atom()).CompositeDisposable();
}

function deactivate() {
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.dispose();
  disposables = null;
}

function consumeWorkspaceViewsService(api) {
  (0, (_assert2 || _assert()).default)(disposables != null);
  disposables.add(api.registerFactory({
    id: 'nuclide-react-native-inspector',
    name: 'React Native Inspector',
    toggleCommand: 'nuclide-react-native-inspector:toggle',
    defaultLocation: 'pane',
    create: function create() {
      return (0, (_commonsAtomViewableFromReactElement2 || _commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom2 || _reactForAtom()).React.createElement((_uiInspector2 || _uiInspector()).default, null));
    },
    isInstance: function isInstance(item) {
      return item instanceof (_uiInspector2 || _uiInspector()).default;
    }
  }));
}