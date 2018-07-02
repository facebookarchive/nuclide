"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initRefactorUIs = initRefactorUIs;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _MainRefactorComponent() {
  const data = require("./components/MainRefactorComponent");

  _MainRefactorComponent = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./refactorActions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const refactorUIFactories = [genericRefactorUI, closeOnEscape, focusEditorOnClose, renameShortcut];

function initRefactorUIs(store) {
  const disposables = refactorUIFactories.map(uiFn => uiFn(store));
  return new (_UniversalDisposable().default)(...disposables);
}

function genericRefactorUI(store) {
  const renderer = new GenericUIRenderer(store);
  const disposeFn = store.subscribe(() => {
    const state = store.getState();

    if (state.type === 'closed' || state.type === 'open' && state.ui === 'generic') {
      renderer.renderState(state);
    }
  });
  return new (_UniversalDisposable().default)(disposeFn);
}

function closeOnEscape(store) {
  let escapeSubscription = null;
  return new (_UniversalDisposable().default)(store.subscribe(() => {
    const state = store.getState();

    if (state.type === 'open' && escapeSubscription == null) {
      escapeSubscription = atom.commands.add('body', 'core:cancel', () => {
        store.dispatch(Actions().close());
      });
    } else if (state.type === 'closed') {
      if (!(escapeSubscription != null)) {
        throw new Error("Invariant violation: \"escapeSubscription != null\"");
      }

      escapeSubscription.dispose();
      escapeSubscription = null;
    }
  }));
}

function focusEditorOnClose(store) {
  return new (_UniversalDisposable().default)(store.subscribe(() => {
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
  return new (_UniversalDisposable().default)(store.subscribe(() => {
    const state = store.getState();

    if (state.type === 'closed') {
      renderer.renderState(state);
      return;
    }

    if (state.ui === 'rename') {
      const {
        phase
      } = state;

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
            store.dispatch(Actions().close());
          } else {
            store.dispatch(Actions().pickedRefactor(renameRefactoring));
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
        this._panel = atom.workspace.addModalPanel({
          item: element
        });
      }

      _reactDom.default.render(React.createElement(_MainRefactorComponent().MainRefactorComponent, {
        appState: state,
        store: this._store
      }), this._panel.getItem());
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