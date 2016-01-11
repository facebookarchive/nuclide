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
    this._disposables.add(atom.commands.add('.entry.file.list-item', 'nuclide-test-runner:run-tests', function (event) {
      var target = event.currentTarget.querySelector('.name');
      _this._controller.runTests(target.dataset.path);
    }));
    // Listen for run events on directories in the file tree
    this._disposables.add(atom.commands.add('.entry.directory.list-item', 'nuclide-test-runner:run-tests', function (event) {
      var target = event.currentTarget.querySelector('.name');
      _this._controller.runTests(target.dataset.path);
    }));
    this._disposables.add(atom.contextMenu.add({
      '.entry.directory.list-item': [{ type: 'separator' }, this._createRunTestsContextMenuItem('Run tests in'), { type: 'separator' }],
      '.entry.file.list-item': [{ type: 'separator' }, this._createRunTestsContextMenuItem('Run tests at'), { type: 'separator' }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2VBa0JJLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBRmpCLG1CQUFtQixZQUFuQixtQkFBbUI7SUFDbkIsVUFBVSxZQUFWLFVBQVU7O0FBR1osSUFBSSxNQUFNLFlBQUEsQ0FBQztBQUNYLFNBQVMsU0FBUyxHQUFHO0FBQ25CLE1BQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxVQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0dBQy9DO0FBQ0QsU0FBTyxNQUFNLENBQUM7Q0FDZjs7Ozs7Ozs7O0FBU0QsU0FBUyxXQUFXLENBQUMsR0FBVyxFQUFnQztNQUE5QixNQUFlLHlEQUFHLEVBQUU7O0FBQ3BELE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDN0IsU0FBTyxBQUFDLFNBQVMsR0FBRyxNQUFNLEdBQ3JCLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBSSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUN6RSxHQUFHLENBQUM7Q0FDUDs7SUFFSyxVQUFVO0FBTUgsV0FOUCxVQUFVLENBTUYsS0FBaUMsRUFBRTs7OzBCQU4zQyxVQUFVOztBQU9aLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUM5QixRQUFNLG9CQUFvQixHQUFHLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQy9ELFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RFLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBQzlDLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDZixNQUFNLEVBQ04sa0NBQWtDLEVBQ2xDLFlBQU07QUFDSixZQUFLLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNoQyxDQUNGLENBQ0YsQ0FBQzs7QUFFRixRQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FDbkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ2YsdUJBQXVCLEVBQ3ZCLCtCQUErQixFQUMvQixVQUFDLEtBQUssRUFBSztBQUNULFVBQU0sTUFBTSxHQUFHLEFBQUUsS0FBSyxDQUFDLGFBQWEsQ0FBcUIsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hGLFlBQUssV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hELENBQ0YsQ0FDRixDQUFDOztBQUVGLFFBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDZiw0QkFBNEIsRUFDNUIsK0JBQStCLEVBQy9CLFVBQUMsS0FBSyxFQUFLO0FBQ1QsVUFBTSxNQUFNLEdBQUcsQUFBRSxLQUFLLENBQUMsYUFBYSxDQUFxQixhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEYsWUFBSyxXQUFXLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEQsQ0FDRixDQUNGLENBQUM7QUFDRixRQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FDbkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7QUFDbkIsa0NBQTRCLEVBQUUsQ0FDNUIsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLEVBQ25CLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxjQUFjLENBQUMsRUFDbkQsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLENBQ3BCO0FBQ0QsNkJBQXVCLEVBQUUsQ0FDdkIsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLEVBQ25CLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxjQUFjLENBQUMsRUFDbkQsRUFBQyxJQUFJLEVBQUUsV0FBVyxFQUFDLENBQ3BCO0tBQ0YsQ0FBQyxDQUNILENBQUM7R0FDSDs7ZUF4REcsVUFBVTs7V0EwREQsdUJBQUMsVUFBc0IsRUFBZTs7O0FBQ2pELFVBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDckMsaUJBQVMsRUFBRSxDQUFDLElBQUksb0NBQWtDLFVBQVUsQ0FBQyxLQUFLLDhCQUEyQixDQUFDO0FBQzlGLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNsQyxVQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLENBQUM7O0FBRXhDLGFBQU8sSUFBSSxVQUFVLENBQUMsWUFBTTtBQUMxQixlQUFLLFlBQVksVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLGVBQUssV0FBVyxDQUFDLG9CQUFvQixFQUFFLENBQUM7T0FDekMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRVEscUJBQVc7QUFDbEIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQ3JDOzs7V0FFNkIsd0NBQUMsS0FBYSxFQUFVOzs7QUFDcEQsYUFBTzs7O0FBR0wsZUFBTyxFQUFFLGlCQUFTLEtBQUssRUFBRTtBQUN2QixjQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQzFCLGNBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFOztBQUVyQyxrQkFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDeEM7QUFDRCxjQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTs7QUFFckMsbUJBQU8sS0FBSyxDQUFDO1dBQ2Q7QUFDRCxjQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztBQUNqQyxjQUFJLENBQUMsT0FBTyxHQUFHLCtCQUErQixDQUFDO0FBQy9DLGNBQUksQ0FBQyxLQUFLLEdBQU0sS0FBSyxXQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBRyxDQUFDO1NBQ2hEO0FBQ0QscUJBQWEsRUFBRSx1QkFBQyxLQUFLLEVBQUs7O0FBRXhCLGNBQUksT0FBSyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtBQUNoQyxtQkFBTyxLQUFLLENBQUM7V0FDZDs7QUFFRCxjQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQzFCLGNBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFOztBQUVyQyxrQkFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDeEM7OztBQUdELGlCQUFPLE1BQU0sSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztTQUNyRjtPQUNGLENBQUM7S0FDSDs7O1NBbkhHLFVBQVU7OztBQXVIaEIsSUFBSSxVQUF1QixZQUFBLENBQUM7QUFDNUIsSUFBSSxPQUFhLEdBQUcsSUFBSSxDQUFDOztBQUV6QixNQUFNLENBQUMsT0FBTyxHQUFHOztBQUVmLFVBQVEsRUFBQSxrQkFBQyxLQUFjLEVBQVE7QUFDN0IsUUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGdCQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEM7R0FDRjs7QUFFRCxZQUFVLEVBQUEsc0JBQVM7QUFDakIsUUFBSSxVQUFVLEVBQUU7QUFDZCxnQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGdCQUFVLEdBQUcsSUFBSSxDQUFDO0tBQ25CO0FBQ0QsUUFBSSxPQUFPLEVBQUU7QUFDWCxhQUFPLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDdkI7R0FDRjs7QUFFRCxXQUFTLEVBQUEscUJBQVc7QUFDbEIsV0FBTyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztHQUNqRDs7QUFFRCxtQkFBaUIsRUFBQSwyQkFBQyxVQUFzQixFQUFlO0FBQ3JELFFBQUksVUFBVSxFQUFFO0FBQ2QsYUFBTyxVQUFVLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQzdDO0dBQ0Y7O0FBRUQsZ0JBQWMsRUFBQSx3QkFBQyxVQUFxQyxFQUFRO0FBQzFELFdBQU8sR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUM1QyxXQUFPLENBQUMsU0FBUyxDQUFDO0FBQ2hCLFVBQUksRUFBRSxXQUFXO0FBQ2pCLGNBQVEsRUFBRSxrQ0FBa0M7QUFDNUMsYUFBTyxFQUFFLG9CQUFvQjtBQUM3QixjQUFRLEVBQUUsR0FBRztLQUNkLENBQUMsQ0FBQztHQUNKOztBQUVELGtCQUFnQixFQUFBLDRCQUFrQjtBQUNoQyxXQUFPO0FBQ0wsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLGFBQWE7QUFDcEIsWUFBSSxFQUFFLFdBQVc7QUFDakIsbUJBQVcsRUFBRSxzRUFBc0U7QUFDbkYsZUFBTyxFQUFFLGtDQUFrQztPQUM1QztBQUNELGNBQVEsRUFBRSxDQUFDO0tBQ1osQ0FBQztHQUNIOztDQUVGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIFRlc3RSdW5uZXJDb250cm9sbGVyU3RhdGUgZnJvbSAnLi9UZXN0UnVubmVyQ29udHJvbGxlcic7XG5pbXBvcnQgdHlwZSB7SG9tZUZyYWdtZW50c30gZnJvbSAnLi4vLi4vaG9tZS1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtUZXN0UnVubmVyfSBmcm9tICcuLi8uLi90ZXN0LXJ1bm5lci1pbnRlcmZhY2VzJztcblxuY29uc3Qge1xuICBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICBEaXNwb3NhYmxlLFxufSA9IHJlcXVpcmUoJ2F0b20nKTtcblxubGV0IGxvZ2dlcjtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYgKCFsb2dnZXIpIHtcbiAgICBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gIH1cbiAgcmV0dXJuIGxvZ2dlcjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIG9mIGxlbmd0aCBgbGVuZ3RoYCArIDEgYnkgcmVwbGFjaW5nIGV4dHJhIGNoYXJhY3RlcnMgaW4gdGhlIG1pZGRsZSBvZiBgc3RyYCB3aXRoXG4gKiBhbiBlbGxpcHNpcyBjaGFyYWN0ZXIuIEV4YW1wbGU6XG4gKlxuICogICAgID4gbGltaXRTdHJpbmcoJ2Zvb2JhcicsIDQpXG4gKiAgICAgJ2Zv4oCmYXInXG4gKi9cbmZ1bmN0aW9uIGxpbWl0U3RyaW5nKHN0cjogc3RyaW5nLCBsZW5ndGg/OiBudW1iZXIgPSAyMCk6IHN0cmluZyB7XG4gIGNvbnN0IHN0ckxlbmd0aCA9IHN0ci5sZW5ndGg7XG4gIHJldHVybiAoc3RyTGVuZ3RoID4gbGVuZ3RoKSA/XG4gICAgYCR7c3RyLnN1YnN0cmluZygwLCBsZW5ndGggLyAyKX3igKYke3N0ci5zdWJzdHJpbmcoc3RyLmxlbmd0aCAtIGxlbmd0aCAvIDIpfWAgOlxuICAgIHN0cjtcbn1cblxuY2xhc3MgQWN0aXZhdGlvbiB7XG5cbiAgX2NvbnRyb2xsZXI6IE9iamVjdDsgLy8gVE9ETzogU2hvdWxkIGJlIGBUZXN0UnVubmVyQ29udHJvbGxlcmAsIGJ1dCBpdCBpcyBsYXppbHkgcmVxdWlyZWQuXG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3Rlc3RSdW5uZXJzOiBTZXQ8VGVzdFJ1bm5lcj47XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9UZXN0UnVubmVyQ29udHJvbGxlclN0YXRlKSB7XG4gICAgdGhpcy5fdGVzdFJ1bm5lcnMgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgVGVzdFJ1bm5lckNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL1Rlc3RSdW5uZXJDb250cm9sbGVyJyk7XG4gICAgdGhpcy5fY29udHJvbGxlciA9IG5ldyBUZXN0UnVubmVyQ29udHJvbGxlcihzdGF0ZSwgdGhpcy5fdGVzdFJ1bm5lcnMpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2JvZHknLFxuICAgICAgICAnbnVjbGlkZS10ZXN0LXJ1bm5lcjp0b2dnbGUtcGFuZWwnLFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fY29udHJvbGxlci50b2dnbGVQYW5lbCgpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgICAvLyBMaXN0ZW4gZm9yIHJ1biBldmVudHMgb24gZmlsZXMgaW4gdGhlIGZpbGUgdHJlZVxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnLmVudHJ5LmZpbGUubGlzdC1pdGVtJyxcbiAgICAgICAgJ251Y2xpZGUtdGVzdC1ydW5uZXI6cnVuLXRlc3RzJyxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gKChldmVudC5jdXJyZW50VGFyZ2V0OiBhbnkpOiBIVE1MRWxlbWVudCkucXVlcnlTZWxlY3RvcignLm5hbWUnKTtcbiAgICAgICAgICB0aGlzLl9jb250cm9sbGVyLnJ1blRlc3RzKHRhcmdldC5kYXRhc2V0LnBhdGgpO1xuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcbiAgICAvLyBMaXN0ZW4gZm9yIHJ1biBldmVudHMgb24gZGlyZWN0b3JpZXMgaW4gdGhlIGZpbGUgdHJlZVxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnLmVudHJ5LmRpcmVjdG9yeS5saXN0LWl0ZW0nLFxuICAgICAgICAnbnVjbGlkZS10ZXN0LXJ1bm5lcjpydW4tdGVzdHMnLFxuICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KS5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICAgIHRoaXMuX2NvbnRyb2xsZXIucnVuVGVzdHModGFyZ2V0LmRhdGFzZXQucGF0aCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICApO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIGF0b20uY29udGV4dE1lbnUuYWRkKHtcbiAgICAgICAgJy5lbnRyeS5kaXJlY3RvcnkubGlzdC1pdGVtJzogW1xuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgICAgdGhpcy5fY3JlYXRlUnVuVGVzdHNDb250ZXh0TWVudUl0ZW0oJ1J1biB0ZXN0cyBpbicpLFxuICAgICAgICAgIHt0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAgIF0sXG4gICAgICAgICcuZW50cnkuZmlsZS5saXN0LWl0ZW0nOiBbXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgICB0aGlzLl9jcmVhdGVSdW5UZXN0c0NvbnRleHRNZW51SXRlbSgnUnVuIHRlc3RzIGF0JyksXG4gICAgICAgICAge3R5cGU6ICdzZXBhcmF0b3InfSxcbiAgICAgICAgXSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGFkZFRlc3RSdW5uZXIodGVzdFJ1bm5lcjogVGVzdFJ1bm5lcik6ID9EaXNwb3NhYmxlIHtcbiAgICBpZiAodGhpcy5fdGVzdFJ1bm5lcnMuaGFzKHRlc3RSdW5uZXIpKSB7XG4gICAgICBnZXRMb2dnZXIoKS5pbmZvKGBBdHRlbXB0ZWQgdG8gYWRkIHRlc3QgcnVubmVyIFwiJHt0ZXN0UnVubmVyLmxhYmVsfVwiIHRoYXQgd2FzIGFscmVhZHkgYWRkZWRgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl90ZXN0UnVubmVycy5hZGQodGVzdFJ1bm5lcik7XG4gICAgdGhpcy5fY29udHJvbGxlci5kaWRVcGRhdGVUZXN0UnVubmVycygpO1xuXG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3Rlc3RSdW5uZXJzLmRlbGV0ZSh0ZXN0UnVubmVyKTtcbiAgICAgIHRoaXMuX2NvbnRyb2xsZXIuZGlkVXBkYXRlVGVzdFJ1bm5lcnMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRyb2xsZXIuc2VyaWFsaXplKCk7XG4gIH1cblxuICBfY3JlYXRlUnVuVGVzdHNDb250ZXh0TWVudUl0ZW0obGFiZWw6IHN0cmluZyk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIEludGVudGlvbmFsbHkgKipub3QqKiBhbiBhcnJvdyBmdW5jdGlvbiBiZWNhdXNlIEF0b20gc2V0cyB0aGUgY29udGV4dCB3aGVuIGNhbGxpbmcgdGhpcyBhbmRcbiAgICAgIC8vIGFsbG93cyBkeW5hbWljYWxseSBzZXR0aW5nIHZhbHVlcyBieSBhc3NpZ25pbmcgdG8gYHRoaXNgLlxuICAgICAgY3JlYXRlZDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKHRhcmdldC5kYXRhc2V0Lm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZSBldmVudCBkaWQgbm90IGhhcHBlbiBvbiB0aGUgYG5hbWVgIHNwYW4sIHNlYXJjaCBmb3IgaXQgaW4gdGhlIGRlc2NlbmRhbnRzLlxuICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0YXJnZXQuZGF0YXNldC5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAvLyBJZiBubyBuZWNlc3NhcnkgYC5uYW1lYCBkZXNjZW5kYW50IGlzIGZvdW5kLCBkb24ndCBkaXNwbGF5IGEgY29udGV4dCBtZW51LlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBuYW1lID0gdGFyZ2V0LmRhdGFzZXQubmFtZTtcbiAgICAgICAgdGhpcy5jb21tYW5kID0gJ251Y2xpZGUtdGVzdC1ydW5uZXI6cnVuLXRlc3RzJztcbiAgICAgICAgdGhpcy5sYWJlbCA9IGAke2xhYmVsfSAnJHtsaW1pdFN0cmluZyhuYW1lKX0nYDtcbiAgICAgIH0sXG4gICAgICBzaG91bGREaXNwbGF5OiAoZXZlbnQpID0+IHtcbiAgICAgICAgLy8gRG9uJ3Qgc2hvdyBhIHRlc3Rpbmcgb3B0aW9uIGlmIHRoZXJlIGFyZSBubyB0ZXN0IHJ1bm5lcnMuXG4gICAgICAgIGlmICh0aGlzLl90ZXN0UnVubmVycy5zaXplID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKHRhcmdldC5kYXRhc2V0Lm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIC8vIElmIHRoZSBldmVudCBkaWQgbm90IGhhcHBlbiBvbiB0aGUgYG5hbWVgIHNwYW4sIHNlYXJjaCBmb3IgaXQgaW4gdGhlIGRlc2NlbmRhbnRzLlxuICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcubmFtZScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIG5vIGRlc2NlbmRhbnQgaGFzIHRoZSBuZWNlc3NhcnkgZGF0YXNldCB0byBjcmVhdGUgdGhpcyBtZW51IGl0ZW0sIGRvbid0IGNyZWF0ZVxuICAgICAgICAvLyBpdC5cbiAgICAgICAgcmV0dXJuIHRhcmdldCAhPSBudWxsICYmIHRhcmdldC5kYXRhc2V0Lm5hbWUgIT0gbnVsbCAmJiB0YXJnZXQuZGF0YXNldC5wYXRoICE9IG51bGw7XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb247XG5sZXQgdG9vbEJhcjogP2FueSA9IG51bGw7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodG9vbEJhcikge1xuICAgICAgdG9vbEJhci5yZW1vdmVJdGVtcygpO1xuICAgIH1cbiAgfSxcblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4gYWN0aXZhdGlvbiA/IGFjdGl2YXRpb24uc2VyaWFsaXplKCkgOiB7fTtcbiAgfSxcblxuICBjb25zdW1lVGVzdFJ1bm5lcih0ZXN0UnVubmVyOiBUZXN0UnVubmVyKTogP0Rpc3Bvc2FibGUge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gYWN0aXZhdGlvbi5hZGRUZXN0UnVubmVyKHRlc3RSdW5uZXIpO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtdGVzdC1ydW5uZXInKTtcbiAgICB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBpY29uOiAnY2hlY2tsaXN0JyxcbiAgICAgIGNhbGxiYWNrOiAnbnVjbGlkZS10ZXN0LXJ1bm5lcjp0b2dnbGUtcGFuZWwnLFxuICAgICAgdG9vbHRpcDogJ1RvZ2dsZSBUZXN0IFJ1bm5lcicsXG4gICAgICBwcmlvcml0eTogNDAwLFxuICAgIH0pO1xuICB9LFxuXG4gIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZlYXR1cmU6IHtcbiAgICAgICAgdGl0bGU6ICdUZXN0IFJ1bm5lcicsXG4gICAgICAgIGljb246ICdjaGVja2xpc3QnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1J1biB0ZXN0cyBkaXJlY3RseSBmcm9tIE51Y2xpZGUgYnkgcmlnaHQtbW91c2UtY2xpY2tpbmcgb24gdGhlIGZpbGUuJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtdGVzdC1ydW5uZXI6dG9nZ2xlLXBhbmVsJyxcbiAgICAgIH0sXG4gICAgICBwcmlvcml0eTogMixcbiAgICB9O1xuICB9LFxuXG59O1xuIl19