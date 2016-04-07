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
        _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(StatusBarTileComponent, this._totalDiagnosticCount), this._item);
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      if (this._item) {
        _reactForAtom.ReactDOM.unmountComponentAtNode(this._item);
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

      var _require = require('../../nuclide-analytics');

      var track = _require.track;

      track('diagnostics-show-table-from-status-bar');
    }
  }]);

  return StatusBarTileComponent;
})(_reactForAtom.React.Component);

module.exports = StatusBarTile;
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxLQUFLLENBQUMsWUFBWSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsY0FBYyxDQUFDO0FBQzlFLGFBQ0U7O1VBQU0sU0FBUyxFQUFDLGdDQUFnQyxFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxBQUFDO1FBQ3RFOztZQUFNLFNBQVMsNENBQTBDLGVBQWUsQUFBRztVQUN6RSw0Q0FBTSxTQUFTLEVBQUMsZ0JBQWdCLEdBQUc7O1VBRWxDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtTQUNqQjtRQUNQOztZQUFNLFNBQVMsOENBQTRDLGlCQUFpQixBQUFHO1VBQzdFLDRDQUFNLFNBQVMsRUFBQyxpQkFBaUIsR0FBRzs7VUFFbkMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZO1NBQ25CO09BQ0YsQ0FDUDtLQUNIOzs7V0FFTyxvQkFBUztBQUNmLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNsRCxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUscUNBQXFDLENBQUMsQ0FBQzs7cUJBRXRELE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQzs7VUFBM0MsS0FBSyxZQUFMLEtBQUs7O0FBQ1osV0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7S0FDakQ7OztTQXRDRyxzQkFBc0I7R0FBUyxvQkFBTSxTQUFTOztBQXlDcEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiU3RhdHVzQmFyVGlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGlhZ25vc3RpY1VwZGF0ZXIsXG4gIERpYWdub3N0aWNNZXNzYWdlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbnR5cGUgRGlhZ25vc3RpY0NvdW50ID0ge1xuICBlcnJvckNvdW50OiBudW1iZXI7XG4gIHdhcm5pbmdDb3VudDogbnVtYmVyO1xufVxuXG4vLyBTdGljayB0aGlzIHRvIHRoZSBsZWZ0IG9mIHJlbW90ZS1wcm9qZWN0cyAoLTk5KVxuY29uc3QgU1RBVFVTX0JBUl9QUklPUklUWSA9IC05OS41O1xuXG5jbGFzcyBTdGF0dXNCYXJUaWxlIHtcblxuICBfZGlhZ25vc3RpY1VwZGF0ZXJzOiBNYXA8RGlhZ25vc3RpY1VwZGF0ZXIsIERpYWdub3N0aWNDb3VudD47XG4gIF90b3RhbERpYWdub3N0aWNDb3VudDogRGlhZ25vc3RpY0NvdW50O1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3RpbGU6ID9hdG9tJFN0YXR1c0JhclRpbGU7XG4gIF9pdGVtOiA/SFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGlhZ25vc3RpY1VwZGF0ZXJzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3RvdGFsRGlhZ25vc3RpY0NvdW50ID0ge1xuICAgICAgZXJyb3JDb3VudDogMCxcbiAgICAgIHdhcm5pbmdDb3VudDogMCxcbiAgICB9O1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29uc3VtZURpYWdub3N0aWNVcGRhdGVzKGRpYWdub3N0aWNVcGRhdGVyOiBEaWFnbm9zdGljVXBkYXRlcik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9kaWFnbm9zdGljVXBkYXRlcnMuaGFzKGRpYWdub3N0aWNVcGRhdGVyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRpYWdub3N0aWNDb3VudCA9IHtcbiAgICAgIGVycm9yQ291bnQ6IDAsXG4gICAgICB3YXJuaW5nQ291bnQ6IDAsXG4gICAgfTtcbiAgICB0aGlzLl9kaWFnbm9zdGljVXBkYXRlcnMuc2V0KGRpYWdub3N0aWNVcGRhdGVyLCBkaWFnbm9zdGljQ291bnQpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgZGlhZ25vc3RpY1VwZGF0ZXIub25BbGxNZXNzYWdlc0RpZFVwZGF0ZShcbiAgICAgICAgdGhpcy5fb25BbGxNZXNzYWdlc0RpZFVwZGF0ZS5iaW5kKHRoaXMsIGRpYWdub3N0aWNVcGRhdGVyKSxcbiAgICAgICksXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyOiBhdG9tJFN0YXR1c0Jhcik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pdGVtKSB7XG4gICAgICAvLyBBc3N1bWluZyBvdXIgaW52YXJpYW50cyBob2xkLCBpZiB0aGlzIGNhc2UgZmlyZXMsIHRoYXQgbWVhbnMgdGhhdCB0aGVyZSBpcyBtb3JlIHRoYW4gb25lXG4gICAgICAvLyBzdGF0dXMgYmFyIHByb3ZpZGVyLCB3aGljaCBpcyB3ZWlyZC4gRm9yIG5vdywgd2UganVzdCBpZ25vcmUgdGhpcyBjYXNlIGZvciBzaW1wbGljaXR5LlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9pdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaXRlbS5jbGFzc05hbWUgPSAnaW5saW5lLWJsb2NrJztcbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICB0aGlzLl90aWxlID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKHtcbiAgICAgIGl0ZW0sXG4gICAgICBwcmlvcml0eTogU1RBVFVTX0JBUl9QUklPUklUWSxcbiAgICB9KTtcbiAgfVxuXG4gIF9vbkFsbE1lc3NhZ2VzRGlkVXBkYXRlKFxuICAgIGRpYWdub3N0aWNVcGRhdGVyOiBEaWFnbm9zdGljVXBkYXRlcixcbiAgICBtZXNzYWdlczogQXJyYXk8RGlhZ25vc3RpY01lc3NhZ2U+LFxuICApOiB2b2lkIHtcbiAgICAvLyBVcGRhdGUgdGhlIERpYWdub3N0aWNDb3VudCBmb3IgdGhlIHVwZGF0ZXIuXG4gICAgbGV0IGVycm9yQ291bnQgPSAwO1xuICAgIGxldCB3YXJuaW5nQ291bnQgPSAwO1xuICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiBtZXNzYWdlcykge1xuICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ0Vycm9yJykge1xuICAgICAgICArK2Vycm9yQ291bnQ7XG4gICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PT0gJ1dhcm5pbmcnKSB7XG4gICAgICAgICsrd2FybmluZ0NvdW50O1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9kaWFnbm9zdGljVXBkYXRlcnMuc2V0KGRpYWdub3N0aWNVcGRhdGVyLCB7XG4gICAgICBlcnJvckNvdW50LFxuICAgICAgd2FybmluZ0NvdW50LFxuICAgIH0pO1xuXG4gICAgLy8gUmVjYWxjdWxhdGUgdGhlIHRvdGFsIGRpYWdub3N0aWMgY291bnQuXG4gICAgbGV0IHRvdGFsRXJyb3JDb3VudCA9IDA7XG4gICAgbGV0IHRvdGFsV2FybmluZ0NvdW50ID0gMDtcbiAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWNDb3VudCBvZiB0aGlzLl9kaWFnbm9zdGljVXBkYXRlcnMudmFsdWVzKCkpIHtcbiAgICAgIHRvdGFsRXJyb3JDb3VudCArPSBkaWFnbm9zdGljQ291bnQuZXJyb3JDb3VudDtcbiAgICAgIHRvdGFsV2FybmluZ0NvdW50ICs9IGRpYWdub3N0aWNDb3VudC53YXJuaW5nQ291bnQ7XG4gICAgfVxuICAgIHRoaXMuX3RvdGFsRGlhZ25vc3RpY0NvdW50ID0ge1xuICAgICAgZXJyb3JDb3VudDogdG90YWxFcnJvckNvdW50LFxuICAgICAgd2FybmluZ0NvdW50OiB0b3RhbFdhcm5pbmdDb3VudCxcbiAgICB9O1xuXG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBfcmVuZGVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pdGVtKSB7XG4gICAgICBSZWFjdERPTS5yZW5kZXIoPFN0YXR1c0JhclRpbGVDb21wb25lbnQgey4uLnRoaXMuX3RvdGFsRGlhZ25vc3RpY0NvdW50fSAvPiwgdGhpcy5faXRlbSk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5faXRlbSkge1xuICAgICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9pdGVtKTtcbiAgICAgIHRoaXMuX2l0ZW0gPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl90aWxlKSB7XG4gICAgICB0aGlzLl90aWxlLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuX3RpbGUgPSBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTdGF0dXNCYXJUaWxlQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX29uQ2xpY2s6IEZ1bmN0aW9uO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgZXJyb3JDb3VudDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgIHdhcm5pbmdDb3VudDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX29uQ2xpY2sgPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgZXJyb3JDb2xvckNsYXNzID0gdGhpcy5wcm9wcy5lcnJvckNvdW50ID09PSAwID8gJycgOiAndGV4dC1lcnJvcic7XG4gICAgY29uc3Qgd2FybmluZ0NvbG9yQ2xhc3MgPSB0aGlzLnByb3BzLndhcm5pbmdDb3VudCA9PT0gMCA/ICcnIDogJ3RleHQtd2FybmluZyc7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm51Y2xpZGUtZGlhZ25vc3RpY3Mtc3RhdHVzLWJhclwiIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2t9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BudWNsaWRlLWRpYWdub3N0aWNzLXN0YXR1cy1iYXItZXJyb3IgJHtlcnJvckNvbG9yQ2xhc3N9YH0+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLXN0b3BcIiAvPlxuICAgICAgICAgICZuYnNwO1xuICAgICAgICAgIHt0aGlzLnByb3BzLmVycm9yQ291bnR9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgbnVjbGlkZS1kaWFnbm9zdGljcy1zdGF0dXMtYmFyLXdhcm5pbmcgJHt3YXJuaW5nQ29sb3JDbGFzc31gfT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tYWxlcnRcIiAvPlxuICAgICAgICAgICZuYnNwO1xuICAgICAgICAgIHt0aGlzLnByb3BzLndhcm5pbmdDb3VudH1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH1cblxuICBfb25DbGljaygpOiB2b2lkIHtcbiAgICBjb25zdCB0YXJnZXQgPSBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnbnVjbGlkZS1kaWFnbm9zdGljcy11aTp0b2dnbGUtdGFibGUnKTtcblxuICAgIGNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFuYWx5dGljcycpO1xuICAgIHRyYWNrKCdkaWFnbm9zdGljcy1zaG93LXRhYmxlLWZyb20tc3RhdHVzLWJhcicpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdHVzQmFyVGlsZTtcbiJdfQ==