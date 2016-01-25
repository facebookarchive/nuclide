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
    logger = require('../../logging').getLogger();
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
//# sourceMappingURL=data:application/json;base64,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LENBQUMsV0FBVyxFQUFFLENBQUM7S0FDdkI7R0FDRjs7QUFFRCxXQUFTLEVBQUEscUJBQVc7QUFDbEIsV0FBTyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztHQUNqRDs7QUFFRCxtQkFBaUIsRUFBQSwyQkFBQyxVQUFzQixFQUFlO0FBQ3JELFFBQUksVUFBVSxFQUFFO0FBQ2QsYUFBTyxVQUFVLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQzdDO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBQSx3QkFBQyxVQUFxQyxFQUFRO0FBQzFELFdBQU8sR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUM1QyxXQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2hCLFVBQUksRUFBRSxXQUFXO0FBQ2pCLGNBQVEsRUFBRSxrQ0FBa0M7QUFDNUMsYUFBTyxFQUFFLG9CQUFvQjtBQUM3QixjQUFRLEVBQUUsR0FBRztLQUNkLENBQUMsQ0FBQztHQUNKOztBQUVELGtCQUFnQixFQUFBLDRCQUFrQjtBQUNoQyxXQUFPO0FBQ0wsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLGFBQWE7QUFDcEIsWUFBSSxFQUFFLFdBQVc7QUFDakIsbUJBQVcsRUFBRSxzRUFBc0U7QUFDbkYsZUFBTyxFQUFFLGtDQUFrQztPQUM1QztBQUNELGNBQVEsRUFBRSxDQUFDO0tBQ1osQ0FBQztHQUNIOztDQUVGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIFRlc3RSdW5uZXJDb250cm9sbGVyU3RhdGUgZnJvbSAnLi9UZXN0UnVubmVyQ29udHJvbGxlcic7XG5pbXBvcnQgdHlwZSB7SG9tZUZyYWdtZW50c30gZnJvbSAnLi4vLi4vaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtUZXN0UnVubmVyfSBmcm9tICcuLi8uLi90ZXN0LXJ1bm5lci1pbnRlcmZhY2VzJztcblxuY29uc3Qge1xuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBEaXNwb3NhYmxlLFxufSA9IHJlcXVpcmUoJ2F0b20nKTtcblxubGV0IGxvZ2dlcjtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYgKCFsb2dnZXIpIHtcbiAgICBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gIH1cbiAgcmV0dXJuIGxvZ2dlcjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIG9mIGxlbmd0aCBgbGVuZ3RoYCArIDEgYnkgcmVwbGFjaW5nIGV4dHJhIGNoYXJhY3RlcnMgaW4gdGhlIG1pZGRsZSBvZiBgc3RyYCB3aXRoXG4gKiBhbiBlbGxpcHNpcyBjaGFyYWN0ZXIuIEV4YW1wbGU6XG4gKlxuICogICAgID4gbGltaXRTdHJpbmcoJ2Zvb2JhcicsIDQpXG4gKiAgICAgJ2Zv4oCmYXInXG4gKi9cbmZ1bmN0aW9uIGxpbWl0U3RyaW5nKHN0cjogc3RyaW5nLCBsZW5ndGg/OiBudW1iZXIgPSAyMCk6IHN0cmluZyB7XG4gIGNvbnN0IHN0ckxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gIHJldHVybiAoc3RyTGVuZ3RoID4gbGVuZ3RoKSA/XG4gICAgYCR7c3RyLnN1YnN0cmluZygwLCBsZW5ndGggLyAyKX3igKYke3N0ci5zdWJzdHJpbmcoc3RyLmxlbmd0aCAtIGxlbmd0aCAvIDIpfWAgOlxuICAgIHN0cjtcbn1cblxuY2xhc3MgQWN0aXZhdGlvbiB7XG5cbiAgX2NvbnRyb2xsZXI6IE9iamVjdDsgLy8gVE9ETzogU2hvdWxkIGJlIGBUZXN0UnVubmVyQ29udHJvbGxlcmAsIGJ1dCBpdCBpcyBsYXppbHkgcmVxdWlyZWQuXG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3Rlc3RSdW5uZXJzOiBTZXQ8VGVzdFJ1bm5lcj47XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9UZXN0UnVubmVyQ29udHJvbGxlclN0YXRlKSB7XG4gICAgdGhpcy5fdGVzdFJ1bm5lcnMgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgVGVzdFJ1bm5lckNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL1Rlc3RSdW5uZXJDb250cm9sbGVyJyk7XG4gICAgdGhpcy5fY29udHJvbGxlciA9IG5ldyBUZXN0UnVubmVyQ29udHJvbGxlcihzdGF0ZSwgdGhpcy5fdGVzdFJ1bm5lcnMpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2JvZHknLFxuICAgICAgICAnbnVjbGlkZS10ZXN0LXJ1bm5lcjp0b2dnbGUtcGFuZWwnLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fY29udHJvbGxlci50b2dnbGVQYW5lbCgpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgICAvLyBMaXN0ZW4gZm9yIHJ1biBldmVudHMgb24gZmlsZXMgaW4gdGhlIGZpbGUgdHJlZVxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnLnRyZWUtdmlldyAuZW50cnkuZmlsZS5saXN0LWl0ZW0nLFxuICAgICAgICAnbnVjbGlkZS10ZXN0LXJ1bm5lcjpydW4tdGVzdHMnLFxuICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KS5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICAgIHRoaXMuX2NvbnRyb2xsZXIucnVuVGVzdHModGFyZ2V0LmRhdGFzZXQucGF0aCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICAgIC8vIExpc3RlbiBmb3IgcnVuIGV2ZW50cyBvbiBkaXJlY3RvcmllcyBpbiB0aGUgZmlsZSB0cmVlXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICcudHJlZS12aWV3IC5lbnRyeS5kaXJlY3RvcnkubGlzdC1uZXN0ZWQtaXRlbScsXG4gICAgICAgICdudWNsaWRlLXRlc3QtcnVubmVyOnJ1bi10ZXN0cycsXG4gICAgICAgIChldmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRhcmdldCA9ICgoZXZlbnQuY3VycmVudFRhcmdldDogYW55KTogSFRNTEVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3IoJy5uYW1lJyk7XG4gICAgICAgICAgdGhpcy5fY29udHJvbGxlci5ydW5UZXN0cyh0YXJnZXQuZGF0YXNldC5wYXRoKTtcbiAgICAgICAgfVxuICAgICAgKVxuICAgICk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgYXRvbS5jb250ZXh0TWVudS5hZGQoe1xuICAgICAgICAnLnRyZWUtdmlldyAuZW50cnkuZGlyZWN0b3J5Lmxpc3QtbmVzdGVkLWl0ZW0nOiBbXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgICB0aGlzLl9jcmVhdGVSdW5UZXN0c0NvbnRleHRNZW51SXRlbSgnUnVuIHRlc3RzIGluJyksXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgXSxcbiAgICAgICAgJy50cmVlLXZpZXcgLmVudHJ5LmZpbGUubGlzdC1pdGVtJzogW1xuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgICAgdGhpcy5fY3JlYXRlUnVuVGVzdHNDb250ZXh0TWVudUl0ZW0oJ1J1biB0ZXN0cyBhdCcpLFxuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBhZGRUZXN0UnVubmVyKHRlc3RSdW5uZXI6IFRlc3RSdW5uZXIpOiA/RGlzcG9zYWJsZSB7XG4gICAgaWYgKHRoaXMuX3Rlc3RSdW5uZXJzLmhhcyh0ZXN0UnVubmVyKSkge1xuICAgICAgZ2V0TG9nZ2VyKCkuaW5mbyhgQXR0ZW1wdGVkIHRvIGFkZCB0ZXN0IHJ1bm5lciBcIiR7dGVzdFJ1bm5lci5sYWJlbH1cIiB0aGF0IHdhcyBhbHJlYWR5IGFkZGVkYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdGVzdFJ1bm5lcnMuYWRkKHRlc3RSdW5uZXIpO1xuICAgIHRoaXMuX2NvbnRyb2xsZXIuZGlkVXBkYXRlVGVzdFJ1bm5lcnMoKTtcblxuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0aGlzLl90ZXN0UnVubmVycy5kZWxldGUodGVzdFJ1bm5lcik7XG4gICAgICB0aGlzLl9jb250cm9sbGVyLmRpZFVwZGF0ZVRlc3RSdW5uZXJzKCk7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB0aGlzLl9jb250cm9sbGVyLnNlcmlhbGl6ZSgpO1xuICB9XG5cbiAgX2NyZWF0ZVJ1blRlc3RzQ29udGV4dE1lbnVJdGVtKGxhYmVsOiBzdHJpbmcpOiBPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBJbnRlbnRpb25hbGx5ICoqbm90KiogYW4gYXJyb3cgZnVuY3Rpb24gYmVjYXVzZSBBdG9tIHNldHMgdGhlIGNvbnRleHQgd2hlbiBjYWxsaW5nIHRoaXMgYW5kXG4gICAgICAvLyBhbGxvd3MgZHluYW1pY2FsbHkgc2V0dGluZyB2YWx1ZXMgYnkgYXNzaWduaW5nIHRvIGB0aGlzYC5cbiAgICAgIGNyZWF0ZWQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0YXJnZXQuZGF0YXNldC5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZXZlbnQgZGlkIG5vdCBoYXBwZW4gb24gdGhlIGBuYW1lYCBzcGFuLCBzZWFyY2ggZm9yIGl0IGluIHRoZSBkZXNjZW5kYW50cy5cbiAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLm5hbWUnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFyZ2V0LmRhdGFzZXQubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gSWYgbm8gbmVjZXNzYXJ5IGAubmFtZWAgZGVzY2VuZGFudCBpcyBmb3VuZCwgZG9uJ3QgZGlzcGxheSBhIGNvbnRleHQgbWVudS5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZSA9IHRhcmdldC5kYXRhc2V0Lm5hbWU7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9ICdudWNsaWRlLXRlc3QtcnVubmVyOnJ1bi10ZXN0cyc7XG4gICAgICAgIHRoaXMubGFiZWwgPSBgJHtsYWJlbH0gJyR7bGltaXRTdHJpbmcobmFtZSl9J2A7XG4gICAgICB9LFxuICAgICAgc2hvdWxkRGlzcGxheTogKGV2ZW50KSA9PiB7XG4gICAgICAgIC8vIERvbid0IHNob3cgYSB0ZXN0aW5nIG9wdGlvbiBpZiB0aGVyZSBhcmUgbm8gdGVzdCBydW5uZXJzLlxuICAgICAgICBpZiAodGhpcy5fdGVzdFJ1bm5lcnMuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICh0YXJnZXQuZGF0YXNldC5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZXZlbnQgZGlkIG5vdCBoYXBwZW4gb24gdGhlIGBuYW1lYCBzcGFuLCBzZWFyY2ggZm9yIGl0IGluIHRoZSBkZXNjZW5kYW50cy5cbiAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLm5hbWUnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBubyBkZXNjZW5kYW50IGhhcyB0aGUgbmVjZXNzYXJ5IGRhdGFzZXQgdG8gY3JlYXRlIHRoaXMgbWVudSBpdGVtLCBkb24ndCBjcmVhdGVcbiAgICAgICAgLy8gaXQuXG4gICAgICAgIHJldHVybiB0YXJnZXQgIT0gbnVsbCAmJiB0YXJnZXQuZGF0YXNldC5uYW1lICE9IG51bGwgJiYgdGFyZ2V0LmRhdGFzZXQucGF0aCAhPSBudWxsO1xuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uO1xubGV0IHRvb2xCYXI6ID9hbnkgPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKHN0YXRlKTtcbiAgICB9XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRvb2xCYXIpIHtcbiAgICAgIHRvb2xCYXIucmVtb3ZlSXRlbXMoKTtcbiAgICB9XG4gIH0sXG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIGFjdGl2YXRpb24gPyBhY3RpdmF0aW9uLnNlcmlhbGl6ZSgpIDoge307XG4gIH0sXG5cbiAgY29uc3VtZVRlc3RSdW5uZXIodGVzdFJ1bm5lcjogVGVzdFJ1bm5lcik6ID9EaXNwb3NhYmxlIHtcbiAgICBpZiAoYWN0aXZhdGlvbikge1xuICAgICAgcmV0dXJuIGFjdGl2YXRpb24uYWRkVGVzdFJ1bm5lcih0ZXN0UnVubmVyKTtcbiAgICB9XG4gIH0sXG5cbiAgY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICAgIHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLXRlc3QtcnVubmVyJyk7XG4gICAgdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgaWNvbjogJ2NoZWNrbGlzdCcsXG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtdGVzdC1ydW5uZXI6dG9nZ2xlLXBhbmVsJyxcbiAgICAgIHRvb2x0aXA6ICdUb2dnbGUgVGVzdCBSdW5uZXInLFxuICAgICAgcHJpb3JpdHk6IDQwMCxcbiAgICB9KTtcbiAgfSxcblxuICBnZXRIb21lRnJhZ21lbnRzKCk6IEhvbWVGcmFnbWVudHMge1xuICAgIHJldHVybiB7XG4gICAgICBmZWF0dXJlOiB7XG4gICAgICAgIHRpdGxlOiAnVGVzdCBSdW5uZXInLFxuICAgICAgICBpY29uOiAnY2hlY2tsaXN0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdSdW4gdGVzdHMgZGlyZWN0bHkgZnJvbSBOdWNsaWRlIGJ5IHJpZ2h0LW1vdXNlLWNsaWNraW5nIG9uIHRoZSBmaWxlLicsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLXRlc3QtcnVubmVyOnRvZ2dsZS1wYW5lbCcsXG4gICAgICB9LFxuICAgICAgcHJpb3JpdHk6IDIsXG4gICAgfTtcbiAgfSxcblxufTtcbiJdfQ==