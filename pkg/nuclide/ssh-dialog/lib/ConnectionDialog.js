'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  NuclideRemoteConnectionParams,
  NuclideRemoteConnectionProfile,
} from './connection-types';

import type {
  SshHandshakeErrorType,
  SshConnectionConfiguration,
} from '../../remote-connection/lib/SshHandshake';

import type {RemoteConnection} from '../../remote-connection/lib/RemoteConnection';

import {notifySshHandshakeError} from './notification';
import AuthenticationPrompt from './AuthenticationPrompt';
import ConnectionDetailsPrompt from './ConnectionDetailsPrompt';
import IndeterminateProgressBar from './IndeterminateProgressBar';
import {React} from 'react-for-atom';
import {
  SshHandshake,
  decorateSshConnectionDelegateWithTracking,
} from '../../remote-connection';
const logger = require('../../logging').getLogger();

type DefaultProps = {
  indexOfInitiallySelectedConnectionProfile: number;
};

type Props = {
  // The list of connection profiles that will be displayed.
  connectionProfiles: ?Array<NuclideRemoteConnectionProfile>;
  // If there is >= 1 connection profile, this index indicates the initial
  // profile to use.
  indexOfInitiallySelectedConnectionProfile: number;
  // Function that is called when the "+" button on the profiles list is clicked.
  // The user's intent is to create a new profile.
  onAddProfileClicked: () => mixed;
  // Function that is called when the "-" button on the profiles list is clicked
  // ** while a profile is selected **.
  // The user's intent is to delete the currently-selected profile.
  onDeleteProfileClicked: (indexOfSelectedConnectionProfile: number) => mixed;
  onConnect: () => mixed;
  onError: () => mixed;
  onCancel: () => mixed;
  onClosed: ?() => mixed;
};

type State = {
  indexOfSelectedConnectionProfile: number;
  instructions: string;
  finish: (answers: Array<string>) => mixed;
  mode: number;
  sshHandshake: SshHandshake;
};

const REQUEST_CONNECTION_DETAILS = 1;
const WAITING_FOR_CONNECTION = 2;
const REQUEST_AUTHENTICATION_DETAILS = 3;
const WAITING_FOR_AUTHENTICATION = 4;

/**
 * Component that manages the state transitions as the user connects to a
 * server.
 */
/* eslint-disable react/prop-types */
export default class ConnectionDialog extends React.Component<DefaultProps, Props, State> {
  _boundOk: () => void;
  _boundCancel: () => void;

  static defaultProps = {
    indexOfInitiallySelectedConnectionProfile: -1,
  };

  constructor(props: Props) {
    super(props);

    const sshHandshake = new SshHandshake(decorateSshConnectionDelegateWithTracking({
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish)  => {
        // TODO: Display all prompts, not just the first one.
        this.requestAuthentication(prompts[0], finish);
      },

      onWillConnect:() => {},

      onDidConnect: (connection: RemoteConnection, config: SshConnectionConfiguration) => {
        this.close(); // Close the dialog.
        this.props.onConnect(connection, config);
      },

      onError: (
        errorType: SshHandshakeErrorType,
        error: Error,
        config: SshConnectionConfiguration,
      ) => {
        this.close(); // Close the dialog.
        notifySshHandshakeError(errorType, error, config);
        this.props.onError(error, config);
        logger.debug(error);
      },
    }));

    this.state = {
      finish: answers => {},
      indexOfSelectedConnectionProfile: props.indexOfInitiallySelectedConnectionProfile,
      instructions: '',
      mode: REQUEST_CONNECTION_DETAILS,
      sshHandshake: sshHandshake,
    };

    this._boundCancel = this.cancel.bind(this);
    this._boundOk = this.ok.bind(this);
    this._boundOnProfileClicked = this.onProfileClicked.bind(this);
  }

  componentWillReceiveProps(nextProps: Props): void {
    let indexOfSelectedConnectionProfile = this.state.indexOfSelectedConnectionProfile;
    if (nextProps.connectionProfiles == null) {
      indexOfSelectedConnectionProfile = -1;
    } else if (
      // The current selection is outside the bounds of the next profiles list
      indexOfSelectedConnectionProfile > (nextProps.connectionProfiles.length - 1)
      // The next profiles list is longer than before, a new one was added
      || nextProps.connectionProfiles.length > this.props.connectionProfiles.length
    ) {
      // Select the final connection profile in the list because one of the above conditions means
      // the current selected index is outdated.
      indexOfSelectedConnectionProfile = nextProps.connectionProfiles.length - 1;
    }

    this.setState({indexOfSelectedConnectionProfile});
  }

  render(): ReactElement {
    const mode = this.state.mode;
    let content;
    let isOkDisabled;
    let okButtonText;

    if (mode === REQUEST_CONNECTION_DETAILS) {
      content = (
        <ConnectionDetailsPrompt
          ref="connection-details"
          connectionProfiles={this.props.connectionProfiles}
          indexOfSelectedConnectionProfile={this.state.indexOfSelectedConnectionProfile}
          onAddProfileClicked={this.props.onAddProfileClicked}
          onDeleteProfileClicked={this.props.onDeleteProfileClicked}
          onConfirm={this._boundOk}
          onCancel={this._boundCancel}
          onProfileClicked={this._boundOnProfileClicked}
        />
      );
      isOkDisabled = false;
      okButtonText = 'Connect';
    } else if (mode === WAITING_FOR_CONNECTION || mode === WAITING_FOR_AUTHENTICATION) {
      content = <IndeterminateProgressBar />;
      isOkDisabled = true;
      okButtonText = 'Connect';
    } else {
      content = (
        <AuthenticationPrompt
          ref="authentication"
          instructions={this.state.instructions}
          onConfirm={this._boundOk}
          onCancel={this._boundCancel}
        />
      );
      isOkDisabled = false;
      okButtonText = 'OK';
    }

    return (
      <atom-panel class="modal modal-lg from-top">
        <div className="padded">
          {content}
        </div>
        <div className="padded text-right">
          <div className="btn-group">
            <button className="btn" onClick={this._boundCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={this._boundOk} disabled={isOkDisabled}>
              {okButtonText}
            </button>
          </div>
        </div>
      </atom-panel>
    );
  }

  cancel() {
    const mode = this.state.mode;

    // It is safe to call cancel even if no connection is started
    this.state.sshHandshake.cancel();

    if (mode === WAITING_FOR_CONNECTION) {
      // TODO(mikeo): Tell delegate to cancel the connection request.
      this.setState({mode: REQUEST_CONNECTION_DETAILS});
    } else {
      // TODO(mikeo): Also cancel connection request, as appropriate for mode?
      this.props.onCancel();
      this.close();
    }
  }

  close() {
    if (this.props.onClosed) {
      this.props.onClosed();
    }
  }

  ok() {
    const mode = this.state.mode;

    if (mode === REQUEST_CONNECTION_DETAILS) {
      // User is trying to submit connection details.
      const connectionDetailsForm = this.refs['connection-details'];
      const {
        username,
        server,
        cwd,
        remoteServerCommand,
        sshPort,
        pathToPrivateKey,
        authMethod,
        password,
      } = connectionDetailsForm.getFormFields();
      if (username && server && cwd && remoteServerCommand) {
        this.setState({mode: WAITING_FOR_CONNECTION});
        this.state.sshHandshake.connect({
          host: server,
          sshPort,
          username,
          pathToPrivateKey,
          authMethod,
          cwd,
          remoteServerCommand,
          password,
        });
      } else {
        // TODO(mbolin): Tell user to fill out all of the fields.
      }
    } else if (mode === REQUEST_AUTHENTICATION_DETAILS) {
      const authenticationPrompt = this.refs['authentication'];
      const password = authenticationPrompt.getPassword();

      this.state.finish([password]);

      this.setState({mode: WAITING_FOR_AUTHENTICATION});
    }
  }

  requestAuthentication(
    instructions: {echo: boolean; prompt: string},
    finish: (answers: Array<string>) => void
  ) {
    this.setState({
      mode: REQUEST_AUTHENTICATION_DETAILS,
      instructions: instructions.prompt,
      finish,
    });
  }

  getFormFields(): ?NuclideRemoteConnectionParams {
    const connectionDetailsForm = this.refs['connection-details'];
    if (!connectionDetailsForm) {
      return null;
    }
    const {
      username,
      server,
      cwd,
      remoteServerCommand,
      sshPort,
      pathToPrivateKey,
      authMethod,
    } = connectionDetailsForm.getFormFields();
    return {
      username,
      server,
      cwd,
      remoteServerCommand,
      sshPort,
      pathToPrivateKey,
      authMethod,
    };
  }

  onProfileClicked(indexOfSelectedConnectionProfile: number): void {
    this.setState({indexOfSelectedConnectionProfile});
  }
}
/* eslint-enable react/prop-types */
