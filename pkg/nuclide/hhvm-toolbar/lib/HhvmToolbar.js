'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomInput = require('nuclide-ui-atom-input');
var NuclideDropdown = require('nuclide-ui-dropdown');
var React = require('react-for-atom');
var {PropTypes} = React;

var DebugOption = {
  WebServer : 0,
  Script : 1,
};

async function callDebugService(scriptTarget: ?string): Promise {
  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  var debuggerService = await require('nuclide-service-hub-plus')
      .consumeFirstProvider('nuclide-debugger.remote');
  debuggerService.debugHhvm(scriptTarget);
}

class HhvmToolbar extends React.Component {
  constructor(props: mixed) {
    super(props);
    this.state = {
      selectedIndex: 0,
      menuItems: this._getMenuItems(),
    };
    this._debug = this._debug.bind(this);
    this._handleDropdownChange = this._handleDropdownChange.bind(this);
  }

  _getMenuItems(): any {
    var options = Object.keys(DebugOption);
    return options.map( option => ({
        label: option,
        value: DebugOption[option],
    }));
  }

  componentWillReceiveProps(nextProps: Object) {
    this.refs.debugTarget.setText(
      this._getDebugTarget(this.state.selectedIndex, nextProps.targetFilePath)
    );
  }

  render(): ReactElement {
    var debugTarget = this._getDebugTarget(this.state.selectedIndex, this.props.targetFilePath);
    var isDebugScript = this._isDebugScript(this.state.selectedIndex);
    return (
      <div className="buck-toolbar block">
        <NuclideDropdown
          className="inline-block"
          menuItems={this.state.menuItems}
          selectedIndex={this.state.selectedIndex}
          onSelectedChange={this._handleDropdownChange}
          ref="dropdown"
          size="sm"
        />
        <div className="inline-block" style={{width: '500px'}}>
          <AtomInput ref="debugTarget" initialValue={debugTarget} disabled={!isDebugScript} size="sm"/>
        </div>
        <div className="btn-group btn-group-sm inline-block">
          <button onClick={this._debug} className="btn">{isDebugScript ? 'Launch' : 'Attach'}</button>
        </div>
      </div>
    );
  }

  _isDebugScript(index: number): bool {
    return index === DebugOption.Script;
  }

  _getDebugTarget(index: number, targetFilePath: string): string {
    var remoteUri = require('nuclide-remote-uri');
    var hostName = remoteUri.getHostname(targetFilePath);
    var remoteFilePath = remoteUri.getPath(targetFilePath);
    return this._isDebugScript(index) ? remoteFilePath : hostName;
  }

  _handleDropdownChange(newIndex: number) {
    var debugTarget = this._getDebugTarget(newIndex, this.props.targetFilePath);
    if (this.refs['debugTarget']) {
      this.refs['debugTarget'].setText(debugTarget);
    }
    this.setState({selectedIndex: newIndex});
  }

  /**
   * Use void here to explictly disallow async function in react component.
   */
  _debug(): void {
    // Stop any existing debugging sessions, as install hangs if an existing
    // app that's being overwritten is being debugged.
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:stop-debugging');

    var scriptTarget = null;
    if (this._isDebugScript(this.state.selectedIndex)) {
      scriptTarget = this.refs['debugTarget'].getText();
    }
    callDebugService(scriptTarget);
  }
}

HhvmToolbar.propTypes = {
  targetFilePath: PropTypes.string.isRequired,
};

module.exports = HhvmToolbar;
