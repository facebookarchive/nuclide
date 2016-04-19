'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import {AttachProcessInfo} from './AttachProcessInfo';
import {
  Button,
  ButtonTypes,
} from '../../nuclide-ui/lib/Button';

import type {NuclideUri} from '../../nuclide-remote-uri';

type PropsType = {
  targetUri: NuclideUri;
};

export class AttachUiComponent extends React.Component<void, PropsType, void> {
  props: PropsType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    (this: any)._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);
  }

  render(): React.Element {
    return (
      <div className="block">
        <div className="padded text-right">
          <Button onClick={this._handleCancelButtonClick}>Cancel</Button>
          <Button
            buttonType={ButtonTypes.PRIMARY}
            onClick={this._handleAttachButtonClick}>
            Attach
          </Button>
        </div>
      </div>
    );
  }

  _handleAttachButtonClick(): void {
    // Start a debug session with the user-supplied information.
    const processInfo = new AttachProcessInfo(this.props.targetUri);
    require('../../nuclide-service-hub-plus')
      .consumeFirstProvider('nuclide-debugger.remote')
      .then(debuggerService => debuggerService.startDebugging(processInfo));
    this._showDebuggerPanel();
    this._handleCancelButtonClick();
  }

  _showDebuggerPanel(): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:show'
    );
  }

  _handleCancelButtonClick(): void {
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-debugger:toggle-launch-attach'
    );
  }
}
