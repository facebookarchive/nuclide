'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Stick this to the left of remote-projects (-99)
const STATUS_BAR_PRIORITY = -99.5; /**
                                    * Copyright (c) 2017-present, Facebook, Inc.
                                    * All rights reserved.
                                    *
                                    * This source code is licensed under the BSD-style license found in the
                                    * LICENSE file in the root directory of this source tree. An additional grant
                                    * of patent rights can be found in the PATENTS file in the same directory.
                                    *
                                    * 
                                    * @format
                                    */

const RENDER_DEBOUNCE_TIME = 100;

class StatusBarTile {

  constructor() {
    this._diagnosticUpdaters = new Map();
    this._totalDiagnosticCount = {
      errorCount: 0,
      warningCount: 0
    };
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  consumeDiagnosticUpdates(diagnosticUpdater) {
    if (this._diagnosticUpdaters.has(diagnosticUpdater)) {
      return;
    }

    const diagnosticCount = {
      errorCount: 0,
      warningCount: 0
    };
    this._diagnosticUpdaters.set(diagnosticUpdater, diagnosticCount);
    this._subscriptions.add((0, (_event || _load_event()).observableFromSubscribeFunction)(diagnosticUpdater.observeMessages).debounceTime(RENDER_DEBOUNCE_TIME).subscribe(this._onAllMessagesDidUpdate.bind(this, diagnosticUpdater), null, this._onAllMessagesDidUpdate.bind(this, diagnosticUpdater, [])));
  }

  consumeStatusBar(statusBar) {
    if (this._item) {
      // Assuming our invariants hold, if this case fires, that means that there is more than one
      // status bar provider, which is weird. For now, we just ignore this case for simplicity.
      return;
    }

    const item = this._item = document.createElement('div');
    item.className = 'inline-block';
    this._render();
    this._tile = statusBar.addLeftTile({
      item,
      priority: STATUS_BAR_PRIORITY
    });
  }

  _onAllMessagesDidUpdate(diagnosticUpdater, messages) {
    // Update the DiagnosticCount for the updater.
    let errorCount = 0;
    let warningCount = 0;
    for (const message of messages) {
      if (message.type === 'Error') {
        ++errorCount;
      } else if (message.type === 'Warning' || message.type === 'Info') {
        // TODO: should "Info" messages have their own category?
        ++warningCount;
      }
    }
    this._diagnosticUpdaters.set(diagnosticUpdater, {
      errorCount,
      warningCount
    });

    // Recalculate the total diagnostic count.
    let totalErrorCount = 0;
    let totalWarningCount = 0;
    for (const diagnosticCount of this._diagnosticUpdaters.values()) {
      totalErrorCount += diagnosticCount.errorCount;
      totalWarningCount += diagnosticCount.warningCount;
    }
    this._totalDiagnosticCount = {
      errorCount: totalErrorCount,
      warningCount: totalWarningCount
    };

    this._render();
  }

  _render() {
    if (this._item) {
      _reactDom.default.render(_react.createElement(StatusBarTileComponent, this._totalDiagnosticCount), this._item);
    }
  }

  dispose() {
    this._subscriptions.dispose();
    if (this._item) {
      _reactDom.default.unmountComponentAtNode(this._item);
      this._item = null;
    }

    if (this._tile) {
      this._tile.destroy();
      this._tile = null;
    }
  }
}

exports.default = StatusBarTile;


class StatusBarTileComponent extends _react.Component {
  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
  }

  render() {
    const errorCount = this.props.errorCount;
    const warningCount = this.props.warningCount;
    const hasErrors = errorCount > 0;
    const hasWarnings = warningCount > 0;
    const errorClassName = (0, (_classnames || _load_classnames()).default)('nuclide-diagnostics-status-bar-highlight', {
      'text-error': hasErrors
    });
    const warningClassName = (0, (_classnames || _load_classnames()).default)('nuclide-diagnostics-status-bar-highlight', {
      'text-warning': hasWarnings
    });
    const errorLabel = hasErrors ? errorCount : 'No';
    const errorSuffix = errorCount !== 1 ? 's' : '';
    const warningLabel = hasWarnings ? warningCount : 'No';
    const warningSuffix = warningCount !== 1 ? 's' : '';

    return _react.createElement(
      'span',
      null,
      _react.createElement(
        'a',
        {
          className: errorClassName,
          onClick: this._onClick
          // $FlowFixMe(>=0.53.0) Flow suppress
          , ref: (0, (_addTooltip || _load_addTooltip()).default)({
            title: `${errorLabel} error${errorSuffix}`,
            placement: 'top'
          }) },
        _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'stop' }),
        errorCount
      ),
      _react.createElement(
        'a',
        {
          className: warningClassName,
          onClick: this._onClick
          // $FlowFixMe(>=0.53.0) Flow suppress
          , ref: (0, (_addTooltip || _load_addTooltip()).default)({
            title: `${warningLabel} warning${warningSuffix}`,
            placement: 'top'
          }) },
        _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'alert' }),
        warningCount
      )
    );
  }

  _onClick() {
    const target = atom.views.getView(atom.workspace);
    atom.commands.dispatch(target, 'diagnostics:toggle-table');
    (_analytics || _load_analytics()).default.track('diagnostics-show-table-from-status-bar');
  }
}