'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import {CompositeDisposable} from 'atom';
import React from 'react-for-atom';

type DiagnosticCount = {
  errorCount: number;
  warningCount: number;
}

var STATUS_BAR_PRIORITY = 0;

class StatusBarTile {

  _diagnosticUpdaters: Map<DiagnosticUpdater, DiagnosticCount>;
  _totalDiagnosticCount: DiagnosticCount;
  _subscriptions: CompositeDisposable;
  _tile: ?atom$StatusBarTile;
  _item: ?HTMLElement;

  constructor() {
    this._diagnosticUpdaters = new Map();
    this._totalDiagnosticCount = {
      errorCount: 0,
      warningCount: 0,
    };
    this._subscriptions = new CompositeDisposable();
  }

  consumeDiagnosticUpdates(diagnosticUpdater: DiagnosticUpdater): void {
    if (this._diagnosticUpdaters.has(diagnosticUpdater)) {
      return;
    }

    var diagnosticCount = {
      errorCount: 0,
      warningCount: 0,
    };
    this._diagnosticUpdaters.set(diagnosticUpdater, diagnosticCount);
    this._subscriptions.add(
      diagnosticUpdater.onAllMessagesDidUpdate(
        this._onAllMessagesDidUpdate.bind(this, diagnosticUpdater),
      ),
    );
  }

  consumeStatusBar(statusBar: atom$StatusBar): void {
    if (this._item) {
      // Assuming our invariants hold, if this case fires, that means that there is more than one
      // status bar provider, which is weird. For now, we just ignore this case for simplicity.
      return;
    }

    var item = this._item = document.createElement('div');
    item.className = 'inline-block';
    this._render();
    this._tile = statusBar.addLeftTile({
      item,
      priority: STATUS_BAR_PRIORITY,
    });
  }

  _onAllMessagesDidUpdate(
    diagnosticUpdater: DiagnosticUpdater,
    messages: Array<DiagnosticMessage>,
  ): void {
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
      errorCount,
      warningCount,
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
      warningCount: totalWarningCount,
    };

    this._render();
  }

  _render(): void {
    if (this._item) {
      React.render(<StatusBarTileComponent {...this._totalDiagnosticCount} />, this._item);
    }
  }

  dispose() {
    this._subscriptions.dispose();
    if (this._item) {
      React.unmountComponentAtNode(this._item);
      this._item = null;
    }

    if (this._tile) {
      this._tile.destroy();
      this._tile = null;
    }
  }
}

class StatusBarTileComponent extends React.Component {
  _onClick: Function;

  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
  }

  render() {
    return (
      <span className="nuclide-diagnostics-status-bar" onClick={this._onClick}>
        <span className="nuclide-diagnostics-status-bar-error text-error">
          <span className="icon icon-stop" />
          &nbsp;
          {this.props.errorCount}
        </span>
        <span className="nuclide-diagnostics-status-bar-warning text-warning">
          <span className="icon icon-alert" />
          &nbsp;
          {this.props.warningCount}
        </span>
      </span>
    );
  }

  _onClick(): void {
    var target = atom.views.getView(atom.workspace);
    atom.commands.dispatch(target, 'nuclide-diagnostics-ui:toggle-table');

    var {track} = require('nuclide-analytics');
    track('diagnostics-show-table-from-status-bar');
  }
}

var {PropTypes} = React;

StatusBarTileComponent.propTypes = {
  errorCount: PropTypes.number.isRequired,
  warningCount: PropTypes.number.isRequired,
};

module.exports = StatusBarTile;
