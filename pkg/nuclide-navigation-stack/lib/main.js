Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomProjects2;

function _commonsAtomProjects() {
  return _commonsAtomProjects2 = require('../../commons-atom/projects');
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var _NavigationStackController2;

function _NavigationStackController() {
  return _NavigationStackController2 = require('./NavigationStackController');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _StatusBar2;

function _StatusBar() {
  return _StatusBar2 = require('./StatusBar');
}

var controller = new (_NavigationStackController2 || _NavigationStackController()).NavigationStackController();

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    var subscribeEditor = function subscribeEditor(editor) {
      var cursorSubscription = editor.onDidChangeCursorPosition(function (event) {
        controller.updatePosition(editor, event.newBufferPosition);
      });
      var scrollSubscription = (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).getViewOfEditor)(editor).onDidChangeScrollTop(function (scrollTop) {
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
    this._disposables.add((0, (_commonsAtomProjects2 || _commonsAtomProjects()).onDidRemoveProjectPath)(function (path) {
      controller.removePath(path, atom.project.getDirectories().map(function (directory) {
        return directory.getPath();
      }));
    }));
    this._disposables.add(new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default((0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).observeNavigatingEditors)().subscribe(function (editor) {
      controller.onOptInNavigation(editor);
    })));

    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-forwards', function () {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('nuclide-navigation-stack:forwards', function () {
        return controller.navigateForwards();
      });
    }));
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-backwards', function () {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('nuclide-navigation-stack:backwards', function () {
        return controller.navigateBackwards();
      });
    }));
  }

  _createClass(Activation, [{
    key: 'consumeStatusBar',
    value: function consumeStatusBar(statusBar) {
      var disposable = (0, (_StatusBar2 || _StatusBar()).consumeStatusBar)(statusBar, controller);
      this._disposables.add(disposable);
      return disposable;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;