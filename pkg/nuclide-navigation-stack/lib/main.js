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

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _commonsAtomProjects;

function _load_commonsAtomProjects() {
  return _commonsAtomProjects = require('../../commons-atom/projects');
}

var _commonsAtomTextEditor;

function _load_commonsAtomTextEditor() {
  return _commonsAtomTextEditor = require('../../commons-atom/text-editor');
}

var _NavigationStackController;

function _load_NavigationStackController() {
  return _NavigationStackController = require('./NavigationStackController');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsAtomGoToLocation;

function _load_commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation = require('../../commons-atom/go-to-location');
}

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _StatusBar;

function _load_StatusBar() {
  return _StatusBar = require('./StatusBar');
}

var controller = new (_NavigationStackController || _load_NavigationStackController()).NavigationStackController();

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._disposables = new (_atom || _load_atom()).CompositeDisposable();

    var subscribeEditor = function subscribeEditor(editor) {
      var cursorSubscription = editor.onDidChangeCursorPosition(function (event) {
        controller.updatePosition(editor, event.newBufferPosition);
      });
      var scrollSubscription = (0, (_commonsAtomTextEditor || _load_commonsAtomTextEditor()).getViewOfEditor)(editor).onDidChangeScrollTop(function (scrollTop) {
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
    this._disposables.add((0, (_commonsAtomProjects || _load_commonsAtomProjects()).onDidRemoveProjectPath)(function (path) {
      controller.removePath(path, atom.project.getDirectories().map(function (directory) {
        return directory.getPath();
      }));
    }));
    this._disposables.add(new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default((0, (_commonsAtomGoToLocation || _load_commonsAtomGoToLocation()).observeNavigatingEditors)().subscribe(function (editor) {
      controller.onOptInNavigation(editor);
    })));

    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-forwards', function () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('nuclide-navigation-stack:forwards', function () {
        return controller.navigateForwards();
      });
    }));
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-backwards', function () {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('nuclide-navigation-stack:backwards', function () {
        return controller.navigateBackwards();
      });
    }));
  }

  _createClass(Activation, [{
    key: 'consumeStatusBar',
    value: function consumeStatusBar(statusBar) {
      var disposable = (0, (_StatusBar || _load_StatusBar()).consumeStatusBar)(statusBar, controller);
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

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;