'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerProcessInfo from '../../nuclide-debugger-atom/lib/DebuggerProcessInfo';
const {AtomInput} = require('../../nuclide-ui/lib/AtomInput');
const {Dropdown} = require('../../nuclide-ui/lib/Dropdown');
const {React} = require('react-for-atom');
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

async function callDebugService(processInfo: DebuggerProcessInfo): Promise {
  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  const debuggerService = await require('../../nuclide-service-hub-plus')
      .consumeFirstProvider('nuclide-debugger.remote');
  debuggerService.startDebugging(processInfo);
}

class HhvmToolbar extends React.Component {
  static propTypes = {
    targetFilePath: PropTypes.string.isRequired,
  };

  state: {
    selectedIndex: number;
  };

  constructor(props: mixed) {
    super(props);
    this.state = {
      selectedIndex: DEFAULT_OPTION_INDEX,
    };
    (this: any)._debug = this._debug.bind(this);
    (this: any)._handleDropdownChange = this._handleDropdownChange.bind(this);
  }

  _getMenuItems(): Array<{label: string; value: number}> {
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
      <div className="buck-toolbar hhvm-toolbar block padded">
        <Dropdown
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
            size="sm"
          />
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
    const remoteUri = require('../../nuclide-remote-uri');
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
    // TODO: is this.props.targetFilePath best one for targetUri?
    let processInfo = null;
    if (this._isDebugScript(this.state.selectedIndex)) {
      const scriptTarget = this.refs['debugTarget'].getText();
      const {LaunchProcessInfo} = require('../../nuclide-debugger-hhvm/lib/LaunchProcessInfo');
      processInfo = new LaunchProcessInfo(this.props.targetFilePath, scriptTarget);
    } else {
      const {AttachProcessInfo} = require('../../nuclide-debugger-hhvm/lib/AttachProcessInfo');
      processInfo = new AttachProcessInfo(this.props.targetFilePath);
    }
    callDebugService(processInfo);
  }
}

module.exports = HhvmToolbar;
