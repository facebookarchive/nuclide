'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeBlameProvider = consumeBlameProvider;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;

var _atom = require('atom');

var _BlameGutter;

function _load_BlameGutter() {
  return _BlameGutter = _interopRequireDefault(require('./BlameGutter'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PACKAGES_MISSING_MESSAGE = 'Could not open blame. Missing at least one blame provider.'; /**
                                                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                * All rights reserved.
                                                                                                *
                                                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                                                * the root directory of this source tree.
                                                                                                *
                                                                                                * 
                                                                                                * @format
                                                                                                */

const TOGGLE_BLAME_FILE_TREE_CONTEXT_MENU_PRIORITY = 2000;

class Activation {
  // Map of a TextEditor to its BlameGutter, if it exists.
  constructor() {
    this._registeredProviders = new Set();
    this._textEditorToBlameGutter = new Map();
    this._textEditorToDestroySubscription = new Map();
    this._packageDisposables = new _atom.CompositeDisposable();
    this._packageDisposables.add(atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Source Control',
        submenu: [{
          label: 'Toggle Blame',
          command: 'nuclide-blame:toggle-blame',
          shouldDisplay: event => this._canShowBlame() || this._canHideBlame()
        }]
      }]
    }));
    this._packageDisposables.add(atom.commands.add('atom-text-editor', 'nuclide-blame:toggle-blame', () => {
      if (this._canShowBlame()) {
        this._showBlame();
      } else if (this._canHideBlame()) {
        this._hideBlame();
      }
    }), atom.commands.add('atom-text-editor', 'nuclide-blame:hide-blame', () => {
      if (this._canHideBlame()) {
        this._hideBlame();
      }
    }));
  }
  // Map of a TextEditor to the subscription on its ::onDidDestroy.


  dispose() {
    this._packageDisposables.dispose();
    this._registeredProviders.clear();
    this._textEditorToBlameGutter.clear();
    for (const disposable of this._textEditorToDestroySubscription.values()) {
      disposable.dispose();
    }
    this._textEditorToDestroySubscription.clear();
  }

  /**
   * Section: Managing Gutters
   */

  _removeBlameGutterForEditor(editor) {
    const blameGutter = this._textEditorToBlameGutter.get(editor);
    if (blameGutter != null) {
      blameGutter.destroy();
      this._textEditorToBlameGutter.delete(editor);
    }
  }

  _showBlameGutterForEditor(editor) {
    if (this._registeredProviders.size === 0) {
      atom.notifications.addInfo(PACKAGES_MISSING_MESSAGE);
      return;
    }

    let blameGutter = this._textEditorToBlameGutter.get(editor);
    if (!blameGutter) {
      let providerForEditor = null;
      for (const blameProvider of this._registeredProviders) {
        if (blameProvider.canProvideBlameForEditor(editor)) {
          providerForEditor = blameProvider;
          break;
        }
      }

      if (providerForEditor) {
        blameGutter = new (_BlameGutter || _load_BlameGutter()).default('nuclide-blame', editor, providerForEditor);
        this._textEditorToBlameGutter.set(editor, blameGutter);
        const destroySubscription = editor.onDidDestroy(() => this._editorWasDestroyed(editor));
        this._textEditorToDestroySubscription.set(editor, destroySubscription);

        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('blame-open', {
          editorPath: editor.getPath() || ''
        });
      } else {
        atom.notifications.addInfo('Could not open blame: no blame information currently available for this file.');

        (0, (_log4js || _load_log4js()).getLogger)('nuclide-blame').info('nuclide-blame: Could not open blame: no blame provider currently available for this ' + `file: ${String(editor.getPath())}`);
      }
    }
  }

  _editorWasDestroyed(editor) {
    const blameGutter = this._textEditorToBlameGutter.get(editor);
    if (blameGutter) {
      blameGutter.destroy();
      this._textEditorToBlameGutter.delete(editor);
    }
    this._textEditorToDestroySubscription.delete(editor);
  }

  /**
   * Section: Managing Context Menus
   */

  _showBlame(event) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('blame.showBlame', () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        this._showBlameGutterForEditor(editor);
      }
    });
  }

  _hideBlame(event) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('blame.hideBlame', () => {
      const editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        this._removeBlameGutterForEditor(editor);
      }
    });
  }

  _canShowBlame() {
    const editor = atom.workspace.getActiveTextEditor();
    return !(editor != null && this._textEditorToBlameGutter.has(editor));
  }

  _canHideBlame() {
    const editor = atom.workspace.getActiveTextEditor();
    return editor != null && this._textEditorToBlameGutter.has(editor);
  }

  /**
   * Section: Consuming Services
   */

  consumeBlameProvider(provider) {
    this._registeredProviders.add(provider);
    return new _atom.Disposable(() => {
      if (this._registeredProviders) {
        this._registeredProviders.delete(provider);
      }
    });
  }

  addItemsToFileTreeContextMenu(contextMenu) {
    const contextDisposable = contextMenu.addItemToSourceControlMenu({
      label: 'Toggle Blame',
      callback() {
        findBlameableNodes(contextMenu).forEach((() => {
          var _ref = (0, _asyncToGenerator.default)(function* (node) {
            const editor = yield (0, (_goToLocation || _load_goToLocation()).goToLocation)(node.uri);
            atom.commands.dispatch(atom.views.getView(editor), 'nuclide-blame:toggle-blame');
          });

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        })());
      },
      shouldDisplay() {
        return findBlameableNodes(contextMenu).length > 0;
      }
    }, TOGGLE_BLAME_FILE_TREE_CONTEXT_MENU_PRIORITY);

    this._packageDisposables.add(contextDisposable);
    // We don't need to dispose of the contextDisposable when the provider is disabled -
    // it needs to be handled by the provider itself. We only should remove it from the list
    // of the disposables we maintain.
    return new _atom.Disposable(() => this._packageDisposables.remove(contextDisposable));
  }
}

/**
 * @return list of nodes against which "Toggle Blame" is an appropriate action.
 */
function findBlameableNodes(contextMenu) {
  const nodes = [];
  for (const node of contextMenu.getSelectedNodes()) {
    if (node == null || !node.uri) {
      continue;
    }
    const repo = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(node.uri);
    if (!node.isContainer && repo != null && repo.getType() === 'hg') {
      nodes.push(node);
    }
  }
  return nodes;
}

let activation;

function activate(state) {
  if (!activation) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}

function consumeBlameProvider(provider) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.consumeBlameProvider(provider);
}

function addItemsToFileTreeContextMenu(contextMenu) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.addItemsToFileTreeContextMenu(contextMenu);
}