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
    _reactForAtom.React.render(_reactForAtom.React.createElement(_BuckToolbar2['default'], { store: this._store, actions: this._actions }), container);
    var panel = atom.workspace.addTopPanel({
      item: container,
      // Increase priority (default is 100) to ensure this toolbar comes after the 'tool-bar'
      // package's toolbar. Hierarchically the controlling toolbar should be above, and practically
      // this ensures the popover in this build toolbar stacks on top of other UI.
      priority: 200
    });
    this._disposables.add(new _atom.Disposable(function () {
      _reactForAtom.React.unmountComponentAtNode(container);
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
      toolBarButton.innerHTML = _reactForAtom.React.renderToStaticMarkup(_reactForAtom.React.createElement(_BuckIcon2['default'], null));
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
//# sourceMappingURL=data:application/json;base64,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K0JBQXVCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRTtPQUMvRCxDQUFDO0tBQ0g7OztTQXRFRyxVQUFVOzs7QUEwRWhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkFjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEJ1Y2tJY29uIGZyb20gJy4vQnVja0ljb24nO1xuaW1wb3J0IEJ1Y2tUb29sYmFyIGZyb20gJy4vQnVja1Rvb2xiYXInO1xuaW1wb3J0IEJ1Y2tUb29sYmFyQWN0aW9ucyBmcm9tICcuL0J1Y2tUb29sYmFyQWN0aW9ucyc7XG5pbXBvcnQgQnVja1Rvb2xiYXJTdG9yZSBmcm9tICcuL0J1Y2tUb29sYmFyU3RvcmUnO1xuaW1wb3J0IHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9hY3Rpb25zOiBCdWNrVG9vbGJhckFjdGlvbnM7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3N0b3JlOiBCdWNrVG9vbGJhclN0b3JlO1xuXG4gIGNvbnN0cnVjdG9yKHJhd1N0YXRlOiA/T2JqZWN0KSB7XG4gICAgcmF3U3RhdGUgPSByYXdTdGF0ZSB8fCB7fTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdib2R5JyxcbiAgICAgICAgJ251Y2xpZGUtYnVjay10b29sYmFyOnRvZ2dsZScsXG4gICAgICAgICgpID0+IHsgdGhpcy5fYWN0aW9ucy50b2dnbGVQYW5lbFZpc2liaWxpdHkoKTsgfSxcbiAgICAgICksXG4gICAgKTtcblxuICAgIGNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcbiAgICAgIGJ1aWxkVGFyZ2V0OiByYXdTdGF0ZS5idWlsZFRhcmdldCB8fCBudWxsLFxuICAgICAgaXNQYW5lbFZpc2libGU6IHJhd1N0YXRlLmlzUGFuZWxWaXNpYmxlIHx8IGZhbHNlLFxuICAgICAgaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU6IHJhd1N0YXRlLmlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlIHx8IGZhbHNlLFxuICAgIH07XG5cbiAgICBjb25zdCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICB0aGlzLl9zdG9yZSA9IG5ldyBCdWNrVG9vbGJhclN0b3JlKGRpc3BhdGNoZXIsIGluaXRpYWxTdGF0ZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX3N0b3JlKTtcbiAgICB0aGlzLl9hY3Rpb25zID0gbmV3IEJ1Y2tUb29sYmFyQWN0aW9ucyhkaXNwYXRjaGVyKTtcblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIFJlYWN0LnJlbmRlcihcbiAgICAgIDxCdWNrVG9vbGJhciBzdG9yZT17dGhpcy5fc3RvcmV9IGFjdGlvbnM9e3RoaXMuX2FjdGlvbnN9IC8+LFxuICAgICAgY29udGFpbmVyLFxuICAgICk7XG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRUb3BQYW5lbCh7XG4gICAgICBpdGVtOiBjb250YWluZXIsXG4gICAgICAvLyBJbmNyZWFzZSBwcmlvcml0eSAoZGVmYXVsdCBpcyAxMDApIHRvIGVuc3VyZSB0aGlzIHRvb2xiYXIgY29tZXMgYWZ0ZXIgdGhlICd0b29sLWJhcidcbiAgICAgIC8vIHBhY2thZ2UncyB0b29sYmFyLiBIaWVyYXJjaGljYWxseSB0aGUgY29udHJvbGxpbmcgdG9vbGJhciBzaG91bGQgYmUgYWJvdmUsIGFuZCBwcmFjdGljYWxseVxuICAgICAgLy8gdGhpcyBlbnN1cmVzIHRoZSBwb3BvdmVyIGluIHRoaXMgYnVpbGQgdG9vbGJhciBzdGFja3Mgb24gdG9wIG9mIG90aGVyIFVJLlxuICAgICAgcHJpb3JpdHk6IDIwMCxcbiAgICB9KTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUoY29udGFpbmVyKTtcbiAgICAgICAgcGFuZWwuZGVzdHJveSgpO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1idWNrLXRvb2xiYXInKTtcbiAgICBjb25zdCB0b29sQmFyQnV0dG9uID0gdG9vbEJhci5hZGRCdXR0b24oe1xuICAgICAgY2FsbGJhY2s6ICdudWNsaWRlLWJ1Y2stdG9vbGJhcjp0b2dnbGUnLFxuICAgICAgdG9vbHRpcDogJ1RvZ2dsZSBCdWNrIFRvb2xiYXInLFxuICAgICAgaWNvbnNldDogJ2lvbicsXG4gICAgICBwcmlvcml0eTogNTAwLFxuICAgIH0pWzBdO1xuICAgIHRvb2xCYXJCdXR0b24uaW5uZXJIVE1MID0gUmVhY3QucmVuZGVyVG9TdGF0aWNNYXJrdXAoPEJ1Y2tJY29uIC8+KTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRvb2xCYXIucmVtb3ZlSXRlbXMoKTsgfSksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJ1aWxkVGFyZ2V0OiB0aGlzLl9zdG9yZS5nZXRCdWlsZFRhcmdldCgpLFxuICAgICAgaXNQYW5lbFZpc2libGU6IHRoaXMuX3N0b3JlLmlzUGFuZWxWaXNpYmxlKCksXG4gICAgICBpc1JlYWN0TmF0aXZlU2VydmVyTW9kZTogdGhpcy5fc3RvcmUuaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGUoKSxcbiAgICB9O1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmF0aW9uO1xuIl19