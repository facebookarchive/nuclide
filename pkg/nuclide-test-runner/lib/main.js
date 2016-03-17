var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

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

    this._testRunners = new Set();
    var TestRunnerController = require('./TestRunnerController');
    this._controller = new TestRunnerController(state, this._testRunners);
    this._disposables = new CompositeDisposable();
    this._disposables.add(atom.commands.add('body', 'nuclide-test-runner:toggle-panel', function () {
      _this._controller.togglePanel();
    }));
    // Listen for run events on files in the file tree
    this._disposables.add(atom.commands.add('.tree-view .entry.file.list-item', 'nuclide-test-runner:run-tests', function (event) {
      var target = event.currentTarget.querySelector('.name');
      _this._controller.runTests(target.dataset.path);
    }));
    // Listen for run events on directories in the file tree
    this._disposables.add(atom.commands.add('.tree-view .entry.directory.list-nested-item', 'nuclide-test-runner:run-tests', function (event) {
      var target = event.currentTarget.querySelector('.name');
      _this._controller.runTests(target.dataset.path);
    }));
    this._disposables.add(atom.contextMenu.add({
      '.tree-view .entry.directory.list-nested-item': [{ type: 'separator' }, this._createRunTestsContextMenuItem('Run tests in'), { type: 'separator' }],
      '.tree-view .entry.file.list-item': [{ type: 'separator' }, this._createRunTestsContextMenuItem('Run tests at'), { type: 'separator' }]
    }));
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
      this._controller.didUpdateTestRunners();

      return new Disposable(function () {
        _this2._testRunners['delete'](testRunner);
        _this2._controller.didUpdateTestRunners();
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return this._controller.serialize();
    }
  }, {
    key: '_createRunTestsContextMenuItem',
    value: function _createRunTestsContextMenuItem(label) {
      var _this3 = this;

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
          if (_this3._testRunners.size === 0) {
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
  }]);

  return Activation;
})();

var activation = undefined;
var toolBar = null;

module.exports = {

  activate: function activate(state) {
    if (!activation) {
      activation = new Activation(state);
    }
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
    if (toolBar) {
      toolBar.removeItems();
    }
  },

  serialize: function serialize() {
    return activation ? activation.serialize() : {};
  },

  consumeTestRunner: function consumeTestRunner(testRunner) {
    if (activation) {
      return activation.addTestRunner(testRunner);
    }
  },

  consumeToolBar: function consumeToolBar(getToolBar) {
    toolBar = getToolBar('nuclide-test-runner');
    toolBar.addButton({
      icon: 'checklist',
      callback: 'nuclide-test-runner:toggle-panel',
      tooltip: 'Toggle Test Runner',
      priority: 400
    });
  },

  getHomeFragments: function getHomeFragments() {
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

};
// TODO: Should be `TestRunnerController`, but it is lazily required.
//# sourceMappingURL=data:application/json;base64,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QU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUN2QjtHQUNGOztBQUVELFdBQVMsRUFBQSxxQkFBVztBQUNsQixXQUFPLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDO0dBQ2pEOztBQUVELG1CQUFpQixFQUFBLDJCQUFDLFVBQXNCLEVBQWU7QUFDckQsUUFBSSxVQUFVLEVBQUU7QUFDZCxhQUFPLFVBQVUsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7S0FDN0M7R0FDRjs7QUFFRCxnQkFBYyxFQUFBLHdCQUFDLFVBQXFDLEVBQVE7QUFDMUQsV0FBTyxHQUFHLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQzVDLFdBQU8sQ0FBQyxTQUFTLENBQUM7QUFDaEIsVUFBSSxFQUFFLFdBQVc7QUFDakIsY0FBUSxFQUFFLGtDQUFrQztBQUM1QyxhQUFPLEVBQUUsb0JBQW9CO0FBQzdCLGNBQVEsRUFBRSxHQUFHO0tBQ2QsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsa0JBQWdCLEVBQUEsNEJBQWtCO0FBQ2hDLFdBQU87QUFDTCxhQUFPLEVBQUU7QUFDUCxhQUFLLEVBQUUsYUFBYTtBQUNwQixZQUFJLEVBQUUsV0FBVztBQUNqQixtQkFBVyxFQUFFLHNFQUFzRTtBQUNuRixlQUFPLEVBQUUsa0NBQWtDO09BQzVDO0FBQ0QsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDO0dBQ0g7O0NBRUYsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgVGVzdFJ1bm5lckNvbnRyb2xsZXJTdGF0ZSBmcm9tICcuL1Rlc3RSdW5uZXJDb250cm9sbGVyJztcbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9udWNsaWRlLWhvbWUtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7VGVzdFJ1bm5lcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS10ZXN0LXJ1bm5lci1pbnRlcmZhY2VzJztcblxuY29uc3Qge1xuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBEaXNwb3NhYmxlLFxufSA9IHJlcXVpcmUoJ2F0b20nKTtcblxubGV0IGxvZ2dlcjtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYgKCFsb2dnZXIpIHtcbiAgICBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgfVxuICByZXR1cm4gbG9nZ2VyO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgb2YgbGVuZ3RoIGBsZW5ndGhgICsgMSBieSByZXBsYWNpbmcgZXh0cmEgY2hhcmFjdGVycyBpbiB0aGUgbWlkZGxlIG9mIGBzdHJgIHdpdGhcbiAqIGFuIGVsbGlwc2lzIGNoYXJhY3Rlci4gRXhhbXBsZTpcbiAqXG4gKiAgICAgPiBsaW1pdFN0cmluZygnZm9vYmFyJywgNClcbiAqICAgICAnZm/igKZhcidcbiAqL1xuZnVuY3Rpb24gbGltaXRTdHJpbmcoc3RyOiBzdHJpbmcsIGxlbmd0aD86IG51bWJlciA9IDIwKTogc3RyaW5nIHtcbiAgY29uc3Qgc3RyTGVuZ3RoID0gc3RyLmxlbmd0aDtcbiAgcmV0dXJuIChzdHJMZW5ndGggPiBsZW5ndGgpID9cbiAgICBgJHtzdHIuc3Vic3RyaW5nKDAsIGxlbmd0aCAvIDIpfeKApiR7c3RyLnN1YnN0cmluZyhzdHIubGVuZ3RoIC0gbGVuZ3RoIC8gMil9YCA6XG4gICAgc3RyO1xufVxuXG5jbGFzcyBBY3RpdmF0aW9uIHtcblxuICBfY29udHJvbGxlcjogT2JqZWN0OyAvLyBUT0RPOiBTaG91bGQgYmUgYFRlc3RSdW5uZXJDb250cm9sbGVyYCwgYnV0IGl0IGlzIGxhemlseSByZXF1aXJlZC5cbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfdGVzdFJ1bm5lcnM6IFNldDxUZXN0UnVubmVyPjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP1Rlc3RSdW5uZXJDb250cm9sbGVyU3RhdGUpIHtcbiAgICB0aGlzLl90ZXN0UnVubmVycyA9IG5ldyBTZXQoKTtcbiAgICBjb25zdCBUZXN0UnVubmVyQ29udHJvbGxlciA9IHJlcXVpcmUoJy4vVGVzdFJ1bm5lckNvbnRyb2xsZXInKTtcbiAgICB0aGlzLl9jb250cm9sbGVyID0gbmV3IFRlc3RSdW5uZXJDb250cm9sbGVyKHN0YXRlLCB0aGlzLl90ZXN0UnVubmVycyk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYm9keScsXG4gICAgICAgICdudWNsaWRlLXRlc3QtcnVubmVyOnRvZ2dsZS1wYW5lbCcsXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9jb250cm9sbGVyLnRvZ2dsZVBhbmVsKCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICAgIC8vIExpc3RlbiBmb3IgcnVuIGV2ZW50cyBvbiBmaWxlcyBpbiB0aGUgZmlsZSB0cmVlXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICcudHJlZS12aWV3IC5lbnRyeS5maWxlLmxpc3QtaXRlbScsXG4gICAgICAgICdudWNsaWRlLXRlc3QtcnVubmVyOnJ1bi10ZXN0cycsXG4gICAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KS5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICAgIHRoaXMuX2NvbnRyb2xsZXIucnVuVGVzdHModGFyZ2V0LmRhdGFzZXQucGF0aCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICAgIC8vIExpc3RlbiBmb3IgcnVuIGV2ZW50cyBvbiBkaXJlY3RvcmllcyBpbiB0aGUgZmlsZSB0cmVlXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICcudHJlZS12aWV3IC5lbnRyeS5kaXJlY3RvcnkubGlzdC1uZXN0ZWQtaXRlbScsXG4gICAgICAgICdudWNsaWRlLXRlc3QtcnVubmVyOnJ1bi10ZXN0cycsXG4gICAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KS5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICAgIHRoaXMuX2NvbnRyb2xsZXIucnVuVGVzdHModGFyZ2V0LmRhdGFzZXQucGF0aCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmRpcmVjdG9yeS5saXN0LW5lc3RlZC1pdGVtJzogW1xuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgICAgdGhpcy5fY3JlYXRlUnVuVGVzdHNDb250ZXh0TWVudUl0ZW0oJ1J1biB0ZXN0cyBpbicpLFxuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIF0sXG4gICAgICAgICcudHJlZS12aWV3IC5lbnRyeS5maWxlLmxpc3QtaXRlbSc6IFtcbiAgICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICAgIHRoaXMuX2NyZWF0ZVJ1blRlc3RzQ29udGV4dE1lbnVJdGVtKCdSdW4gdGVzdHMgYXQnKSxcbiAgICAgICAgICB7dHlwZTogJ3NlcGFyYXRvcid9LFxuICAgICAgICBdLFxuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgYWRkVGVzdFJ1bm5lcih0ZXN0UnVubmVyOiBUZXN0UnVubmVyKTogP0Rpc3Bvc2FibGUge1xuICAgIGlmICh0aGlzLl90ZXN0UnVubmVycy5oYXModGVzdFJ1bm5lcikpIHtcbiAgICAgIGdldExvZ2dlcigpLmluZm8oYEF0dGVtcHRlZCB0byBhZGQgdGVzdCBydW5uZXIgXCIke3Rlc3RSdW5uZXIubGFiZWx9XCIgdGhhdCB3YXMgYWxyZWFkeSBhZGRlZGApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3Rlc3RSdW5uZXJzLmFkZCh0ZXN0UnVubmVyKTtcbiAgICB0aGlzLl9jb250cm9sbGVyLmRpZFVwZGF0ZVRlc3RSdW5uZXJzKCk7XG5cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fdGVzdFJ1bm5lcnMuZGVsZXRlKHRlc3RSdW5uZXIpO1xuICAgICAgdGhpcy5fY29udHJvbGxlci5kaWRVcGRhdGVUZXN0UnVubmVycygpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5fY29udHJvbGxlci5zZXJpYWxpemUoKTtcbiAgfVxuXG4gIF9jcmVhdGVSdW5UZXN0c0NvbnRleHRNZW51SXRlbShsYWJlbDogc3RyaW5nKTogT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gSW50ZW50aW9uYWxseSAqKm5vdCoqIGFuIGFycm93IGZ1bmN0aW9uIGJlY2F1c2UgQXRvbSBzZXRzIHRoZSBjb250ZXh0IHdoZW4gY2FsbGluZyB0aGlzIGFuZFxuICAgICAgLy8gYWxsb3dzIGR5bmFtaWNhbGx5IHNldHRpbmcgdmFsdWVzIGJ5IGFzc2lnbmluZyB0byBgdGhpc2AuXG4gICAgICBjcmVhdGVkOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBsZXQgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICBpZiAodGFyZ2V0LmRhdGFzZXQubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGV2ZW50IGRpZCBub3QgaGFwcGVuIG9uIHRoZSBgbmFtZWAgc3Bhbiwgc2VhcmNoIGZvciBpdCBpbiB0aGUgZGVzY2VuZGFudHMuXG4gICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhcmdldC5kYXRhc2V0Lm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIG5vIG5lY2Vzc2FyeSBgLm5hbWVgIGRlc2NlbmRhbnQgaXMgZm91bmQsIGRvbid0IGRpc3BsYXkgYSBjb250ZXh0IG1lbnUuXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0YXJnZXQuZGF0YXNldC5uYW1lO1xuICAgICAgICB0aGlzLmNvbW1hbmQgPSAnbnVjbGlkZS10ZXN0LXJ1bm5lcjpydW4tdGVzdHMnO1xuICAgICAgICB0aGlzLmxhYmVsID0gYCR7bGFiZWx9ICcke2xpbWl0U3RyaW5nKG5hbWUpfSdgO1xuICAgICAgfSxcbiAgICAgIHNob3VsZERpc3BsYXk6IGV2ZW50ID0+IHtcbiAgICAgICAgLy8gRG9uJ3Qgc2hvdyBhIHRlc3Rpbmcgb3B0aW9uIGlmIHRoZXJlIGFyZSBubyB0ZXN0IHJ1bm5lcnMuXG4gICAgICAgIGlmICh0aGlzLl90ZXN0UnVubmVycy5zaXplID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKHRhcmdldC5kYXRhc2V0Lm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZSBldmVudCBkaWQgbm90IGhhcHBlbiBvbiB0aGUgYG5hbWVgIHNwYW4sIHNlYXJjaCBmb3IgaXQgaW4gdGhlIGRlc2NlbmRhbnRzLlxuICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIG5vIGRlc2NlbmRhbnQgaGFzIHRoZSBuZWNlc3NhcnkgZGF0YXNldCB0byBjcmVhdGUgdGhpcyBtZW51IGl0ZW0sIGRvbid0IGNyZWF0ZVxuICAgICAgICAvLyBpdC5cbiAgICAgICAgcmV0dXJuIHRhcmdldCAhPSBudWxsICYmIHRhcmdldC5kYXRhc2V0Lm5hbWUgIT0gbnVsbCAmJiB0YXJnZXQuZGF0YXNldC5wYXRoICE9IG51bGw7XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb247XG5sZXQgdG9vbEJhcjogP2FueSA9IG51bGw7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodG9vbEJhcikge1xuICAgICAgdG9vbEJhci5yZW1vdmVJdGVtcygpO1xuICAgIH1cbiAgfSxcblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4gYWN0aXZhdGlvbiA/IGFjdGl2YXRpb24uc2VyaWFsaXplKCkgOiB7fTtcbiAgfSxcblxuICBjb25zdW1lVGVzdFJ1bm5lcih0ZXN0UnVubmVyOiBUZXN0UnVubmVyKTogP0Rpc3Bvc2FibGUge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gYWN0aXZhdGlvbi5hZGRUZXN0UnVubmVyKHRlc3RSdW5uZXIpO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtdGVzdC1ydW5uZXInKTtcbiAgICB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiAnY2hlY2tsaXN0JyxcbiAgICAgIGNhbGxiYWNrOiAnbnVjbGlkZS10ZXN0LXJ1bm5lcjp0b2dnbGUtcGFuZWwnLFxuICAgICAgdG9vbHRpcDogJ1RvZ2dsZSBUZXN0IFJ1bm5lcicsXG4gICAgICBwcmlvcml0eTogNDAwLFxuICAgIH0pO1xuICB9LFxuXG4gIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZlYXR1cmU6IHtcbiAgICAgICAgdGl0bGU6ICdUZXN0IFJ1bm5lcicsXG4gICAgICAgIGljb246ICdjaGVja2xpc3QnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1J1biB0ZXN0cyBkaXJlY3RseSBmcm9tIE51Y2xpZGUgYnkgcmlnaHQtbW91c2UtY2xpY2tpbmcgb24gdGhlIGZpbGUuJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtdGVzdC1ydW5uZXI6dG9nZ2xlLXBhbmVsJyxcbiAgICAgIH0sXG4gICAgICBwcmlvcml0eTogMixcbiAgICB9O1xuICB9LFxuXG59O1xuIl19