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

exports.activate = activate;
exports.deactivate = deactivate;
exports.serialize = serialize;
exports.consumeOutlineProvider = consumeOutlineProvider;
exports.consumeToolBar = consumeToolBar;
exports.getHomeFragments = getHomeFragments;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;
exports.getOutlineViewResultsStream = getOutlineViewResultsStream;
exports.consumeRegisterNuxService = consumeRegisterNuxService;

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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var NUX_OUTLINE_VIEW_TOUR = 'nuclide-nux.outline-view-tour';
var GK_NUX_OUTLINE_VIEW = 'nuclide_outline_view_nux';

/**
 * Includes additional information that is useful to the UI, but redundant or nonsensical for
 * providers to include in their responses.
 */

var DEFAULT_WIDTH = 300; // px

function makeDefaultState() {
  return {
    width: DEFAULT_WIDTH,
    visible: false
  };
}

var Activation = (function () {
  _createClass(Activation, [{
    key: '_createOutlineViewNuxTourModel',
    value: function _createOutlineViewNuxTourModel() {
      var nuxTriggerOutline = {
        content: 'Check out the new Outline View!',
        isCustomContent: false,
        selector: '.nuclide-outline-view-toolbar-button',
        selectorFunction: null,
        position: 'auto',
        completionPredicate: function completionPredicate() {
          return document.querySelector('div.nuclide-outline-view') != null;
        }
      };

      var nuxOutlineView = {
        content: 'Click on a symbol to jump to its definition.',
        isCustomContent: false,
        selector: 'div.pane-item.nuclide-outline-view',
        selectorFunction: null,
        position: 'left',
        completionPredicate: null
      };

      var isJavaScriptFile = function isJavaScriptFile(editor) {
        if (editor == null) {
          return false;
        }
        var path = editor.getPath();
        if (path == null) {
          return false;
        }
        return path.endsWith('.js');
      };
      var isOutlineViewClosed = function isOutlineViewClosed() {
        return document.querySelector('.nuclide-outline-view') == null;
      };
      var triggerCallback = function triggerCallback(editor) {
        return isOutlineViewClosed() && isJavaScriptFile(editor);
      };
      var nuxTriggerModel = {
        triggerType: 'editor',
        triggerCallback: triggerCallback
      };

      var sampleOutlineNuxTour = {
        completed: false,
        id: NUX_OUTLINE_VIEW_TOUR,
        nuxList: [nuxTriggerOutline, nuxOutlineView],
        trigger: nuxTriggerModel,
        gatekeeperID: GK_NUX_OUTLINE_VIEW
      };

      return sampleOutlineNuxTour;
    }
  }]);

  function Activation() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? makeDefaultState() : arguments[0];

    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    this._editorService = new (_commonsAtomActiveEditorRegistry2 || _commonsAtomActiveEditorRegistry()).default(function (provider, editor) {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-outline-view-getoutline');
      return provider.getOutline(editor);
    });

    var panel = this._panel = new (_OutlineViewPanel2 || _OutlineViewPanel()).OutlineViewPanelState((0, (_createOutlines2 || _createOutlines()).createOutlines)(this._editorService), state.width, state.visible);
    this._disposables.add(panel);

    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-outline-view:toggle', panel.toggle.bind(panel)));
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-outline-view:show', panel.show.bind(panel)));
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-outline-view:hide', panel.hide.bind(panel)));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        visible: this._panel.isVisible(),
        width: this._panel.getWidth()
      };
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
      var toolBarButtonView = toolBar.addButton({
        icon: 'list-unordered',
        callback: 'nuclide-outline-view:toggle',
        tooltip: 'Toggle Outline View',
        priority: 350 });
      // Class added is not defined elsewhere, and is just used to mark the toolbar button
      // Between diff view and test runner
      toolBarButtonView.element.classList.add('nuclide-outline-view-toolbar-button');
      this._disposables.add(new (_atom2 || _atom()).Disposable(function () {
        toolBar.removeItems();
      }));
    }
  }, {
    key: 'getDistractionFreeModeProvider',
    value: function getDistractionFreeModeProvider() {
      var panel = this._panel;
      return {
        name: 'nuclide-outline-view',
        isVisible: panel.isVisible.bind(panel),
        toggle: panel.toggle.bind(panel)
      };
    }
  }, {
    key: 'getOutlineViewResultsStream',
    value: function getOutlineViewResultsStream() {
      var _this = this;

      return {
        getResultsStream: function getResultsStream() {
          return _this._editorService.getResultsStream();
        }
      };
    }
  }, {
    key: 'consumeRegisterNuxService',
    value: function consumeRegisterNuxService(addNewNux) {
      (0, (_assert2 || _assert()).default)(activation != null);
      var disposable = addNewNux(this._createOutlineViewNuxTourModel());
      this._disposables.add(disposable);
      return disposable;
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function serialize() {
  if (activation != null) {
    return activation.serialize();
  }
}

function consumeOutlineProvider(provider) {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.consumeOutlineProvider(provider);
}

function consumeToolBar(getToolBar) {
  (0, (_assert2 || _assert()).default)(activation != null);
  activation.consumeToolBar(getToolBar);
}

function getHomeFragments() {
  return {
    feature: {
      title: 'Outline View',
      icon: 'list-unordered',
      description: 'Displays major components of the current file (classes, methods, etc.)',
      command: 'nuclide-outline-view:show'
    },
    priority: 2.5 };
}

// Between diff view and test runner

function getDistractionFreeModeProvider() {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.getDistractionFreeModeProvider();
}

function getOutlineViewResultsStream() {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.getOutlineViewResultsStream();
}

function consumeRegisterNuxService(addNewNux) {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.consumeRegisterNuxService(addNewNux);
}

// Must be one or the other. If both are present, tokenizedText is preferred.

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