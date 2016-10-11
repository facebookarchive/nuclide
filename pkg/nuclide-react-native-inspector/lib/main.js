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

var _commonsAtomViewableFromReactElement;

function _load_commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _uiInspector;

function _load_uiInspector() {
  return _uiInspector = _interopRequireDefault(require('./ui/Inspector'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var disposables = null;

function activate() {
  disposables = new (_atom || _load_atom()).CompositeDisposable();
}

function deactivate() {
  (0, (_assert || _load_assert()).default)(disposables != null);
  disposables.dispose();
  disposables = null;
}

function consumeWorkspaceViewsService(api) {
  (0, (_assert || _load_assert()).default)(disposables != null);
  disposables.add(api.registerFactory({
    id: 'nuclide-react-native-inspector',
    name: 'React Native Inspector',
    toggleCommand: 'nuclide-react-native-inspector:toggle',
    defaultLocation: 'pane',
    create: function create() {
      return (0, (_commonsAtomViewableFromReactElement || _load_commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom || _load_reactForAtom()).React.createElement((_uiInspector || _load_uiInspector()).default, null));
    },
    isInstance: function isInstance(item) {
      return item instanceof (_uiInspector || _load_uiInspector()).default;
    }
  }));
}