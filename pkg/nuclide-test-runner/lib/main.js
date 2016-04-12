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
exports.consumeToolBar = consumeToolBar;
exports.getHomeFragments = getHomeFragments;
exports.getDistractionFreeModeProvider = getDistractionFreeModeProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

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
    this._disposables.add(atom.contextMenu.add({
      '.tree-view .entry.directory.list-nested-item > .list-item': [{ type: 'separator' }, this._createRunTestsContextMenuItem('Run tests in'), { type: 'separator' }],
      '.tree-view .entry.file.list-item': [{ type: 'separator' }, this._createRunTestsContextMenuItem('Run tests at'), { type: 'separator' }]
    }));

    // The panel should be visible because of the last serialized state, initialize it immediately.
    if (state != null && state.panelVisible) {
      this._getController();
    }
  }

  _createClass(Activation, [{
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
    value: function _createRunTestsContextMenuItem(label) {
      var _this4 = this;

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
//# sourceMappingURL=data:application/json;base64,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QUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUM1QyxTQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2hCLFFBQUksRUFBRSxXQUFXO0FBQ2pCLFlBQVEsRUFBRSxrQ0FBa0M7QUFDNUMsV0FBTyxFQUFFLG9CQUFvQjtBQUM3QixZQUFRLEVBQUUsR0FBRztHQUNkLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsZ0JBQWdCLEdBQWtCO0FBQ2hELFNBQU87QUFDTCxXQUFPLEVBQUU7QUFDUCxXQUFLLEVBQUUsYUFBYTtBQUNwQixVQUFJLEVBQUUsV0FBVztBQUNqQixpQkFBVyxFQUFFLHNFQUFzRTtBQUNuRixhQUFPLEVBQUUsa0NBQWtDO0tBQzVDO0FBQ0QsWUFBUSxFQUFFLENBQUM7R0FDWixDQUFDO0NBQ0g7O0FBRU0sU0FBUyw4QkFBOEIsR0FBZ0M7QUFDNUUsMkJBQVUsVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzlCLFNBQU8sVUFBVSxDQUFDLDhCQUE4QixFQUFFLENBQUM7Q0FDcEQiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9udWNsaWRlLWhvbWUtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7RGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWRpc3RyYWN0aW9uLWZyZWUtbW9kZSc7XG5pbXBvcnQgdHlwZSB7VGVzdFJ1bm5lcn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtUZXN0UnVubmVyQ29udHJvbGxlciBhcyBUZXN0UnVubmVyQ29udHJvbGxlclR5cGV9IGZyb20gJy4vVGVzdFJ1bm5lckNvbnRyb2xsZXInO1xuaW1wb3J0IHR5cGUge1Rlc3RSdW5uZXJDb250cm9sbGVyU3RhdGV9IGZyb20gJy4vVGVzdFJ1bm5lckNvbnRyb2xsZXInO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5sZXQgbG9nZ2VyO1xuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICBpZiAoIWxvZ2dlcikge1xuICAgIGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICB9XG4gIHJldHVybiBsb2dnZXI7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyBvZiBsZW5ndGggYGxlbmd0aGAgKyAxIGJ5IHJlcGxhY2luZyBleHRyYSBjaGFyYWN0ZXJzIGluIHRoZSBtaWRkbGUgb2YgYHN0cmAgd2l0aFxuICogYW4gZWxsaXBzaXMgY2hhcmFjdGVyLiBFeGFtcGxlOlxuICpcbiAqICAgICA+IGxpbWl0U3RyaW5nKCdmb29iYXInLCA0KVxuICogICAgICdmb+KApmFyJ1xuICovXG5mdW5jdGlvbiBsaW1pdFN0cmluZyhzdHI6IHN0cmluZywgbGVuZ3RoPzogbnVtYmVyID0gMjApOiBzdHJpbmcge1xuICBjb25zdCBzdHJMZW5ndGggPSBzdHIubGVuZ3RoO1xuICByZXR1cm4gKHN0ckxlbmd0aCA+IGxlbmd0aCkgP1xuICAgIGAke3N0ci5zdWJzdHJpbmcoMCwgbGVuZ3RoIC8gMil94oCmJHtzdHIuc3Vic3RyaW5nKHN0ci5sZW5ndGggLSBsZW5ndGggLyAyKX1gIDpcbiAgICBzdHI7XG59XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuXG4gIF9jb250cm9sbGVyOiA/VGVzdFJ1bm5lckNvbnRyb2xsZXJUeXBlO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pbml0aWFsU3RhdGU6ID9UZXN0UnVubmVyQ29udHJvbGxlclN0YXRlO1xuICBfdGVzdFJ1bm5lcnM6IFNldDxUZXN0UnVubmVyPjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP1Rlc3RSdW5uZXJDb250cm9sbGVyU3RhdGUpIHtcbiAgICB0aGlzLl9pbml0aWFsU3RhdGUgPSBzdGF0ZTtcbiAgICB0aGlzLl90ZXN0UnVubmVycyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgICdudWNsaWRlLXRlc3QtcnVubmVyOnRvZ2dsZS1wYW5lbCcsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9nZXRDb250cm9sbGVyKCkudG9nZ2xlUGFuZWwoKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG4gICAgLy8gTGlzdGVuIGZvciBydW4gZXZlbnRzIG9uIGZpbGVzIGluIHRoZSBmaWxlIHRyZWVcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmZpbGUubGlzdC1pdGVtJyxcbiAgICAgICAgJ251Y2xpZGUtdGVzdC1ydW5uZXI6cnVuLXRlc3RzJyxcbiAgICAgICAgZXZlbnQgPT4ge1xuICAgICAgICAgIGNvbnN0IHRhcmdldCA9ICgoZXZlbnQuY3VycmVudFRhcmdldDogYW55KTogSFRNTEVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJyk7XG4gICAgICAgICAgdGhpcy5fZ2V0Q29udHJvbGxlcigpLnJ1blRlc3RzKHRhcmdldC5kYXRhc2V0LnBhdGgpO1xuICAgICAgICAgIC8vIEVuc3VyZSBhbmNlc3RvcnMgb2YgdGhpcyBlbGVtZW50IGRvbid0IGF0dGVtcHQgdG8gcnVuIHRlc3RzIGFzIHdlbGwuXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICAgIC8vIExpc3RlbiBmb3IgcnVuIGV2ZW50cyBvbiBkaXJlY3RvcmllcyBpbiB0aGUgZmlsZSB0cmVlXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICcudHJlZS12aWV3IC5lbnRyeS5kaXJlY3RvcnkubGlzdC1uZXN0ZWQtaXRlbScsXG4gICAgICAgICdudWNsaWRlLXRlc3QtcnVubmVyOnJ1bi10ZXN0cycsXG4gICAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KS5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICAgIHRoaXMuX2dldENvbnRyb2xsZXIoKS5ydW5UZXN0cyh0YXJnZXQuZGF0YXNldC5wYXRoKTtcbiAgICAgICAgICAvLyBFbnN1cmUgYW5jZXN0b3JzIG9mIHRoaXMgZWxlbWVudCBkb24ndCBhdHRlbXB0IHRvIHJ1biB0ZXN0cyBhcyB3ZWxsLlxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbnRleHRNZW51LmFkZCh7XG4gICAgICAgICcudHJlZS12aWV3IC5lbnRyeS5kaXJlY3RvcnkubGlzdC1uZXN0ZWQtaXRlbSA+IC5saXN0LWl0ZW0nOiBbXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgICB0aGlzLl9jcmVhdGVSdW5UZXN0c0NvbnRleHRNZW51SXRlbSgnUnVuIHRlc3RzIGluJyksXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgXSxcbiAgICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmZpbGUubGlzdC1pdGVtJzogW1xuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgICAgdGhpcy5fY3JlYXRlUnVuVGVzdHNDb250ZXh0TWVudUl0ZW0oJ1J1biB0ZXN0cyBhdCcpLFxuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBUaGUgcGFuZWwgc2hvdWxkIGJlIHZpc2libGUgYmVjYXVzZSBvZiB0aGUgbGFzdCBzZXJpYWxpemVkIHN0YXRlLCBpbml0aWFsaXplIGl0IGltbWVkaWF0ZWx5LlxuICAgIGlmIChzdGF0ZSAhPSBudWxsICYmIHN0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgdGhpcy5fZ2V0Q29udHJvbGxlcigpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRlc3RSdW5uZXIodGVzdFJ1bm5lcjogVGVzdFJ1bm5lcik6ID9EaXNwb3NhYmxlIHtcbiAgICBpZiAodGhpcy5fdGVzdFJ1bm5lcnMuaGFzKHRlc3RSdW5uZXIpKSB7XG4gICAgICBnZXRMb2dnZXIoKS5pbmZvKGBBdHRlbXB0ZWQgdG8gYWRkIHRlc3QgcnVubmVyIFwiJHt0ZXN0UnVubmVyLmxhYmVsfVwiIHRoYXQgd2FzIGFscmVhZHkgYWRkZWRgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl90ZXN0UnVubmVycy5hZGQodGVzdFJ1bm5lcik7XG4gICAgLy8gVGVsbCB0aGUgY29udHJvbGxlciB0byByZS1yZW5kZXIgb25seSBpZiBpdCBleGlzdHMgc28gdGVzdCBydW5uZXIgc2VydmljZXMgd29uJ3QgZm9yY2VcbiAgICAvLyBjb25zdHJ1Y3Rpb24gaWYgdGhlIHBhbmVsIGlzIHN0aWxsIGludmlzaWJsZS5cbiAgICAvL1xuICAgIC8vIFRPRE8ocm9zc2FsbGVuKTogVGhlIGNvbnRyb2wgc2hvdWxkIGJlIGludmVydGVkIGhlcmUuIFRoZSBjb250cm9sbGVyIHNob3VsZCBsaXN0ZW4gZm9yXG4gICAgLy8gY2hhbmdlcyByYXRoZXIgdGhhbiBiZSB0b2xkIGFib3V0IHRoZW0uXG4gICAgaWYgKHRoaXMuX2NvbnRyb2xsZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fZ2V0Q29udHJvbGxlcigpLmRpZFVwZGF0ZVRlc3RSdW5uZXJzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3Rlc3RSdW5uZXJzLmRlbGV0ZSh0ZXN0UnVubmVyKTtcbiAgICAgIC8vIFRlbGwgdGhlIGNvbnRyb2xsZXIgdG8gcmUtcmVuZGVyIG9ubHkgaWYgaXQgZXhpc3RzIHNvIHRlc3QgcnVubmVyIHNlcnZpY2VzIHdvbid0IGZvcmNlXG4gICAgICAvLyBjb25zdHJ1Y3Rpb24gaWYgdGhlIHBhbmVsIGlzIHN0aWxsIGludmlzaWJsZS5cbiAgICAgIGlmICh0aGlzLl9jb250cm9sbGVyICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fZ2V0Q29udHJvbGxlcigpLmRpZFVwZGF0ZVRlc3RSdW5uZXJzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXREaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXIoKTogRGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ251Y2xpZGUtdGVzdC1ydW5uZXInLFxuICAgICAgaXNWaXNpYmxlOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb250cm9sbGVyICE9IG51bGwgJiYgdGhpcy5fY29udHJvbGxlci5pc1Zpc2libGUoKTtcbiAgICAgIH0sXG4gICAgICB0b2dnbGU6ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZ2V0Q29udHJvbGxlcigpLnRvZ2dsZVBhbmVsKCk7XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB0aGlzLl9nZXRDb250cm9sbGVyKCkuc2VyaWFsaXplKCk7XG4gIH1cblxuICBfY3JlYXRlUnVuVGVzdHNDb250ZXh0TWVudUl0ZW0obGFiZWw6IHN0cmluZyk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIEludGVudGlvbmFsbHkgKipub3QqKiBhbiBhcnJvdyBmdW5jdGlvbiBiZWNhdXNlIEF0b20gc2V0cyB0aGUgY29udGV4dCB3aGVuIGNhbGxpbmcgdGhpcyBhbmRcbiAgICAgIC8vIGFsbG93cyBkeW5hbWljYWxseSBzZXR0aW5nIHZhbHVlcyBieSBhc3NpZ25pbmcgdG8gYHRoaXNgLlxuICAgICAgY3JlYXRlZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKHRhcmdldC5kYXRhc2V0Lm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZSBldmVudCBkaWQgbm90IGhhcHBlbiBvbiB0aGUgYG5hbWVgIHNwYW4sIHNlYXJjaCBmb3IgaXQgaW4gdGhlIGRlc2NlbmRhbnRzLlxuICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQuZGF0YXNldC5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBJZiBubyBuZWNlc3NhcnkgYC5uYW1lYCBkZXNjZW5kYW50IGlzIGZvdW5kLCBkb24ndCBkaXNwbGF5IGEgY29udGV4dCBtZW51LlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuYW1lID0gdGFyZ2V0LmRhdGFzZXQubmFtZTtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gJ251Y2xpZGUtdGVzdC1ydW5uZXI6cnVuLXRlc3RzJztcbiAgICAgICAgdGhpcy5sYWJlbCA9IGAke2xhYmVsfSAnJHtsaW1pdFN0cmluZyhuYW1lKX0nYDtcbiAgICAgIH0sXG4gICAgICBzaG91bGREaXNwbGF5OiBldmVudCA9PiB7XG4gICAgICAgIC8vIERvbid0IHNob3cgYSB0ZXN0aW5nIG9wdGlvbiBpZiB0aGVyZSBhcmUgbm8gdGVzdCBydW5uZXJzLlxuICAgICAgICBpZiAodGhpcy5fdGVzdFJ1bm5lcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0YXJnZXQuZGF0YXNldC5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZXZlbnQgZGlkIG5vdCBoYXBwZW4gb24gdGhlIGBuYW1lYCBzcGFuLCBzZWFyY2ggZm9yIGl0IGluIHRoZSBkZXNjZW5kYW50cy5cbiAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLm5hbWUnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBubyBkZXNjZW5kYW50IGhhcyB0aGUgbmVjZXNzYXJ5IGRhdGFzZXQgdG8gY3JlYXRlIHRoaXMgbWVudSBpdGVtLCBkb24ndCBjcmVhdGVcbiAgICAgICAgLy8gaXQuXG4gICAgICAgIHJldHVybiB0YXJnZXQgIT0gbnVsbCAmJiB0YXJnZXQuZGF0YXNldC5uYW1lICE9IG51bGwgJiYgdGFyZ2V0LmRhdGFzZXQucGF0aCAhPSBudWxsO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgX2dldENvbnRyb2xsZXIoKSB7XG4gICAgbGV0IGNvbnRyb2xsZXIgPSB0aGlzLl9jb250cm9sbGVyO1xuICAgIGlmIChjb250cm9sbGVyID09IG51bGwpIHtcbiAgICAgIGNvbnN0IHtUZXN0UnVubmVyQ29udHJvbGxlcn0gPSByZXF1aXJlKCcuL1Rlc3RSdW5uZXJDb250cm9sbGVyJyk7XG4gICAgICBjb250cm9sbGVyID0gbmV3IFRlc3RSdW5uZXJDb250cm9sbGVyKHRoaXMuX2luaXRpYWxTdGF0ZSwgdGhpcy5fdGVzdFJ1bm5lcnMpO1xuICAgICAgdGhpcy5fY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gICAgfVxuICAgIHJldHVybiBjb250cm9sbGVyO1xuICB9XG5cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uO1xubGV0IHRvb2xCYXI6ID9hbnkgPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxuICBpZiAodG9vbEJhcikge1xuICAgIHRvb2xCYXIucmVtb3ZlSXRlbXMoKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gIHJldHVybiBhY3RpdmF0aW9uID8gYWN0aXZhdGlvbi5zZXJpYWxpemUoKSA6IHt9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZVRlc3RSdW5uZXIodGVzdFJ1bm5lcjogVGVzdFJ1bm5lcik6ID9EaXNwb3NhYmxlIHtcbiAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICByZXR1cm4gYWN0aXZhdGlvbi5hZGRUZXN0UnVubmVyKHRlc3RSdW5uZXIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gIHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLXRlc3QtcnVubmVyJyk7XG4gIHRvb2xCYXIuYWRkQnV0dG9uKHtcbiAgICBpY29uOiAnY2hlY2tsaXN0JyxcbiAgICBjYWxsYmFjazogJ251Y2xpZGUtdGVzdC1ydW5uZXI6dG9nZ2xlLXBhbmVsJyxcbiAgICB0b29sdGlwOiAnVG9nZ2xlIFRlc3QgUnVubmVyJyxcbiAgICBwcmlvcml0eTogNDAwLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gIHJldHVybiB7XG4gICAgZmVhdHVyZToge1xuICAgICAgdGl0bGU6ICdUZXN0IFJ1bm5lcicsXG4gICAgICBpY29uOiAnY2hlY2tsaXN0JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnUnVuIHRlc3RzIGRpcmVjdGx5IGZyb20gTnVjbGlkZSBieSByaWdodC1tb3VzZS1jbGlja2luZyBvbiB0aGUgZmlsZS4nLFxuICAgICAgY29tbWFuZDogJ251Y2xpZGUtdGVzdC1ydW5uZXI6dG9nZ2xlLXBhbmVsJyxcbiAgICB9LFxuICAgIHByaW9yaXR5OiAyLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGlzdHJhY3Rpb25GcmVlTW9kZVByb3ZpZGVyKCk6IERpc3RyYWN0aW9uRnJlZU1vZGVQcm92aWRlciB7XG4gIGludmFyaWFudChhY3RpdmF0aW9uICE9IG51bGwpO1xuICByZXR1cm4gYWN0aXZhdGlvbi5nZXREaXN0cmFjdGlvbkZyZWVNb2RlUHJvdmlkZXIoKTtcbn1cbiJdfQ==