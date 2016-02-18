var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _buckIcon = require('./buckIcon');

var _buckIcon2 = _interopRequireDefault(_buckIcon);

var _BuckToolbar = require('./BuckToolbar');

var _BuckToolbar2 = _interopRequireDefault(_BuckToolbar);

var _BuckToolbarActions = require('./BuckToolbarActions');

var _BuckToolbarActions2 = _interopRequireDefault(_BuckToolbarActions);

var _BuckToolbarStore = require('./BuckToolbarStore');

var _BuckToolbarStore2 = _interopRequireDefault(_BuckToolbarStore);

var _flux = require('flux');

var _reactForAtom = require('react-for-atom');

var Activation = (function () {
  function Activation(rawState) {
    var _this = this;

    _classCallCheck(this, Activation);

    rawState = rawState || {};
    this._disposables = new _atom.CompositeDisposable(atom.commands.add('body', 'nuclide-buck-toolbar:toggle', function () {
      _this._actions.togglePanelVisibility();
    }));

    var initialState = {
      buildTarget: rawState.buildTarget || null,
      isPanelVisible: rawState.isPanelVisible || false,
      isReactNativeServerMode: rawState.isReactNativeServerMode || false
    };

    var dispatcher = new _flux.Dispatcher();
    this._store = new _BuckToolbarStore2['default'](dispatcher, initialState);
    this._disposables.add(this._store);
    this._actions = new _BuckToolbarActions2['default'](dispatcher);

    var container = document.createElement('div');
    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_BuckToolbar2['default'], { store: this._store, actions: this._actions }), container);
    var panel = atom.workspace.addTopPanel({
      item: container,
      // Increase priority (default is 100) to ensure this toolbar comes after the 'tool-bar'
      // package's toolbar. Hierarchically the controlling toolbar should be above, and practically
      // this ensures the popover in this build toolbar stacks on top of other UI.
      priority: 200
    });
    this._disposables.add(new _atom.Disposable(function () {
      _reactForAtom.ReactDOM.unmountComponentAtNode(container);
      panel.destroy();
    }));
  }

  _createClass(Activation, [{
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-buck-toolbar');
      var toolBarButton = toolBar.addButton({
        callback: 'nuclide-buck-toolbar:toggle',
        tooltip: 'Toggle Buck Toolbar',
        iconset: 'ion',
        priority: 500
      })[0];
      toolBarButton.innerHTML = (0, _buckIcon2['default'])();
      this._disposables.add(new _atom.Disposable(function () {
        toolBar.removeItems();
      }));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        buildTarget: this._store.getBuildTarget(),
        isPanelVisible: this._store.isPanelVisible(),
        isReactNativeServerMode: this._store.isReactNativeServerMode()
      };
    }
  }]);

  return Activation;
})();

module.exports = Activation;
//# sourceMappingURL=data:application/json;base64,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TUFBTSxDQUFDLHVCQUF1QixFQUFFO09BQy9ELENBQUM7S0FDSDs7O1NBdEVHLFVBQVU7OztBQTBFaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiQWN0aXZhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgYnVja0ljb24gZnJvbSAnLi9idWNrSWNvbic7XG5pbXBvcnQgQnVja1Rvb2xiYXIgZnJvbSAnLi9CdWNrVG9vbGJhcic7XG5pbXBvcnQgQnVja1Rvb2xiYXJBY3Rpb25zIGZyb20gJy4vQnVja1Rvb2xiYXJBY3Rpb25zJztcbmltcG9ydCBCdWNrVG9vbGJhclN0b3JlIGZyb20gJy4vQnVja1Rvb2xiYXJTdG9yZSc7XG5pbXBvcnQge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfYWN0aW9uczogQnVja1Rvb2xiYXJBY3Rpb25zO1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zdG9yZTogQnVja1Rvb2xiYXJTdG9yZTtcblxuICBjb25zdHJ1Y3RvcihyYXdTdGF0ZTogP09iamVjdCkge1xuICAgIHJhd1N0YXRlID0gcmF3U3RhdGUgfHwge307XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgICAnYm9keScsXG4gICAgICAgICdudWNsaWRlLWJ1Y2stdG9vbGJhcjp0b2dnbGUnLFxuICAgICAgICAoKSA9PiB7IHRoaXMuX2FjdGlvbnMudG9nZ2xlUGFuZWxWaXNpYmlsaXR5KCk7IH0sXG4gICAgICApLFxuICAgICk7XG5cbiAgICBjb25zdCBpbml0aWFsU3RhdGUgPSB7XG4gICAgICBidWlsZFRhcmdldDogcmF3U3RhdGUuYnVpbGRUYXJnZXQgfHwgbnVsbCxcbiAgICAgIGlzUGFuZWxWaXNpYmxlOiByYXdTdGF0ZS5pc1BhbmVsVmlzaWJsZSB8fCBmYWxzZSxcbiAgICAgIGlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlOiByYXdTdGF0ZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSB8fCBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29uc3QgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCk7XG4gICAgdGhpcy5fc3RvcmUgPSBuZXcgQnVja1Rvb2xiYXJTdG9yZShkaXNwYXRjaGVyLCBpbml0aWFsU3RhdGUpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZCh0aGlzLl9zdG9yZSk7XG4gICAgdGhpcy5fYWN0aW9ucyA9IG5ldyBCdWNrVG9vbGJhckFjdGlvbnMoZGlzcGF0Y2hlcik7XG5cbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8QnVja1Rvb2xiYXIgc3RvcmU9e3RoaXMuX3N0b3JlfSBhY3Rpb25zPXt0aGlzLl9hY3Rpb25zfSAvPixcbiAgICAgIGNvbnRhaW5lcixcbiAgICApO1xuICAgIGNvbnN0IHBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkVG9wUGFuZWwoe1xuICAgICAgaXRlbTogY29udGFpbmVyLFxuICAgICAgLy8gSW5jcmVhc2UgcHJpb3JpdHkgKGRlZmF1bHQgaXMgMTAwKSB0byBlbnN1cmUgdGhpcyB0b29sYmFyIGNvbWVzIGFmdGVyIHRoZSAndG9vbC1iYXInXG4gICAgICAvLyBwYWNrYWdlJ3MgdG9vbGJhci4gSGllcmFyY2hpY2FsbHkgdGhlIGNvbnRyb2xsaW5nIHRvb2xiYXIgc2hvdWxkIGJlIGFib3ZlLCBhbmQgcHJhY3RpY2FsbHlcbiAgICAgIC8vIHRoaXMgZW5zdXJlcyB0aGUgcG9wb3ZlciBpbiB0aGlzIGJ1aWxkIHRvb2xiYXIgc3RhY2tzIG9uIHRvcCBvZiBvdGhlciBVSS5cbiAgICAgIHByaW9yaXR5OiAyMDAsXG4gICAgfSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKGNvbnRhaW5lcik7XG4gICAgICAgIHBhbmVsLmRlc3Ryb3koKTtcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBjb25zdW1lVG9vbEJhcihnZXRUb29sQmFyOiAoZ3JvdXA6IHN0cmluZykgPT4gT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3QgdG9vbEJhciA9IGdldFRvb2xCYXIoJ251Y2xpZGUtYnVjay10b29sYmFyJyk7XG4gICAgY29uc3QgdG9vbEJhckJ1dHRvbiA9IHRvb2xCYXIuYWRkQnV0dG9uKHtcbiAgICAgIGNhbGxiYWNrOiAnbnVjbGlkZS1idWNrLXRvb2xiYXI6dG9nZ2xlJyxcbiAgICAgIHRvb2x0aXA6ICdUb2dnbGUgQnVjayBUb29sYmFyJyxcbiAgICAgIGljb25zZXQ6ICdpb24nLFxuICAgICAgcHJpb3JpdHk6IDUwMCxcbiAgICB9KVswXTtcbiAgICB0b29sQmFyQnV0dG9uLmlubmVySFRNTCA9IGJ1Y2tJY29uKCk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyB0b29sQmFyLnJlbW92ZUl0ZW1zKCk7IH0pLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBidWlsZFRhcmdldDogdGhpcy5fc3RvcmUuZ2V0QnVpbGRUYXJnZXQoKSxcbiAgICAgIGlzUGFuZWxWaXNpYmxlOiB0aGlzLl9zdG9yZS5pc1BhbmVsVmlzaWJsZSgpLFxuICAgICAgaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU6IHRoaXMuX3N0b3JlLmlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlKCksXG4gICAgfTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhdGlvbjtcbiJdfQ==