var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _BreakpointDisplayController2;

function _BreakpointDisplayController() {
  return _BreakpointDisplayController2 = _interopRequireDefault(require('./BreakpointDisplayController'));
}

var BreakpointManager = (function () {
  function BreakpointManager(store, debuggerActions) {
    _classCallCheck(this, BreakpointManager);

    this._breakpointStore = store;
    this._debuggerActions = debuggerActions;
    this._displayControllers = new Map();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(atom.workspace.observeTextEditors(this._handleTextEditor.bind(this)));
  }

  _createClass(BreakpointManager, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
      this._displayControllers.forEach(function (controller) {
        return controller.dispose();
      });
      this._displayControllers.clear();
    }

    /**
     * Used for testing.
     */
  }, {
    key: 'getDisplayControllers',
    value: function getDisplayControllers() {
      return this._displayControllers;
    }

    /**
     * Delegate callback from BreakpointDisplayController.
     */
  }, {
    key: 'handleTextEditorDestroyed',
    value: function handleTextEditorDestroyed(controller) {
      controller.dispose();
      this._displayControllers.delete(controller.getEditor());
    }
  }, {
    key: '_handleTextEditor',
    value: function _handleTextEditor(editor) {
      if (!this._displayControllers.has(editor)) {
        var controller = new (_BreakpointDisplayController2 || _BreakpointDisplayController()).default(this, this._breakpointStore, editor, this._debuggerActions);
        this._displayControllers.set(editor, controller);
      }
    }
  }]);

  return BreakpointManager;
})();

module.exports = BreakpointManager;