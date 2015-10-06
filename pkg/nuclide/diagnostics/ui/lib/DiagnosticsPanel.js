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
var {PanelComponent} = require('nuclide-ui-panel');
var React = require('react-for-atom');

// This must match the value in diagnostics-table.less.
var PANEL_HEADER_HEIGHT_IN_PX = 28;

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
  constructor(props: mixed) {
    super(props);
    this._onFilterByActiveTextEditorChange = this._onFilterByActiveTextEditorChange.bind(this);
  }

  getHeight(): number {
    return this.refs['panel'].getLength();
  }

  render(): ReactElement {
    var warningCount = 0;
    var errorCount = 0;
    var {diagnostics} = this.props;
    if (this.props.filterByActiveTextEditor && this.props.pathToActiveTextEditor) {
      var pathToFilterBy = this.props.pathToActiveTextEditor;
      diagnostics = diagnostics.filter(diagnostic => diagnostic.filePath === pathToFilterBy);
    }
    diagnostics.forEach(diagnostic => {
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
        <span className="text-subtle inline-block">
          Use <kbd className="key-binding key-binding-sm text-highlight">
          {getKeyboardShortcut()}
          </kbd> to toggle this panel.
        </span>
      );
    }

    var linterWarning = null;
    if (this.props.warnAboutLinter) {
      linterWarning = (
        <div className="nuclide-diagnostics-pane-linter-warning">
          <span>
            nuclide-diagnostics is not compatible with the linter package. We recommend that
            you <a onClick={this.props.disableLinter}>disable the linter package</a>.&nbsp;
            <a href="https://github.com/facebook/nuclide/tree/master/pkg/nuclide/diagnostics">
            Learn More</a>.
          </span>
        </div>
      );
    }

    var errorSpanClassName = `inline-block ${errorCount > 0 ? 'text-error' : ''}`;
    var warningSpanClassName = `inline-block ${warningCount > 0 ? 'text-warning' : ''}`;

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
          {linterWarning}
          <div className="nuclide-diagnostics-pane-nav">
            <div className="nuclide-diagnostics-pane-nav-left">
              <span className={errorSpanClassName}>
                Errors: {errorCount}
              </span>
              <span className={warningSpanClassName}>
                Warnings: {warningCount}
              </span>
              <span className="inline-block">
                <label className="nuclide-diagnostics-label">
                  <input
                    type="checkbox"
                    checked={this.props.filterByActiveTextEditor}
                    onChange={this._onFilterByActiveTextEditorChange}
                  />
                  &nbsp;
                  Show only diagnostics for current file.
                </label>
              </span>
            </div>
            <div className="nuclide-diagnostics-pane-nav-right">
              {shortcutSpan}
              <button
                onClick={this.props.onDismiss}
                className="btn btn-subtle btn-sm icon icon-x inline-block"
                title="Close Panel"
              />
            </div>
          </div>
          <DiagnosticsPane
            showFileName={!this.props.filterByActiveTextEditor}
            diagnostics={diagnostics}
            height={paneHeight}
            width={this.props.width}
          />
        </div>
      </PanelComponent>
    );
  }

  _onFilterByActiveTextEditorChange(event: SyntheticEvent) {
    var isChecked = ((event.target: any): HTMLInputElement).checked;
    this.props.onFilterByActiveTextEditorChange.call(null, isChecked);
  }
}

var {PropTypes} = React;

DiagnosticsPanel.propTypes = {
  diagnostics: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onResize: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  pathToActiveTextEditor: PropTypes.string,
  filterByActiveTextEditor: PropTypes.bool.isRequired,
  onFilterByActiveTextEditorChange: PropTypes.func.isRequired,
  warnAboutLinter: PropTypes.bool.isRequired,
  disableLinter: PropTypes.func.isRequired,
};

module.exports = DiagnosticsPanel;
