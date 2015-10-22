'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import AuthenticationPrompt from './AuthenticationPrompt';
import ConnectionDetailsForm from './ConnectionDetailsForm';
import IndeterminateProgressBar from './IndeterminateProgressBar';
import React from 'react-for-atom';
import {
  SshHandshake,
  decorateSshConnectionDelegateWithTracking,
} from 'nuclide-remote-connection';
const logger = require('nuclide-logging').getLogger();

type DefaultProps = {};
type Props = {
  initialUsername: ?string;
  initialServer: ?string;
  initialRemoteServerCommand: ?string;
  initialCwd: ?string;
  initialSshPort: ?string;
  initialPathToPrivateKey: ?string;
  onConnect: () => mixed;
  onError: () => mixed;
  onCancel: () => mixed;
  onClosed: ?() => mixed;
};
type State = {
  mode: number;
  instructions: string;
  sshHandshake: SshHandshake;
  finish: (answers: Array<string>) => mixed;
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

  constructor(props: Props) {
    super(props);
    this.state = this._createInitialState();
    this._boundOk = this.ok.bind(this);
    this._boundCancel = this.cancel.bind(this);
  }

  _createInitialState() {
    var sshHandshake = new SshHandshake(decorateSshConnectionDelegateWithTracking({
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish)  => {
        // TODO: Display all prompts, not just the first one.
        this.requestAuthentication(prompts[0], finish);
      },

      onWillConnect:() => {},

      onDidConnect: (connection: SshHandshake, config: SshConnectionConfiguration) => {
        this.close(); // Close the dialog.
        this.props.onConnect(connection, config);
      },

      onError: (error: Error, config: SshConnectionConfiguration) => {
        this.close(); // Close the dialog.
        atom.notifications.addError(error.message, {dismissable: true});
        this.props.onError(error, config);
        logger.debug(error);
      },
    }));

    return {
      mode: REQUEST_CONNECTION_DETAILS,
      instructions: '',
      sshHandshake: sshHandshake,
      finish: (answers) => {},
    };
  }

  render() {
    const mode = this.state.mode;
    let content;
    let isOkDisabled;
    if (mode === REQUEST_CONNECTION_DETAILS) {
      // Note React.__spread() is not available in the Atom React fork, so we
      // pass the props explicitly.
      content = (
        <ConnectionDetailsForm
          ref="connection-details"
          initialUsername={this.props.initialUsername}
          initialServer={this.props.initialServer}
          initialRemoteServerCommand={this.props.initialRemoteServerCommand}
          initialCwd={this.props.initialCwd}
          initialSshPort={this.props.initialSshPort}
          initialPathToPrivateKey={this.props.initialPathToPrivateKey}
          initialAuthMethod={this.props.initialAuthMethod}
          onConfirm={this._boundOk}
          onCancel={this._boundCancel}
        />
      );
      isOkDisabled = false;
    } else if (mode === WAITING_FOR_CONNECTION || mode === WAITING_FOR_AUTHENTICATION) {
      content = <IndeterminateProgressBar />;
      isOkDisabled = true;
    } else {
      content = (
        <AuthenticationPrompt ref="authentication"
                              instructions={this.state.instructions}
                              onConfirm={this._boundOk}
                              onCancel={this._boundCancel}
      />);
      isOkDisabled = false;
    }

    // The root element cannot have a 'key' property, so we use a dummy
    // <div> as the root. Ideally, the <atom-panel> would be the root.
    return (
      <div>
        <atom-panel className="modal from-top" key="connect-dialog">
          {content}
          <div className="block nuclide-ok-cancel">
            <button className="btn" onClick={this._boundCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={this._boundOk} disabled={isOkDisabled}>
              OK
            </button>
          </div>
        </atom-panel>
      </div>
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
    const domNode = React.findDOMNode(this);
    if (domNode) {
      React.unmountComponentAtNode(domNode.parentNode);
    }
  }

  ok() {
    const mode = this.state.mode;

    if (mode === REQUEST_CONNECTION_DETAILS) {
      // User is trying to submit connection details.
      const connectionDetailsForm = this.refs['connection-details'];
      const pathToPrivateKey = connectionDetailsForm.getText('pathToPrivateKey');
      const username = connectionDetailsForm.getText('username');
      const server = connectionDetailsForm.getText('server');
      const cwd = connectionDetailsForm.getText('cwd');
      const sshPort = connectionDetailsForm.getText('sshPort');
      const remoteServerCommand = connectionDetailsForm.getText('remoteServerCommand');
      const authMethod = connectionDetailsForm.getAuthMethod();
      const password = connectionDetailsForm.getPassword();
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
}
/* eslint-enable react/prop-types */
