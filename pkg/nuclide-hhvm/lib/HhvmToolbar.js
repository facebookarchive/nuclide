'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DebuggerProcessInfo} from '../../nuclide-debugger-base';
import type ProjectStore from './ProjectStore';
import type {DebugMode} from './types';

import {HACK_GRAMMARS} from '../../nuclide-hack-common/lib/constants.js';
import {AtomInput} from '../../nuclide-ui/AtomInput';
import {Dropdown} from '../../nuclide-ui/Dropdown';
import {React} from 'react-for-atom';
import {
  Button,
} from '../../nuclide-ui/Button';
import {
  ButtonGroup,
  ButtonGroupSizes,
} from '../../nuclide-ui/ButtonGroup';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
import nuclideUri from '../../commons-node/nuclideUri';

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {LaunchProcessInfo} from '../../nuclide-debugger-php/lib/LaunchProcessInfo';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {AttachProcessInfo} from '../../nuclide-debugger-php/lib/AttachProcessInfo';

const WEB_SERVER_OPTION = {label: 'WebServer', value: 'webserver'};
const SCRIPT_OPTION = {label: 'Script', value: 'script'};

const DEBUG_OPTIONS = [
  WEB_SERVER_OPTION,
  SCRIPT_OPTION,
];

const NO_LAUNCH_DEBUG_OPTIONS = [
  WEB_SERVER_OPTION,
];

async function callDebugService(processInfo: DebuggerProcessInfo): Promise<any> {
  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  const debuggerService = await consumeFirstProvider('nuclide-debugger.remote');
  debuggerService.startDebugging(processInfo);
}

type Props = {
  projectStore: ProjectStore,
};

class HhvmToolbar extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    (this: any)._debug = this._debug.bind(this);
    (this: any)._handleDropdownChange = this._handleDropdownChange.bind(this);
    (this: any)._updateLastScriptCommand = this._updateLastScriptCommand.bind(this);
    (this: any)._getLastScriptCommand = this._getLastScriptCommand.bind(this);
  }

  _updateLastScriptCommand(command: string): void {
    if (this.props.projectStore.getDebugMode() === 'script') {
      this.props.projectStore.updateLastScriptCommand(command);
    }
  }

  _getLastScriptCommand(filePath: string): string {
    return this.props.projectStore.getLastScriptCommand(filePath);
  }

  _getMenuItems(): Array<{label: string, value: DebugMode}> {
    return this._isTargetLaunchable(this.props.projectStore.getCurrentFilePath())
      ? DEBUG_OPTIONS
      : NO_LAUNCH_DEBUG_OPTIONS;
  }

  _isTargetLaunchable(targetFilePath: string): boolean {
    if (targetFilePath.endsWith('.php') || targetFilePath.endsWith('.hh')) {
      return true;
    }
    return atom.workspace.getTextEditors().some(editor => {
      const editorPath = editor.getPath();
      if (editorPath != null && editorPath.endsWith(targetFilePath)) {
        const grammar = editor.getGrammar();
        return HACK_GRAMMARS.indexOf(grammar.scopeName) >= 0;
      }
      return false;
    });
  }

  componentWillReceiveProps(nextProps: Object) {
    // Reset selected item to webserver if target is not launchable anymore.
    // TODO[jeffreytan]: this is ugly, refactor to make it more elegant.
    const store = this.props.projectStore;
    if (store.getDebugMode() === 'script' &&
        !this._isTargetLaunchable(store.getCurrentFilePath())) {
      store.setDebugMode('webserver');
    }
    this.refs.debugTarget.setText(this._getDebugTarget(
      store.getDebugMode(),
      store.getCurrentFilePath(),
    ));
  }

  render(): React.Element<any> {
    const store = this.props.projectStore;
    const debugTarget = this._getDebugTarget(store.getDebugMode(), store.getCurrentFilePath());
    const isDebugScript = store.getDebugMode() === 'script';
    return (
      <div className="hhvm-toolbar block padded">
        <Dropdown
          className="inline-block"
          options={this._getMenuItems()}
          value={store.getDebugMode()}
          onChange={this._handleDropdownChange}
          ref="dropdown"
          size="sm"
        />
        <div className="inline-block" style={{width: '500px'}}>
          <AtomInput
            ref="debugTarget"
            initialValue={debugTarget}
            disabled={!isDebugScript}
            onDidChange={this._updateLastScriptCommand}
            size="sm"
          />
        </div>
        <ButtonGroup size={ButtonGroupSizes.SMALL} className="inline-block">
          <Button onClick={this._debug}>
            {isDebugScript ? 'Launch' : 'Attach'}
          </Button>
        </ButtonGroup>
      </div>
    );
  }

  _getDebugTarget(debugMode: DebugMode, targetFilePath: string): string {
    if (debugMode === 'script') {
      const targetPath = nuclideUri.getPath(targetFilePath);
      const lastScriptCommand = this._getLastScriptCommand(targetPath);
      if (lastScriptCommand === '') {
        return targetPath;
      }
      return lastScriptCommand;
    }
    return nuclideUri.getHostname(targetFilePath);
  }

  _handleDropdownChange(value: DebugMode) {
    this.props.projectStore.setDebugMode(value);
  }

  /**
   * Use void here to explictly disallow async function in react component.
   */
  _debug(): void {
    const store = this.props.projectStore;
    let processInfo = null;
    if (store.getDebugMode() === 'script') {
      const scriptTarget = this.refs.debugTarget.getText();
      processInfo = new LaunchProcessInfo(store.getCurrentFilePath(), scriptTarget);
    } else {
      processInfo = new AttachProcessInfo(store.getCurrentFilePath());
    }
    callDebugService(processInfo);
  }
}

module.exports = HhvmToolbar;
