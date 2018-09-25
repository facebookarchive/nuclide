"use strict";

function _projects() {
  const data = require("../../../modules/nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _textEditor() {
  const data = require("../../../modules/nuclide-commons-atom/text-editor");

  _textEditor = function () {
    return data;
  };

  return data;
}

function _NavigationStackController() {
  const data = require("./NavigationStackController");

  _NavigationStackController = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
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
const controller = new (_NavigationStackController().NavigationStackController)();

class Activation {
  constructor(state) {
    this._disposables = new (_UniversalDisposable().default)();

    const subscribeEditor = editor => {
      this._disposables.addUntilDestroyed(editor, editor.onDidDestroy(() => {
        controller.onDestroy(editor);
      }), editor.onDidChangeCursorPosition(event => {
        controller.updatePosition(editor, event.newBufferPosition);
      }));
    };

    const addEditor = addEvent => {
      const editor = addEvent.textEditor;

      if ((0, _textEditor().isValidTextEditor)(editor)) {
        subscribeEditor(editor);
        controller.onCreate(editor);
      }
    };

    atom.workspace.getTextEditors().forEach(subscribeEditor);

    this._disposables.add(atom.workspace.observeActivePaneItem(item => {
      if (!(0, _textEditor().isValidTextEditor)(item)) {
        return;
      }

      controller.onActivate(item);
    }), atom.workspace.onDidAddTextEditor(addEditor), atom.workspace.onDidOpen(event => {
      if ((0, _textEditor().isValidTextEditor)(event.item)) {
        controller.onOpen(event.item);
      }
    }), atom.workspace.onDidStopChangingActivePaneItem(item => {
      if ((0, _textEditor().isValidTextEditor)(item)) {
        controller.onActiveStopChanging(item);
      }
    }), (0, _projects().onDidRemoveProjectPath)(path => {
      controller.removePath(path, atom.project.getDirectories().map(directory => directory.getPath()));
    }), (0, _goToLocation().observeNavigatingEditors)().subscribe(editor => {
      controller.onOptInNavigation(editor);
    }), atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-forwards', () => {
      (0, _nuclideAnalytics().trackTiming)('nuclide-navigation-stack:forwards', () => controller.navigateForwards());
    }), atom.commands.add('atom-workspace', 'nuclide-navigation-stack:navigate-backwards', () => {
      (0, _nuclideAnalytics().trackTiming)('nuclide-navigation-stack:backwards', () => controller.navigateBackwards());
    }));
  }

  getNavigationStackProvider() {
    const stackChanges = controller.observeStackChanges().map(stack => ({
      hasPrevious: stack.hasPrevious(),
      hasNext: stack.hasNext()
    }));
    return {
      subscribe: callback => new (_UniversalDisposable().default)(stackChanges.subscribe(callback)),
      navigateForwards: () => controller.navigateForwards(),
      navigateBackwards: () => controller.navigateBackwards()
    };
  }

  dispose() {
    this._disposables.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);