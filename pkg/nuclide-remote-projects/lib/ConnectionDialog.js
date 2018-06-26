'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _AuthenticationPrompt;

function _load_AuthenticationPrompt() {
  return _AuthenticationPrompt = _interopRequireDefault(require('./AuthenticationPrompt'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../../modules/nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../modules/nuclide-commons-ui/ButtonGroup');
}

var _connectBigDigSshHandshake;

function _load_connectBigDigSshHandshake() {
  return _connectBigDigSshHandshake = _interopRequireDefault(require('./connectBigDigSshHandshake'));
}

var _ConnectionDetailsPrompt;

function _load_ConnectionDetailsPrompt() {
  return _ConnectionDetailsPrompt = _interopRequireDefault(require('./ConnectionDetailsPrompt'));
}

var _IndeterminateProgressBar;

function _load_IndeterminateProgressBar() {
  return _IndeterminateProgressBar = _interopRequireDefault(require('./IndeterminateProgressBar'));
}

var _notification;

function _load_notification() {
  return _notification = require('./notification');
}

var _react = _interopRequireWildcard(require('react'));

var _electron = _interopRequireDefault(require('electron'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _formValidationUtils;

function _load_formValidationUtils() {
  return _formValidationUtils = require('./form-validation-utils');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-projects'); /**
                                                                                       * Copyright (c) 2015-present, Facebook, Inc.
                                                                                       * All rights reserved.
                                                                                       *
                                                                                       * This source code is licensed under the license found in the LICENSE file in
                                                                                       * the root directory of this source tree.
                                                                                       *
                                                                                       *  strict-local
                                                                                       * @format
                                                                                       */

const { remote } = _electron.default;

if (!(remote != null)) {
  throw new Error('Invariant violation: "remote != null"');
}

const REQUEST_CONNECTION_DETAILS = 1;
const WAITING_FOR_CONNECTION = 2;
const REQUEST_AUTHENTICATION_DETAILS = 3;
const WAITING_FOR_AUTHENTICATION = 4;

/**
 * Component that manages the state transitions as the user connects to a server.
 */
class ConnectionDialog extends _react.Component {

  constructor(props) {
    super(props);

    this._handleDidChange = () => {
      this.setState({ isDirty: true });
    };

    this._handleClickSave = () => {
      if (!(this.props.connectionProfiles != null)) {
        throw new Error('Invariant violation: "this.props.connectionProfiles != null"');
      }

      const selectedProfile = this.props.connectionProfiles[this.props.selectedProfileIndex];
      const connectionDetailsPrompt = this._content;

      if (!(connectionDetailsPrompt instanceof (_ConnectionDetailsPrompt || _load_ConnectionDetailsPrompt()).default)) {
        throw new Error('Invariant violation: "connectionDetailsPrompt instanceof ConnectionDetailsPrompt"');
      }

      const connectionDetails = connectionDetailsPrompt.getFormFields();
      const validationResult = (0, (_formValidationUtils || _load_formValidationUtils()).validateFormInputs)(selectedProfile.displayTitle, connectionDetails, '');

      if (typeof validationResult.errorMessage === 'string') {
        atom.notifications.addError(validationResult.errorMessage);
        return;
      }

      if (!(validationResult.validatedProfile != null && typeof validationResult.validatedProfile === 'object')) {
        throw new Error('Invariant violation: "validationResult.validatedProfile != null &&\\n        typeof validationResult.validatedProfile === \'object\'"');
      }
      // Save the validated profile, and show any warning messages.


      const newProfile = validationResult.validatedProfile;
      if (typeof validationResult.warningMessage === 'string') {
        atom.notifications.addWarning(validationResult.warningMessage);
      }

      this.props.onSaveProfile(this.props.selectedProfileIndex, newProfile);
      this.setState({ isDirty: false });
    };

    this.cancel = () => {
      const mode = this.state.mode;

      if (this._pendingHandshake != null) {
        this._pendingHandshake.unsubscribe();
        this._pendingHandshake = null;
      }

      if (mode === WAITING_FOR_CONNECTION) {
        this.setState({
          isDirty: false,
          mode: REQUEST_CONNECTION_DETAILS
        });
      } else {
        this.props.onCancel();
        this.close();
      }
    };

    this.ok = () => {
      const { mode, isDirty } = this.state;

      if (mode === REQUEST_CONNECTION_DETAILS) {
        // User is trying to submit connection details.
        const connectionDetailsForm = this._content;

        if (!(connectionDetailsForm instanceof (_ConnectionDetailsPrompt || _load_ConnectionDetailsPrompt()).default)) {
          throw new Error('Invariant violation: "connectionDetailsForm instanceof ConnectionDetailsPrompt"');
        }

        const {
          username,
          server,
          cwd,
          remoteServerCommand,
          sshPort,
          pathToPrivateKey,
          authMethod,
          password,
          displayTitle
        } = connectionDetailsForm.getFormFields();

        if (!this._validateInitialDirectory(cwd)) {
          remote.dialog.showErrorBox('Invalid initial path', 'Please specify a non-root directory.');
          return;
        }

        if (username && server && cwd && remoteServerCommand) {
          this.setState({
            isDirty: false,
            mode: WAITING_FOR_CONNECTION
          });
          this._pendingHandshake = this._connect({
            host: server,
            sshPort: parseInt(sshPort, 10),
            username,
            pathToPrivateKey,
            authMethod,
            cwd,
            remoteServerCommand,
            password,
            // Modified profiles probably don't match the display title.
            displayTitle: isDirty ? '' : displayTitle
          });
        } else {
          remote.dialog.showErrorBox('Missing information', "Please make sure you've filled out all the form fields.");
        }
      } else if (mode === REQUEST_AUTHENTICATION_DETAILS) {
        const authenticationPrompt = this._content;

        if (!(authenticationPrompt instanceof (_AuthenticationPrompt || _load_AuthenticationPrompt()).default)) {
          throw new Error('Invariant violation: "authenticationPrompt instanceof AuthenticationPrompt"');
        }

        const password = authenticationPrompt.getPassword();

        this.state.finish([password]);

        this.setState({
          isDirty: false,
          mode: WAITING_FOR_AUTHENTICATION
        });
      }
    };

    this.onProfileClicked = selectedProfileIndex => {
      this.setState({ isDirty: false });
      this.props.onProfileSelected(selectedProfileIndex);
    };

    this._delegate = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).decorateSshConnectionDelegateWithTracking)({
      onKeyboardInteractive: (name, instructions, instructionsLang, prompts, finish) => {
        // TODO: Display all prompts, not just the first one.
        this.requestAuthentication(prompts[0], finish);
      },

      onWillConnect: () => {},

      onDidConnect: (connection, config) => {
        this.close(); // Close the dialog.
        this.props.onConnect(connection, config);
      },

      onError: (errorType, error, config) => {
        this.close(); // Close the dialog.
        (0, (_notification || _load_notification()).notifySshHandshakeError)(errorType, error, config);
        this.props.onError(error, config);
        logger.debug(error);
      }
    });

    this.state = {
      finish: answers => {},
      instructions: '',
      isDirty: false,
      mode: REQUEST_CONNECTION_DETAILS
    };
  }

  componentDidMount() {
    this._focus();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.mode !== prevState.mode) {
      this._focus();
    } else if (this.state.mode === REQUEST_CONNECTION_DETAILS && this.props.selectedProfileIndex === prevProps.selectedProfileIndex && !this.state.isDirty && prevState.isDirty && this._okButton != null) {
      // When editing a profile and clicking "Save", the Save button disappears. Focus the primary
      // button after re-rendering so focus is on a logical element.
      this._okButton.focus();
    }
  }

  _focus() {
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

  _validateInitialDirectory(path) {
    return path !== '/';
  }

  render() {
    const mode = this.state.mode;
    let content;
    let isOkDisabled;
    let okButtonText;

    if (mode === REQUEST_CONNECTION_DETAILS) {
      content = _react.createElement((_ConnectionDetailsPrompt || _load_ConnectionDetailsPrompt()).default, {
        connectionProfiles: this.props.connectionProfiles,
        selectedProfileIndex: this.props.selectedProfileIndex,
        onAddProfileClicked: this.props.onAddProfileClicked,
        onCancel: this.cancel,
        onConfirm: this.ok,
        onDeleteProfileClicked: this.props.onDeleteProfileClicked,
        onDidChange: this._handleDidChange,
        onProfileClicked: this.onProfileClicked,
        ref: prompt => {
          this._content = prompt;
        }
      });
      isOkDisabled = false;
      okButtonText = 'Connect';
    } else if (mode === WAITING_FOR_CONNECTION || mode === WAITING_FOR_AUTHENTICATION) {
      content = _react.createElement((_IndeterminateProgressBar || _load_IndeterminateProgressBar()).default, null);
      isOkDisabled = true;
      okButtonText = 'Connect';
    } else {
      content = _react.createElement((_AuthenticationPrompt || _load_AuthenticationPrompt()).default, {
        instructions: this.state.instructions,
        onCancel: this.cancel,
        onConfirm: this.ok,
        ref: prompt => {
          this._content = prompt;
        }
      });
      isOkDisabled = false;
      okButtonText = 'OK';
    }

    let saveButtonGroup;
    let selectedProfile;
    if (this.props.selectedProfileIndex >= 0 && this.props.connectionProfiles != null) {
      selectedProfile = this.props.connectionProfiles[this.props.selectedProfileIndex];
    }
    if (this.state.isDirty && selectedProfile != null && selectedProfile.saveable) {
      saveButtonGroup = _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'inline-block' },
        _react.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._handleClickSave },
          'Save'
        )
      );
    }

    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'div',
        { className: 'block' },
        content
      ),
      _react.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'flex-end' } },
        saveButtonGroup,
        _react.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.createElement(
            (_Button || _load_Button()).Button,
            {
              onClick: this.cancel,
              ref: button => {
                this._cancelButton = button;
              } },
            'Cancel'
          ),
          _react.createElement(
            (_Button || _load_Button()).Button,
            {
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              disabled: isOkDisabled,
              onClick: this.ok,
              ref: button => {
                this._okButton = button;
              } },
            okButtonText
          )
        )
      )
    );
  }

  close() {
    if (this._pendingHandshake != null) {
      this._pendingHandshake.unsubscribe();
      this._pendingHandshake = null;
    }

    if (this.props.onClosed) {
      this.props.onClosed();
    }
  }

  requestAuthentication(instructions, finish) {
    this.setState({
      finish,
      instructions: instructions.prompt,
      isDirty: false,
      mode: REQUEST_AUTHENTICATION_DETAILS
    });
  }

  getFormFields() {
    const connectionDetailsForm = this._content;
    if (!connectionDetailsForm) {
      return null;
    }

    if (!(connectionDetailsForm instanceof (_ConnectionDetailsPrompt || _load_ConnectionDetailsPrompt()).default)) {
      throw new Error('Invariant violation: "connectionDetailsForm instanceof ConnectionDetailsPrompt"');
    }

    const {
      username,
      server,
      cwd,
      remoteServerCommand,
      sshPort,
      pathToPrivateKey,
      authMethod,
      displayTitle
    } = connectionDetailsForm.getFormFields();
    return {
      username,
      server,
      cwd,
      remoteServerCommand,
      sshPort,
      pathToPrivateKey,
      authMethod,
      displayTitle
    };
  }

  _connect(connectionConfig) {
    return _rxjsBundlesRxMinJs.Observable.defer(() => (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.reconnect(connectionConfig.host, connectionConfig.cwd, connectionConfig.displayTitle)).switchMap(existingConnection => {
      if (existingConnection != null) {
        this._delegate.onWillConnect(connectionConfig); // required for the API
        this._delegate.onDidConnect(existingConnection, connectionConfig);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const sshHandshake = (0, (_connectBigDigSshHandshake || _load_connectBigDigSshHandshake()).default)(connectionConfig, this._delegate);
      return _rxjsBundlesRxMinJs.Observable.create(() => {
        return () => sshHandshake.cancel();
      });
    }).subscribe(next => {}, err => this._delegate.onError(err.sshHandshakeErrorType || 'UNKNOWN', err, connectionConfig));
  }
}
exports.default = ConnectionDialog;