'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _reactForAtom = require('react-for-atom');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Stick this to the left of remote-projects (-99)
const STATUS_BAR_PRIORITY = -99.5;let StatusBarTile = class StatusBarTile {

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
    this._subscriptions.add(diagnosticUpdater.allMessageUpdates.subscribe(this._onAllMessagesDidUpdate.bind(this, diagnosticUpdater)));
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
      item: item,
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
      } else if (message.type === 'Warning') {
        ++warningCount;
      }
    }
    this._diagnosticUpdaters.set(diagnosticUpdater, {
      errorCount: errorCount,
      warningCount: warningCount
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
      _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(StatusBarTileComponent, this._totalDiagnosticCount), this._item);
    }
  }

  dispose() {
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
};
let StatusBarTileComponent = class StatusBarTileComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
  }

  render() {
    const errorClassName = (0, (_classnames || _load_classnames()).default)('nuclide-diagnostics-status-bar-highlight', {
      'highlight': this.props.errorCount === 0,
      'highlight-error': this.props.errorCount > 0
    });
    const warningClassName = (0, (_classnames || _load_classnames()).default)('nuclide-diagnostics-status-bar-highlight', {
      'highlight': this.props.warningCount === 0,
      'highlight-warning': this.props.warningCount > 0
    });

    return _reactForAtom.React.createElement(
      'span',
      {
        className: 'nuclide-diagnostics-highlight-group',
        onClick: this._onClick,
        title: 'Errors | Warnings' },
      _reactForAtom.React.createElement(
        'span',
        { className: errorClassName },
        this.props.errorCount
      ),
      _reactForAtom.React.createElement(
        'span',
        { className: warningClassName },
        this.props.warningCount
      )
    );
  }

  _onClick() {
    const target = atom.views.getView(atom.workspace);
    atom.commands.dispatch(target, 'nuclide-diagnostics-ui:toggle-table');
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('diagnostics-show-table-from-status-bar');
  }
};


module.exports = StatusBarTile;