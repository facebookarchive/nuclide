'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const AtomInput = require('../../ui/atom-input');
const NuclideDropdown = require('../../ui/dropdown');
const React = require('react-for-atom');
const {PropTypes} = React;

const WEB_SERVER_OPTION = {label: 'WebServer', value: 0};
const SCRIPT_OPTION = {label: 'Script', value: 1};
const DEFAULT_OPTION_INDEX = WEB_SERVER_OPTION.value;

const DEBUG_OPTIONS = [
  WEB_SERVER_OPTION,
  SCRIPT_OPTION,
];

const NO_LAUNCH_DEBUG_OPTIONS = [
  WEB_SERVER_OPTION,
];

async function callDebugService(scriptTarget: ?string): Promise {
  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  const debuggerService = await require('../../service-hub-plus')
      .consumeFirstProvider('nuclide-debugger.remote');
  debuggerService.debugHhvm(scriptTarget);
}

class HhvmToolbar extends React.Component {
  constructor(props: mixed) {
    super(props);
    this.state = {
      selectedIndex: DEFAULT_OPTION_INDEX,
    };
    this._debug = this._debug.bind(this);
    this._handleDropdownChange = this._handleDropdownChange.bind(this);
  }

  _getMenuItems(): Array<{label: string, value: number}> {
    return this._isTargetLaunchable(this.props.targetFilePath)
      ? DEBUG_OPTIONS
      : NO_LAUNCH_DEBUG_OPTIONS;
  }

  _isTargetLaunchable(targetFilePath: string): boolean {
    return targetFilePath.endsWith('.php') ||
      targetFilePath.endsWith('.hh');
  }

  componentWillReceiveProps(nextProps: Object) {
    let selectedIndex = this.state.selectedIndex;
    // Reset selected item to DEFAULT_OPTION_INDEX if target is not launchable anymore.
    // TODO[jeffreytan]: this is ugly, refactor to make it more elegant.
    if (!this._isTargetLaunchable(nextProps.targetFilePath)) {
      selectedIndex = DEFAULT_OPTION_INDEX;
      this.setState({selectedIndex: selectedIndex});
    }
    this.refs.debugTarget.setText(this._getDebugTarget(selectedIndex, nextProps.targetFilePath));
  }

  render(): ReactElement {
    const debugTarget = this._getDebugTarget(this.state.selectedIndex, this.props.targetFilePath);
    const isDebugScript = this._isDebugScript(this.state.selectedIndex);
    return (
      <div className="buck-toolbar block padded">
        <NuclideDropdown
          className="inline-block"
          menuItems={this._getMenuItems()}
          selectedIndex={this.state.selectedIndex}
          onSelectedChange={this._handleDropdownChange}
          ref="dropdown"
          size="sm"
        />
        <div className="inline-block" style={{width: '500px'}}>
          <AtomInput
            ref="debugTarget"
            initialValue={debugTarget}
            disabled={!isDebugScript}
            size="sm"/>
        </div>
        <div className="btn-group btn-group-sm inline-block">
          <button
            onClick={this._debug}
            className="btn">
            {isDebugScript ? 'Launch' : 'Attach'}
          </button>
        </div>
      </div>
    );
  }

  _isDebugScript(index: number): bool {
    return index === SCRIPT_OPTION.value;
  }

  _getDebugTarget(index: number, targetFilePath: string): string {
    const remoteUri = require('../../remote-uri');
    const hostName = remoteUri.getHostname(targetFilePath);
    const remoteFilePath = remoteUri.getPath(targetFilePath);
    return this._isDebugScript(index) ? remoteFilePath : hostName;
  }

  _handleDropdownChange(newIndex: number) {
    const debugTarget = this._getDebugTarget(newIndex, this.props.targetFilePath);
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

    let scriptTarget = null;
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
