"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initRefactorUIs = initRefactorUIs;

function _ReactMountRootElement() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-ui/ReactMountRootElement"));

  _ReactMountRootElement = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _atom = require("atom");

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _RenameComponent() {
  const data = _interopRequireDefault(require("./components/RenameComponent"));

  _RenameComponent = function () {
    return data;
  };

  return data;
}

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
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
  const genericRenderer = new GenericUIRenderer(store);
  const inlineRenameRenderer = new InlineRenameRenderer(store);
  const disposeFn = store.subscribe(() => {
    const state = store.getState();

    if (state.type === 'closed' || state.type === 'open' && (state.ui === 'generic' || state.ui === 'rename')) {
      genericRenderer.renderState(state);
      inlineRenameRenderer.renderState(state);
    }
  });
  return new (_UniversalDisposable().default)(disposeFn, genericRenderer, inlineRenameRenderer);
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
    if (state.type === 'open' && state.phase.type !== 'rename' && !(state.ui === 'rename' && state.phase.type === 'execute')) {
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
      this.dispose();
    }
  }

  dispose() {
    if (this._panel != null) {
      const panel = this._panel;

      _reactDom.default.unmountComponentAtNode(panel.getItem());

      panel.destroy();
      this._panel = null;
    }
  }

}

class InlineRenameRenderer {
  constructor(store) {
    this._store = store;
  }

  renderRenameInput(editor, selectedText, provider, symbolPosition) {
    return React.createElement(_RenameComponent().default, {
      selectedText: selectedText,
      provider: provider,
      parentEditor: editor,
      store: this._store,
      symbolPosition: symbolPosition
    });
  }

  mountRenameInput(editor, mountPosition, container, element) {
    const overlayMarker = editor.markBufferRange(new _atom.Range(mountPosition, mountPosition), {
      invalidate: 'never'
    });
    editor.decorateMarker(overlayMarker, {
      type: 'overlay',
      position: 'tail',
      item: container
    });
    return new (_UniversalDisposable().default)(() => overlayMarker.destroy(), () => _reactDom.default.unmountComponentAtNode(container), // The editor may not mount the marker until the next update.
    // It's not safe to render anything until that point, as overlayed containers
    // often need to measure their size in the DOM.
    _RxMin.Observable.from(editor.getElement().getNextUpdatePromise()).subscribe(() => {
      container.style.display = 'block';

      _reactDom.default.render(element, container);
    }), // After enabling `insert-mode` in RenameComponent.js for those who use
    //  the `vim-mode-plus` package, the user has to press `esc` to return to `normal-mode`.
    //  We execute this command manually for them here.
    //  Since most users of this package operate by default in normal mode,
    //  we assume that they'd like to return to this mode after executing the rename.
    () => atom.commands.dispatch(atom.views.getView(editor), 'vim-mode-plus:activate-normal-mode'));
  }

  renderState(state) {
    if (state.type === 'open' && state.phase.type === 'rename') {
      const container = new (_ReactMountRootElement().default)();
      container.className = 'nuclide-refactorizer-rename-container';
      const {
        provider,
        editor,
        selectedText,
        mountPosition,
        symbolPosition
      } = state.phase;
      const renameElement = this.renderRenameInput(editor, selectedText, provider, symbolPosition);
      this._disposable = this.mountRenameInput(editor, mountPosition, container, renameElement);
    } else {
      this.dispose();
    }
  }

  dispose() {
    if (this._disposable != null) {
      this._disposable.dispose();

      this._disposable = null;
    }
  }

}