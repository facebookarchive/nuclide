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
//# sourceMappingURL=data:application/json;base64,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QUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFO0FBQzVDLCtCQUF1QixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUU7T0FDL0QsQ0FBQztLQUNIOzs7U0F6RUcsVUFBVTs7O0FBNkVoQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBidWNrSWNvbiBmcm9tICcuL2J1Y2tJY29uJztcbmltcG9ydCBCdWNrVG9vbGJhciBmcm9tICcuL0J1Y2tUb29sYmFyJztcbmltcG9ydCBCdWNrVG9vbGJhckFjdGlvbnMgZnJvbSAnLi9CdWNrVG9vbGJhckFjdGlvbnMnO1xuaW1wb3J0IEJ1Y2tUb29sYmFyU3RvcmUgZnJvbSAnLi9CdWNrVG9vbGJhclN0b3JlJztcbmltcG9ydCB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9hY3Rpb25zOiBCdWNrVG9vbGJhckFjdGlvbnM7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3N0b3JlOiBCdWNrVG9vbGJhclN0b3JlO1xuXG4gIGNvbnN0cnVjdG9yKHJhd1N0YXRlOiA/T2JqZWN0KSB7XG4gICAgcmF3U3RhdGUgPSByYXdTdGF0ZSB8fCB7fTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAgICdib2R5JyxcbiAgICAgICAgJ251Y2xpZGUtYnVjay10b29sYmFyOnRvZ2dsZScsXG4gICAgICAgICgpID0+IHsgdGhpcy5fYWN0aW9ucy50b2dnbGVQYW5lbFZpc2liaWxpdHkoKTsgfSxcbiAgICAgICksXG4gICAgKTtcblxuICAgIGNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcbiAgICAgIGJ1aWxkVGFyZ2V0OiByYXdTdGF0ZS5idWlsZFRhcmdldCB8fCBudWxsLFxuICAgICAgaXNQYW5lbFZpc2libGU6IHJhd1N0YXRlLmlzUGFuZWxWaXNpYmxlIHx8IGZhbHNlLFxuICAgICAgaXNSZWFjdE5hdGl2ZVNlcnZlck1vZGU6IHJhd1N0YXRlLmlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlIHx8IGZhbHNlLFxuICAgIH07XG5cbiAgICBjb25zdCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoKTtcbiAgICB0aGlzLl9zdG9yZSA9IG5ldyBCdWNrVG9vbGJhclN0b3JlKGRpc3BhdGNoZXIsIGluaXRpYWxTdGF0ZSk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX3N0b3JlKTtcbiAgICB0aGlzLl9hY3Rpb25zID0gbmV3IEJ1Y2tUb29sYmFyQWN0aW9ucyhkaXNwYXRjaGVyKTtcblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxCdWNrVG9vbGJhciBzdG9yZT17dGhpcy5fc3RvcmV9IGFjdGlvbnM9e3RoaXMuX2FjdGlvbnN9IC8+LFxuICAgICAgY29udGFpbmVyLFxuICAgICk7XG4gICAgY29uc3QgcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRUb3BQYW5lbCh7XG4gICAgICBpdGVtOiBjb250YWluZXIsXG4gICAgICAvLyBJbmNyZWFzZSBwcmlvcml0eSAoZGVmYXVsdCBpcyAxMDApIHRvIGVuc3VyZSB0aGlzIHRvb2xiYXIgY29tZXMgYWZ0ZXIgdGhlICd0b29sLWJhcidcbiAgICAgIC8vIHBhY2thZ2UncyB0b29sYmFyLiBIaWVyYXJjaGljYWxseSB0aGUgY29udHJvbGxpbmcgdG9vbGJhciBzaG91bGQgYmUgYWJvdmUsIGFuZCBwcmFjdGljYWxseVxuICAgICAgLy8gdGhpcyBlbnN1cmVzIHRoZSBwb3BvdmVyIGluIHRoaXMgYnVpbGQgdG9vbGJhciBzdGFja3Mgb24gdG9wIG9mIG90aGVyIFVJLlxuICAgICAgcHJpb3JpdHk6IDIwMCxcbiAgICB9KTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5hZGQoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUoY29udGFpbmVyKTtcbiAgICAgICAgcGFuZWwuZGVzdHJveSgpO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN1bWVUb29sQmFyKGdldFRvb2xCYXI6IChncm91cDogc3RyaW5nKSA9PiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCB0b29sQmFyID0gZ2V0VG9vbEJhcignbnVjbGlkZS1idWNrLXRvb2xiYXInKTtcbiAgICB0b29sQmFyLmFkZFNwYWNlcih7XG4gICAgICBwcmlvcml0eTogNDk5LFxuICAgIH0pO1xuICAgIGNvbnN0IHRvb2xCYXJCdXR0b24gPSB0b29sQmFyLmFkZEJ1dHRvbih7XG4gICAgICBjYWxsYmFjazogJ251Y2xpZGUtYnVjay10b29sYmFyOnRvZ2dsZScsXG4gICAgICB0b29sdGlwOiAnVG9nZ2xlIEJ1Y2sgVG9vbGJhcicsXG4gICAgICBpY29uc2V0OiAnaW9uJyxcbiAgICAgIHByaW9yaXR5OiA1MDAsXG4gICAgfSlbMF07XG4gICAgdG9vbEJhckJ1dHRvbi5pbm5lckhUTUwgPSBidWNrSWNvbigpO1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmFkZChcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdG9vbEJhci5yZW1vdmVJdGVtcygpOyB9KSxcbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgYnVpbGRUYXJnZXQ6IHRoaXMuX3N0b3JlLmdldEJ1aWxkVGFyZ2V0KCksXG4gICAgICBpc1BhbmVsVmlzaWJsZTogdGhpcy5fc3RvcmUuaXNQYW5lbFZpc2libGUoKSxcbiAgICAgIGlzUmVhY3ROYXRpdmVTZXJ2ZXJNb2RlOiB0aGlzLl9zdG9yZS5pc1JlYWN0TmF0aXZlU2VydmVyTW9kZSgpLFxuICAgIH07XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YXRpb247XG4iXX0=