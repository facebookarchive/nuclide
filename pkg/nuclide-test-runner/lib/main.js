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

    this._initialState = state;
    this._testRunners = new Set();
    this._disposables = new CompositeDisposable();
    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-test-runner:toggle-panel', function () {
      _this._getController().togglePanel();
    }));
    // Listen for run events on files in the file tree
    this._disposables.add(atom.commands.add('.tree-view .entry.file.list-item', 'nuclide-test-runner:run-tests', function (event) {
      var target = event.currentTarget.querySelector('.name');
      _this._getController().runTests(target.dataset.path);
    }));
    // Listen for run events on directories in the file tree
    this._disposables.add(atom.commands.add('.tree-view .entry.directory.list-nested-item', 'nuclide-test-runner:run-tests', function (event) {
      var target = event.currentTarget.querySelector('.name');
      _this._getController().runTests(target.dataset.path);
    }));
    this._disposables.add(atom.contextMenu.add({
      '.tree-view .entry.directory.list-nested-item': [{ type: 'separator' }, this._createRunTestsContextMenuItem('Run tests in'), { type: 'separator' }],
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

      return new Disposable(function () {
        _this2._testRunners['delete'](testRunner);
        // Tell the controller to re-render only if it exists so test runner services won't force
        // construction if the panel is still invisible.
        if (_this2._controller != null) {
          _this2._getController().didUpdateTestRunners();
        }
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
      return this._getController().serialize();
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
  }, {
    key: '_getController',
    value: function _getController() {
      var controller = this._controller;
      if (controller == null) {
        var _require2 = require('./TestRunnerController');

        var TestRunnerController = _require2.TestRunnerController;

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
//# sourceMappingURL=data:application/json;base64,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QUFFO0FBQ1AsYUFBSyxFQUFFLGFBQWE7QUFDcEIsWUFBSSxFQUFFLFdBQVc7QUFDakIsbUJBQVcsRUFBRSxzRUFBc0U7QUFDbkYsZUFBTyxFQUFFLGtDQUFrQztPQUM1QztBQUNELGNBQVEsRUFBRSxDQUFDO0tBQ1osQ0FBQztHQUNIOztDQUVGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9udWNsaWRlLWhvbWUtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7VGVzdFJ1bm5lcn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtUZXN0UnVubmVyQ29udHJvbGxlciBhcyBUZXN0UnVubmVyQ29udHJvbGxlclR5cGV9IGZyb20gJy4vVGVzdFJ1bm5lckNvbnRyb2xsZXInO1xuaW1wb3J0IHR5cGUge1Rlc3RSdW5uZXJDb250cm9sbGVyU3RhdGV9IGZyb20gJy4vVGVzdFJ1bm5lckNvbnRyb2xsZXInO1xuXG5jb25zdCB7XG4gIENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gIERpc3Bvc2FibGUsXG59ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5sZXQgbG9nZ2VyO1xuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICBpZiAoIWxvZ2dlcikge1xuICAgIGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICB9XG4gIHJldHVybiBsb2dnZXI7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyBvZiBsZW5ndGggYGxlbmd0aGAgKyAxIGJ5IHJlcGxhY2luZyBleHRyYSBjaGFyYWN0ZXJzIGluIHRoZSBtaWRkbGUgb2YgYHN0cmAgd2l0aFxuICogYW4gZWxsaXBzaXMgY2hhcmFjdGVyLiBFeGFtcGxlOlxuICpcbiAqICAgICA+IGxpbWl0U3RyaW5nKCdmb29iYXInLCA0KVxuICogICAgICdmb+KApmFyJ1xuICovXG5mdW5jdGlvbiBsaW1pdFN0cmluZyhzdHI6IHN0cmluZywgbGVuZ3RoPzogbnVtYmVyID0gMjApOiBzdHJpbmcge1xuICBjb25zdCBzdHJMZW5ndGggPSBzdHIubGVuZ3RoO1xuICByZXR1cm4gKHN0ckxlbmd0aCA+IGxlbmd0aCkgP1xuICAgIGAke3N0ci5zdWJzdHJpbmcoMCwgbGVuZ3RoIC8gMil94oCmJHtzdHIuc3Vic3RyaW5nKHN0ci5sZW5ndGggLSBsZW5ndGggLyAyKX1gIDpcbiAgICBzdHI7XG59XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuXG4gIF9jb250cm9sbGVyOiBUZXN0UnVubmVyQ29udHJvbGxlclR5cGU7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2luaXRpYWxTdGF0ZTogP1Rlc3RSdW5uZXJDb250cm9sbGVyU3RhdGU7XG4gIF90ZXN0UnVubmVyczogU2V0PFRlc3RSdW5uZXI+O1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/VGVzdFJ1bm5lckNvbnRyb2xsZXJTdGF0ZSkge1xuICAgIHRoaXMuX2luaXRpYWxTdGF0ZSA9IHN0YXRlO1xuICAgIHRoaXMuX3Rlc3RSdW5uZXJzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICAgJ251Y2xpZGUtdGVzdC1ydW5uZXI6dG9nZ2xlLXBhbmVsJyxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX2dldENvbnRyb2xsZXIoKS50b2dnbGVQYW5lbCgpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgICAvLyBMaXN0ZW4gZm9yIHJ1biBldmVudHMgb24gZmlsZXMgaW4gdGhlIGZpbGUgdHJlZVxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnLnRyZWUtdmlldyAuZW50cnkuZmlsZS5saXN0LWl0ZW0nLFxuICAgICAgICAnbnVjbGlkZS10ZXN0LXJ1bm5lcjpydW4tdGVzdHMnLFxuICAgICAgICBldmVudCA9PiB7XG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gKChldmVudC5jdXJyZW50VGFyZ2V0OiBhbnkpOiBIVE1MRWxlbWVudCkucXVlcnlTZWxlY3RvcignLm5hbWUnKTtcbiAgICAgICAgICB0aGlzLl9nZXRDb250cm9sbGVyKCkucnVuVGVzdHModGFyZ2V0LmRhdGFzZXQucGF0aCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICAgIC8vIExpc3RlbiBmb3IgcnVuIGV2ZW50cyBvbiBkaXJlY3RvcmllcyBpbiB0aGUgZmlsZSB0cmVlXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICcudHJlZS12aWV3IC5lbnRyeS5kaXJlY3RvcnkubGlzdC1uZXN0ZWQtaXRlbScsXG4gICAgICAgICdudWNsaWRlLXRlc3QtcnVubmVyOnJ1bi10ZXN0cycsXG4gICAgICAgIGV2ZW50ID0+IHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KS5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICAgIHRoaXMuX2dldENvbnRyb2xsZXIoKS5ydW5UZXN0cyh0YXJnZXQuZGF0YXNldC5wYXRoKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgICAnLnRyZWUtdmlldyAuZW50cnkuZGlyZWN0b3J5Lmxpc3QtbmVzdGVkLWl0ZW0nOiBbXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgICB0aGlzLl9jcmVhdGVSdW5UZXN0c0NvbnRleHRNZW51SXRlbSgnUnVuIHRlc3RzIGluJyksXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgXSxcbiAgICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmZpbGUubGlzdC1pdGVtJzogW1xuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgICAgdGhpcy5fY3JlYXRlUnVuVGVzdHNDb250ZXh0TWVudUl0ZW0oJ1J1biB0ZXN0cyBhdCcpLFxuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBUaGUgcGFuZWwgc2hvdWxkIGJlIHZpc2libGUgYmVjYXVzZSBvZiB0aGUgbGFzdCBzZXJpYWxpemVkIHN0YXRlLCBpbml0aWFsaXplIGl0IGltbWVkaWF0ZWx5LlxuICAgIGlmIChzdGF0ZSAhPSBudWxsICYmIHN0YXRlLnBhbmVsVmlzaWJsZSkge1xuICAgICAgdGhpcy5fZ2V0Q29udHJvbGxlcigpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRlc3RSdW5uZXIodGVzdFJ1bm5lcjogVGVzdFJ1bm5lcik6ID9EaXNwb3NhYmxlIHtcbiAgICBpZiAodGhpcy5fdGVzdFJ1bm5lcnMuaGFzKHRlc3RSdW5uZXIpKSB7XG4gICAgICBnZXRMb2dnZXIoKS5pbmZvKGBBdHRlbXB0ZWQgdG8gYWRkIHRlc3QgcnVubmVyIFwiJHt0ZXN0UnVubmVyLmxhYmVsfVwiIHRoYXQgd2FzIGFscmVhZHkgYWRkZWRgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl90ZXN0UnVubmVycy5hZGQodGVzdFJ1bm5lcik7XG4gICAgLy8gVGVsbCB0aGUgY29udHJvbGxlciB0byByZS1yZW5kZXIgb25seSBpZiBpdCBleGlzdHMgc28gdGVzdCBydW5uZXIgc2VydmljZXMgd29uJ3QgZm9yY2VcbiAgICAvLyBjb25zdHJ1Y3Rpb24gaWYgdGhlIHBhbmVsIGlzIHN0aWxsIGludmlzaWJsZS5cbiAgICAvL1xuICAgIC8vIFRPRE8ocm9zc2FsbGVuKTogVGhlIGNvbnRyb2wgc2hvdWxkIGJlIGludmVydGVkIGhlcmUuIFRoZSBjb250cm9sbGVyIHNob3VsZCBsaXN0ZW4gZm9yXG4gICAgLy8gY2hhbmdlcyByYXRoZXIgdGhhbiBiZSB0b2xkIGFib3V0IHRoZW0uXG4gICAgaWYgKHRoaXMuX2NvbnRyb2xsZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fZ2V0Q29udHJvbGxlcigpLmRpZFVwZGF0ZVRlc3RSdW5uZXJzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3Rlc3RSdW5uZXJzLmRlbGV0ZSh0ZXN0UnVubmVyKTtcbiAgICAgIC8vIFRlbGwgdGhlIGNvbnRyb2xsZXIgdG8gcmUtcmVuZGVyIG9ubHkgaWYgaXQgZXhpc3RzIHNvIHRlc3QgcnVubmVyIHNlcnZpY2VzIHdvbid0IGZvcmNlXG4gICAgICAvLyBjb25zdHJ1Y3Rpb24gaWYgdGhlIHBhbmVsIGlzIHN0aWxsIGludmlzaWJsZS5cbiAgICAgIGlmICh0aGlzLl9jb250cm9sbGVyICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fZ2V0Q29udHJvbGxlcigpLmRpZFVwZGF0ZVRlc3RSdW5uZXJzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB0aGlzLl9nZXRDb250cm9sbGVyKCkuc2VyaWFsaXplKCk7XG4gIH1cblxuICBfY3JlYXRlUnVuVGVzdHNDb250ZXh0TWVudUl0ZW0obGFiZWw6IHN0cmluZyk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIEludGVudGlvbmFsbHkgKipub3QqKiBhbiBhcnJvdyBmdW5jdGlvbiBiZWNhdXNlIEF0b20gc2V0cyB0aGUgY29udGV4dCB3aGVuIGNhbGxpbmcgdGhpcyBhbmRcbiAgICAgIC8vIGFsbG93cyBkeW5hbWljYWxseSBzZXR0aW5nIHZhbHVlcyBieSBhc3NpZ25pbmcgdG8gYHRoaXNgLlxuICAgICAgY3JlYXRlZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKHRhcmdldC5kYXRhc2V0Lm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZSBldmVudCBkaWQgbm90IGhhcHBlbiBvbiB0aGUgYG5hbWVgIHNwYW4sIHNlYXJjaCBmb3IgaXQgaW4gdGhlIGRlc2NlbmRhbnRzLlxuICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQuZGF0YXNldC5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBJZiBubyBuZWNlc3NhcnkgYC5uYW1lYCBkZXNjZW5kYW50IGlzIGZvdW5kLCBkb24ndCBkaXNwbGF5IGEgY29udGV4dCBtZW51LlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuYW1lID0gdGFyZ2V0LmRhdGFzZXQubmFtZTtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gJ251Y2xpZGUtdGVzdC1ydW5uZXI6cnVuLXRlc3RzJztcbiAgICAgICAgdGhpcy5sYWJlbCA9IGAke2xhYmVsfSAnJHtsaW1pdFN0cmluZyhuYW1lKX0nYDtcbiAgICAgIH0sXG4gICAgICBzaG91bGREaXNwbGF5OiBldmVudCA9PiB7XG4gICAgICAgIC8vIERvbid0IHNob3cgYSB0ZXN0aW5nIG9wdGlvbiBpZiB0aGVyZSBhcmUgbm8gdGVzdCBydW5uZXJzLlxuICAgICAgICBpZiAodGhpcy5fdGVzdFJ1bm5lcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0YXJnZXQuZGF0YXNldC5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZXZlbnQgZGlkIG5vdCBoYXBwZW4gb24gdGhlIGBuYW1lYCBzcGFuLCBzZWFyY2ggZm9yIGl0IGluIHRoZSBkZXNjZW5kYW50cy5cbiAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLm5hbWUnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBubyBkZXNjZW5kYW50IGhhcyB0aGUgbmVjZXNzYXJ5IGRhdGFzZXQgdG8gY3JlYXRlIHRoaXMgbWVudSBpdGVtLCBkb24ndCBjcmVhdGVcbiAgICAgICAgLy8gaXQuXG4gICAgICAgIHJldHVybiB0YXJnZXQgIT0gbnVsbCAmJiB0YXJnZXQuZGF0YXNldC5uYW1lICE9IG51bGwgJiYgdGFyZ2V0LmRhdGFzZXQucGF0aCAhPSBudWxsO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgX2dldENvbnRyb2xsZXIoKSB7XG4gICAgbGV0IGNvbnRyb2xsZXIgPSB0aGlzLl9jb250cm9sbGVyO1xuICAgIGlmIChjb250cm9sbGVyID09IG51bGwpIHtcbiAgICAgIGNvbnN0IHtUZXN0UnVubmVyQ29udHJvbGxlcn0gPSByZXF1aXJlKCcuL1Rlc3RSdW5uZXJDb250cm9sbGVyJyk7XG4gICAgICBjb250cm9sbGVyID0gbmV3IFRlc3RSdW5uZXJDb250cm9sbGVyKHRoaXMuX2luaXRpYWxTdGF0ZSwgdGhpcy5fdGVzdFJ1bm5lcnMpO1xuICAgICAgdGhpcy5fY29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gICAgfVxuICAgIHJldHVybiBjb250cm9sbGVyO1xuICB9XG5cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uO1xubGV0IHRvb2xCYXI6ID9hbnkgPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRvb2xCYXIpIHtcbiAgICAgIHRvb2xCYXIucmVtb3ZlSXRlbXMoKTtcbiAgICB9XG4gIH0sXG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIGFjdGl2YXRpb24gPyBhY3RpdmF0aW9uLnNlcmlhbGl6ZSgpIDoge307XG4gIH0sXG5cbiAgY29uc3VtZVRlc3RSdW5uZXIodGVzdFJ1bm5lcjogVGVzdFJ1bm5lcik6ID9EaXNwb3NhYmxlIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgcmV0dXJuIGFjdGl2YXRpb24uYWRkVGVzdFJ1bm5lcih0ZXN0UnVubmVyKTtcbiAgICB9XG4gIH0sXG5cbiAgY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICAgIHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLXRlc3QtcnVubmVyJyk7XG4gICAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ2NoZWNrbGlzdCcsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtdGVzdC1ydW5uZXI6dG9nZ2xlLXBhbmVsJyxcbiAgICAgIHRvb2x0aXA6ICdUb2dnbGUgVGVzdCBSdW5uZXInLFxuICAgICAgcHJpb3JpdHk6IDQwMCxcbiAgICB9KTtcbiAgfSxcblxuICBnZXRIb21lRnJhZ21lbnRzKCk6IEhvbWVGcmFnbWVudHMge1xuICAgIHJldHVybiB7XG4gICAgICBmZWF0dXJlOiB7XG4gICAgICAgIHRpdGxlOiAnVGVzdCBSdW5uZXInLFxuICAgICAgICBpY29uOiAnY2hlY2tsaXN0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSdW4gdGVzdHMgZGlyZWN0bHkgZnJvbSBOdWNsaWRlIGJ5IHJpZ2h0LW1vdXNlLWNsaWNraW5nIG9uIHRoZSBmaWxlLicsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLXRlc3QtcnVubmVyOnRvZ2dsZS1wYW5lbCcsXG4gICAgICB9LFxuICAgICAgcHJpb3JpdHk6IDIsXG4gICAgfTtcbiAgfSxcblxufTtcbiJdfQ==