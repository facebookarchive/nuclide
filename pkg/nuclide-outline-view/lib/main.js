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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomActiveEditorRegistry2;

function _commonsAtomActiveEditorRegistry() {
  return _commonsAtomActiveEditorRegistry2 = _interopRequireDefault(require('../../commons-atom/ActiveEditorRegistry'));
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _OutlineViewPanel2;

function _OutlineViewPanel() {
  return _OutlineViewPanel2 = require('./OutlineViewPanel');
}

var _createOutlines2;

function _createOutlines() {
  return _createOutlines2 = require('./createOutlines');
}

var NUX_OUTLINE_VIEW_TOUR = 'nuclide_outline_view_nux';
var NUX_OUTLINE_VIEW_ID = 4342;
var GK_NUX_OUTLINE_VIEW = 'mp_nuclide_outline_view_nux';

/**
 * Includes additional information that is useful to the UI, but redundant or nonsensical for
 * providers to include in their responses.
 */

var Activation = (function () {
  _createClass(Activation, [{
    key: '_createOutlineViewNuxTourModel',
    value: function _createOutlineViewNuxTourModel() {
      var outlineViewToolbarIconNux = {
        content: 'Check out the new Outline View!',
        selector: '.nuclide-outline-view-toolbar-button',
        position: 'auto',
        completionPredicate: function completionPredicate() {
          return document.querySelector('div.nuclide-outline-view') != null;
        }
      };

      var outlineViewPanelNux = {
        content: 'Click on a symbol to jump to its definition.',
        selector: 'div.pane-item.nuclide-outline-view',
        position: 'left'
      };

      var isValidFileTypeForNux = function isValidFileTypeForNux(editor) {
        if (editor == null) {
          return false;
        }
        var path = editor.getPath();
        if (path == null) {
          return false;
        }
        return path.endsWith('.js') || path.endsWith('.php');
      };

      var isOutlineViewClosed = function isOutlineViewClosed() {
        return document.querySelector('.nuclide-outline-view') == null;
      };
      var triggerCallback = function triggerCallback(editor) {
        return isOutlineViewClosed() && isValidFileTypeForNux(editor);
      };

      var nuxTriggerModel = {
        triggerType: 'editor',
        triggerCallback: triggerCallback
      };

      var outlineViewNuxTour = {
        id: NUX_OUTLINE_VIEW_ID,
        name: NUX_OUTLINE_VIEW_TOUR,
        nuxList: [outlineViewToolbarIconNux, outlineViewPanelNux],
        trigger: nuxTriggerModel,
        gatekeeperID: GK_NUX_OUTLINE_VIEW
      };

      return outlineViewNuxTour;
    }
  }]);

  function Activation() {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    this._editorService = new (_commonsAtomActiveEditorRegistry2 || _commonsAtomActiveEditorRegistry()).default(function (provider, editor) {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-outline-view-getoutline');
      return provider.getOutline(editor);
    });
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'consumeOutlineProvider',
    value: function consumeOutlineProvider(provider) {
      return this._editorService.consumeProvider(provider);
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-outline-view');

      var _toolBar$addButton = toolBar.addButton({
        icon: 'list-unordered',
        callback: 'nuclide-outline-view:toggle',
        tooltip: 'Toggle Outline View',
        priority: 350 });

      var element = _toolBar$addButton.element;

      // Class added is not defined elsewhere, and is just used to mark the toolbar button
      // Between diff view and test runner
      element.classList.add('nuclide-outline-view-toolbar-button');
      var disposable = new (_atom2 || _atom()).Disposable(function () {
        toolBar.removeItems();
      });
      this._disposables.add(disposable);
      return disposable;
    }
  }, {
    key: '_createOutlineViewPanelState',
    value: function _createOutlineViewPanelState() {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-outline-view-show');
      return new (_OutlineViewPanel2 || _OutlineViewPanel()).OutlineViewPanelState((0, (_createOutlines2 || _createOutlines()).createOutlines)(this._editorService));
    }
  }, {
    key: 'consumeWorkspaceViewsService',
    value: function consumeWorkspaceViewsService(api) {
      var _this = this;

      this._disposables.add(api.registerFactory({
        id: 'nuclide-outline-view',
        name: 'Outline View',
        iconName: 'list-unordered',
        toggleCommand: 'nuclide-outline-view:toggle',
        defaultLocation: 'right-panel',
        create: function create() {
          return _this._createOutlineViewPanelState();
        },
        isInstance: function isInstance(item) {
          return item instanceof (_OutlineViewPanel2 || _OutlineViewPanel()).OutlineViewPanelState;
        }
      }));
    }
  }, {
    key: 'deserializeOutlineViewPanelState',
    value: function deserializeOutlineViewPanelState() {
      return this._createOutlineViewPanelState();
    }
  }, {
    key: 'getOutlineViewResultsStream',
    value: function getOutlineViewResultsStream() {
      var _this2 = this;

      return {
        getResultsStream: function getResultsStream() {
          return _this2._editorService.getResultsStream();
        }
      };
    }
  }, {
    key: 'consumeRegisterNuxService',
    value: function consumeRegisterNuxService(addNewNux) {
      var disposable = addNewNux(this._createOutlineViewNuxTourModel());
      this._disposables.add(disposable);
      return disposable;
    }
  }, {
    key: 'getHomeFragments',
    value: function getHomeFragments() {
      return {
        feature: {
          title: 'Outline View',
          icon: 'list-unordered',
          description: 'Displays major components of the current file (classes, methods, etc.)',
          command: function command() {
            atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-outline-view:toggle', { visible: true });
          }
        },
        priority: 2.5 };
    }
  }]);

  return Activation;
})();

// Between diff view and test runner
exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;

// The initial state at startup.

// The thing that currently has focus is not a text editor.

// Currently awaiting results from a provider (for longer than a certain delay).

// Indicates that no provider is registered for the given grammar.

// Human-readable name for the grammar.

// Indicates that a provider is registered but that it did not return an outline.

/**
 * Use a TextEditor instead of a path so that:
 * - If there are multiple editors for a file, we always jump to outline item
 *   locations in the correct editor.
 * - Jumping to outline item locations works for new, unsaved files.
 */

// If there are multiple providers for a given grammar, the one with the highest priority will be
// used.