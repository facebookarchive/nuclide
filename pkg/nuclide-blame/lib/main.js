'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeBlameProvider = consumeBlameProvider;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;

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
  return _goToLocation = require('../../../modules/nuclide-commons-atom/go-to-location');
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../../modules/nuclide-commons-atom/text-editor');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _BlameToggle;

function _load_BlameToggle() {
  return _BlameToggle = _interopRequireDefault(require('./BlameToggle'));
}

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

const PACKAGES_MISSING_MESSAGE = 'Could not open blame. Missing at least one blame provider.';
const TOGGLE_BLAME_FILE_TREE_CONTEXT_MENU_PRIORITY = 2000;

class Activation {
  // Map of a TextEditor to its BlameGutter, if it exists.
  constructor() {
    this._registeredProviders = new Set();
    this._textEditorToBlameGutter = new Map();
    this._textEditorToBlameToggle = new Map();
    this._textEditorToDestroySubscription = new Map();
    this._packageDisposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._packageDisposables.add(atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Source Control',
        submenu: [{
          label: 'Toggle Blame',
          command: 'nuclide-blame:toggle-blame',
          shouldDisplay: event => this._canShowBlame(true /* fromContextMenu */) || this._canHideBlame(true /* fromContextMenu */)
        }]
      }]
    }));
    this._packageDisposables.add(atom.commands.add('atom-workspace', 'nuclide-blame:toggle-blame', () => {
      if (this._canShowBlame()) {
        this._showBlame();
      } else if (this._canHideBlame()) {
        this._hideBlame();
      }
    }),
    // eslint-disable-next-line
    atom.commands.add('atom-workspace', 'nuclide-blame:hide-blame', () => {
      if (this._canHideBlame()) {
        this._hideBlame();
      }
    }));

    this._packageDisposables.add(atom.workspace.observeTextEditors(editor => {
      const button = new (_BlameToggle || _load_BlameToggle()).default(editor, this._hasProviderForEditor.bind(this));
      const disposeButton = () => button.destroy();
      this._packageDisposables.add(disposeButton);

      this._textEditorToBlameToggle.set(editor, button);
      this._textEditorToDestroySubscription.set(editor, editor.onDidDestroy(() => {
        this._packageDisposables.remove(disposeButton);
        this._editorWasDestroyed(editor);
      }));
    }));
  }
  // Map of a TextEditor to the subscription on its ::onDidDestroy.

  // Map of a TextEditor to its BlameToggle, if it exists.


  dispose() {
    this._packageDisposables.dispose();
    this._registeredProviders.clear();
    this._textEditorToBlameGutter.clear();
    this._textEditorToBlameToggle.clear();
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
      const providerForEditor = this._getProviderForEditor(editor);

      if (editor.isModified()) {
        atom.notifications.addInfo('There is blame information for this file, but only for saved changes. ' + 'Save, then try again.');
      } else if (providerForEditor) {
        blameGutter = new (_BlameGutter || _load_BlameGutter()).default('nuclide-blame', editor, providerForEditor);
        this._textEditorToBlameGutter.set(editor, blameGutter);

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

    const blameToggle = this._textEditorToBlameToggle.get(editor);
    if (blameToggle != null) {
      blameToggle.destroy();
      this._textEditorToBlameToggle.delete(editor);
    }

    const subscription = this._textEditorToDestroySubscription.get(editor);
    if (subscription != null) {
      subscription.dispose();
      this._textEditorToDestroySubscription.delete(editor);
    }
  }

  /**
   * Section: Managing Context Menus
   */

  _showBlame(event) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('blame.showBlame', () => {
      const editor = getMostRelevantEditor();
      if (editor != null) {
        this._showBlameGutterForEditor(editor);
      }
    });
  }

  _hideBlame(event) {
    return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('blame.hideBlame', () => {
      const editor = getMostRelevantEditor();
      if (editor != null) {
        this._removeBlameGutterForEditor(editor);
      }
    });
  }

  _canShowBlame(fromContextMenu = false) {
    const editor = getMostRelevantEditor(fromContextMenu);
    return editor != null && !this._textEditorToBlameGutter.has(editor);
  }

  _canHideBlame(fromContextMenu = false) {
    const editor = getMostRelevantEditor(fromContextMenu);
    return editor != null && this._textEditorToBlameGutter.has(editor);
  }

  /**
   * Section: Consuming Services
   */

  _getProviderForEditor(editor) {
    for (const blameProvider of this._registeredProviders) {
      if (blameProvider.canProvideBlameForEditor(editor)) {
        return blameProvider;
      }
    }

    return null;
  }

  _hasProviderForEditor(editor) {
    return Boolean(this._getProviderForEditor(editor) != null);
  }

  consumeBlameProvider(provider) {
    this._registeredProviders.add(provider);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      if (this._registeredProviders) {
        this._registeredProviders.delete(provider);
      }
    });
  }

  addItemsToFileTreeContextMenu(contextMenu) {
    const contextDisposable = contextMenu.addItemToSourceControlMenu({
      label: 'Toggle Blame',
      callback() {
        findBlameableNodes(contextMenu).forEach(async node => {
          const editor = await (0, (_goToLocation || _load_goToLocation()).goToLocation)(node.uri);
          atom.commands.dispatch(atom.views.getView(editor), 'nuclide-blame:toggle-blame');
        });
      },
      shouldDisplay() {
        return findBlameableNodes(contextMenu).length > 0;
      }
    }, TOGGLE_BLAME_FILE_TREE_CONTEXT_MENU_PRIORITY);

    this._packageDisposables.add(contextDisposable);
    // We don't need to dispose of the contextDisposable when the provider is disabled -
    // it needs to be handled by the provider itself. We only should remove it from the list
    // of the disposables we maintain.
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => this._packageDisposables.remove(contextDisposable));
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

function getMostRelevantEditor(fromContextMenu = false) {
  const editor = atom.workspace.getActiveTextEditor();
  if (fromContextMenu || editor != null) {
    return editor;
  }
  const item = atom.workspace.getCenter().getActivePane().getActiveItem();
  return (0, (_textEditor || _load_textEditor()).isValidTextEditor)(item) ? item : null;
}