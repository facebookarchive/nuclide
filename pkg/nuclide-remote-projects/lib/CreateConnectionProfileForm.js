'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _atom = require('atom');

var _ConnectionDetailsForm;

function _load_ConnectionDetailsForm() {
  return _ConnectionDetailsForm = _interopRequireDefault(require('./ConnectionDetailsForm'));
}

var _formValidationUtils;

function _load_formValidationUtils() {
  return _formValidationUtils = require('./form-validation-utils');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const PROFILE_NAME_LABEL = 'Profile Name'; /**
                                            * Copyright (c) 2015-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the license found in the LICENSE file in
                                            * the root directory of this source tree.
                                            *
                                            * 
                                            * @format
                                            */

const DEFAULT_SERVER_COMMAND_PLACEHOLDER = '(DEFAULT)';

const emptyFunction = () => {};

/**
 * A form that is used to create a new connection profile.
 */
class CreateConnectionProfileForm extends _react.Component {

  constructor(props) {
    super(props);

    this._clickSave = () => {
      // Validate the form inputs.
      const profileName = this._getProfileName();
      const connectionDetails = this.refs['connection-details'].getFormFields();
      const validationResult = (0, (_formValidationUtils || _load_formValidationUtils()).validateFormInputs)(profileName, connectionDetails, DEFAULT_SERVER_COMMAND_PLACEHOLDER);
      if (typeof validationResult.errorMessage === 'string') {
        atom.notifications.addError(validationResult.errorMessage);
        return;
      }

      if (!(validationResult.validatedProfile != null && typeof validationResult.validatedProfile === 'object')) {
        throw new Error('Invariant violation: "validationResult.validatedProfile != null &&\\n        typeof validationResult.validatedProfile === \'object\'"');
      }

      const newProfile = validationResult.validatedProfile;
      // Save the validated profile, and show any warning messages.
      if (typeof validationResult.warningMessage === 'string') {
        atom.notifications.addWarning(validationResult.warningMessage);
      }
      this.props.onSave(newProfile);
    };

    this._clickCancel = () => {
      this.props.onCancel();
    };

    this.disposables = new _atom.CompositeDisposable();
  }

  componentDidMount() {
    const root = _reactDom.default.findDOMNode(this);
    this.disposables.add(
    // Hitting enter when this panel has focus should confirm the dialog.
    // $FlowFixMe
    atom.commands.add(root, 'core:confirm', this._clickSave),
    // Hitting escape when this panel has focus should cancel the dialog.
    // $FlowFixMe
    atom.commands.add(root, 'core:cancel', this._clickCancel));
    this.refs['profile-name'].focus();
  }

  componentWillUnmount() {
    this.disposables.dispose();
  }

  /**
   * Note: This form displays DEFAULT_SERVER_COMMAND_PLACEHOLDER as the prefilled
   * remote server command. The remote server command will only be saved if the
   * user changes it from this default.
   */
  render() {
    const initialFields = this.props.initialFormFields;

    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'div',
        { className: 'form-group' },
        _react.createElement(
          'label',
          null,
          PROFILE_NAME_LABEL,
          ':'
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, { initialValue: '', ref: 'profile-name', unstyled: true })
      ),
      _react.createElement((_ConnectionDetailsForm || _load_ConnectionDetailsForm()).default, {
        initialUsername: initialFields.username,
        initialServer: initialFields.server,
        initialCwd: initialFields.cwd,
        initialRemoteServerCommand:
        // flowlint-next-line sketchy-null-string:off
        initialFields.remoteServerCommand || DEFAULT_SERVER_COMMAND_PLACEHOLDER,
        initialSshPort: initialFields.sshPort,
        initialPathToPrivateKey: initialFields.pathToPrivateKey,
        initialAuthMethod: initialFields.authMethod,
        initialDisplayTitle: initialFields.displayTitle,
        profileHosts: this.props.profileHosts,
        onCancel: emptyFunction,
        onConfirm: this._clickSave,
        onDidChange: emptyFunction,
        ref: 'connection-details'
      }),
      _react.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'flex-end' } },
        _react.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this._clickCancel },
            'Cancel'
          ),
          _react.createElement(
            (_Button || _load_Button()).Button,
            { buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY, onClick: this._clickSave },
            'Save'
          )
        )
      )
    );
  }

  _getProfileName() {
    const fieldName = 'profile-name';
    return this.refs[fieldName] && this.refs[fieldName].getText().trim() || '';
  }

}
exports.default = CreateConnectionProfileForm;