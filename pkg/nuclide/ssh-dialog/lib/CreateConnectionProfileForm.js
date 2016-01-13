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
  }

  /* eslint-enable react/prop-types */

  /**
   * Note: This form displays DEFAULT_SERVER_COMMAND_PLACEHOLDER as the prefilled
   * remote server command. The remote server command will only be saved if the
   * user changes it from this default.
   */

  _createClass(CreateConnectionProfileForm, [{
    key: 'render',
    value: function render() {
      var initialFields = this.props.initialFormFields;

      return _reactForAtom2['default'].createElement(
        'div',
        null,
        _reactForAtom2['default'].createElement(
          'atom-panel',
          { 'class': 'modal from-top' },
          _reactForAtom2['default'].createElement(
            'div',
            null,
            PROFILE_NAME_LABEL,
            ':',
            _reactForAtom2['default'].createElement(_uiAtomInput2['default'], { ref: 'profile-name', initialValue: '' })
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
            { className: 'block nuclide-ok-cancel' },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJCQWlCc0IscUJBQXFCOzs7OzRCQUN6QixnQkFBZ0I7Ozs7c0JBQ1osUUFBUTs7OztxQ0FDSSx5QkFBeUI7Ozs7bUNBQzFCLHlCQUF5Qjs7QUFnQjFELElBQU0sa0JBQWtCLEdBQUcsY0FBYyxDQUFDO0FBQzFDLElBQU0sa0NBQWtDLEdBQUcsV0FBVyxDQUFDOztBQUV2RCxJQUFNLGFBQWEsR0FBRyxTQUFoQixhQUFhLEdBQVMsRUFBRSxDQUFDOzs7Ozs7O0lBTVYsMkJBQTJCO1lBQTNCLDJCQUEyQjs7QUFHbkMsV0FIUSwyQkFBMkIsQ0FHbEMsS0FBWSxFQUFFOzBCQUhQLDJCQUEyQjs7QUFJNUMsK0JBSmlCLDJCQUEyQiw2Q0FJdEMsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxRQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDdkQ7Ozs7Ozs7Ozs7ZUFQa0IsMkJBQTJCOztXQWN4QyxrQkFBaUI7QUFDckIsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQzs7QUFFbkQsYUFDRTs7O1FBQ0U7O1lBQVksU0FBTSxnQkFBZ0I7VUFDaEM7OztZQUNHLGtCQUFrQjs7WUFDbkIsb0VBQVcsR0FBRyxFQUFDLGNBQWMsRUFBQyxZQUFZLEVBQUMsRUFBRSxHQUFHO1dBQzVDO1VBQ047QUFDRSxlQUFHLEVBQUMsb0JBQW9CO0FBQ3hCLDJCQUFlLEVBQUUsYUFBYSxDQUFDLFFBQVEsQUFBQztBQUN4Qyx5QkFBYSxFQUFFLGFBQWEsQ0FBQyxNQUFNLEFBQUM7QUFDcEMsc0JBQVUsRUFBRSxhQUFhLENBQUMsR0FBRyxBQUFDO0FBQzlCLHNDQUEwQixFQUFFLGtDQUFrQyxBQUFDO0FBQy9ELDBCQUFjLEVBQUUsYUFBYSxDQUFDLE9BQU8sQUFBQztBQUN0QyxtQ0FBdUIsRUFBRSxhQUFhLENBQUMsZ0JBQWdCLEFBQUM7QUFDeEQsNkJBQWlCLEVBQUUsYUFBYSxDQUFDLFVBQVUsQUFBQztBQUM1QyxxQkFBUyxFQUFFLGFBQWEsQUFBQztBQUN6QixvQkFBUSxFQUFFLGFBQWEsQUFBQztZQUN4QjtVQUVGOztjQUFLLFNBQVMsRUFBQyx5QkFBeUI7WUFDdEM7O2dCQUFRLFNBQVMsRUFBQyxLQUFLLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQUFBQzs7YUFFL0M7WUFDVDs7Z0JBQVEsU0FBUyxFQUFDLGlCQUFpQixFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDOzthQUV6RDtXQUNMO1NBQ0s7T0FDVCxDQUNOO0tBQ0g7OztXQUVjLDJCQUFXO0FBQ3hCLFVBQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQztBQUNqQyxhQUFPLEFBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxJQUFLLEVBQUUsQ0FBQztLQUM5RTs7O1dBRVMsc0JBQVM7O0FBRWpCLFVBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUMzQyxVQUFNLGlCQUE0RCxHQUM5RCxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDcEQsVUFBTSxnQkFBZ0IsR0FBRyw2Q0FDdkIsV0FBVyxFQUNYLGlCQUFpQixFQUNqQixrQ0FBa0MsQ0FDbkMsQ0FBQztBQUNGLFVBQUksZ0JBQWdCLENBQUMsWUFBWSxFQUFFO0FBQ2pDLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzNELGVBQU87T0FDUjtBQUNELCtCQUFVLGdCQUFnQixDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDOztBQUVyRCxVQUFNLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNyRCxVQUFJLGdCQUFnQixDQUFDLGNBQWMsRUFBRTtBQUNuQyxZQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztPQUNoRTtBQUNELFVBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0tBQy9COzs7V0FFVyx3QkFBUztBQUNuQixVQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3ZCOzs7U0FoRmtCLDJCQUEyQjtHQUNwQywwQkFBTSxTQUFTOztxQkFETiwyQkFBMkIiLCJmaWxlIjoiQ3JlYXRlQ29ubmVjdGlvblByb2ZpbGVGb3JtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBOdWNsaWRlTmV3Q29ubmVjdGlvblByb2ZpbGVJbml0aWFsRmllbGRzLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCxcbiAgTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25Qcm9maWxlLFxufSBmcm9tICcuL2Nvbm5lY3Rpb24tdHlwZXMnO1xuXG5pbXBvcnQgQXRvbUlucHV0IGZyb20gJy4uLy4uL3VpL2F0b20taW5wdXQnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBDb25uZWN0aW9uRGV0YWlsc0Zvcm0gZnJvbSAnLi9Db25uZWN0aW9uRGV0YWlsc0Zvcm0nO1xuaW1wb3J0IHt2YWxpZGF0ZUZvcm1JbnB1dHN9IGZyb20gJy4vZm9ybS12YWxpZGF0aW9uLXV0aWxzJztcblxudHlwZSBEZWZhdWx0UHJvcHMgPSB7fTtcbnR5cGUgUHJvcHMgPSB7XG4gIC8vIEEgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIFwiQ2FuY2VsXCIgYnV0dG9uIGlzIGNsaWNrZWQuXG4gIG9uQ2FuY2VsOiAoKSA9PiBtaXhlZDtcbiAgLy8gQSBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgXCJTYXZlXCIgYnV0dG9uIGlzIGNsaWNrZWQuIFRoZSBwcm9maWxlIHBhc3NlZFxuICAvLyB0byB0aGUgZnVuY3Rpb24gaXMgdGhlIHByb2ZpbGUgdGhhdCB0aGUgdXNlciBoYXMganVzdCBjcmVhdGVkLlxuICAvLyBUaGUgQ3JlYXRlQ29ubmVjdGlvblByb2ZpbGVGb3JtIHdpbGwgZG8gYmFzaWMgdmFsaWRhdGlvbiBvbiB0aGUgaW5wdXRzOiBJdFxuICAvLyBjaGVja3MgdGhhdCB0aGUgZmllbGRzIGFyZSBub24tZW1wdHkgYmVmb3JlIGNhbGxpbmcgdGhpcyBmdW5jdGlvbi5cbiAgb25TYXZlOiAocHJvZmlsZTogTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25Qcm9maWxlKSA9PiBtaXhlZDtcbiAgLy8gVGhlIGlucHV0cyB0byBwcmUtZmlsbCB0aGUgZm9ybSB3aXRoLlxuICBpbml0aWFsRm9ybUZpZWxkczogTnVjbGlkZU5ld0Nvbm5lY3Rpb25Qcm9maWxlSW5pdGlhbEZpZWxkcyxcbn07XG50eXBlIFN0YXRlID0ge307XG5cbmNvbnN0IFBST0ZJTEVfTkFNRV9MQUJFTCA9ICdQcm9maWxlIE5hbWUnO1xuY29uc3QgREVGQVVMVF9TRVJWRVJfQ09NTUFORF9QTEFDRUhPTERFUiA9ICcoREVGQVVMVCknO1xuXG5jb25zdCBlbXB0eUZ1bmN0aW9uID0gKCkgPT4ge307XG5cbi8qKlxuICogQSBmb3JtIHRoYXQgaXMgdXNlZCB0byBjcmVhdGUgYSBuZXcgY29ubmVjdGlvbiBwcm9maWxlLlxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDcmVhdGVDb25uZWN0aW9uUHJvZmlsZUZvcm1cbiAgICBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxEZWZhdWx0UHJvcHMsIFByb3BzLCBTdGF0ZT4ge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9ib3VuZENsaWNrU2F2ZSA9IHRoaXMuX2NsaWNrU2F2ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kQ2xpY2tDYW5jZWwgPSB0aGlzLl9jbGlja0NhbmNlbC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGU6IFRoaXMgZm9ybSBkaXNwbGF5cyBERUZBVUxUX1NFUlZFUl9DT01NQU5EX1BMQUNFSE9MREVSIGFzIHRoZSBwcmVmaWxsZWRcbiAgICogcmVtb3RlIHNlcnZlciBjb21tYW5kLiBUaGUgcmVtb3RlIHNlcnZlciBjb21tYW5kIHdpbGwgb25seSBiZSBzYXZlZCBpZiB0aGVcbiAgICogdXNlciBjaGFuZ2VzIGl0IGZyb20gdGhpcyBkZWZhdWx0LlxuICAgKi9cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgaW5pdGlhbEZpZWxkcyA9IHRoaXMucHJvcHMuaW5pdGlhbEZvcm1GaWVsZHM7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJtb2RhbCBmcm9tLXRvcFwiPlxuICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICB7UFJPRklMRV9OQU1FX0xBQkVMfTpcbiAgICAgICAgICAgIDxBdG9tSW5wdXQgcmVmPVwicHJvZmlsZS1uYW1lXCIgaW5pdGlhbFZhbHVlPVwiXCIgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8Q29ubmVjdGlvbkRldGFpbHNGb3JtXG4gICAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHNcIlxuICAgICAgICAgICAgaW5pdGlhbFVzZXJuYW1lPXtpbml0aWFsRmllbGRzLnVzZXJuYW1lfVxuICAgICAgICAgICAgaW5pdGlhbFNlcnZlcj17aW5pdGlhbEZpZWxkcy5zZXJ2ZXJ9XG4gICAgICAgICAgICBpbml0aWFsQ3dkPXtpbml0aWFsRmllbGRzLmN3ZH1cbiAgICAgICAgICAgIGluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kPXtERUZBVUxUX1NFUlZFUl9DT01NQU5EX1BMQUNFSE9MREVSfVxuICAgICAgICAgICAgaW5pdGlhbFNzaFBvcnQ9e2luaXRpYWxGaWVsZHMuc3NoUG9ydH1cbiAgICAgICAgICAgIGluaXRpYWxQYXRoVG9Qcml2YXRlS2V5PXtpbml0aWFsRmllbGRzLnBhdGhUb1ByaXZhdGVLZXl9XG4gICAgICAgICAgICBpbml0aWFsQXV0aE1ldGhvZD17aW5pdGlhbEZpZWxkcy5hdXRoTWV0aG9kfVxuICAgICAgICAgICAgb25Db25maXJtPXtlbXB0eUZ1bmN0aW9ufVxuICAgICAgICAgICAgb25DYW5jZWw9e2VtcHR5RnVuY3Rpb259XG4gICAgICAgICAgLz5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2sgbnVjbGlkZS1vay1jYW5jZWxcIj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fYm91bmRDbGlja0NhbmNlbH0+XG4gICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX2JvdW5kQ2xpY2tTYXZlfT5cbiAgICAgICAgICAgICAgU2F2ZVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfZ2V0UHJvZmlsZU5hbWUoKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaWVsZE5hbWUgPSAncHJvZmlsZS1uYW1lJztcbiAgICByZXR1cm4gKHRoaXMucmVmc1tmaWVsZE5hbWVdICYmIHRoaXMucmVmc1tmaWVsZE5hbWVdLmdldFRleHQoKS50cmltKCkpIHx8ICcnO1xuICB9XG5cbiAgX2NsaWNrU2F2ZSgpOiB2b2lkIHtcbiAgICAvLyBWYWxpZGF0ZSB0aGUgZm9ybSBpbnB1dHMuXG4gICAgY29uc3QgcHJvZmlsZU5hbWUgPSB0aGlzLl9nZXRQcm9maWxlTmFtZSgpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25EZXRhaWxzOiBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCA9XG4gICAgICAgIHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzJ10uZ2V0Rm9ybUZpZWxkcygpO1xuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0ZUZvcm1JbnB1dHMoXG4gICAgICBwcm9maWxlTmFtZSxcbiAgICAgIGNvbm5lY3Rpb25EZXRhaWxzLFxuICAgICAgREVGQVVMVF9TRVJWRVJfQ09NTUFORF9QTEFDRUhPTERFUixcbiAgICApO1xuICAgIGlmICh2YWxpZGF0aW9uUmVzdWx0LmVycm9yTWVzc2FnZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKHZhbGlkYXRpb25SZXN1bHQuZXJyb3JNZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW52YXJpYW50KHZhbGlkYXRpb25SZXN1bHQudmFsaWRhdGVkUHJvZmlsZSAhPSBudWxsKTtcbiAgICAvLyBTYXZlIHRoZSB2YWxpZGF0ZWQgcHJvZmlsZSwgYW5kIHNob3cgYW55IHdhcm5pbmcgbWVzc2FnZXMuXG4gICAgY29uc3QgbmV3UHJvZmlsZSA9IHZhbGlkYXRpb25SZXN1bHQudmFsaWRhdGVkUHJvZmlsZTtcbiAgICBpZiAodmFsaWRhdGlvblJlc3VsdC53YXJuaW5nTWVzc2FnZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcodmFsaWRhdGlvblJlc3VsdC53YXJuaW5nTWVzc2FnZSk7XG4gICAgfVxuICAgIHRoaXMucHJvcHMub25TYXZlKG5ld1Byb2ZpbGUpO1xuICB9XG5cbiAgX2NsaWNrQ2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgfVxufVxuXG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==