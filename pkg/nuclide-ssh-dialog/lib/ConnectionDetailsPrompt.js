'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ConnectionDetailsForm from './ConnectionDetailsForm';
import {MutableListSelector} from '../../nuclide-ui/lib/MutableListSelector';
import {React} from 'react-for-atom';

import type {
  NuclideRemoteConnectionParams,
  NuclideRemoteConnectionParamsWithPassword,
  NuclideRemoteConnectionProfile,
} from './connection-types';

type Props = {
  // The initial list of connection profiles that will be displayed.
  // Whenever a user add/removes profiles via the child NuclideListSelector,
  // these props should be updated from the top-level by calling ReactDOM.render()
  // again (with the new props) on the ConnectionDetailsPrompt.
  connectionProfiles: ?Array<NuclideRemoteConnectionProfile>;
  // If there is >= 1 connection profile, this index indicates the profile to use.
  indexOfSelectedConnectionProfile: ?number;
  // Function to call when 'enter'/'confirm' is selected by the user in this view.
  onConfirm: () => mixed;
  // Function to call when 'cancel' is selected by the user in this view.
  onCancel: () => mixed;
  // Function that is called when the "+" button on the profiles list is clicked.
  // The user's intent is to create a new profile.
  onAddProfileClicked: () => mixed;
  // Function that is called when the "-" button on the profiles list is clicked
  // ** while a profile is selected **.
  // The user's intent is to delete the currently-selected profile.
  onDeleteProfileClicked: (indexOfSelectedConnectionProfile: number) => mixed;
  onProfileClicked: (indexOfSelectedConnectionProfile: number) => mixed;
};

/**
 * This component contains the entire view in which the user inputs their
 * connection information when connecting to a remote project.
 * This view contains the ConnectionDetailsForm on the left side, and a
 * NuclideListSelector on the right side that displays 0 or more connection
 * 'profiles'. Clicking on a 'profile' in the NuclideListSelector auto-fills
 * the form with the information associated with that profile.
 */
export default class ConnectionDetailsPrompt extends React.Component<void, Props, void> {
  props: Props;

  _idToConnectionProfile: ?Map<string, NuclideRemoteConnectionProfile>;
  _boundOnProfileClicked: (profileId: string) => void;
  _boundOnDeleteProfileClicked: (profileId: ?string) => void;

  constructor(props: Props) {
    super(props);
    this._boundOnProfileClicked = this._onProfileClicked.bind(this);
    this._boundOnDeleteProfileClicked = this._onDeleteProfileClicked.bind(this);
  }

  getFormFields(): NuclideRemoteConnectionParamsWithPassword {
    return this.refs['connection-details-form'].getFormFields();
  }

  getPrefilledConnectionParams(): ?NuclideRemoteConnectionParams {
    // If there are profiles, pre-fill the form with the information from the
    // specified selected profile.
    if (this.props.connectionProfiles &&
        this.props.connectionProfiles.length &&
        this.props.indexOfSelectedConnectionProfile != null) {
      let indexToSelect = this.props.indexOfSelectedConnectionProfile;
      if (indexToSelect >= this.props.connectionProfiles.length) {
        // This logic protects us from incorrect indices passed from above, and
        // allows us to passively account for profiles being deleted.
        indexToSelect = this.props.connectionProfiles.length - 1;
      }
      const selectedProfile = this.props.connectionProfiles[indexToSelect];
      return selectedProfile.params;
    }
  }

  componentDidUpdate() {
    // We have to manually update the contents of an existing ConnectionDetailsForm,
    // because it contains AtomInput components (which don't update their contents
    // when their props change).
    const existingConnectionDetailsForm = this.refs['connection-details-form'];
    if (existingConnectionDetailsForm) {
      existingConnectionDetailsForm.setFormFields(this.getPrefilledConnectionParams());
      existingConnectionDetailsForm.clearPassword();
    }
  }

  render(): ReactElement {
    // If there are profiles, pre-fill the form with the information from the
    // specified selected profile.
    const prefilledConnectionParams = this.getPrefilledConnectionParams() || {};

    // Create helper data structures.
    let listSelectorItems;
    if (this.props.connectionProfiles) {
      listSelectorItems = this.props.connectionProfiles.map((profile, index) => {
        // Use the index of each profile as its id. This is safe because the
        // items are immutable (within this React component).
        return {
          deletable: profile.deletable,
          displayTitle: profile.displayTitle,
          id: String(index),
        };
      });
    } else {
      listSelectorItems = [];
    }

    const idOfSelectedItem = (this.props.indexOfSelectedConnectionProfile == null)
      ? null
      : String(this.props.indexOfSelectedConnectionProfile);

    return (
      <div className="nuclide-connection-details-prompt container-fluid">
        <div className="row" style={{display: 'flex'}}>
          <div className="connection-profiles col-xs-3 inset-panel">
            <h6>Profiles</h6>
            <MutableListSelector
              items={listSelectorItems}
              idOfSelectedItem={idOfSelectedItem}
              onItemClicked={this._boundOnProfileClicked}
              onAddButtonClicked={this.props.onAddProfileClicked}
              onDeleteButtonClicked={this._boundOnDeleteProfileClicked}
            />
          </div>
          <div className="connection-details-form col-xs-9">
            <ConnectionDetailsForm
              ref="connection-details-form"
              initialUsername={prefilledConnectionParams.username}
              initialServer={prefilledConnectionParams.server}
              initialRemoteServerCommand={prefilledConnectionParams.remoteServerCommand}
              initialCwd={prefilledConnectionParams.cwd}
              initialSshPort={prefilledConnectionParams.sshPort}
              initialPathToPrivateKey={prefilledConnectionParams.pathToPrivateKey}
              initialAuthMethod={prefilledConnectionParams.authMethod}
              onConfirm={this.props.onConfirm}
              onCancel={this.props.onCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  _onProfileClicked(profileId: string): void {
    // The id of a profile is its index in the list of props.
    this.props.onProfileClicked(parseInt(profileId, 10));
  }

  _onDeleteProfileClicked(profileId: ?string): void {
    if (profileId == null) {
      return;
    }
    // The id of a profile is its index in the list of props.
    this.props.onDeleteProfileClicked(parseInt(profileId, 10));
  }
}
