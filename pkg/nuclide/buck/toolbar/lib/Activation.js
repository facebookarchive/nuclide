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

var _BuckIcon = require('./BuckIcon');

var _BuckIcon2 = _interopRequireDefault(_BuckIcon);

var _BuckToolbar = require('./BuckToolbar');

var _BuckToolbar2 = _interopRequireDefault(_BuckToolbar);

var _BuckToolbarActions = require('./BuckToolbarActions');

var _BuckToolbarActions2 = _interopRequireDefault(_BuckToolbarActions);

var _BuckToolbarStore = require('./BuckToolbarStore');

var _BuckToolbarStore2 = _interopRequireDefault(_BuckToolbarStore);

var _flux = require('flux');

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
    _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(_BuckToolbar2['default'], { store: this._store, actions: this._actions }), container);
    var panel = atom.workspace.addTopPanel({
      item: container,
      // Increase priority (default is 100) to ensure this toolbar comes after the 'tool-bar'
      // package's toolbar. Hierarchically the controlling toolbar should be above, and practically
      // this ensures the popover in this build toolbar stacks on top of other UI.
      priority: 200
    });
    this._disposables.add(new _atom.Disposable(function () {
      _reactForAtom2['default'].unmountComponentAtNode(container);
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
      var container = document.createElement('div');
      container.className = 'buck-toolbar-icon-container';
      toolBarButton.appendChild(container);
      _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(_BuckIcon2['default'], null), container);
      this._disposables.add(new _atom.Disposable(function () {
        toolBar.removeItems();
      }), new _atom.Disposable(function () {
        _reactForAtom2['default'].unmountComponentAtNode(container);
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
//# sourceMappingURL=data:application/json;base64,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QUM7S0FDSDs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFUSxxQkFBVztBQUNsQixhQUFPO0FBQ0wsbUJBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRTtBQUN6QyxzQkFBYyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO0FBQzVDLCtCQUF1QixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUU7T0FDL0QsQ0FBQztLQUNIOzs7U0ExRUcsVUFBVTs7O0FBOEVoQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBCdWNrSWNvbiBmcm9tICcuL0J1Y2tJY29uJztcbmltcG9ydCBCdWNrVG9vbGJhciBmcm9tICcuL0J1Y2tUb29sYmFyJztcbmltcG9ydCBCdWNrVG9vbGJhckFjdGlvbnMgZnJvbSAnLi9CdWNrVG9vbGJhckFjdGlvbnMnO1xuaW1wb3J0IEJ1Y2tUb29sYmFyU3RvcmUgZnJvbSAnLi9CdWNrVG9vbGJhclN0b3JlJztcbmltcG9ydCB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2FjdGlvbnM6IEJ1Y2tUb29sYmFyQWN0aW9ucztcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3RvcmU6IEJ1Y2tUb29sYmFyU3RvcmU7XG5cbiAgY29uc3RydWN0b3IocmF3U3RhdGU6ID9PYmplY3QpIHtcbiAgICByYXdTdGF0ZSA9IHJhd1N0YXRlIHx8IHt9O1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2JvZHknLFxuICAgICAgICAnbnVjbGlkZS1idWNrLXRvb2xiYXI6dG9nZ2xlJyxcbiAgICAgICAgKCkgPT4geyB0aGlzLl9hY3Rpb25zLnRvZ2dsZVBhbmVsVmlzaWJpbGl0eSgpOyB9LFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgY29uc3QgaW5pdGlhbFN0YXRlID0ge1xuICAgICAgYnVpbGRUYXJnZXQ6IHJhd1N0YXRlLmJ1aWxkVGFyZ2V0IHx8IG51bGwsXG4gICAgICBpc1BhbmVsVmlzaWJsZTogcmF3U3RhdGUuaXNQYW5lbFZpc2libGUgfHwgZmFsc2UsXG4gICAgICBpc1JlYWN0TmF0aXZlU2VydmVyTW9kZTogcmF3U3RhdGUuaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUgfHwgZmFsc2UsXG4gICAgfTtcblxuICAgIGNvbnN0IGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgIHRoaXMuX3N0b3JlID0gbmV3IEJ1Y2tUb29sYmFyU3RvcmUoZGlzcGF0Y2hlciwgaW5pdGlhbFN0YXRlKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQodGhpcy5fc3RvcmUpO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBuZXcgQnVja1Rvb2xiYXJBY3Rpb25zKGRpc3BhdGNoZXIpO1xuXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgPEJ1Y2tUb29sYmFyIHN0b3JlPXt0aGlzLl9zdG9yZX0gYWN0aW9ucz17dGhpcy5fYWN0aW9uc30gLz4sXG4gICAgICBjb250YWluZXIsXG4gICAgKTtcbiAgICBjb25zdCBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFRvcFBhbmVsKHtcbiAgICAgIGl0ZW06IGNvbnRhaW5lcixcbiAgICAgIC8vIEluY3JlYXNlIHByaW9yaXR5IChkZWZhdWx0IGlzIDEwMCkgdG8gZW5zdXJlIHRoaXMgdG9vbGJhciBjb21lcyBhZnRlciB0aGUgJ3Rvb2wtYmFyJ1xuICAgICAgLy8gcGFja2FnZSdzIHRvb2xiYXIuIEhpZXJhcmNoaWNhbGx5IHRoZSBjb250cm9sbGluZyB0b29sYmFyIHNob3VsZCBiZSBhYm92ZSwgYW5kIHByYWN0aWNhbGx5XG4gICAgICAvLyB0aGlzIGVuc3VyZXMgdGhlIHBvcG92ZXIgaW4gdGhpcyBidWlsZCB0b29sYmFyIHN0YWNrcyBvbiB0b3Agb2Ygb3RoZXIgVUkuXG4gICAgICBwcmlvcml0eTogMjAwLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShjb250YWluZXIpO1xuICAgICAgICBwYW5lbC5kZXN0cm95KCk7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgY29uc3VtZVRvb2xCYXIoZ2V0VG9vbEJhcjogKGdyb3VwOiBzdHJpbmcpID0+IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IHRvb2xCYXIgPSBnZXRUb29sQmFyKCdudWNsaWRlLWJ1Y2stdG9vbGJhcicpO1xuICAgIGNvbnN0IHRvb2xCYXJCdXR0b24gPSB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtYnVjay10b29sYmFyOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIEJ1Y2sgVG9vbGJhcicsXG4gICAgICBpY29uc2V0OiAnaW9uJyxcbiAgICAgIHByaW9yaXR5OiA1MDAsXG4gICAgfSlbMF07XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29udGFpbmVyLmNsYXNzTmFtZSA9ICdidWNrLXRvb2xiYXItaWNvbi1jb250YWluZXInO1xuICAgIHRvb2xCYXJCdXR0b24uYXBwZW5kQ2hpbGQoY29udGFpbmVyKTtcbiAgICBSZWFjdC5yZW5kZXIoPEJ1Y2tJY29uIC8+LCBjb250YWluZXIpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdG9vbEJhci5yZW1vdmVJdGVtcygpOyB9KSxcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZShjb250YWluZXIpOyB9KSxcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgYnVpbGRUYXJnZXQ6IHRoaXMuX3N0b3JlLmdldEJ1aWxkVGFyZ2V0KCksXG4gICAgICBpc1BhbmVsVmlzaWJsZTogdGhpcy5fc3RvcmUuaXNQYW5lbFZpc2libGUoKSxcbiAgICAgIGlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlOiB0aGlzLl9zdG9yZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpLFxuICAgIH07XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YXRpb247XG4iXX0=