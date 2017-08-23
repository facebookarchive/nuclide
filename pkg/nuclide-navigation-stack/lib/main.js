'use strict';

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _NavigationStackController;

function _load_NavigationStackController() {
  return _NavigationStackController = require('./NavigationStackController');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _StatusBar;

function _load_StatusBar() {
  return _StatusBar = require('./StatusBar');
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

const controller = new (_NavigationStackController || _load_NavigationStackController()).NavigationStackController();

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const subscribeEditor = editor => {
      const cursorSubscription = editor.onDidChangeCursorPosition(event => {
        controller.updatePosition(editor, event.newBufferPosition);
      });
      const scrollSubscription = (0, (_textEditor || _load_textEditor()).getViewOfEditor)(editor).onDidChangeScrollTop(scrollTop => {
        controller.updateScroll(editor, scrollTop);
      });
      this._disposables.add(cursorSubscription);
      this._disposables.add(scrollSubscription);
      const destroySubscription = editor.onDidDestroy(() => {
        controller.onDestroy(editor);
        this._disposables.remove(cursorSubscription);
        this._disposables.remove(scrollSubscription);
        this._disposables.remove(destroySubscription);
      });
      this._disposables.add(destroySubscription);
    };

    const addEditor = addEvent => {
      const editor = addEvent.textEditor;
      if ((0, (_textEditor || _load_textEditor()).isValidTextEditor)(editor)) {
        subscribeEditor(editor);
        controller.onCreate(editor);
      }
    };

    atom.workspace.getTextEditors().forEach(subscribeEditor);
    this._disposables.add(atom.workspace.onDidAddTextEditor(addEditor), atom.workspace.onDidOpen(event => {
      if ((0, (_textEditor || _load_textEditor()).isValidTextEditor)(event.item)) {
        controller.onOpen(event.item);
      }
    }), atom.workspace.observeActivePaneItem(item => {
      if ((0, (_textEditor || _load_textEditor()).isValidTextEditor)(item)) {
        controller.onActivate(item);
      }
    }), atom.workspace.onDidStopChangingActivePaneItem(item => {
      if ((0, (_textEditor || _load_textEditor()).isValidTextEditor)(item)) {
        controller.onActiveStopChanging(item);
      }
    }), (0, (_projects || _load_projects()).onDidRemoveProjectPath)(path => {
      controller.removePath(path, atom.project.getDirectories().map(directory => directory.getPath()));
    }), (0, (_goToLocation || _load_goToLocation()).observeNavigatingEditors)().subscribe(editor => {
      controller.onOptInNavigation(editor);
    }), atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-forwards', () => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-navigation-stack:forwards', () => controller.navigateForwards());
    }), atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-backwards', () => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('nuclide-navigation-stack:backwards', () => controller.navigateBackwards());
    }));
  }

  consumeStatusBar(statusBar) {
    const disposable = (0, (_StatusBar || _load_StatusBar()).consumeStatusBar)(statusBar, controller);
    this._disposables.add(disposable);
    return disposable;
  }

  dispose() {
    this._disposables.dispose();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);