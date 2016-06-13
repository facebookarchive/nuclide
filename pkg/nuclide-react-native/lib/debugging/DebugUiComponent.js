'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../../nuclide-remote-uri';

import {React} from 'react-for-atom';
import {Button, ButtonTypes} from '../../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../../nuclide-ui/lib/ButtonGroup';
import {Checkbox} from '../../../nuclide-ui/lib/Checkbox';

type Props = {
  targetUri: NuclideUri;
};

// TODO: All this needs to be serialized by the package, so we're going to need to hoist it and use
//   actions.
type State = {
  startPackager: boolean;
  tailIosLogs: boolean;
  tailAdbLogs: boolean;
};

export class DebugUiComponent extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    (this: any)._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    (this: any)._handleDebugButtonClick = this._handleDebugButtonClick.bind(this);

    this.state = {
      startPackager: false,
      tailIosLogs: false,
      tailAdbLogs: false,
    };
  }

  render(): React.Element<any> {
    return (
      <div className="block">
        <div className="block">
          <Checkbox
            checked={this.state.startPackager}
            label="Start Packager"
            onChange={startPackager => this.setState({startPackager})}
          />
        </div>
        <div className="block">
          <Checkbox
            checked={this.state.tailIosLogs}
            label="Tail iOS Simulator Logs"
            onChange={tailIosLogs => this.setState({tailIosLogs})}
          />
        </div>
        <div className="block">
          <Checkbox
          checked={this.state.tailAdbLogs}
            label="Tail adb Logcat Logs"
            onChange={tailAdbLogs => this.setState({tailAdbLogs})}
          />
        </div>
        <div className="text-left text-smaller text-subtle">
          After starting the debugger, enable JS debugging from the developer menu of your React
          Native app
        </div>
        <div className="nuclide-react-native-debugging-launch-attach-actions">
          <ButtonGroup>
            <Button
              onClick={this._handleCancelButtonClick}>
              Cancel
            </Button>
            <Button
              buttonType={ButtonTypes.PRIMARY}
              onClick={this._handleDebugButtonClick}>
              Attach
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }

  _handleDebugButtonClick(): void {
    if (this.state.startPackager) {
      callWorkspaceCommand('nuclide-react-native:start-packager');
    }
    if (this.state.tailIosLogs) {
      callWorkspaceCommand('nuclide-ios-simulator-logs:start');
    }
    if (this.state.tailAdbLogs) {
      callWorkspaceCommand('nuclide-adb-logcat:start');
    }
    callWorkspaceCommand('nuclide-react-native:start-debugging');
    callWorkspaceCommand('nuclide-debugger:toggle-launch-attach');
  }

  _handleCancelButtonClick(): void {
    callWorkspaceCommand('nuclide-debugger:toggle-launch-attach');
  }

}

function callWorkspaceCommand(command: string): void {
  atom.commands.dispatch(atom.views.getView(atom.workspace), command);
}
