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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

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
    this._disposables = new _atom.CompositeDisposable();
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
      var fileItem = this._createRunTestsContextMenuItem( /* isForFile */true, contextMenu);
      var directoryItem = this._createRunTestsContextMenuItem( /* isForFile */false, contextMenu);

      // Create a separator menu item that displays if either the file or directory item displays.
      (0, _assert2['default'])(fileItem.shouldDisplay);
      var fileItemShouldDisplay = fileItem.shouldDisplay.bind(fileItem);
      (0, _assert2['default'])(directoryItem.shouldDisplay);
      var directoryItemShouldDisplay = directoryItem.shouldDisplay.bind(directoryItem);
      var separatorShouldDisplay = function separatorShouldDisplay(event) {
        return fileItemShouldDisplay(event) || directoryItemShouldDisplay(event);
      };
      var separator = {
        type: 'separator',
        shouldDisplay: separatorShouldDisplay
      };

      var menuItemSubscriptions = new _atom.CompositeDisposable();
      menuItemSubscriptions.add(contextMenu.addItemToTestSection(fileItem, FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToTestSection(directoryItem, FILE_TREE_CONTEXT_MENU_PRIORITY + 1), contextMenu.addItemToTestSection(separator, FILE_TREE_CONTEXT_MENU_PRIORITY + 2));
      this._disposables.add(menuItemSubscriptions);
      return menuItemSubscriptions;
    }
  }, {
    key: 'addTestRunner',
    value: function addTestRunner(testRunner) {
      var _this2 = this;

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

      return new _atom.Disposable(function () {
        _this2._testRunners['delete'](testRunner);
        // Tell the controller to re-render only if it exists so test runner services won't force
        // construction if the panel is still invisible.
        if (_this2._controller != null) {
          _this2._getController().didUpdateTestRunners();
        }
      });
    }
  }, {
    key: 'getDistractionFreeModeProvider',
    value: function getDistractionFreeModeProvider() {
      var _this3 = this;

      return {
        name: 'nuclide-test-runner',
        isVisible: function isVisible() {
          return _this3._controller != null && _this3._controller.isVisible();
        },
        toggle: function toggle() {
          _this3._getController().togglePanel();
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
      var _this4 = this;

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
            return false;
          }
          var name = target.dataset.name;
          this.command = 'nuclide-test-runner:run-tests';
          this.label = label + ' \'' + limitString(name) + '\'';
        },
        shouldDisplay: function shouldDisplay(event) {
          // Don't show a testing option if there are no test runners.
          if (_this4._testRunners.size === 0) {
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
  (0, _assert2['default'])(activation);
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
  (0, _assert2['default'])(activation != null);
  return activation.getDistractionFreeModeProvider();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQWtCc0IsUUFBUTs7OztvQkFDZ0IsTUFBTTs7QUFFcEQsSUFBTSwrQkFBK0IsR0FBRyxHQUFHLENBQUM7O0FBRTVDLElBQUksTUFBTSxZQUFBLENBQUM7QUFDWCxTQUFTLFNBQVMsR0FBRztBQUNuQixNQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsVUFBTSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0dBQ3ZEO0FBQ0QsU0FBTyxNQUFNLENBQUM7Q0FDZjs7Ozs7Ozs7O0FBU0QsU0FBUyxXQUFXLENBQUMsR0FBVyxFQUFnQztNQUE5QixNQUFlLHlEQUFHLEVBQUU7O0FBQ3BELE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDN0IsU0FBTyxBQUFDLFNBQVMsR0FBRyxNQUFNLEdBQ3JCLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBSSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUN6RSxHQUFHLENBQUM7Q0FDUDs7SUFFSyxVQUFVO0FBT0gsV0FQUCxVQUFVLENBT0YsS0FBaUMsRUFBRTs7OzBCQVAzQyxVQUFVOztBQVFaLFFBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM5QixRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0FBQzlDLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDZixnQkFBZ0IsRUFDaEIsa0NBQWtDLEVBQ2xDLFlBQU07QUFDSixZQUFLLGNBQWMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3JDLENBQ0YsQ0FDRixDQUFDOztBQUVGLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDZixrQ0FBa0MsRUFDbEMsK0JBQStCLEVBQy9CLFVBQUEsS0FBSyxFQUFJO0FBQ1AsVUFBTSxNQUFNLEdBQUcsQUFBRSxLQUFLLENBQUMsYUFBYSxDQUFxQixhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEYsWUFBSyxjQUFjLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFcEQsV0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ3pCLENBQ0YsQ0FDRixDQUFDOztBQUVGLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDZiw4Q0FBOEMsRUFDOUMsK0JBQStCLEVBQy9CLFVBQUEsS0FBSyxFQUFJO0FBQ1AsVUFBTSxNQUFNLEdBQUcsQUFBRSxLQUFLLENBQUMsYUFBYSxDQUFxQixhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEYsWUFBSyxjQUFjLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFcEQsV0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ3pCLENBQ0YsQ0FDRixDQUFDOzs7QUFHRixRQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLFlBQVksRUFBRTtBQUN2QyxVQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7S0FDdkI7R0FDRjs7ZUFuREcsVUFBVTs7V0FxRGUsdUNBQUMsV0FBZ0MsRUFBZTtBQUMzRSxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsOEJBQThCLGlCQUFpQixJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDeEYsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLDhCQUE4QixpQkFBaUIsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDOzs7QUFHOUYsK0JBQVUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2xDLFVBQU0scUJBQXFCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEUsK0JBQVUsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3ZDLFVBQU0sMEJBQTBCLEdBQUcsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkYsVUFBTSxzQkFBc0IsR0FBRyxTQUF6QixzQkFBc0IsQ0FBSSxLQUFLLEVBQWlCO0FBQ3BELGVBQU8scUJBQXFCLENBQUMsS0FBSyxDQUFDLElBQUksMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDMUUsQ0FBQztBQUNGLFVBQU0sU0FBUyxHQUFHO0FBQ2hCLFlBQUksRUFBRSxXQUFXO0FBQ2pCLHFCQUFhLEVBQUUsc0JBQXNCO09BQ3RDLENBQUM7O0FBRUYsVUFBTSxxQkFBcUIsR0FBRywrQkFBeUIsQ0FBQztBQUN4RCwyQkFBcUIsQ0FBQyxHQUFHLENBQ3ZCLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsK0JBQStCLENBQUMsRUFDM0UsV0FBVyxDQUFDLG9CQUFvQixDQUFDLGFBQWEsRUFBRSwrQkFBK0IsR0FBRyxDQUFDLENBQUMsRUFDcEYsV0FBVyxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSwrQkFBK0IsR0FBRyxDQUFDLENBQUMsQ0FDakYsQ0FBQztBQUNGLFVBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDN0MsYUFBTyxxQkFBcUIsQ0FBQztLQUM5Qjs7O1dBRVksdUJBQUMsVUFBc0IsRUFBZTs7O0FBQ2pELFVBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDckMsaUJBQVMsRUFBRSxDQUFDLElBQUksb0NBQWtDLFVBQVUsQ0FBQyxLQUFLLDhCQUEyQixDQUFDO0FBQzlGLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7Ozs7O0FBTWxDLFVBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDNUIsWUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUM7T0FDOUM7O0FBRUQsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLGVBQUssWUFBWSxVQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7OztBQUdyQyxZQUFJLE9BQUssV0FBVyxJQUFJLElBQUksRUFBRTtBQUM1QixpQkFBSyxjQUFjLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1NBQzlDO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUU2QiwwQ0FBZ0M7OztBQUM1RCxhQUFPO0FBQ0wsWUFBSSxFQUFFLHFCQUFxQjtBQUMzQixpQkFBUyxFQUFFLHFCQUFNO0FBQ2YsaUJBQU8sT0FBSyxXQUFXLElBQUksSUFBSSxJQUFJLE9BQUssV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ2pFO0FBQ0QsY0FBTSxFQUFFLGtCQUFNO0FBQ1osaUJBQUssY0FBYyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDckM7T0FDRixDQUFDO0tBQ0g7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRVEscUJBQVc7QUFDbEIsYUFBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDMUM7OztXQUU2Qix3Q0FDNUIsU0FBa0IsRUFDbEIsV0FBZ0MsRUFDVjs7O0FBQ3RCLFVBQUksS0FBSyxZQUFBLENBQUM7QUFDVixVQUFJLGlCQUFpQixZQUFBLENBQUM7QUFDdEIsVUFBSSxTQUFTLEVBQUU7QUFDYixhQUFLLEdBQUcsY0FBYyxDQUFDO0FBQ3ZCLHlCQUFpQixHQUFHLFVBQUEsS0FBSyxFQUFJO0FBQzNCLGNBQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQ2pELGlCQUFPLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO1NBQzFDLENBQUM7T0FDSCxNQUFNO0FBQ0wsYUFBSyxHQUFHLGNBQWMsQ0FBQztBQUN2Qix5QkFBaUIsR0FBRyxVQUFBLEtBQUssRUFBSTtBQUMzQixjQUFNLElBQUksR0FBRyxXQUFXLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUNqRCxpQkFBTyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUM7U0FDekMsQ0FBQztPQUNIOztBQUVELGFBQU87OztBQUdMLGVBQU8sRUFBRSxpQkFBUyxLQUFLLEVBQUU7QUFDdkIsY0FBSSxNQUFNLEdBQU0sS0FBSyxDQUFDLE1BQU0sQUFBcUIsQ0FBQztBQUNsRCxjQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTs7QUFFckMsa0JBQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1dBQ3hDO0FBQ0QsY0FBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7O0FBRXJDLG1CQUFPLEtBQUssQ0FBQztXQUNkO0FBQ0QsY0FBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDakMsY0FBSSxDQUFDLE9BQU8sR0FBRywrQkFBK0IsQ0FBQztBQUMvQyxjQUFJLENBQUMsS0FBSyxHQUFNLEtBQUssV0FBSyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQUcsQ0FBQztTQUNoRDtBQUNELHFCQUFhLEVBQUUsdUJBQUEsS0FBSyxFQUFJOztBQUV0QixjQUFJLE9BQUssWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDaEMsbUJBQU8sS0FBSyxDQUFDO1dBQ2Q7O0FBRUQsY0FBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQzdCLG1CQUFPLEtBQUssQ0FBQztXQUNkOztBQUVELGNBQUksTUFBTSxHQUFNLEtBQUssQ0FBQyxNQUFNLEFBQXFCLENBQUM7QUFDbEQsY0FBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7O0FBRXJDLGtCQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztXQUN4Qzs7O0FBR0QsaUJBQU8sTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO1NBQ3JGO09BQ0YsQ0FBQztLQUNIOzs7V0FFYSwwQkFBRztBQUNmLFVBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDbEMsVUFBSSxVQUFVLElBQUksSUFBSSxFQUFFO3VCQUNTLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQzs7WUFBekQsb0JBQW9CLFlBQXBCLG9CQUFvQjs7QUFDM0Isa0JBQVUsR0FBRyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdFLFlBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO09BQy9CO0FBQ0QsYUFBTyxVQUFVLENBQUM7S0FDbkI7OztTQWpNRyxVQUFVOzs7QUFxTWhCLElBQUksVUFBdUIsWUFBQSxDQUFDO0FBQzVCLElBQUksT0FBYSxHQUFHLElBQUksQ0FBQzs7QUFFbEIsU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFRO0FBQzdDLE1BQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixjQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDcEM7Q0FDRjs7QUFFTSxTQUFTLFVBQVUsR0FBUztBQUNqQyxNQUFJLFVBQVUsRUFBRTtBQUNkLGNBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixjQUFVLEdBQUcsSUFBSSxDQUFDO0dBQ25CO0FBQ0QsTUFBSSxPQUFPLEVBQUU7QUFDWCxXQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7R0FDdkI7Q0FDRjs7QUFFTSxTQUFTLFNBQVMsR0FBVztBQUNsQyxTQUFPLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDO0NBQ2pEOztBQUVNLFNBQVMsaUJBQWlCLENBQUMsVUFBc0IsRUFBZTtBQUNyRSxNQUFJLFVBQVUsRUFBRTtBQUNkLFdBQU8sVUFBVSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUM3QztDQUNGOztBQUVNLFNBQVMsNkJBQTZCLENBQUMsV0FBZ0MsRUFBZTtBQUMzRiwyQkFBVSxVQUFVLENBQUMsQ0FBQztBQUN0QixTQUFPLFVBQVUsQ0FBQyw2QkFBNkIsQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUM5RDs7QUFFTSxTQUFTLGNBQWMsQ0FBQyxVQUFxQyxFQUFRO0FBQzFFLFNBQU8sR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUM1QyxTQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2hCLFFBQUksRUFBRSxXQUFXO0FBQ2pCLFlBQVEsRUFBRSxrQ0FBa0M7QUFDNUMsV0FBTyxFQUFFLG9CQUFvQjtBQUM3QixZQUFRLEVBQUUsR0FBRztHQUNkLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsZ0JBQWdCLEdBQWtCO0FBQ2hELFNBQU87QUFDTCxXQUFPLEVBQUU7QUFDUCxXQUFLLEVBQUUsYUFBYTtBQUNwQixVQUFJLEVBQUUsV0FBVztBQUNqQixpQkFBVyxFQUFFLHNFQUFzRTtBQUNuRixhQUFPLEVBQUUsa0NBQWtDO0tBQzVDO0FBQ0QsWUFBUSxFQUFFLENBQUM7R0FDWixDQUFDO0NBQ0g7O0FBRU0sU0FBUyw4QkFBOEIsR0FBZ0M7QUFDNUUsMkJBQVUsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzlCLFNBQU8sVUFBVSxDQUFDLDhCQUE4QixFQUFFLENBQUM7Q0FDcEQiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIEZpbGVUcmVlQ29udGV4dE1lbnUgZnJvbSAnLi4vLi4vbnVjbGlkZS1maWxlLXRyZWUvbGliL0ZpbGVUcmVlQ29udGV4dE1lbnUnO1xuaW1wb3J0IHR5cGUge0hvbWVGcmFnbWVudHN9IGZyb20gJy4uLy4uL251Y2xpZGUtaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtZGlzdHJhY3Rpb24tZnJlZS1tb2RlJztcbmltcG9ydCB0eXBlIHtUZXN0UnVubmVyfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge1Rlc3RSdW5uZXJDb250cm9sbGVyIGFzIFRlc3RSdW5uZXJDb250cm9sbGVyVHlwZX0gZnJvbSAnLi9UZXN0UnVubmVyQ29udHJvbGxlcic7XG5pbXBvcnQgdHlwZSB7VGVzdFJ1bm5lckNvbnRyb2xsZXJTdGF0ZX0gZnJvbSAnLi9UZXN0UnVubmVyQ29udHJvbGxlcic7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbmNvbnN0IEZJTEVfVFJFRV9DT05URVhUX01FTlVfUFJJT1JJVFkgPSAyMDA7XG5cbmxldCBsb2dnZXI7XG5mdW5jdGlvbiBnZXRMb2dnZXIoKSB7XG4gIGlmICghbG9nZ2VyKSB7XG4gICAgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gIH1cbiAgcmV0dXJuIGxvZ2dlcjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIG9mIGxlbmd0aCBgbGVuZ3RoYCArIDEgYnkgcmVwbGFjaW5nIGV4dHJhIGNoYXJhY3RlcnMgaW4gdGhlIG1pZGRsZSBvZiBgc3RyYCB3aXRoXG4gKiBhbiBlbGxpcHNpcyBjaGFyYWN0ZXIuIEV4YW1wbGU6XG4gKlxuICogICAgID4gbGltaXRTdHJpbmcoJ2Zvb2JhcicsIDQpXG4gKiAgICAgJ2Zv4oCmYXInXG4gKi9cbmZ1bmN0aW9uIGxpbWl0U3RyaW5nKHN0cjogc3RyaW5nLCBsZW5ndGg/OiBudW1iZXIgPSAyMCk6IHN0cmluZyB7XG4gIGNvbnN0IHN0ckxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gIHJldHVybiAoc3RyTGVuZ3RoID4gbGVuZ3RoKSA/XG4gICAgYCR7c3RyLnN1YnN0cmluZygwLCBsZW5ndGggLyAyKX3igKYke3N0ci5zdWJzdHJpbmcoc3RyLmxlbmd0aCAtIGxlbmd0aCAvIDIpfWAgOlxuICAgIHN0cjtcbn1cblxuY2xhc3MgQWN0aXZhdGlvbiB7XG5cbiAgX2NvbnRyb2xsZXI6ID9UZXN0UnVubmVyQ29udHJvbGxlclR5cGU7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2luaXRpYWxTdGF0ZTogP1Rlc3RSdW5uZXJDb250cm9sbGVyU3RhdGU7XG4gIF90ZXN0UnVubmVyczogU2V0PFRlc3RSdW5uZXI+O1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/VGVzdFJ1bm5lckNvbnRyb2xsZXJTdGF0ZSkge1xuICAgIHRoaXMuX2luaXRpYWxTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuX3Rlc3RSdW5uZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgJ251Y2xpZGUtdGVzdC1ydW5uZXI6dG9nZ2xlLXBhbmVsJyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2dldENvbnRyb2xsZXIoKS50b2dnbGVQYW5lbCgpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgICAvLyBMaXN0ZW4gZm9yIHJ1biBldmVudHMgb24gZmlsZXMgaW4gdGhlIGZpbGUgdHJlZVxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnLnRyZWUtdmlldyAuZW50cnkuZmlsZS5saXN0LWl0ZW0nLFxuICAgICAgICAnbnVjbGlkZS10ZXN0LXJ1bm5lcjpydW4tdGVzdHMnLFxuICAgICAgICBldmVudCA9PiB7XG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gKChldmVudC5jdXJyZW50VGFyZ2V0OiBhbnkpOiBIVE1MRWxlbWVudCkucXVlcnlTZWxlY3RvcignLm5hbWUnKTtcbiAgICAgICAgICB0aGlzLl9nZXRDb250cm9sbGVyKCkucnVuVGVzdHModGFyZ2V0LmRhdGFzZXQucGF0aCk7XG4gICAgICAgICAgLy8gRW5zdXJlIGFuY2VzdG9ycyBvZiB0aGlzIGVsZW1lbnQgZG9uJ3QgYXR0ZW1wdCB0byBydW4gdGVzdHMgYXMgd2VsbC5cbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG4gICAgLy8gTGlzdGVuIGZvciBydW4gZXZlbnRzIG9uIGRpcmVjdG9yaWVzIGluIHRoZSBmaWxlIHRyZWVcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmRpcmVjdG9yeS5saXN0LW5lc3RlZC1pdGVtJyxcbiAgICAgICAgJ251Y2xpZGUtdGVzdC1ydW5uZXI6cnVuLXRlc3RzJyxcbiAgICAgICAgZXZlbnQgPT4ge1xuICAgICAgICAgIGNvbnN0IHRhcmdldCA9ICgoZXZlbnQuY3VycmVudFRhcmdldDogYW55KTogSFRNTEVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJyk7XG4gICAgICAgICAgdGhpcy5fZ2V0Q29udHJvbGxlcigpLnJ1blRlc3RzKHRhcmdldC5kYXRhc2V0LnBhdGgpO1xuICAgICAgICAgIC8vIEVuc3VyZSBhbmNlc3RvcnMgb2YgdGhpcyBlbGVtZW50IGRvbid0IGF0dGVtcHQgdG8gcnVuIHRlc3RzIGFzIHdlbGwuXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuXG4gICAgLy8gVGhlIHBhbmVsIHNob3VsZCBiZSB2aXNpYmxlIGJlY2F1c2Ugb2YgdGhlIGxhc3Qgc2VyaWFsaXplZCBzdGF0ZSwgaW5pdGlhbGl6ZSBpdCBpbW1lZGlhdGVseS5cbiAgICBpZiAoc3RhdGUgIT0gbnVsbCAmJiBzdGF0ZS5wYW5lbFZpc2libGUpIHtcbiAgICAgIHRoaXMuX2dldENvbnRyb2xsZXIoKTtcbiAgICB9XG4gIH1cblxuICBhZGRJdGVtc1RvRmlsZVRyZWVDb250ZXh0TWVudShjb250ZXh0TWVudTogRmlsZVRyZWVDb250ZXh0TWVudSk6IElEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBmaWxlSXRlbSA9IHRoaXMuX2NyZWF0ZVJ1blRlc3RzQ29udGV4dE1lbnVJdGVtKC8qIGlzRm9yRmlsZSAqLyB0cnVlLCBjb250ZXh0TWVudSk7XG4gICAgY29uc3QgZGlyZWN0b3J5SXRlbSA9IHRoaXMuX2NyZWF0ZVJ1blRlc3RzQ29udGV4dE1lbnVJdGVtKC8qIGlzRm9yRmlsZSAqLyBmYWxzZSwgY29udGV4dE1lbnUpO1xuXG4gICAgLy8gQ3JlYXRlIGEgc2VwYXJhdG9yIG1lbnUgaXRlbSB0aGF0IGRpc3BsYXlzIGlmIGVpdGhlciB0aGUgZmlsZSBvciBkaXJlY3RvcnkgaXRlbSBkaXNwbGF5cy5cbiAgICBpbnZhcmlhbnQoZmlsZUl0ZW0uc2hvdWxkRGlzcGxheSk7XG4gICAgY29uc3QgZmlsZUl0ZW1TaG91bGREaXNwbGF5ID0gZmlsZUl0ZW0uc2hvdWxkRGlzcGxheS5iaW5kKGZpbGVJdGVtKTtcbiAgICBpbnZhcmlhbnQoZGlyZWN0b3J5SXRlbS5zaG91bGREaXNwbGF5KTtcbiAgICBjb25zdCBkaXJlY3RvcnlJdGVtU2hvdWxkRGlzcGxheSA9IGRpcmVjdG9yeUl0ZW0uc2hvdWxkRGlzcGxheS5iaW5kKGRpcmVjdG9yeUl0ZW0pO1xuICAgIGNvbnN0IHNlcGFyYXRvclNob3VsZERpc3BsYXkgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgIHJldHVybiBmaWxlSXRlbVNob3VsZERpc3BsYXkoZXZlbnQpIHx8IGRpcmVjdG9yeUl0ZW1TaG91bGREaXNwbGF5KGV2ZW50KTtcbiAgICB9O1xuICAgIGNvbnN0IHNlcGFyYXRvciA9IHtcbiAgICAgIHR5cGU6ICdzZXBhcmF0b3InLFxuICAgICAgc2hvdWxkRGlzcGxheTogc2VwYXJhdG9yU2hvdWxkRGlzcGxheSxcbiAgICB9O1xuXG4gICAgY29uc3QgbWVudUl0ZW1TdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBtZW51SXRlbVN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgY29udGV4dE1lbnUuYWRkSXRlbVRvVGVzdFNlY3Rpb24oZmlsZUl0ZW0sIEZJTEVfVFJFRV9DT05URVhUX01FTlVfUFJJT1JJVFkpLFxuICAgICAgY29udGV4dE1lbnUuYWRkSXRlbVRvVGVzdFNlY3Rpb24oZGlyZWN0b3J5SXRlbSwgRklMRV9UUkVFX0NPTlRFWFRfTUVOVV9QUklPUklUWSArIDEpLFxuICAgICAgY29udGV4dE1lbnUuYWRkSXRlbVRvVGVzdFNlY3Rpb24oc2VwYXJhdG9yLCBGSUxFX1RSRUVfQ09OVEVYVF9NRU5VX1BSSU9SSVRZICsgMiksXG4gICAgKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQobWVudUl0ZW1TdWJzY3JpcHRpb25zKTtcbiAgICByZXR1cm4gbWVudUl0ZW1TdWJzY3JpcHRpb25zO1xuICB9XG5cbiAgYWRkVGVzdFJ1bm5lcih0ZXN0UnVubmVyOiBUZXN0UnVubmVyKTogP0Rpc3Bvc2FibGUge1xuICAgIGlmICh0aGlzLl90ZXN0UnVubmVycy5oYXModGVzdFJ1bm5lcikpIHtcbiAgICAgIGdldExvZ2dlcigpLmluZm8oYEF0dGVtcHRlZCB0byBhZGQgdGVzdCBydW5uZXIgXCIke3Rlc3RSdW5uZXIubGFiZWx9XCIgdGhhdCB3YXMgYWxyZWFkeSBhZGRlZGApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3Rlc3RSdW5uZXJzLmFkZCh0ZXN0UnVubmVyKTtcbiAgICAvLyBUZWxsIHRoZSBjb250cm9sbGVyIHRvIHJlLXJlbmRlciBvbmx5IGlmIGl0IGV4aXN0cyBzbyB0ZXN0IHJ1bm5lciBzZXJ2aWNlcyB3b24ndCBmb3JjZVxuICAgIC8vIGNvbnN0cnVjdGlvbiBpZiB0aGUgcGFuZWwgaXMgc3RpbGwgaW52aXNpYmxlLlxuICAgIC8vXG4gICAgLy8gVE9ETyhyb3NzYWxsZW4pOiBUaGUgY29udHJvbCBzaG91bGQgYmUgaW52ZXJ0ZWQgaGVyZS4gVGhlIGNvbnRyb2xsZXIgc2hvdWxkIGxpc3RlbiBmb3JcbiAgICAvLyBjaGFuZ2VzIHJhdGhlciB0aGFuIGJlIHRvbGQgYWJvdXQgdGhlbS5cbiAgICBpZiAodGhpcy5fY29udHJvbGxlciAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9nZXRDb250cm9sbGVyKCkuZGlkVXBkYXRlVGVzdFJ1bm5lcnMoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fdGVzdFJ1bm5lcnMuZGVsZXRlKHRlc3RSdW5uZXIpO1xuICAgICAgLy8gVGVsbCB0aGUgY29udHJvbGxlciB0byByZS1yZW5kZXIgb25seSBpZiBpdCBleGlzdHMgc28gdGVzdCBydW5uZXIgc2VydmljZXMgd29uJ3QgZm9yY2VcbiAgICAgIC8vIGNvbnN0cnVjdGlvbiBpZiB0aGUgcGFuZWwgaXMgc3RpbGwgaW52aXNpYmxlLlxuICAgICAgaWYgKHRoaXMuX2NvbnRyb2xsZXIgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9nZXRDb250cm9sbGVyKCkuZGlkVXBkYXRlVGVzdFJ1bm5lcnMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldERpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcigpOiBEaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXIge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnbnVjbGlkZS10ZXN0LXJ1bm5lcicsXG4gICAgICBpc1Zpc2libGU6ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbnRyb2xsZXIgIT0gbnVsbCAmJiB0aGlzLl9jb250cm9sbGVyLmlzVmlzaWJsZSgpO1xuICAgICAgfSxcbiAgICAgIHRvZ2dsZTogKCkgPT4ge1xuICAgICAgICB0aGlzLl9nZXRDb250cm9sbGVyKCkudG9nZ2xlUGFuZWwoKTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMuX2dldENvbnRyb2xsZXIoKS5zZXJpYWxpemUoKTtcbiAgfVxuXG4gIF9jcmVhdGVSdW5UZXN0c0NvbnRleHRNZW51SXRlbShcbiAgICBpc0ZvckZpbGU6IGJvb2xlYW4sXG4gICAgY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnUsXG4gICk6IGF0b20kQ29udGV4dE1lbnVJdGVtIHtcbiAgICBsZXQgbGFiZWw7XG4gICAgbGV0IHNob3VsZERpc3BsYXlJdGVtO1xuICAgIGlmIChpc0ZvckZpbGUpIHtcbiAgICAgIGxhYmVsID0gJ1J1biB0ZXN0cyBhdCc7XG4gICAgICBzaG91bGREaXNwbGF5SXRlbSA9IGV2ZW50ID0+IHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IGNvbnRleHRNZW51LmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsICYmICFub2RlLmlzQ29udGFpbmVyO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFiZWwgPSAnUnVuIHRlc3RzIGluJztcbiAgICAgIHNob3VsZERpc3BsYXlJdGVtID0gZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBub2RlID0gY29udGV4dE1lbnUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgIHJldHVybiBub2RlICE9IG51bGwgJiYgbm9kZS5pc0NvbnRhaW5lcjtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIEludGVudGlvbmFsbHkgKipub3QqKiBhbiBhcnJvdyBmdW5jdGlvbiBiZWNhdXNlIEF0b20gc2V0cyB0aGUgY29udGV4dCB3aGVuIGNhbGxpbmcgdGhpcyBhbmRcbiAgICAgIC8vIGFsbG93cyBkeW5hbWljYWxseSBzZXR0aW5nIHZhbHVlcyBieSBhc3NpZ25pbmcgdG8gYHRoaXNgLlxuICAgICAgY3JlYXRlZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbGV0IHRhcmdldCA9ICgoKGV2ZW50LnRhcmdldCk6IGFueSk6IEhUTUxFbGVtZW50KTtcbiAgICAgICAgaWYgKHRhcmdldC5kYXRhc2V0Lm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZSBldmVudCBkaWQgbm90IGhhcHBlbiBvbiB0aGUgYG5hbWVgIHNwYW4sIHNlYXJjaCBmb3IgaXQgaW4gdGhlIGRlc2NlbmRhbnRzLlxuICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQuZGF0YXNldC5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBJZiBubyBuZWNlc3NhcnkgYC5uYW1lYCBkZXNjZW5kYW50IGlzIGZvdW5kLCBkb24ndCBkaXNwbGF5IGEgY29udGV4dCBtZW51LlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuYW1lID0gdGFyZ2V0LmRhdGFzZXQubmFtZTtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gJ251Y2xpZGUtdGVzdC1ydW5uZXI6cnVuLXRlc3RzJztcbiAgICAgICAgdGhpcy5sYWJlbCA9IGAke2xhYmVsfSAnJHtsaW1pdFN0cmluZyhuYW1lKX0nYDtcbiAgICAgIH0sXG4gICAgICBzaG91bGREaXNwbGF5OiBldmVudCA9PiB7XG4gICAgICAgIC8vIERvbid0IHNob3cgYSB0ZXN0aW5nIG9wdGlvbiBpZiB0aGVyZSBhcmUgbm8gdGVzdCBydW5uZXJzLlxuICAgICAgICBpZiAodGhpcy5fdGVzdFJ1bm5lcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2hvdWxkRGlzcGxheUl0ZW0oZXZlbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRhcmdldCA9ICgoKGV2ZW50LnRhcmdldCk6IGFueSk6IEhUTUxFbGVtZW50KTtcbiAgICAgICAgaWYgKHRhcmdldC5kYXRhc2V0Lm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZSBldmVudCBkaWQgbm90IGhhcHBlbiBvbiB0aGUgYG5hbWVgIHNwYW4sIHNlYXJjaCBmb3IgaXQgaW4gdGhlIGRlc2NlbmRhbnRzLlxuICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIG5vIGRlc2NlbmRhbnQgaGFzIHRoZSBuZWNlc3NhcnkgZGF0YXNldCB0byBjcmVhdGUgdGhpcyBtZW51IGl0ZW0sIGRvbid0IGNyZWF0ZVxuICAgICAgICAvLyBpdC5cbiAgICAgICAgcmV0dXJuIHRhcmdldCAhPSBudWxsICYmIHRhcmdldC5kYXRhc2V0Lm5hbWUgIT0gbnVsbCAmJiB0YXJnZXQuZGF0YXNldC5wYXRoICE9IG51bGw7XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBfZ2V0Q29udHJvbGxlcigpIHtcbiAgICBsZXQgY29udHJvbGxlciA9IHRoaXMuX2NvbnRyb2xsZXI7XG4gICAgaWYgKGNvbnRyb2xsZXIgPT0gbnVsbCkge1xuICAgICAgY29uc3Qge1Rlc3RSdW5uZXJDb250cm9sbGVyfSA9IHJlcXVpcmUoJy4vVGVzdFJ1bm5lckNvbnRyb2xsZXInKTtcbiAgICAgIGNvbnRyb2xsZXIgPSBuZXcgVGVzdFJ1bm5lckNvbnRyb2xsZXIodGhpcy5faW5pdGlhbFN0YXRlLCB0aGlzLl90ZXN0UnVubmVycyk7XG4gICAgICB0aGlzLl9jb250cm9sbGVyID0gY29udHJvbGxlcjtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnRyb2xsZXI7XG4gIH1cblxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb247XG5sZXQgdG9vbEJhcjogP2FueSA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICBpZiAoIWFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICBpZiAoYWN0aXZhdGlvbikge1xuICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICB9XG4gIGlmICh0b29sQmFyKSB7XG4gICAgdG9vbEJhci5yZW1vdmVJdGVtcygpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgcmV0dXJuIGFjdGl2YXRpb24gPyBhY3RpdmF0aW9uLnNlcmlhbGl6ZSgpIDoge307XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lVGVzdFJ1bm5lcih0ZXN0UnVubmVyOiBUZXN0UnVubmVyKTogP0Rpc3Bvc2FibGUge1xuICBpZiAoYWN0aXZhdGlvbikge1xuICAgIHJldHVybiBhY3RpdmF0aW9uLmFkZFRlc3RSdW5uZXIodGVzdFJ1bm5lcik7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEl0ZW1zVG9GaWxlVHJlZUNvbnRleHRNZW51KGNvbnRleHRNZW51OiBGaWxlVHJlZUNvbnRleHRNZW51KTogSURpc3Bvc2FibGUge1xuICBpbnZhcmlhbnQoYWN0aXZhdGlvbik7XG4gIHJldHVybiBhY3RpdmF0aW9uLmFkZEl0ZW1zVG9GaWxlVHJlZUNvbnRleHRNZW51KGNvbnRleHRNZW51KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtdGVzdC1ydW5uZXInKTtcbiAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgIGljb246ICdjaGVja2xpc3QnLFxuICAgIGNhbGxiYWNrOiAnbnVjbGlkZS10ZXN0LXJ1bm5lcjp0b2dnbGUtcGFuZWwnLFxuICAgIHRvb2x0aXA6ICdUb2dnbGUgVGVzdCBSdW5uZXInLFxuICAgIHByaW9yaXR5OiA0MDAsXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SG9tZUZyYWdtZW50cygpOiBIb21lRnJhZ21lbnRzIHtcbiAgcmV0dXJuIHtcbiAgICBmZWF0dXJlOiB7XG4gICAgICB0aXRsZTogJ1Rlc3QgUnVubmVyJyxcbiAgICAgIGljb246ICdjaGVja2xpc3QnLFxuICAgICAgZGVzY3JpcHRpb246ICdSdW4gdGVzdHMgZGlyZWN0bHkgZnJvbSBOdWNsaWRlIGJ5IHJpZ2h0LW1vdXNlLWNsaWNraW5nIG9uIHRoZSBmaWxlLicsXG4gICAgICBjb21tYW5kOiAnbnVjbGlkZS10ZXN0LXJ1bm5lcjp0b2dnbGUtcGFuZWwnLFxuICAgIH0sXG4gICAgcHJpb3JpdHk6IDIsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXIoKTogRGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyIHtcbiAgaW52YXJpYW50KGFjdGl2YXRpb24gIT0gbnVsbCk7XG4gIHJldHVybiBhY3RpdmF0aW9uLmdldERpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlcigpO1xufVxuIl19