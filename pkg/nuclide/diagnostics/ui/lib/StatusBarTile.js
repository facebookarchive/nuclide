var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

// Stick this to the left of remote-projects (-99)
var STATUS_BAR_PRIORITY = -99.5;

var StatusBarTile = (function () {
  function StatusBarTile() {
    _classCallCheck(this, StatusBarTile);

    this._diagnosticUpdaters = new Map();
    this._totalDiagnosticCount = {
      errorCount: 0,
      warningCount: 0
    };
    this._subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(StatusBarTile, [{
    key: 'consumeDiagnosticUpdates',
    value: function consumeDiagnosticUpdates(diagnosticUpdater) {
      if (this._diagnosticUpdaters.has(diagnosticUpdater)) {
        return;
      }

      var diagnosticCount = {
        errorCount: 0,
        warningCount: 0
      };
      this._diagnosticUpdaters.set(diagnosticUpdater, diagnosticCount);
      this._subscriptions.add(diagnosticUpdater.onAllMessagesDidUpdate(this._onAllMessagesDidUpdate.bind(this, diagnosticUpdater)));
    }
  }, {
    key: 'consumeStatusBar',
    value: function consumeStatusBar(statusBar) {
      if (this._item) {
        // Assuming our invariants hold, if this case fires, that means that there is more than one
        // status bar provider, which is weird. For now, we just ignore this case for simplicity.
        return;
      }

      var item = this._item = document.createElement('div');
      item.className = 'inline-block';
      this._render();
      this._tile = statusBar.addLeftTile({
        item: item,
        priority: STATUS_BAR_PRIORITY
      });
    }
  }, {
    key: '_onAllMessagesDidUpdate',
    value: function _onAllMessagesDidUpdate(diagnosticUpdater, messages) {
      // Update the DiagnosticCount for the updater.
      var errorCount = 0;
      var warningCount = 0;
      for (var message of messages) {
        if (message.type === 'Error') {
          ++errorCount;
        } else if (message.type === 'Warning') {
          ++warningCount;
        }
      }
      this._diagnosticUpdaters.set(diagnosticUpdater, {
        errorCount: errorCount,
        warningCount: warningCount
      });

      // Recalculate the total diagnostic count.
      var totalErrorCount = 0;
      var totalWarningCount = 0;
      for (var diagnosticCount of this._diagnosticUpdaters.values()) {
        totalErrorCount += diagnosticCount.errorCount;
        totalWarningCount += diagnosticCount.warningCount;
      }
      this._totalDiagnosticCount = {
        errorCount: totalErrorCount,
        warningCount: totalWarningCount
      };

      this._render();
    }
  }, {
    key: '_render',
    value: function _render() {
      if (this._item) {
        _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(StatusBarTileComponent, this._totalDiagnosticCount), this._item);
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      if (this._item) {
        _reactForAtom2['default'].unmountComponentAtNode(this._item);
        this._item = null;
      }

      if (this._tile) {
        this._tile.destroy();
        this._tile = null;
      }
    }
  }]);

  return StatusBarTile;
})();

var StatusBarTileComponent = (function (_React$Component) {
  _inherits(StatusBarTileComponent, _React$Component);

  function StatusBarTileComponent(props) {
    _classCallCheck(this, StatusBarTileComponent);

    _get(Object.getPrototypeOf(StatusBarTileComponent.prototype), 'constructor', this).call(this, props);
    this._onClick = this._onClick.bind(this);
  }

  _createClass(StatusBarTileComponent, [{
    key: 'render',
    value: function render() {
      var errorColorClass = this.props.errorCount === 0 ? '' : 'text-error';
      var warningColorClass = this.props.warningCount === 0 ? '' : 'text-warning';
      return _reactForAtom2['default'].createElement(
        'span',
        { className: 'nuclide-diagnostics-status-bar', onClick: this._onClick },
        _reactForAtom2['default'].createElement(
          'span',
          { className: 'nuclide-diagnostics-status-bar-error ' + errorColorClass },
          _reactForAtom2['default'].createElement('span', { className: 'icon icon-stop' }),
          ' ',
          this.props.errorCount
        ),
        _reactForAtom2['default'].createElement(
          'span',
          { className: 'nuclide-diagnostics-status-bar-warning ' + warningColorClass },
          _reactForAtom2['default'].createElement('span', { className: 'icon icon-alert' }),
          ' ',
          this.props.warningCount
        )
      );
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      var target = atom.views.getView(atom.workspace);
      atom.commands.dispatch(target, 'nuclide-diagnostics-ui:toggle-table');

      var _require = require('../../../analytics');

      var track = _require.track;

      track('diagnostics-show-table-from-status-bar');
    }
  }]);

  return StatusBarTileComponent;
})(_reactForAtom2['default'].Component);

var PropTypes = _reactForAtom2['default'].PropTypes;

StatusBarTileComponent.propTypes = {
  errorCount: PropTypes.number.isRequired,
  warningCount: PropTypes.number.isRequired
};

module.exports = StatusBarTile;
//# sourceMappingURL=data:application/json;base64,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WUFBTSxTQUFTLDRDQUEwQyxlQUFlLEFBQUc7VUFDekUsa0RBQU0sU0FBUyxFQUFDLGdCQUFnQixHQUFHOztVQUVsQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7U0FDakI7UUFDUDs7WUFBTSxTQUFTLDhDQUE0QyxpQkFBaUIsQUFBRztVQUM3RSxrREFBTSxTQUFTLEVBQUMsaUJBQWlCLEdBQUc7O1VBRW5DLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWTtTQUNuQjtPQUNGLENBQ1A7S0FDSDs7O1dBRU8sb0JBQVM7QUFDZixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbEQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLHFDQUFxQyxDQUFDLENBQUM7O3FCQUV0RCxPQUFPLENBQUMsb0JBQW9CLENBQUM7O1VBQXRDLEtBQUssWUFBTCxLQUFLOztBQUNaLFdBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0tBQ2pEOzs7U0FqQ0csc0JBQXNCO0dBQVMsMEJBQU0sU0FBUzs7SUFvQzdDLFNBQVMsNkJBQVQsU0FBUzs7QUFFaEIsc0JBQXNCLENBQUMsU0FBUyxHQUFHO0FBQ2pDLFlBQVUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVU7QUFDdkMsY0FBWSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVTtDQUMxQyxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IlN0YXR1c0JhclRpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIERpYWdub3N0aWNVcGRhdGVyLFxuICBEaWFnbm9zdGljTWVzc2FnZSxcbn0gZnJvbSAnLi4vLi4vYmFzZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIERpYWdub3N0aWNDb3VudCA9IHtcbiAgZXJyb3JDb3VudDogbnVtYmVyO1xuICB3YXJuaW5nQ291bnQ6IG51bWJlcjtcbn1cblxuLy8gU3RpY2sgdGhpcyB0byB0aGUgbGVmdCBvZiByZW1vdGUtcHJvamVjdHMgKC05OSlcbmNvbnN0IFNUQVRVU19CQVJfUFJJT1JJVFkgPSAtOTkuNTtcblxuY2xhc3MgU3RhdHVzQmFyVGlsZSB7XG5cbiAgX2RpYWdub3N0aWNVcGRhdGVyczogTWFwPERpYWdub3N0aWNVcGRhdGVyLCBEaWFnbm9zdGljQ291bnQ+O1xuICBfdG90YWxEaWFnbm9zdGljQ291bnQ6IERpYWdub3N0aWNDb3VudDtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF90aWxlOiA/YXRvbSRTdGF0dXNCYXJUaWxlO1xuICBfaXRlbTogP0hUTUxFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2RpYWdub3N0aWNVcGRhdGVycyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl90b3RhbERpYWdub3N0aWNDb3VudCA9IHtcbiAgICAgIGVycm9yQ291bnQ6IDAsXG4gICAgICB3YXJuaW5nQ291bnQ6IDAsXG4gICAgfTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGNvbnN1bWVEaWFnbm9zdGljVXBkYXRlcyhkaWFnbm9zdGljVXBkYXRlcjogRGlhZ25vc3RpY1VwZGF0ZXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZGlhZ25vc3RpY1VwZGF0ZXJzLmhhcyhkaWFnbm9zdGljVXBkYXRlcikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaWFnbm9zdGljQ291bnQgPSB7XG4gICAgICBlcnJvckNvdW50OiAwLFxuICAgICAgd2FybmluZ0NvdW50OiAwLFxuICAgIH07XG4gICAgdGhpcy5fZGlhZ25vc3RpY1VwZGF0ZXJzLnNldChkaWFnbm9zdGljVXBkYXRlciwgZGlhZ25vc3RpY0NvdW50KTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGRpYWdub3N0aWNVcGRhdGVyLm9uQWxsTWVzc2FnZXNEaWRVcGRhdGUoXG4gICAgICAgIHRoaXMuX29uQWxsTWVzc2FnZXNEaWRVcGRhdGUuYmluZCh0aGlzLCBkaWFnbm9zdGljVXBkYXRlciksXG4gICAgICApLFxuICAgICk7XG4gIH1cblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXRlbSkge1xuICAgICAgLy8gQXNzdW1pbmcgb3VyIGludmFyaWFudHMgaG9sZCwgaWYgdGhpcyBjYXNlIGZpcmVzLCB0aGF0IG1lYW5zIHRoYXQgdGhlcmUgaXMgbW9yZSB0aGFuIG9uZVxuICAgICAgLy8gc3RhdHVzIGJhciBwcm92aWRlciwgd2hpY2ggaXMgd2VpcmQuIEZvciBub3csIHdlIGp1c3QgaWdub3JlIHRoaXMgY2FzZSBmb3Igc2ltcGxpY2l0eS5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpdGVtID0gdGhpcy5faXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGl0ZW0uY2xhc3NOYW1lID0gJ2lubGluZS1ibG9jayc7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gICAgdGhpcy5fdGlsZSA9IHN0YXR1c0Jhci5hZGRMZWZ0VGlsZSh7XG4gICAgICBpdGVtLFxuICAgICAgcHJpb3JpdHk6IFNUQVRVU19CQVJfUFJJT1JJVFksXG4gICAgfSk7XG4gIH1cblxuICBfb25BbGxNZXNzYWdlc0RpZFVwZGF0ZShcbiAgICBkaWFnbm9zdGljVXBkYXRlcjogRGlhZ25vc3RpY1VwZGF0ZXIsXG4gICAgbWVzc2FnZXM6IEFycmF5PERpYWdub3N0aWNNZXNzYWdlPixcbiAgKTogdm9pZCB7XG4gICAgLy8gVXBkYXRlIHRoZSBEaWFnbm9zdGljQ291bnQgZm9yIHRoZSB1cGRhdGVyLlxuICAgIGxldCBlcnJvckNvdW50ID0gMDtcbiAgICBsZXQgd2FybmluZ0NvdW50ID0gMDtcbiAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgbWVzc2FnZXMpIHtcbiAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdFcnJvcicpIHtcbiAgICAgICAgKytlcnJvckNvdW50O1xuICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnR5cGUgPT09ICdXYXJuaW5nJykge1xuICAgICAgICArK3dhcm5pbmdDb3VudDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fZGlhZ25vc3RpY1VwZGF0ZXJzLnNldChkaWFnbm9zdGljVXBkYXRlciwge1xuICAgICAgZXJyb3JDb3VudCxcbiAgICAgIHdhcm5pbmdDb3VudCxcbiAgICB9KTtcblxuICAgIC8vIFJlY2FsY3VsYXRlIHRoZSB0b3RhbCBkaWFnbm9zdGljIGNvdW50LlxuICAgIGxldCB0b3RhbEVycm9yQ291bnQgPSAwO1xuICAgIGxldCB0b3RhbFdhcm5pbmdDb3VudCA9IDA7XG4gICAgZm9yIChjb25zdCBkaWFnbm9zdGljQ291bnQgb2YgdGhpcy5fZGlhZ25vc3RpY1VwZGF0ZXJzLnZhbHVlcygpKSB7XG4gICAgICB0b3RhbEVycm9yQ291bnQgKz0gZGlhZ25vc3RpY0NvdW50LmVycm9yQ291bnQ7XG4gICAgICB0b3RhbFdhcm5pbmdDb3VudCArPSBkaWFnbm9zdGljQ291bnQud2FybmluZ0NvdW50O1xuICAgIH1cbiAgICB0aGlzLl90b3RhbERpYWdub3N0aWNDb3VudCA9IHtcbiAgICAgIGVycm9yQ291bnQ6IHRvdGFsRXJyb3JDb3VudCxcbiAgICAgIHdhcm5pbmdDb3VudDogdG90YWxXYXJuaW5nQ291bnQsXG4gICAgfTtcblxuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgX3JlbmRlcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXRlbSkge1xuICAgICAgUmVhY3QucmVuZGVyKDxTdGF0dXNCYXJUaWxlQ29tcG9uZW50IHsuLi50aGlzLl90b3RhbERpYWdub3N0aWNDb3VudH0gLz4sIHRoaXMuX2l0ZW0pO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgaWYgKHRoaXMuX2l0ZW0pIHtcbiAgICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5faXRlbSk7XG4gICAgICB0aGlzLl9pdGVtID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdGlsZSkge1xuICAgICAgdGhpcy5fdGlsZS5kZXN0cm95KCk7XG4gICAgICB0aGlzLl90aWxlID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgU3RhdHVzQmFyVGlsZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9vbkNsaWNrOiBGdW5jdGlvbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9vbkNsaWNrID0gdGhpcy5fb25DbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IGVycm9yQ29sb3JDbGFzcyA9IHRoaXMucHJvcHMuZXJyb3JDb3VudCA9PT0gMCA/ICcnIDogJ3RleHQtZXJyb3InO1xuICAgIGNvbnN0IHdhcm5pbmdDb2xvckNsYXNzID0gdGhpcy5wcm9wcy53YXJuaW5nQ291bnQgPT09IDAgPyAnJyA6ICd0ZXh0LXdhcm5pbmcnO1xuICAgIHJldHVybiAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJudWNsaWRlLWRpYWdub3N0aWNzLXN0YXR1cy1iYXJcIiBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrfT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgbnVjbGlkZS1kaWFnbm9zdGljcy1zdGF0dXMtYmFyLWVycm9yICR7ZXJyb3JDb2xvckNsYXNzfWB9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1zdG9wXCIgLz5cbiAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICB7dGhpcy5wcm9wcy5lcnJvckNvdW50fVxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YG51Y2xpZGUtZGlhZ25vc3RpY3Mtc3RhdHVzLWJhci13YXJuaW5nICR7d2FybmluZ0NvbG9yQ2xhc3N9YH0+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWFsZXJ0XCIgLz5cbiAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICB7dGhpcy5wcm9wcy53YXJuaW5nQ291bnR9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvc3Bhbj5cbiAgICApO1xuICB9XG5cbiAgX29uQ2xpY2soKTogdm9pZCB7XG4gICAgY29uc3QgdGFyZ2V0ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgJ251Y2xpZGUtZGlhZ25vc3RpY3MtdWk6dG9nZ2xlLXRhYmxlJyk7XG5cbiAgICBjb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vLi4vYW5hbHl0aWNzJyk7XG4gICAgdHJhY2soJ2RpYWdub3N0aWNzLXNob3ctdGFibGUtZnJvbS1zdGF0dXMtYmFyJyk7XG4gIH1cbn1cblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuU3RhdHVzQmFyVGlsZUNvbXBvbmVudC5wcm9wVHlwZXMgPSB7XG4gIGVycm9yQ291bnQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgd2FybmluZ0NvdW50OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXR1c0JhclRpbGU7XG4iXX0=