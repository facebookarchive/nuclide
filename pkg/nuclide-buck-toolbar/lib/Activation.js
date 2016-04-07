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

    var target = 'atom-workspace';
    this._disposables.add(atom.commands.add(target, 'nuclide-buck-toolbar:build', function () {
      return _this._actions.build();
    }), atom.commands.add(target, 'nuclide-buck-toolbar:debug', function () {
      return _this._actions.debug();
    }), atom.commands.add(target, 'nuclide-buck-toolbar:run', function () {
      return _this._actions.run();
    }), atom.commands.add(target, 'nuclide-buck-toolbar:test', function () {
      return _this._actions.test();
    }));
  }

  _createClass(Activation, [{
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var toolBar = getToolBar('nuclide-buck-toolbar');
      toolBar.addSpacer({
        priority: 499
      });
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
//# sourceMappingURL=data:application/json;base64,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RUFBRSxHQUFHO09BQ2QsQ0FBQyxDQUFDO0FBQ0gsVUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUN0QyxnQkFBUSxFQUFFLDZCQUE2QjtBQUN2QyxlQUFPLEVBQUUscUJBQXFCO0FBQzlCLGVBQU8sRUFBRSxLQUFLO0FBQ2QsZ0JBQVEsRUFBRSxHQUFHO09BQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ04sbUJBQWEsQ0FBQyxTQUFTLEdBQUcsNEJBQVUsQ0FBQztBQUNyQyxVQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FDbkIscUJBQWUsWUFBTTtBQUFFLGVBQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztPQUFFLENBQUMsQ0FDakQsQ0FBQztLQUNIOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVRLHFCQUFXO0FBQ2xCLGFBQU87QUFDTCxtQkFBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO0FBQ3pDLHNCQUFjLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUU7QUFDNUMsK0JBQXVCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRTtPQUMvRCxDQUFDO0tBQ0g7OztTQWpGRyxVQUFVOzs7QUFxRmhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkFjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGJ1Y2tJY29uIGZyb20gJy4vYnVja0ljb24nO1xuaW1wb3J0IEJ1Y2tUb29sYmFyIGZyb20gJy4vQnVja1Rvb2xiYXInO1xuaW1wb3J0IEJ1Y2tUb29sYmFyQWN0aW9ucyBmcm9tICcuL0J1Y2tUb29sYmFyQWN0aW9ucyc7XG5pbXBvcnQgQnVja1Rvb2xiYXJTdG9yZSBmcm9tICcuL0J1Y2tUb29sYmFyU3RvcmUnO1xuaW1wb3J0IHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2FjdGlvbnM6IEJ1Y2tUb29sYmFyQWN0aW9ucztcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3RvcmU6IEJ1Y2tUb29sYmFyU3RvcmU7XG5cbiAgY29uc3RydWN0b3IocmF3U3RhdGU6ID9PYmplY3QpIHtcbiAgICByYXdTdGF0ZSA9IHJhd1N0YXRlIHx8IHt9O1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICAgJ2JvZHknLFxuICAgICAgICAnbnVjbGlkZS1idWNrLXRvb2xiYXI6dG9nZ2xlJyxcbiAgICAgICAgKCkgPT4geyB0aGlzLl9hY3Rpb25zLnRvZ2dsZVBhbmVsVmlzaWJpbGl0eSgpOyB9LFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgY29uc3QgaW5pdGlhbFN0YXRlID0ge1xuICAgICAgYnVpbGRUYXJnZXQ6IHJhd1N0YXRlLmJ1aWxkVGFyZ2V0IHx8IG51bGwsXG4gICAgICBpc1BhbmVsVmlzaWJsZTogcmF3U3RhdGUuaXNQYW5lbFZpc2libGUgfHwgZmFsc2UsXG4gICAgICBpc1JlYWN0TmF0aXZlU2VydmVyTW9kZTogcmF3U3RhdGUuaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUgfHwgZmFsc2UsXG4gICAgfTtcblxuICAgIGNvbnN0IGRpc3BhdGNoZXIgPSBuZXcgRGlzcGF0Y2hlcigpO1xuICAgIHRoaXMuX3N0b3JlID0gbmV3IEJ1Y2tUb29sYmFyU3RvcmUoZGlzcGF0Y2hlciwgaW5pdGlhbFN0YXRlKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQodGhpcy5fc3RvcmUpO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBuZXcgQnVja1Rvb2xiYXJBY3Rpb25zKGRpc3BhdGNoZXIpO1xuXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPEJ1Y2tUb29sYmFyIHN0b3JlPXt0aGlzLl9zdG9yZX0gYWN0aW9ucz17dGhpcy5fYWN0aW9uc30gLz4sXG4gICAgICBjb250YWluZXIsXG4gICAgKTtcbiAgICBjb25zdCBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZFRvcFBhbmVsKHtcbiAgICAgIGl0ZW06IGNvbnRhaW5lcixcbiAgICAgIC8vIEluY3JlYXNlIHByaW9yaXR5IChkZWZhdWx0IGlzIDEwMCkgdG8gZW5zdXJlIHRoaXMgdG9vbGJhciBjb21lcyBhZnRlciB0aGUgJ3Rvb2wtYmFyJ1xuICAgICAgLy8gcGFja2FnZSdzIHRvb2xiYXIuIEhpZXJhcmNoaWNhbGx5IHRoZSBjb250cm9sbGluZyB0b29sYmFyIHNob3VsZCBiZSBhYm92ZSwgYW5kIHByYWN0aWNhbGx5XG4gICAgICAvLyB0aGlzIGVuc3VyZXMgdGhlIHBvcG92ZXIgaW4gdGhpcyBidWlsZCB0b29sYmFyIHN0YWNrcyBvbiB0b3Agb2Ygb3RoZXIgVUkuXG4gICAgICBwcmlvcml0eTogMjAwLFxuICAgIH0pO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZShjb250YWluZXIpO1xuICAgICAgICBwYW5lbC5kZXN0cm95KCk7XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgY29uc3QgdGFyZ2V0ID0gJ2F0b20td29ya3NwYWNlJztcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0YXJnZXQsICdudWNsaWRlLWJ1Y2stdG9vbGJhcjpidWlsZCcsICgpID0+IHRoaXMuX2FjdGlvbnMuYnVpbGQoKSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0YXJnZXQsICdudWNsaWRlLWJ1Y2stdG9vbGJhcjpkZWJ1ZycsICgpID0+IHRoaXMuX2FjdGlvbnMuZGVidWcoKSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCh0YXJnZXQsICdudWNsaWRlLWJ1Y2stdG9vbGJhcjpydW4nLCAoKSA9PiB0aGlzLl9hY3Rpb25zLnJ1bigpKSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRhcmdldCwgJ251Y2xpZGUtYnVjay10b29sYmFyOnRlc3QnLCAoKSA9PiB0aGlzLl9hY3Rpb25zLnRlc3QoKSksXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1idWNrLXRvb2xiYXInKTtcbiAgICB0b29sQmFyLmFkZFNwYWNlcih7XG4gICAgICBwcmlvcml0eTogNDk5LFxuICAgIH0pO1xuICAgIGNvbnN0IHRvb2xCYXJCdXR0b24gPSB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtYnVjay10b29sYmFyOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIEJ1Y2sgVG9vbGJhcicsXG4gICAgICBpY29uc2V0OiAnaW9uJyxcbiAgICAgIHByaW9yaXR5OiA1MDAsXG4gICAgfSlbMF07XG4gICAgdG9vbEJhckJ1dHRvbi5pbm5lckhUTUwgPSBidWNrSWNvbigpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdG9vbEJhci5yZW1vdmVJdGVtcygpOyB9KSxcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgYnVpbGRUYXJnZXQ6IHRoaXMuX3N0b3JlLmdldEJ1aWxkVGFyZ2V0KCksXG4gICAgICBpc1BhbmVsVmlzaWJsZTogdGhpcy5fc3RvcmUuaXNQYW5lbFZpc2libGUoKSxcbiAgICAgIGlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlOiB0aGlzLl9zdG9yZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpLFxuICAgIH07XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YXRpb247XG4iXX0=