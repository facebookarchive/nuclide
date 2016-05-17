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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.consumeBlameGutterClass = consumeBlameGutterClass;
exports.consumeBlameProvider = consumeBlameProvider;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var PACKAGES_MISSING_MESSAGE = 'Could not open blame: the nuclide-blame package needs other Atom packages to provide:\n  - a gutter UI class\n  - at least one blame provider\n\nYou are missing one of these.';

var TOGGLE_BLAME_FILE_TREE_CONTEXT_MENU_PRIORITY = 2000;

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._registeredProviders = new Set();
    this._textEditorToBlameGutter = new Map();
    this._textEditorToDestroySubscription = new Map();
    this._packageDisposables = new (_atom2 || _atom()).CompositeDisposable();
    this._packageDisposables.add(atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Toggle Blame',
        command: 'nuclide-blame:toggle-blame',
        shouldDisplay: function shouldDisplay(event) {
          return _this._canShowBlame() || _this._canHideBlame();
        }
      }]
    }));
    this._packageDisposables.add(atom.commands.add('atom-text-editor', 'nuclide-blame:toggle-blame', function () {
      if (_this._canShowBlame()) {
        _this._showBlame();
      } else if (_this._canHideBlame()) {
        _this._hideBlame();
      }
    }));
  }

  /**
   * @return list of nodes against which "Toggle Blame" is an appropriate action.
   */

  _createDecoratedClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._packageDisposables.dispose();
      this._registeredProviders.clear();
      this._textEditorToBlameGutter.clear();
      for (var disposable of this._textEditorToDestroySubscription.values()) {
        disposable.dispose();
      }
      this._textEditorToDestroySubscription.clear();
    }

    /**
     * Section: Managing Gutters
     */

  }, {
    key: '_removeBlameGutterForEditor',
    value: function _removeBlameGutterForEditor(editor) {
      var blameGutter = this._textEditorToBlameGutter.get(editor);
      if (blameGutter != null) {
        blameGutter.destroy();
        this._textEditorToBlameGutter.delete(editor);
      }
    }
  }, {
    key: '_showBlameGutterForEditor',
    value: function _showBlameGutterForEditor(editor) {
      var _this2 = this;

      if (this._blameGutterClass == null || this._registeredProviders.size === 0) {
        atom.notifications.addInfo(PACKAGES_MISSING_MESSAGE);
        return;
      }

      var blameGutter = this._textEditorToBlameGutter.get(editor);
      if (!blameGutter) {
        var providerForEditor = null;
        for (var blameProvider of this._registeredProviders) {
          if (blameProvider.canProvideBlameForEditor(editor)) {
            providerForEditor = blameProvider;
            break;
          }
        }

        if (providerForEditor) {
          var blameGutterClass = this._blameGutterClass;
          (0, (_assert2 || _assert()).default)(blameGutterClass);
          blameGutter = new blameGutterClass('nuclide-blame', editor, providerForEditor);
          this._textEditorToBlameGutter.set(editor, blameGutter);
          var destroySubscription = editor.onDidDestroy(function () {
            return _this2._editorWasDestroyed(editor);
          });
          this._textEditorToDestroySubscription.set(editor, destroySubscription);

          var _require = require('../../nuclide-analytics');

          var track = _require.track;

          track('blame-open', {
            editorPath: editor.getPath() || ''
          });
        } else {
          atom.notifications.addInfo('Could not open blame: no blame information currently available for this file.');
          var logger = require('../../nuclide-logging').getLogger();
          logger.info('nuclide-blame: Could not open blame: no blame provider currently available for this ' + ('file: ' + String(editor.getPath())));
        }
      }
    }
  }, {
    key: '_editorWasDestroyed',
    value: function _editorWasDestroyed(editor) {
      var blameGutter = this._textEditorToBlameGutter.get(editor);
      if (blameGutter) {
        blameGutter.destroy();
        this._textEditorToBlameGutter.delete(editor);
      }
      this._textEditorToDestroySubscription.delete(editor);
    }

    /**
     * Section: Managing Context Menus
     */

  }, {
    key: '_showBlame',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('blame.showBlame')],
    value: function _showBlame(event) {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        this._showBlameGutterForEditor(editor);
      }
    }
  }, {
    key: '_hideBlame',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('blame.hideBlame')],
    value: function _hideBlame(event) {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        this._removeBlameGutterForEditor(editor);
      }
    }
  }, {
    key: '_canShowBlame',
    value: function _canShowBlame() {
      var editor = atom.workspace.getActiveTextEditor();
      return !(editor != null && this._textEditorToBlameGutter.has(editor));
    }
  }, {
    key: '_canHideBlame',
    value: function _canHideBlame() {
      var editor = atom.workspace.getActiveTextEditor();
      return editor != null && this._textEditorToBlameGutter.has(editor);
    }

    /**
     * Section: Consuming Services
     */

  }, {
    key: 'consumeBlameGutterClass',
    value: function consumeBlameGutterClass(blameGutterClass) {
      var _this3 = this;

      // This package only expects one gutter UI. It will take the first one.
      if (this._blameGutterClass == null) {
        this._blameGutterClass = blameGutterClass;
        return new (_atom2 || _atom()).Disposable(function () {
          _this3._blameGutterClass = null;
        });
      } else {
        return new (_atom2 || _atom()).Disposable(function () {});
      }
    }
  }, {
    key: 'consumeBlameProvider',
    value: function consumeBlameProvider(provider) {
      var _this4 = this;

      this._registeredProviders.add(provider);
      return new (_atom2 || _atom()).Disposable(function () {
        if (_this4._registeredProviders) {
          _this4._registeredProviders.delete(provider);
        }
      });
    }
  }, {
    key: 'addItemsToFileTreeContextMenu',
    value: function addItemsToFileTreeContextMenu(contextMenu) {
      var _this5 = this;

      var contextDisposable = contextMenu.addItemToSourceControlMenu({
        label: 'Toggle Blame',
        callback: _asyncToGenerator(function* () {
          findBlameableNodes(contextMenu).forEach(_asyncToGenerator(function* (node) {
            var editor = yield (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(node.uri);
            atom.commands.dispatch(atom.views.getView(editor), 'nuclide-blame:toggle-blame');
          }));
        }),
        shouldDisplay: function shouldDisplay() {
          return findBlameableNodes(contextMenu).length > 0;
        }
      }, TOGGLE_BLAME_FILE_TREE_CONTEXT_MENU_PRIORITY);

      this._packageDisposables.add(contextDisposable);
      // We don't need to dispose of the contextDisposable when the provider is disabled -
      // it needs to be handled by the provider itself. We only should remove it from the list
      // of the disposables we maintain.
      return new (_atom2 || _atom()).Disposable(function () {
        return _this5._packageDisposables.remove(contextDisposable);
      });
    }
  }]);

  return Activation;
})();

function findBlameableNodes(contextMenu) {
  var nodes = [];
  for (var node of contextMenu.getSelectedNodes()) {
    if (node == null || !node.uri) {
      continue;
    }
    var repo = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(node.uri);
    if (!node.isContainer && repo != null && repo.getType() === 'hg') {
      nodes.push(node);
    }
  }
  return nodes;
}

var activation = undefined;

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

function consumeBlameGutterClass(blameGutter) {
  (0, (_assert2 || _assert()).default)(activation);
  return activation.consumeBlameGutterClass(blameGutter);
}

function consumeBlameProvider(provider) {
  (0, (_assert2 || _assert()).default)(activation);
  return activation.consumeBlameProvider(provider);
}

function addItemsToFileTreeContextMenu(contextMenu) {
  (0, (_assert2 || _assert()).default)(activation);
  return activation.addItemsToFileTreeContextMenu(contextMenu);
}

// Map of a TextEditor to its BlameGutter, if it exists.

// Map of a TextEditor to the subscription on its ::onDidDestroy.