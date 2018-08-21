/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {
  NuclideRemoteConnectionParams,
  NuclideRemoteConnectionParamsWithPassword,
  NuclideRemoteConnectionProfile,
} from './connection-types';
import type {
  SshHandshakeErrorType,
  SshConnectionConfiguration,
  SshConnectionDelegate,
} from '../../nuclide-remote-connection/lib/SshHandshake';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';
import AuthenticationPrompt from './AuthenticationPrompt';
import {Button, ButtonTypes} from 'nuclide-commons-ui/Button';
import {ButtonGroup} from 'nuclide-commons-ui/ButtonGroup';
import connectBigDigSshHandshake from './connectBigDigSshHandshake';
import ConnectionDetailsPrompt from './ConnectionDetailsPrompt';
import IndeterminateProgressBar from './IndeterminateProgressBar';
import invariant from 'assert';
import {notifySshHandshakeError} from './notification';
import * as React from 'react';
import electron from 'electron';
import {
  RemoteConnection,
  decorateSshConnectionDelegateWithTracking,
} from '../../nuclide-remote-connection';
import {validateFormInputs} from './form-validation-utils';
import {getLogger} from 'log4js';

const logger = getLogger('nuclide-remote-projects');
const {remote} = electron;
invariant(remote != null);

type Props = {
  dirty: boolean,
  setDirty: boolean => void,

  confirmConnectionPrompt: (answers: Array<string>) => void,
  setConnectionPromptConfirmation: (
    confirm: (answers: Array<string>) => mixed,
  ) => void,

  connectionPromptInstructions: string,
  setConnectionPromptInstructions: string => void,

  // The list of connection profiles that will be displayed.
  connectionProfiles: ?Array<NuclideRemoteConnectionProfile>,
  // If there is >= 1 connection profile, this index indicates the initial
  // profile to use.
  selectedProfileIndex: number,
  // Function that is called when the "+" button on the profiles list is clicked.
  // The user's intent is to create a new profile.
  onAddProfileClicked: () => mixed,
  // Function that is called when the "-" button on the profiles list is clicked
  // ** while a profile is selected **.
  // The user's intent is to delete the currently-selected profile.
  onDeleteProfileClicked: (selectedProfileIndex: number) => mixed,
  onConnect: (
    connection: RemoteConnection,
    config: SshConnectionConfiguration,
  ) => mixed,
  onError: (error: Error, config: SshConnectionConfiguration) => mixed,
  onCancel: () => mixed,
  onClosed: ?() => mixed,
  onSaveProfile: (
    index: number,
    profile: NuclideRemoteConnectionProfile,
  ) => mixed,
  onProfileSelected: (index: number) => mixed,
};

type State = {
  mode: number,
};

const REQUEST_CONNECTION_DETAILS = 1;
const WAITING_FOR_CONNECTION = 2;
const REQUEST_AUTHENTICATION_DETAILS = 3;
const WAITING_FOR_AUTHENTICATION = 4;

/**
 * Component that manages the state transitions as the user connects to a server.
 */
export default class ConnectionDialog extends React.Component<Props, State> {
  _cancelButton: ?Button;
  _okButton: ?Button;
  _content: ?(AuthenticationPrompt | ConnectionDetailsPrompt);
  _pendingHandshake: ?IDisposable;

  state = {
    mode: REQUEST_CONNECTION_DETAILS,
  };

  componentDidMount(): void {
    this._focus();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.mode !== prevState.mode) {
      this._focus();
    } else if (
      this.state.mode === REQUEST_CONNECTION_DETAILS &&
      this.props.selectedProfileIndex === prevProps.selectedProfileIndex &&
      !this.props.dirty &&
      prevProps.dirty &&
      this._okButton != null
    ) {
      // When editing a profile and clicking "Save", the Save button disappears. Focus the primary
      // button after re-rendering so focus is on a logical element.
      this._okButton.focus();
    }
  }

  _focus(): void {
    const content = this._content;
    if (content == null) {
      if (this._cancelButton == null) {
        return;
      }
      this._cancelButton.focus();
    } else {
      content.focus();
    }
  }

  _handleDidChange = (): void => {
    this.props.setDirty(true);
  };

  _handleClickSave = (): void => {
    invariant(this.props.connectionProfiles != null);

    const selectedProfile = this.props.connectionProfiles[
      this.props.selectedProfileIndex
    ];
    const connectionDetailsPrompt = this._content;
    invariant(connectionDetailsPrompt instanceof ConnectionDetailsPrompt);
    const connectionDetails: NuclideRemoteConnectionParamsWithPassword = connectionDetailsPrompt.getFormFields();
    const validationResult = validateFormInputs(
      selectedProfile.displayTitle,
      connectionDetails,
      '',
    );

    if (typeof validationResult.errorMessage === 'string') {
      atom.notifications.addError(validationResult.errorMessage);
      return;
    }

    invariant(
      validationResult.validatedProfile != null &&
        typeof validationResult.validatedProfile === 'object',
    );
    // Save the validated profile, and show any warning messages.
    const newProfile = validationResult.validatedProfile;
    if (typeof validationResult.warningMessage === 'string') {
      atom.notifications.addWarning(validationResult.warningMessage);
    }

    this.props.onSaveProfile(this.props.selectedProfileIndex, newProfile);
    this.props.setDirty(false);
  };

  _validateInitialDirectory(path: string): boolean {
    return path !== '/';
  }

  render(): React.Node {
    const mode = this.state.mode;
    let content;
    let isOkDisabled;
    let okButtonText;

    if (mode === REQUEST_CONNECTION_DETAILS) {
      content = (
        <ConnectionDetailsPrompt
          connectionProfiles={this.props.connectionProfiles}
          selectedProfileIndex={this.props.selectedProfileIndex}
          onAddProfileClicked={this.props.onAddProfileClicked}
          onCancel={this.cancel}
          onConfirm={this.ok}
          onDeleteProfileClicked={this.props.onDeleteProfileClicked}
          onDidChange={this._handleDidChange}
          onProfileClicked={this.onProfileClicked}
          ref={prompt => {
            this._content = prompt;
          }}
        />
      );
      isOkDisabled = false;
      okButtonText = 'Connect';
    } else if (
      mode === WAITING_FOR_CONNECTION ||
      mode === WAITING_FOR_AUTHENTICATION
    ) {
      content = <IndeterminateProgressBar />;
      isOkDisabled = true;
      okButtonText = 'Connect';
    } else {
      content = (
        <AuthenticationPrompt
          instructions={this.props.connectionPromptInstructions}
          onCancel={this.cancel}
          onConfirm={this.ok}
          ref={prompt => {
            this._content = prompt;
          }}
        />
      );
      isOkDisabled = false;
      okButtonText = 'OK';
    }

    let saveButtonGroup;
    let selectedProfile;
    if (
      this.props.selectedProfileIndex >= 0 &&
      this.props.connectionProfiles != null
    ) {
      selectedProfile = this.props.connectionProfiles[
        this.props.selectedProfileIndex
      ];
    }
    if (
      this.props.dirty &&
      selectedProfile != null &&
      selectedProfile.saveable
    ) {
      saveButtonGroup = (
        <ButtonGroup className="inline-block">
          <Button onClick={this._handleClickSave}>Save</Button>
        </ButtonGroup>
      );
    }

    return (
      <div>
        <div className="block">{content}</div>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          {saveButtonGroup}
          <ButtonGroup>
            <Button
              onClick={this.cancel}
              ref={button => {
                this._cancelButton = button;
              }}>
              Cancel
            </Button>
            <Button
              buttonType={ButtonTypes.PRIMARY}
              disabled={isOkDisabled}
              onClick={this.ok}
              ref={button => {
                this._okButton = button;
              }}>
              {okButtonText}
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }

  cancel = () => {
    const mode = this.state.mode;

    if (this._pendingHandshake != null) {
      this._pendingHandshake.dispose();
      this._pendingHandshake = null;
    }

    if (mode === WAITING_FOR_CONNECTION) {
      this.props.setDirty(false);
      this.setState({mode: REQUEST_CONNECTION_DETAILS});
    } else {
      this.props.onCancel();
      this.close();
    }
  };

  close() {
    if (this._pendingHandshake != null) {
      this._pendingHandshake.dispose();
      this._pendingHandshake = null;
    }

    if (this.props.onClosed) {
      this.props.onClosed();
    }
  }

  ok = () => {
    const {mode} = this.state;

    if (mode === REQUEST_CONNECTION_DETAILS) {
      // User is trying to submit connection details.
      const connectionDetailsForm = this._content;
      invariant(connectionDetailsForm instanceof ConnectionDetailsPrompt);
      const {
        username,
        server,
        cwd,
        remoteServerCommand,
        sshPort,
        pathToPrivateKey,
        authMethod,
        password,
        displayTitle,
      } = connectionDetailsForm.getFormFields();

      if (!this._validateInitialDirectory(cwd)) {
        remote.dialog.showErrorBox(
          'Invalid initial path',
          'Please specify a non-root directory.',
        );
        return;
      }

      if (username && server && cwd && remoteServerCommand) {
        this.props.setDirty(false);
        this.setState({mode: WAITING_FOR_CONNECTION});
        this._connect({
          host: server,
          sshPort: parseInt(sshPort, 10),
          username,
          pathToPrivateKey,
          authMethod,
          cwd,
          remoteServerCommand,
          password,
          // Modified profiles probably don't match the display title.
          displayTitle: this.props.dirty ? '' : displayTitle,
        });
      } else {
        remote.dialog.showErrorBox(
          'Missing information',
          "Please make sure you've filled out all the form fields.",
        );
      }
    } else if (mode === REQUEST_AUTHENTICATION_DETAILS) {
      const authenticationPrompt = this._content;
      invariant(authenticationPrompt instanceof AuthenticationPrompt);
      const password = authenticationPrompt.getPassword();

      this.props.confirmConnectionPrompt([password]);
      this.props.setDirty(false);
      this.setState({mode: WAITING_FOR_AUTHENTICATION});
    }
  };

  requestAuthentication(
    instructions: {echo: boolean, prompt: string},
    confirm: (answers: Array<string>) => void,
  ) {
    this.props.setDirty(false);
    this.props.setConnectionPromptConfirmation(confirm);
    this.props.setConnectionPromptInstructions(instructions.prompt);
    this.setState({
      mode: REQUEST_AUTHENTICATION_DETAILS,
    });
  }

  getFormFields(): ?NuclideRemoteConnectionParams {
    const connectionDetailsForm = this._content;
    if (!connectionDetailsForm) {
      return null;
    }
    invariant(connectionDetailsForm instanceof ConnectionDetailsPrompt);
    const {
      username,
      server,
      cwd,
      remoteServerCommand,
      sshPort,
      pathToPrivateKey,
      authMethod,
      displayTitle,
    } = connectionDetailsForm.getFormFields();
    return {
      username,
      server,
      cwd,
      remoteServerCommand,
      sshPort,
      pathToPrivateKey,
      authMethod,
      displayTitle,
    };
  }

  onProfileClicked = (selectedProfileIndex: number): void => {
    this.props.setDirty(false);
    this.props.onProfileSelected(selectedProfileIndex);
  };

  _connect = (connectionConfig: SshConnectionConfiguration): void => {
    const delegate = decorateSshConnectionDelegateWithTracking({
      onKeyboardInteractive: (
        name,
        instructions,
        instructionsLang,
        prompts,
        confirm,
      ) => {
        // TODO: Display all prompts, not just the first one.
        this.requestAuthentication(prompts[0], confirm);
      },

      onWillConnect: () => {},

      onDidConnect: (
        connection: RemoteConnection,
        config: SshConnectionConfiguration,
      ) => {
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
    });
    this._pendingHandshake = connect(
      delegate,
      connectionConfig,
    );
  };
}

function connect(
  delegate: SshConnectionDelegate,
  connectionConfig: SshConnectionConfiguration,
): IDisposable {
  return new UniversalDisposable(
    Observable.defer(() =>
      RemoteConnection.reconnect(
        connectionConfig.host,
        connectionConfig.cwd,
        connectionConfig.displayTitle,
      ),
    )
      .switchMap(existingConnection => {
        if (existingConnection != null) {
          delegate.onWillConnect(connectionConfig); // required for the API
          delegate.onDidConnect(existingConnection, connectionConfig);
          return Observable.empty();
        }
        const sshHandshake = connectBigDigSshHandshake(
          connectionConfig,
          delegate,
        );
        return Observable.create(() => {
          return () => sshHandshake.cancel();
        });
      })
      .subscribe(
        next => {},
        err =>
          delegate.onError(
            err.sshHandshakeErrorType || 'UNKNOWN',
            err,
            connectionConfig,
          ),
      ),
  );
}
