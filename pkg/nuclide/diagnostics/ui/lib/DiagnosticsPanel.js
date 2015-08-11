'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var DiagnosticsPane = require('./DiagnosticsPane');
var {PanelComponent} = require('nuclide-panel');
var React = require('react-for-atom');

// This must match the value in diagnostics-table.less.
var PANEL_HEADER_HEIGHT_IN_PX = 21;

// This must match the value in panel-component.less.
var RESIZE_HANDLER_HEIGHT_IN_PX = 4;

var keyboardShortcut: ?string = null;
function getKeyboardShortcut(): string {
  if (keyboardShortcut != null) {
    return keyboardShortcut;
  }

  var matchingKeyBindings = atom.keymaps.findKeyBindings({
    command: 'nuclide-diagnostics-ui:toggle-table',
  });
  if (matchingKeyBindings.length && matchingKeyBindings[0].keystrokes) {
    var {humanizeKeystroke} = require('nuclide-keystroke-label');
    keyboardShortcut = humanizeKeystroke(matchingKeyBindings[0].keystrokes);
  } else {
    keyboardShortcut = '';
  }
  return keyboardShortcut;
}


/**
 * Dismissable panel that displays the diagnostics from nuclide-diagnostics-store.
 */
class DiagnosticsPanel extends React.Component {

  getHeight(): number {
    return this.refs['panel'].getLength();
  }

  render(): ReactElement {
    var warningCount = 0;
    var errorCount = 0;
    this.props.diagnostics.forEach(diagnostic => {
      if (diagnostic.type === 'Error') {
        ++errorCount;
      } else if (diagnostic.type === 'Warning') {
        ++warningCount;
      }
    });

    var panelHeight = this.props.height;
    var paneHeight = panelHeight - PANEL_HEADER_HEIGHT_IN_PX - RESIZE_HANDLER_HEIGHT_IN_PX;

    var shortcut = getKeyboardShortcut();
    var shortcutSpan = null;
    if (shortcut) {
      shortcutSpan = (
        <span>
          (Use <kbd className="key-binding">{getKeyboardShortcut()}</kbd> to toggle this panel.)
          &nbsp;
        </span>
      );
    }

    // We hide the horizontal overflow in the PanelComponent because the presence of the scrollbar
    // throws off our height calculations.
    return (
      <PanelComponent
        ref="panel"
        dock="bottom"
        initialLength={panelHeight}
        onResize={this.props.onResize}
        overflowX="hidden">
        <div>
          <div className="nuclide-diagnostics-pane-nav">
            <div className="nuclide-diagnostics-pane-nav-left">
              <span className="nuclide-diagnostics-error-count">Errors: {errorCount}</span>
              &nbsp;&nbsp;&nbsp;
              <span className="nuclide-diagnostics-warning-count">Warnings: {warningCount}</span>
            </div>
            <div className="nuclide-diagnostics-pane-nav-right">
              {shortcutSpan}
              <button
                onClick={this.props.onDismiss}
                className="btn btn-subtle btn-sm icon icon-x inline-block nuclide-diagnostics-pane-toggle-button"
                title="Close Panel"
              />
            </div>
          </div>
          <DiagnosticsPane diagnostics={this.props.diagnostics} width={this.props.width} height={paneHeight} />
        </div>
      </PanelComponent>
    );
  }
}

var {PropTypes} = React;

DiagnosticsPanel.propTypes = {
  diagnostics: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
};

module.exports = DiagnosticsPanel;
