/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  ObservableDiagnosticUpdater,
  DiagnosticMessage,
} from '../../nuclide-diagnostics-common';

import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {track} from '../../nuclide-analytics';

type DiagnosticCount = {
  errorCount: number,
  warningCount: number,
};

// Stick this to the left of remote-projects (-99)
const STATUS_BAR_PRIORITY = -99.5;

export default class StatusBarTile {
  _diagnosticUpdaters: Map<ObservableDiagnosticUpdater, DiagnosticCount>;
  _totalDiagnosticCount: DiagnosticCount;
  _subscriptions: UniversalDisposable;
  _tile: ?atom$StatusBarTile;
  _item: ?HTMLElement;

  constructor() {
    this._diagnosticUpdaters = new Map();
    this._totalDiagnosticCount = {
      errorCount: 0,
      warningCount: 0,
    };
    this._subscriptions = new UniversalDisposable();
  }

  consumeDiagnosticUpdates(diagnosticUpdater: ObservableDiagnosticUpdater): void {
    if (this._diagnosticUpdaters.has(diagnosticUpdater)) {
      return;
    }

    const diagnosticCount = {
      errorCount: 0,
      warningCount: 0,
    };
    this._diagnosticUpdaters.set(diagnosticUpdater, diagnosticCount);
    this._subscriptions.add(
      diagnosticUpdater.allMessageUpdates.subscribe(
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

    const item = this._item = document.createElement('div');
    item.className = 'inline-block';
    this._render();
    this._tile = statusBar.addLeftTile({
      item,
      priority: STATUS_BAR_PRIORITY,
    });
  }

  _onAllMessagesDidUpdate(
    diagnosticUpdater: ObservableDiagnosticUpdater,
    messages: Array<DiagnosticMessage>,
  ): void {
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
      errorCount,
      warningCount,
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
      warningCount: totalWarningCount,
    };

    this._render();
  }

  _render(): void {
    if (this._item) {
      ReactDOM.render(<StatusBarTileComponent {...this._totalDiagnosticCount} />, this._item);
    }
  }

  dispose() {
    this._subscriptions.dispose();
    if (this._item) {
      ReactDOM.unmountComponentAtNode(this._item);
      this._item = null;
    }

    if (this._tile) {
      this._tile.destroy();
      this._tile = null;
    }
  }
}

type Props = {
  errorCount: number,
  warningCount: number,
};

class StatusBarTileComponent extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._onClick = this._onClick.bind(this);
  }

  render() {
    const errorClassName = classnames('nuclide-diagnostics-status-bar-highlight', {
      'highlight': this.props.errorCount === 0,
      'highlight-error': this.props.errorCount > 0,
    });
    const warningClassName = classnames('nuclide-diagnostics-status-bar-highlight', {
      'highlight': this.props.warningCount === 0,
      'highlight-warning': this.props.warningCount > 0,
    });

    return (
      <span
        className="nuclide-diagnostics-highlight-group"
        onClick={this._onClick}
        title="Errors | Warnings">
        <span className={errorClassName}>
          {this.props.errorCount}
        </span>
        <span className={warningClassName}>
          {this.props.warningCount}
        </span>
      </span>
    );
  }

  _onClick(): void {
    const target = atom.views.getView(atom.workspace);
    atom.commands.dispatch(target, 'nuclide-diagnostics-ui:toggle-table');
    track('diagnostics-show-table-from-status-bar');
  }
}
