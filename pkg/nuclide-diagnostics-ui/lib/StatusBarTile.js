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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var PropTypes = (_reactForAtom2 || _reactForAtom()).React.PropTypes;

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
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
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
        (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.createElement(StatusBarTileComponent, this._totalDiagnosticCount), this._item);
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      if (this._item) {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this._item);
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
      var errorClassName = (0, (_classnames2 || _classnames()).default)('nuclide-diagnostics-status-bar-highlight', {
        'highlight': this.props.errorCount === 0,
        'highlight-error': this.props.errorCount > 0
      });
      var warningClassName = (0, (_classnames2 || _classnames()).default)('nuclide-diagnostics-status-bar-highlight', {
        'highlight': this.props.warningCount === 0,
        'highlight-warning': this.props.warningCount > 0
      });

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'span',
        {
          className: 'nuclide-diagnostics-highlight-group',
          onClick: this._onClick,
          title: 'Errors | Warnings' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: errorClassName },
          this.props.errorCount
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'span',
          { className: warningClassName },
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
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = StatusBarTile;