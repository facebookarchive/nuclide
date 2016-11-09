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
exports.initRefactorUIs = initRefactorUIs;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _reactForAtom = require('react-for-atom');

var _MainRefactorComponent;

function _load_MainRefactorComponent() {
  return _MainRefactorComponent = require('./components/MainRefactorComponent');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const refactorUIFactories = [genericRefactorUI];

function initRefactorUIs(store) {
  const disposables = refactorUIFactories.map(uiFn => uiFn(store));
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(...disposables);
}

function genericRefactorUI(store) {
  let panel;
  const disposeFn = store.subscribe(() => {
    const state = store.getState();
    if (state.type === 'open' && state.ui === 'generic') {
      if (panel == null) {
        const element = document.createElement('div');
        panel = atom.workspace.addModalPanel({ item: element });
      }
      _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_MainRefactorComponent || _load_MainRefactorComponent()).MainRefactorComponent, {
        appState: state,
        store: store
      }), panel.getItem());
    } else {
      if (panel != null) {
        _reactForAtom.ReactDOM.unmountComponentAtNode(panel.getItem());
        panel.destroy();
        panel = null;
      }
    }
  });
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(disposeFn);
}