Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _uiAtomInput = require('../../ui/atom-input');

var _uiAtomInput2 = _interopRequireDefault(_uiAtomInput);

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

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
    this._boundClickSave = this._clickSave.bind(this);
    this._boundClickCancel = this._clickCancel.bind(this);
    this.disposables = new _atom.CompositeDisposable();
  }

  /* eslint-enable react/prop-types */

  _createClass(CreateConnectionProfileForm, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var root = _reactForAtom2['default'].findDOMNode(this);
      this.disposables.add(
      // Hitting enter when this panel has focus should confirm the dialog.
      atom.commands.add(root, 'core:confirm', this._boundClickSave),
      // Hitting escape when this panel has focus should cancel the dialog.
      atom.commands.add(root, 'core:cancel', this._boundClickCancel));
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

      return _reactForAtom2['default'].createElement(
        'atom-panel',
        { 'class': 'modal from-top' },
        _reactForAtom2['default'].createElement(
          'div',
          { className: 'padded' },
          _reactForAtom2['default'].createElement(
            'div',
            { className: 'form-group' },
            _reactForAtom2['default'].createElement(
              'label',
              null,
              PROFILE_NAME_LABEL,
              ':'
            ),
            _reactForAtom2['default'].createElement(_uiAtomInput2['default'], {
              className: 'nuclide-connections-dialog-input-unstyled',
              initialValue: '',
              ref: 'profile-name'
            })
          ),
          _reactForAtom2['default'].createElement(_ConnectionDetailsForm2['default'], {
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
          _reactForAtom2['default'].createElement(
            'div',
            { className: 'padded text-right' },
            _reactForAtom2['default'].createElement(
              'div',
              { className: 'btn-group' },
              _reactForAtom2['default'].createElement(
                'button',
                { className: 'btn', onClick: this._boundClickCancel },
                'Cancel'
              ),
              _reactForAtom2['default'].createElement(
                'button',
                { className: 'btn btn-primary', onClick: this._boundClickSave },
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
})(_reactForAtom2['default'].Component);

exports['default'] = CreateConnectionProfileForm;
module.exports = exports['default'];

// A function called when the "Cancel" button is clicked.

// A function called when the "Save" button is clicked. The profile passed
// to the function is the profile that the user has just created.
// The CreateConnectionProfileForm will do basic validation on the inputs: It
// checks that the fields are non-empty before calling this function.

// The inputs to pre-fill the form with.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJCQWlCc0IscUJBQXFCOzs7OzRCQUN6QixnQkFBZ0I7Ozs7c0JBQ1osUUFBUTs7OztvQkFDSSxNQUFNOztxQ0FDTix5QkFBeUI7Ozs7bUNBQzFCLHlCQUF5Qjs7QUFjMUQsSUFBTSxrQkFBa0IsR0FBRyxjQUFjLENBQUM7QUFDMUMsSUFBTSxrQ0FBa0MsR0FBRyxXQUFXLENBQUM7O0FBRXZELElBQU0sYUFBYSxHQUFHLFNBQWhCLGFBQWEsR0FBUyxFQUFFLENBQUM7Ozs7Ozs7SUFNViwyQkFBMkI7WUFBM0IsMkJBQTJCOztBQUluQyxXQUpRLDJCQUEyQixDQUlsQyxLQUFZLEVBQUU7MEJBSlAsMkJBQTJCOztBQUs1QywrQkFMaUIsMkJBQTJCLDZDQUt0QyxLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xELFFBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RCxRQUFJLENBQUMsV0FBVyxHQUFHLCtCQUF5QixDQUFDO0dBQzlDOzs7O2VBVGtCLDJCQUEyQjs7V0FXN0IsNkJBQVM7QUFDeEIsVUFBTSxJQUFJLEdBQUcsMEJBQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLFVBQUksQ0FBQyxXQUFXLENBQUMsR0FBRzs7QUFFbEIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDOztBQUU3RCxVQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUMvRCxDQUFDO0tBQ0g7OztX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Q29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIE51Y2xpZGVOZXdDb25uZWN0aW9uUHJvZmlsZUluaXRpYWxGaWVsZHMsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUsXG59IGZyb20gJy4vY29ubmVjdGlvbi10eXBlcyc7XG5cbmltcG9ydCBBdG9tSW5wdXQgZnJvbSAnLi4vLi4vdWkvYXRvbS1pbnB1dCc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBDb25uZWN0aW9uRGV0YWlsc0Zvcm0gZnJvbSAnLi9Db25uZWN0aW9uRGV0YWlsc0Zvcm0nO1xuaW1wb3J0IHt2YWxpZGF0ZUZvcm1JbnB1dHN9IGZyb20gJy4vZm9ybS12YWxpZGF0aW9uLXV0aWxzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgLy8gQSBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgXCJDYW5jZWxcIiBidXR0b24gaXMgY2xpY2tlZC5cbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xuICAvLyBBIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBcIlNhdmVcIiBidXR0b24gaXMgY2xpY2tlZC4gVGhlIHByb2ZpbGUgcGFzc2VkXG4gIC8vIHRvIHRoZSBmdW5jdGlvbiBpcyB0aGUgcHJvZmlsZSB0aGF0IHRoZSB1c2VyIGhhcyBqdXN0IGNyZWF0ZWQuXG4gIC8vIFRoZSBDcmVhdGVDb25uZWN0aW9uUHJvZmlsZUZvcm0gd2lsbCBkbyBiYXNpYyB2YWxpZGF0aW9uIG9uIHRoZSBpbnB1dHM6IEl0XG4gIC8vIGNoZWNrcyB0aGF0IHRoZSBmaWVsZHMgYXJlIG5vbi1lbXB0eSBiZWZvcmUgY2FsbGluZyB0aGlzIGZ1bmN0aW9uLlxuICBvblNhdmU6IChwcm9maWxlOiBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUpID0+IG1peGVkO1xuICAvLyBUaGUgaW5wdXRzIHRvIHByZS1maWxsIHRoZSBmb3JtIHdpdGguXG4gIGluaXRpYWxGb3JtRmllbGRzOiBOdWNsaWRlTmV3Q29ubmVjdGlvblByb2ZpbGVJbml0aWFsRmllbGRzLFxufTtcblxuY29uc3QgUFJPRklMRV9OQU1FX0xBQkVMID0gJ1Byb2ZpbGUgTmFtZSc7XG5jb25zdCBERUZBVUxUX1NFUlZFUl9DT01NQU5EX1BMQUNFSE9MREVSID0gJyhERUZBVUxUKSc7XG5cbmNvbnN0IGVtcHR5RnVuY3Rpb24gPSAoKSA9PiB7fTtcblxuLyoqXG4gKiBBIGZvcm0gdGhhdCBpcyB1c2VkIHRvIGNyZWF0ZSBhIG5ldyBjb25uZWN0aW9uIHByb2ZpbGUuXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuXG4gIGRpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9ib3VuZENsaWNrU2F2ZSA9IHRoaXMuX2NsaWNrU2F2ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kQ2xpY2tDYW5jZWwgPSB0aGlzLl9jbGlja0NhbmNlbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdCA9IFJlYWN0LmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKFxuICAgICAgLy8gSGl0dGluZyBlbnRlciB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjb25maXJtIHRoZSBkaWFsb2cuXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChyb290LCAnY29yZTpjb25maXJtJywgdGhpcy5fYm91bmRDbGlja1NhdmUpLFxuICAgICAgLy8gSGl0dGluZyBlc2NhcGUgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY2FuY2VsIHRoZSBkaWFsb2cuXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChyb290LCAnY29yZTpjYW5jZWwnLCB0aGlzLl9ib3VuZENsaWNrQ2FuY2VsKVxuICAgICk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlOiBUaGlzIGZvcm0gZGlzcGxheXMgREVGQVVMVF9TRVJWRVJfQ09NTUFORF9QTEFDRUhPTERFUiBhcyB0aGUgcHJlZmlsbGVkXG4gICAqIHJlbW90ZSBzZXJ2ZXIgY29tbWFuZC4gVGhlIHJlbW90ZSBzZXJ2ZXIgY29tbWFuZCB3aWxsIG9ubHkgYmUgc2F2ZWQgaWYgdGhlXG4gICAqIHVzZXIgY2hhbmdlcyBpdCBmcm9tIHRoaXMgZGVmYXVsdC5cbiAgICovXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGluaXRpYWxGaWVsZHMgPSB0aGlzLnByb3BzLmluaXRpYWxGb3JtRmllbGRzO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXBhbmVsIGNsYXNzPVwibW9kYWwgZnJvbS10b3BcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cbiAgICAgICAgICAgIDxsYWJlbD57UFJPRklMRV9OQU1FX0xBQkVMfTo8L2xhYmVsPlxuICAgICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWNvbm5lY3Rpb25zLWRpYWxvZy1pbnB1dC11bnN0eWxlZFwiXG4gICAgICAgICAgICAgIGluaXRpYWxWYWx1ZT1cIlwiXG4gICAgICAgICAgICAgIHJlZj1cInByb2ZpbGUtbmFtZVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxDb25uZWN0aW9uRGV0YWlsc0Zvcm1cbiAgICAgICAgICAgIHJlZj1cImNvbm5lY3Rpb24tZGV0YWlsc1wiXG4gICAgICAgICAgICBpbml0aWFsVXNlcm5hbWU9e2luaXRpYWxGaWVsZHMudXNlcm5hbWV9XG4gICAgICAgICAgICBpbml0aWFsU2VydmVyPXtpbml0aWFsRmllbGRzLnNlcnZlcn1cbiAgICAgICAgICAgIGluaXRpYWxDd2Q9e2luaXRpYWxGaWVsZHMuY3dkfVxuICAgICAgICAgICAgaW5pdGlhbFJlbW90ZVNlcnZlckNvbW1hbmQ9e0RFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVJ9XG4gICAgICAgICAgICBpbml0aWFsU3NoUG9ydD17aW5pdGlhbEZpZWxkcy5zc2hQb3J0fVxuICAgICAgICAgICAgaW5pdGlhbFBhdGhUb1ByaXZhdGVLZXk9e2luaXRpYWxGaWVsZHMucGF0aFRvUHJpdmF0ZUtleX1cbiAgICAgICAgICAgIGluaXRpYWxBdXRoTWV0aG9kPXtpbml0aWFsRmllbGRzLmF1dGhNZXRob2R9XG4gICAgICAgICAgICBvbkNvbmZpcm09e2VtcHR5RnVuY3Rpb259XG4gICAgICAgICAgICBvbkNhbmNlbD17ZW1wdHlGdW5jdGlvbn1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkIHRleHQtcmlnaHRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fYm91bmRDbGlja0NhbmNlbH0+XG4gICAgICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX2JvdW5kQ2xpY2tTYXZlfT5cbiAgICAgICAgICAgICAgICBTYXZlXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hdG9tLXBhbmVsPlxuICAgICk7XG4gIH1cblxuICBfZ2V0UHJvZmlsZU5hbWUoKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaWVsZE5hbWUgPSAncHJvZmlsZS1uYW1lJztcbiAgICByZXR1cm4gKHRoaXMucmVmc1tmaWVsZE5hbWVdICYmIHRoaXMucmVmc1tmaWVsZE5hbWVdLmdldFRleHQoKS50cmltKCkpIHx8ICcnO1xuICB9XG5cbiAgX2NsaWNrU2F2ZSgpOiB2b2lkIHtcbiAgICAvLyBWYWxpZGF0ZSB0aGUgZm9ybSBpbnB1dHMuXG4gICAgY29uc3QgcHJvZmlsZU5hbWUgPSB0aGlzLl9nZXRQcm9maWxlTmFtZSgpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25EZXRhaWxzOiBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCA9XG4gICAgICAgIHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzJ10uZ2V0Rm9ybUZpZWxkcygpO1xuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0ZUZvcm1JbnB1dHMoXG4gICAgICBwcm9maWxlTmFtZSxcbiAgICAgIGNvbm5lY3Rpb25EZXRhaWxzLFxuICAgICAgREVGQVVMVF9TRVJWRVJfQ09NTUFORF9QTEFDRUhPTERFUixcbiAgICApO1xuICAgIGlmICh2YWxpZGF0aW9uUmVzdWx0LmVycm9yTWVzc2FnZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKHZhbGlkYXRpb25SZXN1bHQuZXJyb3JNZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW52YXJpYW50KHZhbGlkYXRpb25SZXN1bHQudmFsaWRhdGVkUHJvZmlsZSAhPSBudWxsKTtcbiAgICAvLyBTYXZlIHRoZSB2YWxpZGF0ZWQgcHJvZmlsZSwgYW5kIHNob3cgYW55IHdhcm5pbmcgbWVzc2FnZXMuXG4gICAgY29uc3QgbmV3UHJvZmlsZSA9IHZhbGlkYXRpb25SZXN1bHQudmFsaWRhdGVkUHJvZmlsZTtcbiAgICBpZiAodmFsaWRhdGlvblJlc3VsdC53YXJuaW5nTWVzc2FnZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcodmFsaWRhdGlvblJlc3VsdC53YXJuaW5nTWVzc2FnZSk7XG4gICAgfVxuICAgIHRoaXMucHJvcHMub25TYXZlKG5ld1Byb2ZpbGUpO1xuICB9XG5cbiAgX2NsaWNrQ2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgfVxufVxuXG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==