"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _addTooltip() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
// Stick this to the left of remote-projects (-99)
const STATUS_BAR_PRIORITY = -99.5;
const RENDER_DEBOUNCE_TIME = 100;

class StatusBarTile {
  constructor() {
    this._diagnosticUpdaters = new Map();
    this._totalDiagnosticCount = {
      errorCount: 0,
      warningCount: 0
    };
    this._subscriptions = new (_UniversalDisposable().default)();
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

    this._subscriptions.add((0, _event().observableFromSubscribeFunction)(diagnosticUpdater.observeMessages).let((0, _observable().fastDebounce)(RENDER_DEBOUNCE_TIME)).subscribe(this._onAllMessagesDidUpdate.bind(this, diagnosticUpdater), null, this._onAllMessagesDidUpdate.bind(this, diagnosticUpdater, [])));
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

    const statusBarPosition = _featureConfig().default.get('atom-ide-diagnostics-ui.statusBarPosition');

    const statusBarPositionMethod = statusBarPosition === 'left' ? statusBar.addLeftTile : statusBar.addRightTile; // negate the priority for better visibility on the right side

    const statusBarPriority = statusBarPosition === 'left' ? STATUS_BAR_PRIORITY : -STATUS_BAR_PRIORITY;
    this._tile = statusBarPositionMethod({
      item,
      priority: statusBarPriority
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
    }); // Recalculate the total diagnostic count.


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
      _reactDom.default.render(React.createElement(StatusBarTileComponent, this._totalDiagnosticCount), this._item);
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

class StatusBarTileComponent extends React.Component {
  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
  }

  render() {
    const errorCount = this.props.errorCount;
    const warningCount = this.props.warningCount;
    const hasErrors = errorCount > 0;
    const hasWarnings = warningCount > 0;
    const errorClassName = (0, _classnames().default)('diagnostics-status-bar-highlight', {
      'text-error': hasErrors
    });
    const warningClassName = (0, _classnames().default)('diagnostics-status-bar-highlight', {
      'text-warning': hasWarnings
    });
    const errorLabel = hasErrors ? errorCount : 'No';
    const errorSuffix = errorCount !== 1 ? 's' : '';
    const warningLabel = hasWarnings ? warningCount : 'No';
    const warningSuffix = warningCount !== 1 ? 's' : '';
    return React.createElement("span", null, React.createElement("a", {
      className: errorClassName,
      onClick: this._onClick // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: (0, _addTooltip().default)({
        title: `${errorLabel} error${errorSuffix}`,
        placement: 'top'
      })
    }, React.createElement(_Icon().Icon, {
      icon: "nuclicon-error"
    }), errorCount), React.createElement("a", {
      className: warningClassName,
      onClick: this._onClick // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: (0, _addTooltip().default)({
        title: `${warningLabel} warning${warningSuffix}`,
        placement: 'top'
      })
    }, React.createElement(_Icon().Icon, {
      icon: "nuclicon-warning"
    }), warningCount));
  }

  _onClick() {
    const target = atom.views.getView(atom.workspace);
    atom.commands.dispatch(target, 'diagnostics:toggle-table');

    _analytics().default.track('diagnostics-show-table-from-status-bar');
  }

}