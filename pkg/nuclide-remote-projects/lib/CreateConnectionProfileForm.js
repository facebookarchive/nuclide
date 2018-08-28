"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _AtomInput() {
  const data = require("../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _ConnectionDetailsForm() {
  const data = _interopRequireDefault(require("./ConnectionDetailsForm"));

  _ConnectionDetailsForm = function () {
    return data;
  };

  return data;
}

function _formValidationUtils() {
  const data = require("./form-validation-utils");

  _formValidationUtils = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const PROFILE_NAME_LABEL = 'Profile Name';
const DEFAULT_SERVER_COMMAND_PLACEHOLDER = '(DEFAULT)';

const emptyFunction = () => {};
/**
 * A form that is used to create a new connection profile.
 */


class CreateConnectionProfileForm extends React.Component {
  constructor(props) {
    super(props);

    this._clickSave = () => {
      // Validate the form inputs.
      const profileName = this._getProfileName();

      const connectionDetails = (0, _nullthrows().default)(this._connectionDetails).getFormFields();
      const validationResult = (0, _formValidationUtils().validateFormInputs)(profileName, connectionDetails, DEFAULT_SERVER_COMMAND_PLACEHOLDER);

      if (typeof validationResult.errorMessage === 'string') {
        atom.notifications.addError(validationResult.errorMessage);
        return;
      }

      if (!(validationResult.validatedProfile != null && typeof validationResult.validatedProfile === 'object')) {
        throw new Error("Invariant violation: \"validationResult.validatedProfile != null &&\\n        typeof validationResult.validatedProfile === 'object'\"");
      }

      const newProfile = validationResult.validatedProfile; // Save the validated profile, and show any warning messages.

      if (typeof validationResult.warningMessage === 'string') {
        atom.notifications.addWarning(validationResult.warningMessage);
      }

      this.props.onSave(newProfile);
    };

    this._clickCancel = () => {
      this.props.onCancel();
    };

    this.disposables = new (_UniversalDisposable().default)();
  }

  componentDidMount() {
    const root = _reactDom.default.findDOMNode(this);

    this.disposables.add( // Hitting enter when this panel has focus should confirm the dialog.
    // $FlowFixMe
    atom.commands.add(root, 'core:confirm', this._clickSave), // Hitting escape when this panel has focus should cancel the dialog.
    // $FlowFixMe
    atom.commands.add(root, 'core:cancel', this._clickCancel));
    (0, _nullthrows().default)(this._profileName).focus();
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
    return React.createElement("div", null, React.createElement("div", {
      className: "form-group"
    }, React.createElement("label", null, PROFILE_NAME_LABEL, ":"), React.createElement(_AtomInput().AtomInput, {
      initialValue: "",
      ref: input => {
        this._profileName = input;
      },
      unstyled: true
    })), React.createElement(_ConnectionDetailsForm().default, {
      initialUsername: initialFields.username,
      initialServer: initialFields.server,
      initialCwd: initialFields.cwd,
      initialRemoteServerCommand: // flowlint-next-line sketchy-null-string:off
      initialFields.remoteServerCommand || DEFAULT_SERVER_COMMAND_PLACEHOLDER,
      initialSshPort: initialFields.sshPort,
      initialPathToPrivateKey: initialFields.pathToPrivateKey,
      initialAuthMethod: initialFields.authMethod,
      initialDisplayTitle: initialFields.displayTitle,
      profileHosts: this.props.profileHosts,
      onCancel: emptyFunction,
      onConfirm: this._clickSave,
      onDidChange: emptyFunction,
      needsPasswordValue: false,
      ref: details => {
        this._connectionDetails = details;
      }
    }), React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
      onClick: this._clickCancel
    }, "Cancel"), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      onClick: this._clickSave
    }, "Save"))));
  }

  _getProfileName() {
    return this._profileName && this._profileName.getText().trim() || '';
  }

}

exports.default = CreateConnectionProfileForm;