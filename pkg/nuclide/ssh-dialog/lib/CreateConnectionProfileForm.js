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
  NuclideNewConnectionProfileInitialFields,
  NuclideRemoteConnectionProfile,
} from './connection-types';

import AtomInput from '../../ui/atom-input';
import React from 'react-for-atom';
import ConnectionDetailsForm from './ConnectionDetailsForm';
import {validateFormInputs} from './form-validation-utils';

type DefaultProps = {};
type Props = {
  // A function called when the "Cancel" button is clicked.
  onCancel: () => mixed;
  // A function called when the "Save" button is clicked. The profile passed
  // to the function is the profile that the user has just created.
  // The CreateConnectionProfileForm will do basic validation on the inputs: It
  // checks that the fields are non-empty before calling this function.
  onSave: (profile: NuclideRemoteConnectionProfile) => mixed;
  // The inputs to pre-fill the form with.
  initialFormFields: NuclideNewConnectionProfileInitialFields,
};
type State = {};

const PROFILE_NAME_LABEL = 'Profile Name';
const DEFAULT_SERVER_COMMAND_PLACEHOLDER = '(DEFAULT)';

const emptyFunction = () => {};

/**
 * A form that is used to create a new connection profile.
 */
/* eslint-disable react/prop-types */
export default class CreateConnectionProfileForm
    extends React.Component<DefaultProps, Props, State> {

  constructor(props: Props) {
    super(props);
    this._boundClickSave = this._clickSave.bind(this);
    this._boundClickCancel = this._clickCancel.bind(this);
  }

  /**
   * Note: This form displays DEFAULT_SERVER_COMMAND_PLACEHOLDER as the prefilled
   * remote server command. The remote server command will only be saved if the
   * user changes it from this default.
   */
  render(): ReactElement {
    const initialFields = this.props.initialFormFields;

    return (
      <div>
        <atom-panel class="modal from-top">
          <div>
            {PROFILE_NAME_LABEL}:
            <AtomInput ref="profile-name" initialValue="" />
          </div>
          <ConnectionDetailsForm
            ref="connection-details"
            initialUsername={initialFields.username}
            initialServer={initialFields.server}
            initialCwd={initialFields.cwd}
            initialRemoteServerCommand={DEFAULT_SERVER_COMMAND_PLACEHOLDER}
            initialSshPort={initialFields.sshPort}
            initialPathToPrivateKey={initialFields.pathToPrivateKey}
            initialAuthMethod={initialFields.authMethod}
            onConfirm={emptyFunction}
            onCancel={emptyFunction}
          />

          <div className="block nuclide-ok-cancel">
            <button className="btn" onClick={this._boundClickCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={this._boundClickSave}>
              Save
            </button>
          </div>
        </atom-panel>
      </div>
    );
  }

  _getProfileName(): string {
    const fieldName = 'profile-name';
    return (this.refs[fieldName] && this.refs[fieldName].getText().trim()) || '';
  }

  _clickSave(): void {
    // Validate the form inputs.
    const profileName = this._getProfileName();
    const connectionDetails: NuclideRemoteConnectionParamsWithPassword =
        this.refs['connection-details'].getFormFields();
    const validationResult = validateFormInputs(
      profileName,
      connectionDetails,
      DEFAULT_SERVER_COMMAND_PLACEHOLDER,
    );
    if (validationResult.errorMessage) {
      atom.notifications.addError(validationResult.errorMessage);
      return;
    }
    // Save the validated profile, and show any warning messages.
    const newProfile = validationResult.validatedProfile;
    if (validationResult.warningMessage) {
      atom.notifications.addWarning(validationResult.warningMessage);
    }
    this.props.onSave(newProfile);
  }

  _clickCancel(): void {
    this.props.onCancel();
  }
}

/* eslint-enable react/prop-types */
