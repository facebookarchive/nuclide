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
  NuclideRemoteConnectionParamsWithPassword,
  NuclideRemoteConnectionProfile,
} from './connection-types';

import AtomInput from '../../ui/atom-input';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import invariant from 'assert';
import {CompositeDisposable} from 'atom';
import ConnectionDetailsForm from './ConnectionDetailsForm';
import {validateFormInputs} from './form-validation-utils';

type Props = {
  // A function called when the "Cancel" button is clicked.
  onCancel: () => mixed;
  // A function called when the "Save" button is clicked. The profile passed
  // to the function is the profile that the user has just created.
  // The CreateConnectionProfileForm will do basic validation on the inputs: It
  // checks that the fields are non-empty before calling this function.
  onSave: (profile: NuclideRemoteConnectionProfile) => mixed;
  // The inputs to pre-fill the form with.
  initialFormFields: NuclideNewConnectionProfileInitialFields;
};

const PROFILE_NAME_LABEL = 'Profile Name';
const DEFAULT_SERVER_COMMAND_PLACEHOLDER = '(DEFAULT)';

const emptyFunction = () => {};

/**
 * A form that is used to create a new connection profile.
 */
/* eslint-disable react/prop-types */
class CreateConnectionProfileForm extends React.Component<void, Props, void> {

  disposables: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    (this: any)._clickSave = this._clickSave.bind(this);
    (this: any)._clickCancel = this._clickCancel.bind(this);
    this.disposables = new CompositeDisposable();
  }

  componentDidMount(): void {
    const root = ReactDOM.findDOMNode(this);
    this.disposables.add(
      // Hitting enter when this panel has focus should confirm the dialog.
      atom.commands.add(root, 'core:confirm', this._clickSave),
      // Hitting escape when this panel has focus should cancel the dialog.
      atom.commands.add(root, 'core:cancel', this._clickCancel)
    );
  }

  componentWillUnmount(): void {
    this.disposables.dispose();
  }

  /**
   * Note: This form displays DEFAULT_SERVER_COMMAND_PLACEHOLDER as the prefilled
   * remote server command. The remote server command will only be saved if the
   * user changes it from this default.
   */
  render(): ReactElement {
    const initialFields = this.props.initialFormFields;

    return (
      <atom-panel class="modal from-top">
        <div className="padded">
          <div className="form-group">
            <label>{PROFILE_NAME_LABEL}:</label>
            <AtomInput
              initialValue=""
              ref="profile-name"
              unstyled={true}
            />
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
          <div className="padded text-right">
            <div className="btn-group">
              <button className="btn" onClick={this._clickCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={this._clickSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      </atom-panel>
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
    invariant(validationResult.validatedProfile != null);
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

module.exports = CreateConnectionProfileForm;
