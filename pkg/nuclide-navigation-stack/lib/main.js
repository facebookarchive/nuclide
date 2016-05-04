Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _NavigationStackController = require('./NavigationStackController');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideCommons = require('../../nuclide-commons');

var controller = new _NavigationStackController.NavigationStackController();

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
  }

  _createClass(Activation, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      var subscribeEditor = function subscribeEditor(editor) {
        var cursorSubscription = editor.onDidChangeCursorPosition(function (event) {
          controller.updatePosition(editor, event.newBufferPosition);
        });
        var scrollSubscription = (0, _nuclideAtomHelpers.getViewOfEditor)(editor).onDidChangeScrollTop(function (scrollTop) {
          controller.updateScroll(editor, scrollTop);
        });
        _this._disposables.add(cursorSubscription);
        _this._disposables.add(scrollSubscription);
        var destroySubscription = editor.onDidDestroy(function () {
          controller.onDestroy(editor);
          _this._disposables.remove(cursorSubscription);
          _this._disposables.remove(scrollSubscription);
          _this._disposables.remove(destroySubscription);
        });
        _this._disposables.add(destroySubscription);
      };

      var addEditor = function addEditor(addEvent) {
        var editor = addEvent.textEditor;
        subscribeEditor(editor);
        controller.onCreate(editor);
      };

      atom.workspace.getTextEditors().forEach(subscribeEditor);
      this._disposables.add(atom.workspace.onDidAddTextEditor(addEditor));
      this._disposables.add(atom.workspace.onDidOpen(function (event) {
        if (atom.workspace.isTextEditor(event.item)) {
          controller.onOpen(event.item);
        }
      }));
      this._disposables.add(atom.workspace.observeActivePaneItem(function (item) {
        if (atom.workspace.isTextEditor(item)) {
          controller.onActivate(item);
        }
      }));
      this._disposables.add(atom.workspace.onDidStopChangingActivePaneItem(function (item) {
        if (atom.workspace.isTextEditor(item)) {
          controller.onActiveStopChanging(item);
        }
      }));
      this._disposables.add(_nuclideAtomHelpers.projects.onDidRemoveProjectPath(function (path) {
        controller.removePath(path, atom.project.getDirectories().map(function (directory) {
          return directory.getPath();
        }));
      }));
      this._disposables.add(new _nuclideCommons.DisposableSubscription((0, _nuclideAtomHelpers.observeNavigatingEditors)().subscribe(function (editor) {
        controller.onOptInNavigation(editor);
      })));

      this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-forwards', function () {
        (0, _nuclideAnalytics.trackOperationTiming)('nuclide-navigation-stack:forwards', function () {
          return controller.navigateForwards();
        });
      }));
      this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-backwards', function () {
        (0, _nuclideAnalytics.trackOperationTiming)('nuclide-navigation-stack:backwards', function () {
          return controller.navigateBackwards();
        });
      }));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}