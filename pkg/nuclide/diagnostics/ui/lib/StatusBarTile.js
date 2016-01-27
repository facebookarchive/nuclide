var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var PropTypes = _reactForAtom.React.PropTypes;

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
        _reactForAtom.React.render(_reactForAtom.React.createElement(StatusBarTileComponent, this._totalDiagnosticCount), this._item);
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      if (this._item) {
        _reactForAtom.React.unmountComponentAtNode(this._item);
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

  _createClass(StatusBarTileComponent, null, [{
    key: 'propTypes',
    value: {
      errorCount: PropTypes.number.isRequired,
      warningCount: PropTypes.number.isRequired
    },
    enumerable: true
  }]);

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
      return _reactForAtom.React.createElement(
        'span',
        { className: 'nuclide-diagnostics-status-bar', onClick: this._onClick },
        _reactForAtom.React.createElement(
          'span',
          { className: 'nuclide-diagnostics-status-bar-error ' + errorColorClass },
          _reactForAtom.React.createElement('span', { className: 'icon icon-stop' }),
          ' ',
          this.props.errorCount
        ),
        _reactForAtom.React.createElement(
          'span',
          { className: 'nuclide-diagnostics-status-bar-warning ' + warningColorClass },
          _reactForAtom.React.createElement('span', { className: 'icon icon-alert' }),
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
})(_reactForAtom.React.Component);

module.exports = StatusBarTile;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxLQUFLLENBQUMsWUFBWSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsY0FBYyxDQUFDO0FBQzlFLGFBQ0U7O1VBQU0sU0FBUyxFQUFDLGdDQUFnQyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxBQUFDO1FBQ3RFOztZQUFNLFNBQVMsNENBQTBDLGVBQWUsQUFBRztVQUN6RSw0Q0FBTSxTQUFTLEVBQUMsZ0JBQWdCLEdBQUc7O1VBRWxDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtTQUNqQjtRQUNQOztZQUFNLFNBQVMsOENBQTRDLGlCQUFpQixBQUFHO1VBQzdFLDRDQUFNLFNBQVMsRUFBQyxpQkFBaUIsR0FBRzs7VUFFbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZO1NBQ25CO09BQ0YsQ0FDUDtLQUNIOzs7V0FFTyxvQkFBUztBQUNmLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNsRCxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUscUNBQXFDLENBQUMsQ0FBQzs7cUJBRXRELE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzs7VUFBdEMsS0FBSyxZQUFMLEtBQUs7O0FBQ1osV0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7S0FDakQ7OztTQXRDRyxzQkFBc0I7R0FBUyxvQkFBTSxTQUFTOztBQXlDcEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiU3RhdHVzQmFyVGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGlhZ25vc3RpY1VwZGF0ZXIsXG4gIERpYWdub3N0aWNNZXNzYWdlLFxufSBmcm9tICcuLi8uLi9iYXNlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxudHlwZSBEaWFnbm9zdGljQ291bnQgPSB7XG4gIGVycm9yQ291bnQ6IG51bWJlcjtcbiAgd2FybmluZ0NvdW50OiBudW1iZXI7XG59XG5cbi8vIFN0aWNrIHRoaXMgdG8gdGhlIGxlZnQgb2YgcmVtb3RlLXByb2plY3RzICgtOTkpXG5jb25zdCBTVEFUVVNfQkFSX1BSSU9SSVRZID0gLTk5LjU7XG5cbmNsYXNzIFN0YXR1c0JhclRpbGUge1xuXG4gIF9kaWFnbm9zdGljVXBkYXRlcnM6IE1hcDxEaWFnbm9zdGljVXBkYXRlciwgRGlhZ25vc3RpY0NvdW50PjtcbiAgX3RvdGFsRGlhZ25vc3RpY0NvdW50OiBEaWFnbm9zdGljQ291bnQ7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfdGlsZTogP2F0b20kU3RhdHVzQmFyVGlsZTtcbiAgX2l0ZW06ID9IVE1MRWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9kaWFnbm9zdGljVXBkYXRlcnMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fdG90YWxEaWFnbm9zdGljQ291bnQgPSB7XG4gICAgICBlcnJvckNvdW50OiAwLFxuICAgICAgd2FybmluZ0NvdW50OiAwLFxuICAgIH07XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb25zdW1lRGlhZ25vc3RpY1VwZGF0ZXMoZGlhZ25vc3RpY1VwZGF0ZXI6IERpYWdub3N0aWNVcGRhdGVyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2RpYWdub3N0aWNVcGRhdGVycy5oYXMoZGlhZ25vc3RpY1VwZGF0ZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGlhZ25vc3RpY0NvdW50ID0ge1xuICAgICAgZXJyb3JDb3VudDogMCxcbiAgICAgIHdhcm5pbmdDb3VudDogMCxcbiAgICB9O1xuICAgIHRoaXMuX2RpYWdub3N0aWNVcGRhdGVycy5zZXQoZGlhZ25vc3RpY1VwZGF0ZXIsIGRpYWdub3N0aWNDb3VudCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBkaWFnbm9zdGljVXBkYXRlci5vbkFsbE1lc3NhZ2VzRGlkVXBkYXRlKFxuICAgICAgICB0aGlzLl9vbkFsbE1lc3NhZ2VzRGlkVXBkYXRlLmJpbmQodGhpcywgZGlhZ25vc3RpY1VwZGF0ZXIpLFxuICAgICAgKSxcbiAgICApO1xuICB9XG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2l0ZW0pIHtcbiAgICAgIC8vIEFzc3VtaW5nIG91ciBpbnZhcmlhbnRzIGhvbGQsIGlmIHRoaXMgY2FzZSBmaXJlcywgdGhhdCBtZWFucyB0aGF0IHRoZXJlIGlzIG1vcmUgdGhhbiBvbmVcbiAgICAgIC8vIHN0YXR1cyBiYXIgcHJvdmlkZXIsIHdoaWNoIGlzIHdlaXJkLiBGb3Igbm93LCB3ZSBqdXN0IGlnbm9yZSB0aGlzIGNhc2UgZm9yIHNpbXBsaWNpdHkuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaXRlbSA9IHRoaXMuX2l0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpdGVtLmNsYXNzTmFtZSA9ICdpbmxpbmUtYmxvY2snO1xuICAgIHRoaXMuX3JlbmRlcigpO1xuICAgIHRoaXMuX3RpbGUgPSBzdGF0dXNCYXIuYWRkTGVmdFRpbGUoe1xuICAgICAgaXRlbSxcbiAgICAgIHByaW9yaXR5OiBTVEFUVVNfQkFSX1BSSU9SSVRZLFxuICAgIH0pO1xuICB9XG5cbiAgX29uQWxsTWVzc2FnZXNEaWRVcGRhdGUoXG4gICAgZGlhZ25vc3RpY1VwZGF0ZXI6IERpYWdub3N0aWNVcGRhdGVyLFxuICAgIG1lc3NhZ2VzOiBBcnJheTxEaWFnbm9zdGljTWVzc2FnZT4sXG4gICk6IHZvaWQge1xuICAgIC8vIFVwZGF0ZSB0aGUgRGlhZ25vc3RpY0NvdW50IGZvciB0aGUgdXBkYXRlci5cbiAgICBsZXQgZXJyb3JDb3VudCA9IDA7XG4gICAgbGV0IHdhcm5pbmdDb3VudCA9IDA7XG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIG1lc3NhZ2VzKSB7XG4gICAgICBpZiAobWVzc2FnZS50eXBlID09PSAnRXJyb3InKSB7XG4gICAgICAgICsrZXJyb3JDb3VudDtcbiAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS50eXBlID09PSAnV2FybmluZycpIHtcbiAgICAgICAgKyt3YXJuaW5nQ291bnQ7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2RpYWdub3N0aWNVcGRhdGVycy5zZXQoZGlhZ25vc3RpY1VwZGF0ZXIsIHtcbiAgICAgIGVycm9yQ291bnQsXG4gICAgICB3YXJuaW5nQ291bnQsXG4gICAgfSk7XG5cbiAgICAvLyBSZWNhbGN1bGF0ZSB0aGUgdG90YWwgZGlhZ25vc3RpYyBjb3VudC5cbiAgICBsZXQgdG90YWxFcnJvckNvdW50ID0gMDtcbiAgICBsZXQgdG90YWxXYXJuaW5nQ291bnQgPSAwO1xuICAgIGZvciAoY29uc3QgZGlhZ25vc3RpY0NvdW50IG9mIHRoaXMuX2RpYWdub3N0aWNVcGRhdGVycy52YWx1ZXMoKSkge1xuICAgICAgdG90YWxFcnJvckNvdW50ICs9IGRpYWdub3N0aWNDb3VudC5lcnJvckNvdW50O1xuICAgICAgdG90YWxXYXJuaW5nQ291bnQgKz0gZGlhZ25vc3RpY0NvdW50Lndhcm5pbmdDb3VudDtcbiAgICB9XG4gICAgdGhpcy5fdG90YWxEaWFnbm9zdGljQ291bnQgPSB7XG4gICAgICBlcnJvckNvdW50OiB0b3RhbEVycm9yQ291bnQsXG4gICAgICB3YXJuaW5nQ291bnQ6IHRvdGFsV2FybmluZ0NvdW50LFxuICAgIH07XG5cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIF9yZW5kZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2l0ZW0pIHtcbiAgICAgIFJlYWN0LnJlbmRlcig8U3RhdHVzQmFyVGlsZUNvbXBvbmVudCB7Li4udGhpcy5fdG90YWxEaWFnbm9zdGljQ291bnR9IC8+LCB0aGlzLl9pdGVtKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGlmICh0aGlzLl9pdGVtKSB7XG4gICAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX2l0ZW0pO1xuICAgICAgdGhpcy5faXRlbSA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3RpbGUpIHtcbiAgICAgIHRoaXMuX3RpbGUuZGVzdHJveSgpO1xuICAgICAgdGhpcy5fdGlsZSA9IG51bGw7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFN0YXR1c0JhclRpbGVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBfb25DbGljazogRnVuY3Rpb247XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBlcnJvckNvdW50OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gICAgd2FybmluZ0NvdW50OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fb25DbGljayA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBlcnJvckNvbG9yQ2xhc3MgPSB0aGlzLnByb3BzLmVycm9yQ291bnQgPT09IDAgPyAnJyA6ICd0ZXh0LWVycm9yJztcbiAgICBjb25zdCB3YXJuaW5nQ29sb3JDbGFzcyA9IHRoaXMucHJvcHMud2FybmluZ0NvdW50ID09PSAwID8gJycgOiAndGV4dC13YXJuaW5nJztcbiAgICByZXR1cm4gKFxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibnVjbGlkZS1kaWFnbm9zdGljcy1zdGF0dXMtYmFyXCIgb25DbGljaz17dGhpcy5fb25DbGlja30+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YG51Y2xpZGUtZGlhZ25vc3RpY3Mtc3RhdHVzLWJhci1lcnJvciAke2Vycm9yQ29sb3JDbGFzc31gfT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tc3RvcFwiIC8+XG4gICAgICAgICAgJm5ic3A7XG4gICAgICAgICAge3RoaXMucHJvcHMuZXJyb3JDb3VudH1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BudWNsaWRlLWRpYWdub3N0aWNzLXN0YXR1cy1iYXItd2FybmluZyAke3dhcm5pbmdDb2xvckNsYXNzfWB9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1hbGVydFwiIC8+XG4gICAgICAgICAgJm5ic3A7XG4gICAgICAgICAge3RoaXMucHJvcHMud2FybmluZ0NvdW50fVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L3NwYW4+XG4gICAgKTtcbiAgfVxuXG4gIF9vbkNsaWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IHRhcmdldCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsICdudWNsaWRlLWRpYWdub3N0aWNzLXVpOnRvZ2dsZS10YWJsZScpO1xuXG4gICAgY29uc3Qge3RyYWNrfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2FuYWx5dGljcycpO1xuICAgIHRyYWNrKCdkaWFnbm9zdGljcy1zaG93LXRhYmxlLWZyb20tc3RhdHVzLWJhcicpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdHVzQmFyVGlsZTtcbiJdfQ==