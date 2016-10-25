'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../nuclide-ui/add-tooltip'));
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _ConnectionDetailsForm;

function _load_ConnectionDetailsForm() {
  return _ConnectionDetailsForm = _interopRequireDefault(require('./ConnectionDetailsForm'));
}

var _HR;

function _load_HR() {
  return _HR = require('../../nuclide-ui/HR');
}

var _MutableListSelector;

function _load_MutableListSelector() {
  return _MutableListSelector = require('../../nuclide-ui/MutableListSelector');
}

var _reactForAtom = require('react-for-atom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This component contains the entire view in which the user inputs their
 * connection information when connecting to a remote project.
 * This view contains the ConnectionDetailsForm on the left side, and a
 * NuclideListSelector on the right side that displays 0 or more connection
 * 'profiles'. Clicking on a 'profile' in the NuclideListSelector auto-fills
 * the form with the information associated with that profile.
 */
let ConnectionDetailsPrompt = class ConnectionDetailsPrompt extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._settingFormFieldsLock = false;

    this._handleConnectionDetailsFormDidChange = this._handleConnectionDetailsFormDidChange.bind(this);
    this._onDefaultProfileClicked = this._onDefaultProfileClicked.bind(this);
    this._onDeleteProfileClicked = this._onDeleteProfileClicked.bind(this);
    this._onProfileClicked = this._onProfileClicked.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    // Manually update the contents of an existing `ConnectionDetailsForm`, because it contains
    // `AtomInput` components (which don't update their contents when their props change).
    if (prevProps.indexOfSelectedConnectionProfile !== this.props.indexOfSelectedConnectionProfile ||
    // If the connection profiles changed length, the effective selected profile also changed.
    prevProps.connectionProfiles != null && this.props.connectionProfiles != null && prevProps.connectionProfiles.length !== this.props.connectionProfiles.length) {
      const existingConnectionDetailsForm = this.refs['connection-details-form'];
      if (existingConnectionDetailsForm) {
        // Setting values in the ConnectionDetailsForm fires change events. However, this is a
        // controlled update that should not trigger any change events. "Lock" change events until
        // synchronous updates to the form are complete.
        this._settingFormFieldsLock = true;
        existingConnectionDetailsForm.setFormFields(this.getPrefilledConnectionParams());
        existingConnectionDetailsForm.clearPassword();
        this._settingFormFieldsLock = false;
        existingConnectionDetailsForm.focus();
      }
    }
  }

  focus() {
    this.refs['connection-details-form'].focus();
  }

  getFormFields() {
    return this.refs['connection-details-form'].getFormFields();
  }

  getPrefilledConnectionParams() {
    // If there are profiles, pre-fill the form with the information from the specified selected
    // profile.
    if (this.props.connectionProfiles != null && this.props.connectionProfiles.length > 0 && this.props.indexOfSelectedConnectionProfile != null) {
      const selectedProfile = this.props.connectionProfiles[this.props.indexOfSelectedConnectionProfile];
      return selectedProfile.params;
    }
  }

  _handleConnectionDetailsFormDidChange() {
    if (this._settingFormFieldsLock) {
      return;
    }

    this.props.onDidChange();
  }

  _onDefaultProfileClicked() {
    this.props.onProfileClicked(0);
  }

  _onDeleteProfileClicked(profileId) {
    if (profileId == null) {
      return;
    }

    // The id of a profile is its index in the list of props.
    // * This requires a `+ 1` because the default profile is sliced from the Array during render
    //   creating an effective offset of -1 for each index passed to the `MutableListSelector`.
    this.props.onDeleteProfileClicked(parseInt(profileId, 10) + 1);
  }

  _onProfileClicked(profileId) {
    // The id of a profile is its index in the list of props.
    // * This requires a `+ 1` because the default profile is sliced from the Array during render
    //   creating an effective offset of -1 for each index passed to the `MutableListSelector`.
    this.props.onProfileClicked(parseInt(profileId, 10) + 1);
  }

  render() {

    // If there are profiles, pre-fill the form with the information from the
    // specified selected profile.
    const prefilledConnectionParams = this.getPrefilledConnectionParams() || {};

    let defaultConnectionProfileList;
    let listSelectorItems;
    const connectionProfiles = this.props.connectionProfiles;
    if (connectionProfiles == null || connectionProfiles.length === 0) {
      listSelectorItems = [];
    } else {
      const mostRecentClassName = (0, (_classnames || _load_classnames()).default)('list-item', {
        selected: this.props.indexOfSelectedConnectionProfile === 0
      });

      defaultConnectionProfileList = _reactForAtom.React.createElement(
        'div',
        { className: 'block select-list' },
        _reactForAtom.React.createElement(
          'ol',
          { className: 'list-group', style: { marginTop: 0 } },
          _reactForAtom.React.createElement(
            'li',
            {
              className: mostRecentClassName,
              onClick: this._onDefaultProfileClicked,
              onDoubleClick: this.props.onConfirm },
            _reactForAtom.React.createElement('span', {
              className: 'icon icon-info pull-right connection-details-icon-info',
              ref: (0, (_addTooltip || _load_addTooltip()).default)({
                // Intentionally *not* an arrow function so the jQuery Tooltip plugin can set the
                // context to the Tooltip instance.
                placement: function () {
                  // Atom modals have z indices of 9999. This Tooltip needs to stack on top of the
                  // modal; beat the modal's z-index.
                  this.tip.style.zIndex = 10999;
                  return 'right';
                },

                title: 'The settings most recently used to connect. To save settings permanently, ' + 'create a profile.'
              })
            }),
            'Most Recent'
          )
        ),
        _reactForAtom.React.createElement((_HR || _load_HR()).HR, null)
      );

      listSelectorItems = connectionProfiles.slice(1).map((profile, index) => {
        // Use the index of each profile as its id. This is safe because the
        // items are immutable (within this React component).
        return {
          deletable: profile.deletable,
          displayTitle: profile.displayTitle,
          id: String(index),
          saveable: profile.saveable
        };
      });
    }

    // The default profile is sliced from the Array to render it separately, which means
    // decrementing the effective index into the Array passed to the `MutableListSelector`.
    let idOfSelectedItem = this.props.indexOfSelectedConnectionProfile == null ? null : this.props.indexOfSelectedConnectionProfile - 1;
    if (idOfSelectedItem === null || idOfSelectedItem < 0) {
      idOfSelectedItem = null;
    } else {
      idOfSelectedItem = String(idOfSelectedItem);
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-remote-projects-connection-dialog' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-remote-projects-connection-profiles' },
        defaultConnectionProfileList,
        _reactForAtom.React.createElement(
          'h6',
          null,
          'Profiles'
        ),
        _reactForAtom.React.createElement((_MutableListSelector || _load_MutableListSelector()).MutableListSelector, {
          items: listSelectorItems,
          idOfSelectedItem: idOfSelectedItem,
          onItemClicked: this._onProfileClicked,
          onItemDoubleClicked: this.props.onConfirm,
          onAddButtonClicked: this.props.onAddProfileClicked,
          onDeleteButtonClicked: this._onDeleteProfileClicked
        })
      ),
      _reactForAtom.React.createElement((_ConnectionDetailsForm || _load_ConnectionDetailsForm()).default, {
        className: 'nuclide-remote-projects-connection-details',
        initialUsername: prefilledConnectionParams.username,
        initialServer: prefilledConnectionParams.server,
        initialRemoteServerCommand: prefilledConnectionParams.remoteServerCommand,
        initialCwd: prefilledConnectionParams.cwd,
        initialSshPort: prefilledConnectionParams.sshPort,
        initialPathToPrivateKey: prefilledConnectionParams.pathToPrivateKey,
        initialAuthMethod: prefilledConnectionParams.authMethod,
        initialDisplayTitle: prefilledConnectionParams.displayTitle,
        onConfirm: this.props.onConfirm,
        onCancel: this.props.onCancel,
        onDidChange: this._handleConnectionDetailsFormDidChange,
        ref: 'connection-details-form'
      })
    );
  }
};
exports.default = ConnectionDetailsPrompt;
module.exports = exports['default'];