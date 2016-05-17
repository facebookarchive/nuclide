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
exports.consumeTestRunner = consumeTestRunner;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;
exports.consumeToolBar = consumeToolBar;
exports.getHomeFragments = getHomeFragments;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var FILE_TREE_CONTEXT_MENU_PRIORITY = 200;

var logger = undefined;
function getLogger() {
  if (!logger) {
    logger = require('../../nuclide-logging').getLogger();
  }
  return logger;
}

/**
 * Returns a string of length `length` + 1 by replacing extra characters in the middle of `str` with
 * an ellipsis character. Example:
 *
 *     > limitString('foobar', 4)
 *     'fo…ar'
 */
function limitString(str) {
  var length = arguments.length <= 1 || arguments[1] === undefined ? 20 : arguments[1];

  var strLength = str.length;
  return strLength > length ? str.substring(0, length / 2) + '…' + str.substring(str.length - length / 2) : str;
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._initialState = state;
    this._testRunners = new Set();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-test-runner:toggle-panel', function () {
      _this._getController().togglePanel();
    }));
    // Listen for run events on files in the file tree
    this._disposables.add(atom.commands.add('.tree-view .entry.file.list-item', 'nuclide-test-runner:run-tests', function (event) {
      var target = event.currentTarget.querySelector('.name');
      _this._getController().runTests(target.dataset.path);
      // Ensure ancestors of this element don't attempt to run tests as well.
      event.stopPropagation();
    }));
    // Listen for run events on directories in the file tree
    this._disposables.add(atom.commands.add('.tree-view .entry.directory.list-nested-item', 'nuclide-test-runner:run-tests', function (event) {
      var target = event.currentTarget.querySelector('.name');
      _this._getController().runTests(target.dataset.path);
      // Ensure ancestors of this element don't attempt to run tests as well.
      event.stopPropagation();
    }));

    // The panel should be visible because of the last serialized state, initialize it immediately.
    if (state != null && state.panelVisible) {
      this._getController();
    }
  }

  _createClass(Activation, [{
    key: 'addItemsToFileTreeContextMenu',
    value: function addItemsToFileTreeContextMenu(contextMenu) {
      var _this2 = this;

      var fileItem = this._createRunTestsContextMenuItem( /* isForFile */true, contextMenu);
      var directoryItem = this._createRunTestsContextMenuItem( /* isForFile */false, contextMenu);

      // Create a separator menu item that displays if either the file or directory item displays.
      (0, (_assert2 || _assert()).default)(fileItem.shouldDisplay);
      var fileItemShouldDisplay = fileItem.shouldDisplay.bind(fileItem);
      (0, (_assert2 || _assert()).default)(directoryItem.shouldDisplay);
      var directoryItemShouldDisplay = directoryItem.shouldDisplay.bind(directoryItem);
      var separatorShouldDisplay = function separatorShouldDisplay(event) {
        return fileItemShouldDisplay(event) || directoryItemShouldDisplay(event);
      };
      var separator = {
        type: 'separator',
        shouldDisplay: separatorShouldDisplay
      };

      var menuItemSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
      menuItemSubscriptions.add(contextMenu.addItemToTestSection(fileItem, FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToTestSection(directoryItem, FILE_TREE_CONTEXT_MENU_PRIORITY + 1), contextMenu.addItemToTestSection(separator, FILE_TREE_CONTEXT_MENU_PRIORITY + 2));
      this._disposables.add(menuItemSubscriptions);

      return new (_atom2 || _atom()).Disposable(function () {
        return _this2._disposables.remove(menuItemSubscriptions);
      });
    }
  }, {
    key: 'addTestRunner',
    value: function addTestRunner(testRunner) {
      var _this3 = this;

      if (this._testRunners.has(testRunner)) {
        getLogger().info('Attempted to add test runner "' + testRunner.label + '" that was already added');
        return;
      }

      this._testRunners.add(testRunner);
      // Tell the controller to re-render only if it exists so test runner services won't force
      // construction if the panel is still invisible.
      //
      // TODO(rossallen): The control should be inverted here. The controller should listen for
      // changes rather than be told about them.
      if (this._controller != null) {
        this._getController().didUpdateTestRunners();
      }

      return new (_atom2 || _atom()).Disposable(function () {
        _this3._testRunners.delete(testRunner);
        // Tell the controller to re-render only if it exists so test runner services won't force
        // construction if the panel is still invisible.
        if (_this3._controller != null) {
          _this3._getController().didUpdateTestRunners();
        }
      });
    }
  }, {
    key: 'getDistractionFreeModeProvider',
    value: function getDistractionFreeModeProvider() {
      var _this4 = this;

      return {
        name: 'nuclide-test-runner',
        isVisible: function isVisible() {
          return _this4._controller != null && _this4._controller.isVisible();
        },
        toggle: function toggle() {
          _this4._getController().togglePanel();
        }
      };
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return this._getController().serialize();
    }
  }, {
    key: '_createRunTestsContextMenuItem',
    value: function _createRunTestsContextMenuItem(isForFile, contextMenu) {
      var _this5 = this;

      var label = undefined;
      var shouldDisplayItem = undefined;
      if (isForFile) {
        label = 'Run tests at';
        shouldDisplayItem = function (event) {
          var node = contextMenu.getSingleSelectedNode();
          return node != null && !node.isContainer;
        };
      } else {
        label = 'Run tests in';
        shouldDisplayItem = function (event) {
          var node = contextMenu.getSingleSelectedNode();
          return node != null && node.isContainer;
        };
      }

      return {
        // Intentionally **not** an arrow function because Atom sets the context when calling this and
        // allows dynamically setting values by assigning to `this`.
        created: function created(event) {
          var target = event.target;
          if (target.dataset.name === undefined) {
            // If the event did not happen on the `name` span, search for it in the descendants.
            target = target.querySelector('.name');
          }
          if (target.dataset.name === undefined) {
            // If no necessary `.name` descendant is found, don't display a context menu.
            return;
          }
          var name = target.dataset.name;
          this.command = 'nuclide-test-runner:run-tests';
          this.label = label + ' \'' + limitString(name) + '\'';
        },
        shouldDisplay: function shouldDisplay(event) {
          // Don't show a testing option if there are no test runners.
          if (_this5._testRunners.size === 0) {
            return false;
          }

          if (!shouldDisplayItem(event)) {
            return false;
          }

          var target = event.target;
          if (target.dataset.name === undefined) {
            // If the event did not happen on the `name` span, search for it in the descendants.
            target = target.querySelector('.name');
          }
          // If no descendant has the necessary dataset to create this menu item, don't create
          // it.
          return target != null && target.dataset.name != null && target.dataset.path != null;
        }
      };
    }
  }, {
    key: '_getController',
    value: function _getController() {
      var controller = this._controller;
      if (controller == null) {
        var _require = require('./TestRunnerController');

        var TestRunnerController = _require.TestRunnerController;

        controller = new TestRunnerController(this._initialState, this._testRunners);
        this._controller = controller;
      }
      return controller;
    }
  }]);

  return Activation;
})();

var activation = undefined;
var toolBar = null;

function activate(state) {
  if (!activation) {
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
  if (toolBar) {
    toolBar.removeItems();
  }
}

function serialize() {
  return activation ? activation.serialize() : {};
}

function consumeTestRunner(testRunner) {
  if (activation) {
    return activation.addTestRunner(testRunner);
  }
}

function addItemsToFileTreeContextMenu(contextMenu) {
  (0, (_assert2 || _assert()).default)(activation);
  return activation.addItemsToFileTreeContextMenu(contextMenu);
}

function consumeToolBar(getToolBar) {
  toolBar = getToolBar('nuclide-test-runner');
  toolBar.addButton({
    icon: 'checklist',
    callback: 'nuclide-test-runner:toggle-panel',
    tooltip: 'Toggle Test Runner',
    priority: 400
  });
}

function getHomeFragments() {
  return {
    feature: {
      title: 'Test Runner',
      icon: 'checklist',
      description: 'Run tests directly from Nuclide by right-mouse-clicking on the file.',
      command: 'nuclide-test-runner:toggle-panel'
    },
    priority: 2
  };
}

function getDistractionFreeModeProvider() {
  (0, (_assert2 || _assert()).default)(activation != null);
  return activation.getDistractionFreeModeProvider();
}