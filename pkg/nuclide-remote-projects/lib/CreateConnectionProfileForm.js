var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideUiLibAtomInput2;

function _nuclideUiLibAtomInput() {
  return _nuclideUiLibAtomInput2 = require('../../nuclide-ui/lib/AtomInput');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _ConnectionDetailsForm2;

function _ConnectionDetailsForm() {
  return _ConnectionDetailsForm2 = _interopRequireDefault(require('./ConnectionDetailsForm'));
}

var _formValidationUtils2;

function _formValidationUtils() {
  return _formValidationUtils2 = require('./form-validation-utils');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibButtonGroup2;

function _nuclideUiLibButtonGroup() {
  return _nuclideUiLibButtonGroup2 = require('../../nuclide-ui/lib/ButtonGroup');
}

var PROFILE_NAME_LABEL = 'Profile Name';
var DEFAULT_SERVER_COMMAND_PLACEHOLDER = '(DEFAULT)';

var emptyFunction = function emptyFunction() {};

/**
 * A form that is used to create a new connection profile.
 */

var CreateConnectionProfileForm = (function (_React$Component) {
  _inherits(CreateConnectionProfileForm, _React$Component);

  function CreateConnectionProfileForm(props) {
    _classCallCheck(this, CreateConnectionProfileForm);

    _get(Object.getPrototypeOf(CreateConnectionProfileForm.prototype), 'constructor', this).call(this, props);
    this._clickSave = this._clickSave.bind(this);
    this._clickCancel = this._clickCancel.bind(this);
    this.disposables = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(CreateConnectionProfileForm, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var root = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
      this.disposables.add(
      // Hitting enter when this panel has focus should confirm the dialog.
      atom.commands.add(root, 'core:confirm', this._clickSave),
      // Hitting escape when this panel has focus should cancel the dialog.
      atom.commands.add(root, 'core:cancel', this._clickCancel));
      this.refs['profile-name'].focus();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.disposables.dispose();
    }

    /**
     * Note: This form displays DEFAULT_SERVER_COMMAND_PLACEHOLDER as the prefilled
     * remote server command. The remote server command will only be saved if the
     * user changes it from this default.
     */
  }, {
    key: 'render',
    value: function render() {
      var initialFields = this.props.initialFormFields;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'form-group' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            PROFILE_NAME_LABEL,
            ':'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
            initialValue: '',
            ref: 'profile-name',
            unstyled: true
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_ConnectionDetailsForm2 || _ConnectionDetailsForm()).default, {
          initialUsername: initialFields.username,
          initialServer: initialFields.server,
          initialCwd: initialFields.cwd,
          initialRemoteServerCommand: DEFAULT_SERVER_COMMAND_PLACEHOLDER,
          initialSshPort: initialFields.sshPort,
          initialPathToPrivateKey: initialFields.pathToPrivateKey,
          initialAuthMethod: initialFields.authMethod,
          initialDisplayTitle: initialFields.displayTitle,
          onCancel: emptyFunction,
          onConfirm: emptyFunction,
          onDidChange: emptyFunction,
          ref: 'connection-details'
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'flex-end' } },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButtonGroup2 || _nuclideUiLibButtonGroup()).ButtonGroup,
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
              { onClick: this._clickCancel },
              'Cancel'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
              { buttonType: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonTypes.PRIMARY, onClick: this._clickSave },
              'Save'
            )
          )
        )
      );
    }
  }, {
    key: '_getProfileName',
    value: function _getProfileName() {
      var fieldName = 'profile-name';
      return this.refs[fieldName] && this.refs[fieldName].getText().trim() || '';
    }
  }, {
    key: '_clickSave',
    value: function _clickSave() {
      // Validate the form inputs.
      var profileName = this._getProfileName();
      var connectionDetails = this.refs['connection-details'].getFormFields();
      var validationResult = (0, (_formValidationUtils2 || _formValidationUtils()).validateFormInputs)(profileName, connectionDetails, DEFAULT_SERVER_COMMAND_PLACEHOLDER);
      if (validationResult.errorMessage) {
        atom.notifications.addError(validationResult.errorMessage);
        return;
      }
      (0, (_assert2 || _assert()).default)(validationResult.validatedProfile != null);
      // Save the validated profile, and show any warning messages.
      var newProfile = validationResult.validatedProfile;
      if (validationResult.warningMessage) {
        atom.notifications.addWarning(validationResult.warningMessage);
      }
      this.props.onSave(newProfile);
    }
  }, {
    key: '_clickCancel',
    value: function _clickCancel() {
      this.props.onCancel();
    }
  }]);

  return CreateConnectionProfileForm;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = CreateConnectionProfileForm;

// A function called when the "Cancel" button is clicked.

// A function called when the "Save" button is clicked. The profile passed
// to the function is the profile that the user has just created.
// The CreateConnectionProfileForm will do basic validation on the inputs: It
// checks that the fields are non-empty before calling this function.

// The inputs to pre-fill the form with.