var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _nuclideUiAtomInput = require('../../nuclide-ui-atom-input');

var _nuclideUiAtomInput2 = _interopRequireDefault(_nuclideUiAtomInput);

var _reactForAtom = require('react-for-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _ConnectionDetailsForm = require('./ConnectionDetailsForm');

var _ConnectionDetailsForm2 = _interopRequireDefault(_ConnectionDetailsForm);

var _formValidationUtils = require('./form-validation-utils');

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
    this.disposables = new _atom.CompositeDisposable();
  }

  _createClass(CreateConnectionProfileForm, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var root = _reactForAtom.ReactDOM.findDOMNode(this);
      this.disposables.add(
      // Hitting enter when this panel has focus should confirm the dialog.
      atom.commands.add(root, 'core:confirm', this._clickSave),
      // Hitting escape when this panel has focus should cancel the dialog.
      atom.commands.add(root, 'core:cancel', this._clickCancel));
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

      return _reactForAtom.React.createElement(
        'atom-panel',
        { 'class': 'modal from-top' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'padded' },
          _reactForAtom.React.createElement(
            'div',
            { className: 'form-group' },
            _reactForAtom.React.createElement(
              'label',
              null,
              PROFILE_NAME_LABEL,
              ':'
            ),
            _reactForAtom.React.createElement(_nuclideUiAtomInput2['default'], {
              initialValue: '',
              ref: 'profile-name',
              unstyled: true
            })
          ),
          _reactForAtom.React.createElement(_ConnectionDetailsForm2['default'], {
            ref: 'connection-details',
            initialUsername: initialFields.username,
            initialServer: initialFields.server,
            initialCwd: initialFields.cwd,
            initialRemoteServerCommand: DEFAULT_SERVER_COMMAND_PLACEHOLDER,
            initialSshPort: initialFields.sshPort,
            initialPathToPrivateKey: initialFields.pathToPrivateKey,
            initialAuthMethod: initialFields.authMethod,
            onConfirm: emptyFunction,
            onCancel: emptyFunction
          }),
          _reactForAtom.React.createElement(
            'div',
            { className: 'padded text-right' },
            _reactForAtom.React.createElement(
              'div',
              { className: 'btn-group' },
              _reactForAtom.React.createElement(
                'button',
                { className: 'btn', onClick: this._clickCancel },
                'Cancel'
              ),
              _reactForAtom.React.createElement(
                'button',
                { className: 'btn btn-primary', onClick: this._clickSave },
                'Save'
              )
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
      var validationResult = (0, _formValidationUtils.validateFormInputs)(profileName, connectionDetails, DEFAULT_SERVER_COMMAND_PLACEHOLDER);
      if (validationResult.errorMessage) {
        atom.notifications.addError(validationResult.errorMessage);
        return;
      }
      (0, _assert2['default'])(validationResult.validatedProfile != null);
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
})(_reactForAtom.React.Component);

module.exports = CreateConnectionProfileForm;

// A function called when the "Cancel" button is clicked.

// A function called when the "Save" button is clicked. The profile passed
// to the function is the profile that the user has just created.
// The CreateConnectionProfileForm will do basic validation on the inputs: It
// checks that the fields are non-empty before calling this function.

// The inputs to pre-fill the form with.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7a0NBaUJzQiw2QkFBNkI7Ozs7NEJBSTVDLGdCQUFnQjs7c0JBQ0QsUUFBUTs7OztvQkFDSSxNQUFNOztxQ0FDTix5QkFBeUI7Ozs7bUNBQzFCLHlCQUF5Qjs7QUFjMUQsSUFBTSxrQkFBa0IsR0FBRyxjQUFjLENBQUM7QUFDMUMsSUFBTSxrQ0FBa0MsR0FBRyxXQUFXLENBQUM7O0FBRXZELElBQU0sYUFBYSxHQUFHLFNBQWhCLGFBQWEsR0FBUyxFQUFFLENBQUM7Ozs7OztJQUt6QiwyQkFBMkI7WUFBM0IsMkJBQTJCOztBQUtwQixXQUxQLDJCQUEyQixDQUtuQixLQUFZLEVBQUU7MEJBTHRCLDJCQUEyQjs7QUFNN0IsK0JBTkUsMkJBQTJCLDZDQU12QixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEQsQUFBQyxRQUFJLENBQU8sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hELFFBQUksQ0FBQyxXQUFXLEdBQUcsK0JBQXlCLENBQUM7R0FDOUM7O2VBVkcsMkJBQTJCOztXQVlkLDZCQUFTO0FBQ3hCLFVBQU0sSUFBSSxHQUFHLHVCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxVQUFJLENBQUMsV0FBVyxDQUFDLEdBQUc7O0FBRWxCLFVBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7QUFFeEQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQzFELENBQUM7S0FDSDs7O1dBRW1C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aWxlRm9ybS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZU5ld0Nvbm5lY3Rpb25Qcm9maWxlSW5pdGlhbEZpZWxkcyxcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXNXaXRoUGFzc3dvcmQsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSxcbn0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcblxuaW1wb3J0IEF0b21JbnB1dCBmcm9tICcuLi8uLi9udWNsaWRlLXVpLWF0b20taW5wdXQnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENvbm5lY3Rpb25EZXRhaWxzRm9ybSBmcm9tICcuL0Nvbm5lY3Rpb25EZXRhaWxzRm9ybSc7XG5pbXBvcnQge3ZhbGlkYXRlRm9ybUlucHV0c30gZnJvbSAnLi9mb3JtLXZhbGlkYXRpb24tdXRpbHMnO1xuXG50eXBlIFByb3BzID0ge1xuICAvLyBBIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBcIkNhbmNlbFwiIGJ1dHRvbiBpcyBjbGlja2VkLlxuICBvbkNhbmNlbDogKCkgPT4gbWl4ZWQ7XG4gIC8vIEEgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIFwiU2F2ZVwiIGJ1dHRvbiBpcyBjbGlja2VkLiBUaGUgcHJvZmlsZSBwYXNzZWRcbiAgLy8gdG8gdGhlIGZ1bmN0aW9uIGlzIHRoZSBwcm9maWxlIHRoYXQgdGhlIHVzZXIgaGFzIGp1c3QgY3JlYXRlZC5cbiAgLy8gVGhlIENyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybSB3aWxsIGRvIGJhc2ljIHZhbGlkYXRpb24gb24gdGhlIGlucHV0czogSXRcbiAgLy8gY2hlY2tzIHRoYXQgdGhlIGZpZWxkcyBhcmUgbm9uLWVtcHR5IGJlZm9yZSBjYWxsaW5nIHRoaXMgZnVuY3Rpb24uXG4gIG9uU2F2ZTogKHByb2ZpbGU6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSkgPT4gbWl4ZWQ7XG4gIC8vIFRoZSBpbnB1dHMgdG8gcHJlLWZpbGwgdGhlIGZvcm0gd2l0aC5cbiAgaW5pdGlhbEZvcm1GaWVsZHM6IE51Y2xpZGVOZXdDb25uZWN0aW9uUHJvZmlsZUluaXRpYWxGaWVsZHM7XG59O1xuXG5jb25zdCBQUk9GSUxFX05BTUVfTEFCRUwgPSAnUHJvZmlsZSBOYW1lJztcbmNvbnN0IERFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVIgPSAnKERFRkFVTFQpJztcblxuY29uc3QgZW1wdHlGdW5jdGlvbiA9ICgpID0+IHt9O1xuXG4vKipcbiAqIEEgZm9ybSB0aGF0IGlzIHVzZWQgdG8gY3JlYXRlIGEgbmV3IGNvbm5lY3Rpb24gcHJvZmlsZS5cbiAqL1xuY2xhc3MgQ3JlYXRlQ29ubmVjdGlvblByb2ZpbGVGb3JtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzLCB2b2lkPiB7XG4gIHByb3BzOiBQcm9wcztcblxuICBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2NsaWNrU2F2ZSA9IHRoaXMuX2NsaWNrU2F2ZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jbGlja0NhbmNlbCA9IHRoaXMuX2NsaWNrQ2FuY2VsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCByb290ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAvLyBIaXR0aW5nIGVudGVyIHdoZW4gdGhpcyBwYW5lbCBoYXMgZm9jdXMgc2hvdWxkIGNvbmZpcm0gdGhlIGRpYWxvZy5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHJvb3QsICdjb3JlOmNvbmZpcm0nLCB0aGlzLl9jbGlja1NhdmUpLFxuICAgICAgLy8gSGl0dGluZyBlc2NhcGUgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY2FuY2VsIHRoZSBkaWFsb2cuXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChyb290LCAnY29yZTpjYW5jZWwnLCB0aGlzLl9jbGlja0NhbmNlbClcbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm90ZTogVGhpcyBmb3JtIGRpc3BsYXlzIERFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVIgYXMgdGhlIHByZWZpbGxlZFxuICAgKiByZW1vdGUgc2VydmVyIGNvbW1hbmQuIFRoZSByZW1vdGUgc2VydmVyIGNvbW1hbmQgd2lsbCBvbmx5IGJlIHNhdmVkIGlmIHRoZVxuICAgKiB1c2VyIGNoYW5nZXMgaXQgZnJvbSB0aGlzIGRlZmF1bHQuXG4gICAqL1xuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBpbml0aWFsRmllbGRzID0gdGhpcy5wcm9wcy5pbml0aWFsRm9ybUZpZWxkcztcblxuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS1wYW5lbCBjbGFzcz1cIm1vZGFsIGZyb20tdG9wXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8bGFiZWw+e1BST0ZJTEVfTkFNRV9MQUJFTH06PC9sYWJlbD5cbiAgICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgICAgaW5pdGlhbFZhbHVlPVwiXCJcbiAgICAgICAgICAgICAgcmVmPVwicHJvZmlsZS1uYW1lXCJcbiAgICAgICAgICAgICAgdW5zdHlsZWQ9e3RydWV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxDb25uZWN0aW9uRGV0YWlsc0Zvcm1cbiAgICAgICAgICAgIHJlZj1cImNvbm5lY3Rpb24tZGV0YWlsc1wiXG4gICAgICAgICAgICBpbml0aWFsVXNlcm5hbWU9e2luaXRpYWxGaWVsZHMudXNlcm5hbWV9XG4gICAgICAgICAgICBpbml0aWFsU2VydmVyPXtpbml0aWFsRmllbGRzLnNlcnZlcn1cbiAgICAgICAgICAgIGluaXRpYWxDd2Q9e2luaXRpYWxGaWVsZHMuY3dkfVxuICAgICAgICAgICAgaW5pdGlhbFJlbW90ZVNlcnZlckNvbW1hbmQ9e0RFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVJ9XG4gICAgICAgICAgICBpbml0aWFsU3NoUG9ydD17aW5pdGlhbEZpZWxkcy5zc2hQb3J0fVxuICAgICAgICAgICAgaW5pdGlhbFBhdGhUb1ByaXZhdGVLZXk9e2luaXRpYWxGaWVsZHMucGF0aFRvUHJpdmF0ZUtleX1cbiAgICAgICAgICAgIGluaXRpYWxBdXRoTWV0aG9kPXtpbml0aWFsRmllbGRzLmF1dGhNZXRob2R9XG4gICAgICAgICAgICBvbkNvbmZpcm09e2VtcHR5RnVuY3Rpb259XG4gICAgICAgICAgICBvbkNhbmNlbD17ZW1wdHlGdW5jdGlvbn1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkIHRleHQtcmlnaHRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fY2xpY2tDYW5jZWx9PlxuICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLl9jbGlja1NhdmV9PlxuICAgICAgICAgICAgICAgIFNhdmVcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2F0b20tcGFuZWw+XG4gICAgKTtcbiAgfVxuXG4gIF9nZXRQcm9maWxlTmFtZSgpOiBzdHJpbmcge1xuICAgIGNvbnN0IGZpZWxkTmFtZSA9ICdwcm9maWxlLW5hbWUnO1xuICAgIHJldHVybiAodGhpcy5yZWZzW2ZpZWxkTmFtZV0gJiYgdGhpcy5yZWZzW2ZpZWxkTmFtZV0uZ2V0VGV4dCgpLnRyaW0oKSkgfHwgJyc7XG4gIH1cblxuICBfY2xpY2tTYXZlKCk6IHZvaWQge1xuICAgIC8vIFZhbGlkYXRlIHRoZSBmb3JtIGlucHV0cy5cbiAgICBjb25zdCBwcm9maWxlTmFtZSA9IHRoaXMuX2dldFByb2ZpbGVOYW1lKCk7XG4gICAgY29uc3QgY29ubmVjdGlvbkRldGFpbHM6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkID1cbiAgICAgICAgdGhpcy5yZWZzWydjb25uZWN0aW9uLWRldGFpbHMnXS5nZXRGb3JtRmllbGRzKCk7XG4gICAgY29uc3QgdmFsaWRhdGlvblJlc3VsdCA9IHZhbGlkYXRlRm9ybUlucHV0cyhcbiAgICAgIHByb2ZpbGVOYW1lLFxuICAgICAgY29ubmVjdGlvbkRldGFpbHMsXG4gICAgICBERUZBVUxUX1NFUlZFUl9DT01NQU5EX1BMQUNFSE9MREVSLFxuICAgICk7XG4gICAgaWYgKHZhbGlkYXRpb25SZXN1bHQuZXJyb3JNZXNzYWdlKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IodmFsaWRhdGlvblJlc3VsdC5lcnJvck1lc3NhZ2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpbnZhcmlhbnQodmFsaWRhdGlvblJlc3VsdC52YWxpZGF0ZWRQcm9maWxlICE9IG51bGwpO1xuICAgIC8vIFNhdmUgdGhlIHZhbGlkYXRlZCBwcm9maWxlLCBhbmQgc2hvdyBhbnkgd2FybmluZyBtZXNzYWdlcy5cbiAgICBjb25zdCBuZXdQcm9maWxlID0gdmFsaWRhdGlvblJlc3VsdC52YWxpZGF0ZWRQcm9maWxlO1xuICAgIGlmICh2YWxpZGF0aW9uUmVzdWx0Lndhcm5pbmdNZXNzYWdlKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyh2YWxpZGF0aW9uUmVzdWx0Lndhcm5pbmdNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vblNhdmUobmV3UHJvZmlsZSk7XG4gIH1cblxuICBfY2xpY2tDYW5jZWwoKTogdm9pZCB7XG4gICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlQ29ubmVjdGlvblByb2ZpbGVGb3JtO1xuIl19