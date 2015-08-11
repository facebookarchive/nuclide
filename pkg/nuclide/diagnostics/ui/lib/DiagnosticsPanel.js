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

/**
 * Dismissable panel that displays the diagnostics from nuclide-diagnostics-store.
 */
class DiagnosticsPanel extends React.Component {

  getHeight(): number {
    return this.refs['panel'].getLength();
  }

  render(): ReactElement {
    return (
      <PanelComponent
        ref="panel"
        dock="bottom"
        initialLength={this.props.height}
        onResize={this.props.onResize}>
        <DiagnosticsPane diagnostics={this.props.diagnostics} height={this.props.height} />
      </PanelComponent>
    );
  }
}

var {PropTypes} = React;

DiagnosticsPanel.propTypes = {
  diagnostics: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  onResize: PropTypes.func.isRequired,
};

module.exports = DiagnosticsPanel;
