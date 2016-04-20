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

var _nuclideUiLibAtomInput = require('../../nuclide-ui/lib/AtomInput');

var _reactForAtom = require('react-for-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _ConnectionDetailsForm = require('./ConnectionDetailsForm');

var _ConnectionDetailsForm2 = _interopRequireDefault(_ConnectionDetailsForm);

var _formValidationUtils = require('./form-validation-utils');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var _nuclideUiLibButtonGroup = require('../../nuclide-ui/lib/ButtonGroup');

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
            _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
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
              _nuclideUiLibButtonGroup.ButtonGroup,
              null,
              _reactForAtom.React.createElement(
                _nuclideUiLibButton.Button,
                { onClick: this._clickCancel },
                'Cancel'
              ),
              _reactForAtom.React.createElement(
                _nuclideUiLibButton.Button,
                { buttonType: _nuclideUiLibButton.ButtonTypes.PRIMARY, onClick: this._clickSave },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBaUJ3QixnQ0FBZ0M7OzRCQUlqRCxnQkFBZ0I7O3NCQUNELFFBQVE7Ozs7b0JBQ0ksTUFBTTs7cUNBQ04seUJBQXlCOzs7O21DQUMxQix5QkFBeUI7O2tDQUluRCw2QkFBNkI7O3VDQUc3QixrQ0FBa0M7O0FBY3pDLElBQU0sa0JBQWtCLEdBQUcsY0FBYyxDQUFDO0FBQzFDLElBQU0sa0NBQWtDLEdBQUcsV0FBVyxDQUFDOztBQUV2RCxJQUFNLGFBQWEsR0FBRyxTQUFoQixhQUFhLEdBQVMsRUFBRSxDQUFDOzs7Ozs7SUFLekIsMkJBQTJCO1lBQTNCLDJCQUEyQjs7QUFLcEIsV0FMUCwyQkFBMkIsQ0FLbkIsS0FBWSxFQUFFOzBCQUx0QiwyQkFBMkI7O0FBTTdCLCtCQU5FLDJCQUEyQiw2Q0FNdkIsS0FBSyxFQUFFO0FBQ2IsQUFBQyxRQUFJLENBQU8sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BELEFBQUMsUUFBSSxDQUFPLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4RCxRQUFJLENBQUMsV0FBVyxHQUFHLCtCQUF5QixDQUFDO0dBQzlDOztlQVZHLDJCQUEyQjs7V0FZZCw2QkFBUztBQUN4QixVQUFNLElBQUksR0FBRyx1QkFBUyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEMsVUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHOztBQUVsQixVQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUM7O0FBRXhELFVBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUMxRCxDQUFDO0tBQ0g7OztXQUVtQixnQ0FBUztBQUMzQixVQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzVCOzs7Ozs7Ozs7V0FPSyxrQkFBa0I7QUFDdEIsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQzs7QUFFbkQsYUFDRTs7VUFBWSxTQUFNLGdCQUFnQjtRQUNoQzs7WUFBSyxTQUFTLEVBQUMsUUFBUTtVQUNyQjs7Y0FBSyxTQUFTLEVBQUMsWUFBWTtZQUN6Qjs7O2NBQVEsa0JBQWtCOzthQUFVO1lBQ3BDO0FBQ0UsMEJBQVksRUFBQyxFQUFFO0FBQ2YsaUJBQUcsRUFBQyxjQUFjO0FBQ2xCLHNCQUFRLEVBQUUsSUFBSSxBQUFDO2NBQ2Y7V0FDRTtVQUNOO0FBQ0UsZUFBRyxFQUFDLG9CQUFvQjtBQUN4QiwyQkFBZSxFQUFFLGFBQWEsQ0FBQyxRQUFRLEFBQUM7QUFDeEMseUJBQWEsRUFBRSxhQUFhLENBQUMsTUFBTSxBQUFDO0FBQ3BDLHNCQUFVLEVBQUUsYUFBYSxDQUFDLEdBQUcsQUFBQztBQUM5QixzQ0FBMEIsRUFBRSxrQ0FBa0MsQUFBQztBQUMvRCwwQkFBYyxFQUFFLGFBQWEsQ0FBQyxPQUFPLEFBQUM7QUFDdEMsbUNBQXVCLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixBQUFDO0FBQ3hELDZCQUFpQixFQUFFLGFBQWEsQ0FBQyxVQUFVLEFBQUM7QUFDNUMscUJBQVMsRUFBRSxhQUFhLEFBQUM7QUFDekIsb0JBQVEsRUFBRSxhQUFhLEFBQUM7WUFDeEI7VUFDRjs7Y0FBSyxTQUFTLEVBQUMsbUJBQW1CO1lBQ2hDOzs7Y0FDRTs7a0JBQVEsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEFBQUM7O2VBRTFCO2NBQ1Q7O2tCQUFRLFVBQVUsRUFBRSxnQ0FBWSxPQUFPLEFBQUMsRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQUFBQzs7ZUFFekQ7YUFDRztXQUNWO1NBQ0Y7T0FDSyxDQUNiO0tBQ0g7OztXQUVjLDJCQUFXO0FBQ3hCLFVBQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQztBQUNqQyxhQUFPLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFLLEVBQUUsQ0FBQztLQUM5RTs7O1dBRVMsc0JBQVM7O0FBRWpCLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUMzQyxVQUFNLGlCQUE0RCxHQUM5RCxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDcEQsVUFBTSxnQkFBZ0IsR0FBRyw2Q0FDdkIsV0FBVyxFQUNYLGlCQUFpQixFQUNqQixrQ0FBa0MsQ0FDbkMsQ0FBQztBQUNGLFVBQUksZ0JBQWdCLENBQUMsWUFBWSxFQUFFO0FBQ2pDLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNELGVBQU87T0FDUjtBQUNELCtCQUFVLGdCQUFnQixDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDOztBQUVyRCxVQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNyRCxVQUFJLGdCQUFnQixDQUFDLGNBQWMsRUFBRTtBQUNuQyxZQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztPQUNoRTtBQUNELFVBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQy9COzs7V0FFVyx3QkFBUztBQUNuQixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3ZCOzs7U0F0R0csMkJBQTJCO0dBQVMsb0JBQU0sU0FBUzs7QUF5R3pELE1BQU0sQ0FBQyxPQUFPLEdBQUcsMkJBQTJCLENBQUMiLCJmaWxlIjoiQ3JlYXRlQ29ubmVjdGlvblByb2ZpbGVGb3JtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBOdWNsaWRlTmV3Q29ubmVjdGlvblByb2ZpbGVJbml0aWFsRmllbGRzLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCxcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25Qcm9maWxlLFxufSBmcm9tICcuL2Nvbm5lY3Rpb24tdHlwZXMnO1xuXG5pbXBvcnQge0F0b21JbnB1dH0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQXRvbUlucHV0JztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBDb25uZWN0aW9uRGV0YWlsc0Zvcm0gZnJvbSAnLi9Db25uZWN0aW9uRGV0YWlsc0Zvcm0nO1xuaW1wb3J0IHt2YWxpZGF0ZUZvcm1JbnB1dHN9IGZyb20gJy4vZm9ybS12YWxpZGF0aW9uLXV0aWxzJztcbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQnV0dG9uVHlwZXMsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5pbXBvcnQge1xuICBCdXR0b25Hcm91cCxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS11aS9saWIvQnV0dG9uR3JvdXAnO1xuXG50eXBlIFByb3BzID0ge1xuICAvLyBBIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBcIkNhbmNlbFwiIGJ1dHRvbiBpcyBjbGlja2VkLlxuICBvbkNhbmNlbDogKCkgPT4gbWl4ZWQ7XG4gIC8vIEEgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIFwiU2F2ZVwiIGJ1dHRvbiBpcyBjbGlja2VkLiBUaGUgcHJvZmlsZSBwYXNzZWRcbiAgLy8gdG8gdGhlIGZ1bmN0aW9uIGlzIHRoZSBwcm9maWxlIHRoYXQgdGhlIHVzZXIgaGFzIGp1c3QgY3JlYXRlZC5cbiAgLy8gVGhlIENyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybSB3aWxsIGRvIGJhc2ljIHZhbGlkYXRpb24gb24gdGhlIGlucHV0czogSXRcbiAgLy8gY2hlY2tzIHRoYXQgdGhlIGZpZWxkcyBhcmUgbm9uLWVtcHR5IGJlZm9yZSBjYWxsaW5nIHRoaXMgZnVuY3Rpb24uXG4gIG9uU2F2ZTogKHByb2ZpbGU6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSkgPT4gbWl4ZWQ7XG4gIC8vIFRoZSBpbnB1dHMgdG8gcHJlLWZpbGwgdGhlIGZvcm0gd2l0aC5cbiAgaW5pdGlhbEZvcm1GaWVsZHM6IE51Y2xpZGVOZXdDb25uZWN0aW9uUHJvZmlsZUluaXRpYWxGaWVsZHM7XG59O1xuXG5jb25zdCBQUk9GSUxFX05BTUVfTEFCRUwgPSAnUHJvZmlsZSBOYW1lJztcbmNvbnN0IERFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVIgPSAnKERFRkFVTFQpJztcblxuY29uc3QgZW1wdHlGdW5jdGlvbiA9ICgpID0+IHt9O1xuXG4vKipcbiAqIEEgZm9ybSB0aGF0IGlzIHVzZWQgdG8gY3JlYXRlIGEgbmV3IGNvbm5lY3Rpb24gcHJvZmlsZS5cbiAqL1xuY2xhc3MgQ3JlYXRlQ29ubmVjdGlvblByb2ZpbGVGb3JtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzLCB2b2lkPiB7XG4gIHByb3BzOiBQcm9wcztcblxuICBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2NsaWNrU2F2ZSA9IHRoaXMuX2NsaWNrU2F2ZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9jbGlja0NhbmNlbCA9IHRoaXMuX2NsaWNrQ2FuY2VsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCByb290ID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAvLyBIaXR0aW5nIGVudGVyIHdoZW4gdGhpcyBwYW5lbCBoYXMgZm9jdXMgc2hvdWxkIGNvbmZpcm0gdGhlIGRpYWxvZy5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHJvb3QsICdjb3JlOmNvbmZpcm0nLCB0aGlzLl9jbGlja1NhdmUpLFxuICAgICAgLy8gSGl0dGluZyBlc2NhcGUgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY2FuY2VsIHRoZSBkaWFsb2cuXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChyb290LCAnY29yZTpjYW5jZWwnLCB0aGlzLl9jbGlja0NhbmNlbClcbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm90ZTogVGhpcyBmb3JtIGRpc3BsYXlzIERFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVIgYXMgdGhlIHByZWZpbGxlZFxuICAgKiByZW1vdGUgc2VydmVyIGNvbW1hbmQuIFRoZSByZW1vdGUgc2VydmVyIGNvbW1hbmQgd2lsbCBvbmx5IGJlIHNhdmVkIGlmIHRoZVxuICAgKiB1c2VyIGNoYW5nZXMgaXQgZnJvbSB0aGlzIGRlZmF1bHQuXG4gICAqL1xuICByZW5kZXIoKTogUmVhY3QuRWxlbWVudCB7XG4gICAgY29uc3QgaW5pdGlhbEZpZWxkcyA9IHRoaXMucHJvcHMuaW5pdGlhbEZvcm1GaWVsZHM7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJtb2RhbCBmcm9tLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPGxhYmVsPntQUk9GSUxFX05BTUVfTEFCRUx9OjwvbGFiZWw+XG4gICAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICAgIGluaXRpYWxWYWx1ZT1cIlwiXG4gICAgICAgICAgICAgIHJlZj1cInByb2ZpbGUtbmFtZVwiXG4gICAgICAgICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8Q29ubmVjdGlvbkRldGFpbHNGb3JtXG4gICAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHNcIlxuICAgICAgICAgICAgaW5pdGlhbFVzZXJuYW1lPXtpbml0aWFsRmllbGRzLnVzZXJuYW1lfVxuICAgICAgICAgICAgaW5pdGlhbFNlcnZlcj17aW5pdGlhbEZpZWxkcy5zZXJ2ZXJ9XG4gICAgICAgICAgICBpbml0aWFsQ3dkPXtpbml0aWFsRmllbGRzLmN3ZH1cbiAgICAgICAgICAgIGluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kPXtERUZBVUxUX1NFUlZFUl9DT01NQU5EX1BMQUNFSE9MREVSfVxuICAgICAgICAgICAgaW5pdGlhbFNzaFBvcnQ9e2luaXRpYWxGaWVsZHMuc3NoUG9ydH1cbiAgICAgICAgICAgIGluaXRpYWxQYXRoVG9Qcml2YXRlS2V5PXtpbml0aWFsRmllbGRzLnBhdGhUb1ByaXZhdGVLZXl9XG4gICAgICAgICAgICBpbml0aWFsQXV0aE1ldGhvZD17aW5pdGlhbEZpZWxkcy5hdXRoTWV0aG9kfVxuICAgICAgICAgICAgb25Db25maXJtPXtlbXB0eUZ1bmN0aW9ufVxuICAgICAgICAgICAgb25DYW5jZWw9e2VtcHR5RnVuY3Rpb259XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZCB0ZXh0LXJpZ2h0XCI+XG4gICAgICAgICAgICA8QnV0dG9uR3JvdXA+XG4gICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17dGhpcy5fY2xpY2tDYW5jZWx9PlxuICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBidXR0b25UeXBlPXtCdXR0b25UeXBlcy5QUklNQVJZfSBvbkNsaWNrPXt0aGlzLl9jbGlja1NhdmV9PlxuICAgICAgICAgICAgICAgIFNhdmVcbiAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICA8L0J1dHRvbkdyb3VwPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICApO1xuICB9XG5cbiAgX2dldFByb2ZpbGVOYW1lKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZmllbGROYW1lID0gJ3Byb2ZpbGUtbmFtZSc7XG4gICAgcmV0dXJuICh0aGlzLnJlZnNbZmllbGROYW1lXSAmJiB0aGlzLnJlZnNbZmllbGROYW1lXS5nZXRUZXh0KCkudHJpbSgpKSB8fCAnJztcbiAgfVxuXG4gIF9jbGlja1NhdmUoKTogdm9pZCB7XG4gICAgLy8gVmFsaWRhdGUgdGhlIGZvcm0gaW5wdXRzLlxuICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gdGhpcy5fZ2V0UHJvZmlsZU5hbWUoKTtcbiAgICBjb25zdCBjb25uZWN0aW9uRGV0YWlsczogTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXNXaXRoUGFzc3dvcmQgPVxuICAgICAgICB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscyddLmdldEZvcm1GaWVsZHMoKTtcbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVGb3JtSW5wdXRzKFxuICAgICAgcHJvZmlsZU5hbWUsXG4gICAgICBjb25uZWN0aW9uRGV0YWlscyxcbiAgICAgIERFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVIsXG4gICAgKTtcbiAgICBpZiAodmFsaWRhdGlvblJlc3VsdC5lcnJvck1lc3NhZ2UpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcih2YWxpZGF0aW9uUmVzdWx0LmVycm9yTWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGludmFyaWFudCh2YWxpZGF0aW9uUmVzdWx0LnZhbGlkYXRlZFByb2ZpbGUgIT0gbnVsbCk7XG4gICAgLy8gU2F2ZSB0aGUgdmFsaWRhdGVkIHByb2ZpbGUsIGFuZCBzaG93IGFueSB3YXJuaW5nIG1lc3NhZ2VzLlxuICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSB2YWxpZGF0aW9uUmVzdWx0LnZhbGlkYXRlZFByb2ZpbGU7XG4gICAgaWYgKHZhbGlkYXRpb25SZXN1bHQud2FybmluZ01lc3NhZ2UpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHZhbGlkYXRpb25SZXN1bHQud2FybmluZ01lc3NhZ2UpO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uU2F2ZShuZXdQcm9maWxlKTtcbiAgfVxuXG4gIF9jbGlja0NhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uQ2FuY2VsKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDcmVhdGVDb25uZWN0aW9uUHJvZmlsZUZvcm07XG4iXX0=