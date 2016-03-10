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

var _uiAtomInput = require('../../ui/atom-input');

var _uiAtomInput2 = _interopRequireDefault(_uiAtomInput);

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
/* eslint-disable react/prop-types */

var CreateConnectionProfileForm = (function (_React$Component) {
  _inherits(CreateConnectionProfileForm, _React$Component);

  function CreateConnectionProfileForm(props) {
    _classCallCheck(this, CreateConnectionProfileForm);

    _get(Object.getPrototypeOf(CreateConnectionProfileForm.prototype), 'constructor', this).call(this, props);
    this._clickSave = this._clickSave.bind(this);
    this._clickCancel = this._clickCancel.bind(this);
    this.disposables = new _atom.CompositeDisposable();
  }

  /* eslint-enable react/prop-types */

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
            _reactForAtom.React.createElement(_uiAtomInput2['default'], {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBaUJzQixxQkFBcUI7Ozs7NEJBSXBDLGdCQUFnQjs7c0JBQ0QsUUFBUTs7OztvQkFDSSxNQUFNOztxQ0FDTix5QkFBeUI7Ozs7bUNBQzFCLHlCQUF5Qjs7QUFjMUQsSUFBTSxrQkFBa0IsR0FBRyxjQUFjLENBQUM7QUFDMUMsSUFBTSxrQ0FBa0MsR0FBRyxXQUFXLENBQUM7O0FBRXZELElBQU0sYUFBYSxHQUFHLFNBQWhCLGFBQWEsR0FBUyxFQUFFLENBQUM7Ozs7Ozs7SUFNekIsMkJBQTJCO1lBQTNCLDJCQUEyQjs7QUFJcEIsV0FKUCwyQkFBMkIsQ0FJbkIsS0FBWSxFQUFFOzBCQUp0QiwyQkFBMkI7O0FBSzdCLCtCQUxFLDJCQUEyQiw2Q0FLdkIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BELEFBQUMsUUFBSSxDQUFPLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4RCxRQUFJLENBQUMsV0FBVyxHQUFHLCtCQUF5QixDQUFDO0dBQzlDOzs7O2VBVEcsMkJBQTJCOztXQVdkLDZCQUFTO0FBQ3hCLFVBQU0sSUFBSSxHQUFHLHVCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxVQUFJLENBQUMsV0FBVyxDQUFDLEdBQUc7O0FBRWxCLFVBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQzs7QUFFeEQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQzFELENBQUM7S0FDSDs7O1dB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cm9maWxlRm9ybS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZU5ld0Nvbm5lY3Rpb25Qcm9maWxlSW5pdGlhbEZpZWxkcyxcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXNXaXRoUGFzc3dvcmQsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSxcbn0gZnJvbSAnLi9jb25uZWN0aW9uLXR5cGVzJztcblxuaW1wb3J0IEF0b21JbnB1dCBmcm9tICcuLi8uLi91aS9hdG9tLWlucHV0JztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBDb25uZWN0aW9uRGV0YWlsc0Zvcm0gZnJvbSAnLi9Db25uZWN0aW9uRGV0YWlsc0Zvcm0nO1xuaW1wb3J0IHt2YWxpZGF0ZUZvcm1JbnB1dHN9IGZyb20gJy4vZm9ybS12YWxpZGF0aW9uLXV0aWxzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgLy8gQSBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgXCJDYW5jZWxcIiBidXR0b24gaXMgY2xpY2tlZC5cbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xuICAvLyBBIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBcIlNhdmVcIiBidXR0b24gaXMgY2xpY2tlZC4gVGhlIHByb2ZpbGUgcGFzc2VkXG4gIC8vIHRvIHRoZSBmdW5jdGlvbiBpcyB0aGUgcHJvZmlsZSB0aGF0IHRoZSB1c2VyIGhhcyBqdXN0IGNyZWF0ZWQuXG4gIC8vIFRoZSBDcmVhdGVDb25uZWN0aW9uUHJvZmlsZUZvcm0gd2lsbCBkbyBiYXNpYyB2YWxpZGF0aW9uIG9uIHRoZSBpbnB1dHM6IEl0XG4gIC8vIGNoZWNrcyB0aGF0IHRoZSBmaWVsZHMgYXJlIG5vbi1lbXB0eSBiZWZvcmUgY2FsbGluZyB0aGlzIGZ1bmN0aW9uLlxuICBvblNhdmU6IChwcm9maWxlOiBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUpID0+IG1peGVkO1xuICAvLyBUaGUgaW5wdXRzIHRvIHByZS1maWxsIHRoZSBmb3JtIHdpdGguXG4gIGluaXRpYWxGb3JtRmllbGRzOiBOdWNsaWRlTmV3Q29ubmVjdGlvblByb2ZpbGVJbml0aWFsRmllbGRzO1xufTtcblxuY29uc3QgUFJPRklMRV9OQU1FX0xBQkVMID0gJ1Byb2ZpbGUgTmFtZSc7XG5jb25zdCBERUZBVUxUX1NFUlZFUl9DT01NQU5EX1BMQUNFSE9MREVSID0gJyhERUZBVUxUKSc7XG5cbmNvbnN0IGVtcHR5RnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuLyoqXG4gKiBBIGZvcm0gdGhhdCBpcyB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBjb25uZWN0aW9uIHByb2ZpbGUuXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmNsYXNzIENyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuXG4gIGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5fY2xpY2tTYXZlID0gdGhpcy5fY2xpY2tTYXZlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2NsaWNrQ2FuY2VsID0gdGhpcy5fY2xpY2tDYW5jZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3QgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIC8vIEhpdHRpbmcgZW50ZXIgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY29uZmlybSB0aGUgZGlhbG9nLlxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQocm9vdCwgJ2NvcmU6Y29uZmlybScsIHRoaXMuX2NsaWNrU2F2ZSksXG4gICAgICAvLyBIaXR0aW5nIGVzY2FwZSB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjYW5jZWwgdGhlIGRpYWxvZy5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHJvb3QsICdjb3JlOmNhbmNlbCcsIHRoaXMuX2NsaWNrQ2FuY2VsKVxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlOiBUaGlzIGZvcm0gZGlzcGxheXMgREVGQVVMVF9TRVJWRVJfQ09NTUFORF9QTEFDRUhPTERFUiBhcyB0aGUgcHJlZmlsbGVkXG4gICAqIHJlbW90ZSBzZXJ2ZXIgY29tbWFuZC4gVGhlIHJlbW90ZSBzZXJ2ZXIgY29tbWFuZCB3aWxsIG9ubHkgYmUgc2F2ZWQgaWYgdGhlXG4gICAqIHVzZXIgY2hhbmdlcyBpdCBmcm9tIHRoaXMgZGVmYXVsdC5cbiAgICovXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGluaXRpYWxGaWVsZHMgPSB0aGlzLnByb3BzLmluaXRpYWxGb3JtRmllbGRzO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXBhbmVsIGNsYXNzPVwibW9kYWwgZnJvbS10b3BcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxsYWJlbD57UFJPRklMRV9OQU1FX0xBQkVMfTo8L2xhYmVsPlxuICAgICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgICBpbml0aWFsVmFsdWU9XCJcIlxuICAgICAgICAgICAgICByZWY9XCJwcm9maWxlLW5hbWVcIlxuICAgICAgICAgICAgICB1bnN0eWxlZD17dHJ1ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPENvbm5lY3Rpb25EZXRhaWxzRm9ybVxuICAgICAgICAgICAgcmVmPVwiY29ubmVjdGlvbi1kZXRhaWxzXCJcbiAgICAgICAgICAgIGluaXRpYWxVc2VybmFtZT17aW5pdGlhbEZpZWxkcy51c2VybmFtZX1cbiAgICAgICAgICAgIGluaXRpYWxTZXJ2ZXI9e2luaXRpYWxGaWVsZHMuc2VydmVyfVxuICAgICAgICAgICAgaW5pdGlhbEN3ZD17aW5pdGlhbEZpZWxkcy5jd2R9XG4gICAgICAgICAgICBpbml0aWFsUmVtb3RlU2VydmVyQ29tbWFuZD17REVGQVVMVF9TRVJWRVJfQ09NTUFORF9QTEFDRUhPTERFUn1cbiAgICAgICAgICAgIGluaXRpYWxTc2hQb3J0PXtpbml0aWFsRmllbGRzLnNzaFBvcnR9XG4gICAgICAgICAgICBpbml0aWFsUGF0aFRvUHJpdmF0ZUtleT17aW5pdGlhbEZpZWxkcy5wYXRoVG9Qcml2YXRlS2V5fVxuICAgICAgICAgICAgaW5pdGlhbEF1dGhNZXRob2Q9e2luaXRpYWxGaWVsZHMuYXV0aE1ldGhvZH1cbiAgICAgICAgICAgIG9uQ29uZmlybT17ZW1wdHlGdW5jdGlvbn1cbiAgICAgICAgICAgIG9uQ2FuY2VsPXtlbXB0eUZ1bmN0aW9ufVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWQgdGV4dC1yaWdodFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXBcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG5cIiBvbkNsaWNrPXt0aGlzLl9jbGlja0NhbmNlbH0+XG4gICAgICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX2NsaWNrU2F2ZX0+XG4gICAgICAgICAgICAgICAgU2F2ZVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICApO1xuICB9XG5cbiAgX2dldFByb2ZpbGVOYW1lKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZmllbGROYW1lID0gJ3Byb2ZpbGUtbmFtZSc7XG4gICAgcmV0dXJuICh0aGlzLnJlZnNbZmllbGROYW1lXSAmJiB0aGlzLnJlZnNbZmllbGROYW1lXS5nZXRUZXh0KCkudHJpbSgpKSB8fCAnJztcbiAgfVxuXG4gIF9jbGlja1NhdmUoKTogdm9pZCB7XG4gICAgLy8gVmFsaWRhdGUgdGhlIGZvcm0gaW5wdXRzLlxuICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gdGhpcy5fZ2V0UHJvZmlsZU5hbWUoKTtcbiAgICBjb25zdCBjb25uZWN0aW9uRGV0YWlsczogTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXNXaXRoUGFzc3dvcmQgPVxuICAgICAgICB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscyddLmdldEZvcm1GaWVsZHMoKTtcbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVGb3JtSW5wdXRzKFxuICAgICAgcHJvZmlsZU5hbWUsXG4gICAgICBjb25uZWN0aW9uRGV0YWlscyxcbiAgICAgIERFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVIsXG4gICAgKTtcbiAgICBpZiAodmFsaWRhdGlvblJlc3VsdC5lcnJvck1lc3NhZ2UpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcih2YWxpZGF0aW9uUmVzdWx0LmVycm9yTWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGludmFyaWFudCh2YWxpZGF0aW9uUmVzdWx0LnZhbGlkYXRlZFByb2ZpbGUgIT0gbnVsbCk7XG4gICAgLy8gU2F2ZSB0aGUgdmFsaWRhdGVkIHByb2ZpbGUsIGFuZCBzaG93IGFueSB3YXJuaW5nIG1lc3NhZ2VzLlxuICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSB2YWxpZGF0aW9uUmVzdWx0LnZhbGlkYXRlZFByb2ZpbGU7XG4gICAgaWYgKHZhbGlkYXRpb25SZXN1bHQud2FybmluZ01lc3NhZ2UpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHZhbGlkYXRpb25SZXN1bHQud2FybmluZ01lc3NhZ2UpO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uU2F2ZShuZXdQcm9maWxlKTtcbiAgfVxuXG4gIF9jbGlja0NhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uQ2FuY2VsKCk7XG4gIH1cbn1cblxuLyogZXNsaW50LWVuYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbm1vZHVsZS5leHBvcnRzID0gQ3JlYXRlQ29ubmVjdGlvblByb2ZpbGVGb3JtO1xuIl19