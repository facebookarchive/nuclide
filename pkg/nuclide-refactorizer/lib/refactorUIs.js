'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initRefactorUIs = initRefactorUIs;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _MainRefactorComponent;

function _load_MainRefactorComponent() {
  return _MainRefactorComponent = require('./components/MainRefactorComponent');
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('./refactorActions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const refactorUIFactories = [genericRefactorUI, closeOnEscape, focusEditorOnClose, renameShortcut];

function initRefactorUIs(store) {
  const disposables = refactorUIFactories.map(uiFn => uiFn(store));
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(...disposables);
}

function genericRefactorUI(store) {
  const renderer = new GenericUIRenderer(store);
  const disposeFn = store.subscribe(() => {
    const state = store.getState();
    if (state.type === 'closed' || state.type === 'open' && state.ui === 'generic') {
      renderer.renderState(state);
    }
  });
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(disposeFn);
}

function closeOnEscape(store) {
  let escapeSubscription = null;
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(store.subscribe(() => {
    const state = store.getState();
    if (state.type === 'open' && escapeSubscription == null) {
      escapeSubscription = atom.commands.add('body', 'core:cancel', () => {
        store.dispatch((_refactorActions || _load_refactorActions()).close());
      });
    } else if (state.type === 'closed') {
      if (!(escapeSubscription != null)) {
        throw new Error('Invariant violation: "escapeSubscription != null"');
      }

      escapeSubscription.dispose();
      escapeSubscription = null;
    }
  }));
}

function focusEditorOnClose(store) {
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(store.subscribe(() => {
    const state = store.getState();
    if (state.type === 'closed') {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      const pane = atom.workspace.paneForItem(editor);
      if (pane == null) {
        return;
      }
      pane.activate();
      pane.activateItem(editor);
    }
  }));
}

function renameShortcut(store) {
  const renderer = new GenericUIRenderer(store);
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(store.subscribe(() => {
    const state = store.getState();
    if (state.type === 'closed') {
      renderer.renderState(state);
      return;
    }
    if (state.ui === 'rename') {
      const { phase } = state;
      switch (phase.type) {
        case 'pick':
          let renameRefactoring = null;
          for (const refactoring of phase.availableRefactorings) {
            if (refactoring.kind === 'rename' || refactoring.kind === 'freeform' && refactoring.disabled !== false && refactoring.name.match(/rename/i)) {
              renameRefactoring = refactoring;
              break;
            }
          }
          if (renameRefactoring == null) {
            atom.notifications.addWarning('Unable to rename at this location');
            store.dispatch((_refactorActions || _load_refactorActions()).close());
          } else {
            store.dispatch((_refactorActions || _load_refactorActions()).pickedRefactor(renameRefactoring));
          }
          break;
        default:
          renderer.renderState(state);
      }
    }
  }));
}

class GenericUIRenderer {

  constructor(store) {
    this._store = store;
  }

  renderState(state) {
    if (state.type === 'open') {
      if (this._panel == null) {
        const element = document.createElement('div');
        this._panel = atom.workspace.addModalPanel({ item: element });
      }
      _reactDom.default.render(_react.createElement((_MainRefactorComponent || _load_MainRefactorComponent()).MainRefactorComponent, { appState: state, store: this._store }), this._panel.getItem());
    } else {
      if (this._panel != null) {
        const panel = this._panel;
        _reactDom.default.unmountComponentAtNode(panel.getItem());
        panel.destroy();
        this._panel = null;
      }
    }
  }
}