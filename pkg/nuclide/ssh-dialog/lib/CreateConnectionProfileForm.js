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
      var root = _reactForAtom.React.findDOMNode(this);
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
                { className: 'btn', onClick: this._boundClickCancel },
                'Cancel'
              ),
              _reactForAtom.React.createElement(
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
})(_reactForAtom.React.Component);

exports['default'] = CreateConnectionProfileForm;
module.exports = exports['default'];

// A function called when the "Cancel" button is clicked.

// A function called when the "Save" button is clicked. The profile passed
// to the function is the profile that the user has just created.
// The CreateConnectionProfileForm will do basic validation on the inputs: It
// checks that the fields are non-empty before calling this function.

// The inputs to pre-fill the form with.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJCQWlCc0IscUJBQXFCOzs7OzRCQUN2QixnQkFBZ0I7O3NCQUNkLFFBQVE7Ozs7b0JBQ0ksTUFBTTs7cUNBQ04seUJBQXlCOzs7O21DQUMxQix5QkFBeUI7O0FBYzFELElBQU0sa0JBQWtCLEdBQUcsY0FBYyxDQUFDO0FBQzFDLElBQU0sa0NBQWtDLEdBQUcsV0FBVyxDQUFDOztBQUV2RCxJQUFNLGFBQWEsR0FBRyxTQUFoQixhQUFhLEdBQVMsRUFBRSxDQUFDOzs7Ozs7O0lBTVYsMkJBQTJCO1lBQTNCLDJCQUEyQjs7QUFJbkMsV0FKUSwyQkFBMkIsQ0FJbEMsS0FBWSxFQUFFOzBCQUpQLDJCQUEyQjs7QUFLNUMsK0JBTGlCLDJCQUEyQiw2Q0FLdEMsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxRQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsUUFBSSxDQUFDLFdBQVcsR0FBRywrQkFBeUIsQ0FBQztHQUM5Qzs7OztlQVRrQiwyQkFBMkI7O1dBVzdCLDZCQUFTO0FBQ3hCLFVBQU0sSUFBSSxHQUFHLG9CQUFNLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQyxVQUFJLENBQUMsV0FBVyxDQUFDLEdBQUc7O0FBRWxCLFVBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQzs7QUFFN0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FDL0QsQ0FBQztLQUNIOzs7V0FF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Q29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIE51Y2xpZGVOZXdDb25uZWN0aW9uUHJvZmlsZUluaXRpYWxGaWVsZHMsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUsXG59IGZyb20gJy4vY29ubmVjdGlvbi10eXBlcyc7XG5cbmltcG9ydCBBdG9tSW5wdXQgZnJvbSAnLi4vLi4vdWkvYXRvbS1pbnB1dCc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IENvbm5lY3Rpb25EZXRhaWxzRm9ybSBmcm9tICcuL0Nvbm5lY3Rpb25EZXRhaWxzRm9ybSc7XG5pbXBvcnQge3ZhbGlkYXRlRm9ybUlucHV0c30gZnJvbSAnLi9mb3JtLXZhbGlkYXRpb24tdXRpbHMnO1xuXG50eXBlIFByb3BzID0ge1xuICAvLyBBIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBcIkNhbmNlbFwiIGJ1dHRvbiBpcyBjbGlja2VkLlxuICBvbkNhbmNlbDogKCkgPT4gbWl4ZWQ7XG4gIC8vIEEgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIFwiU2F2ZVwiIGJ1dHRvbiBpcyBjbGlja2VkLiBUaGUgcHJvZmlsZSBwYXNzZWRcbiAgLy8gdG8gdGhlIGZ1bmN0aW9uIGlzIHRoZSBwcm9maWxlIHRoYXQgdGhlIHVzZXIgaGFzIGp1c3QgY3JlYXRlZC5cbiAgLy8gVGhlIENyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybSB3aWxsIGRvIGJhc2ljIHZhbGlkYXRpb24gb24gdGhlIGlucHV0czogSXRcbiAgLy8gY2hlY2tzIHRoYXQgdGhlIGZpZWxkcyBhcmUgbm9uLWVtcHR5IGJlZm9yZSBjYWxsaW5nIHRoaXMgZnVuY3Rpb24uXG4gIG9uU2F2ZTogKHByb2ZpbGU6IE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUHJvZmlsZSkgPT4gbWl4ZWQ7XG4gIC8vIFRoZSBpbnB1dHMgdG8gcHJlLWZpbGwgdGhlIGZvcm0gd2l0aC5cbiAgaW5pdGlhbEZvcm1GaWVsZHM6IE51Y2xpZGVOZXdDb25uZWN0aW9uUHJvZmlsZUluaXRpYWxGaWVsZHMsXG59O1xuXG5jb25zdCBQUk9GSUxFX05BTUVfTEFCRUwgPSAnUHJvZmlsZSBOYW1lJztcbmNvbnN0IERFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVIgPSAnKERFRkFVTFQpJztcblxuY29uc3QgZW1wdHlGdW5jdGlvbiA9ICgpID0+IHt9O1xuXG4vKipcbiAqIEEgZm9ybSB0aGF0IGlzIHVzZWQgdG8gY3JlYXRlIGEgbmV3IGNvbm5lY3Rpb24gcHJvZmlsZS5cbiAqL1xuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3JlYXRlQ29ubmVjdGlvblByb2ZpbGVGb3JtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzLCB2b2lkPiB7XG5cbiAgZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2JvdW5kQ2xpY2tTYXZlID0gdGhpcy5fY2xpY2tTYXZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRDbGlja0NhbmNlbCA9IHRoaXMuX2NsaWNrQ2FuY2VsLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCByb290ID0gUmVhY3QuZmluZERPTU5vZGUodGhpcyk7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoXG4gICAgICAvLyBIaXR0aW5nIGVudGVyIHdoZW4gdGhpcyBwYW5lbCBoYXMgZm9jdXMgc2hvdWxkIGNvbmZpcm0gdGhlIGRpYWxvZy5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHJvb3QsICdjb3JlOmNvbmZpcm0nLCB0aGlzLl9ib3VuZENsaWNrU2F2ZSksXG4gICAgICAvLyBIaXR0aW5nIGVzY2FwZSB3aGVuIHRoaXMgcGFuZWwgaGFzIGZvY3VzIHNob3VsZCBjYW5jZWwgdGhlIGRpYWxvZy5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHJvb3QsICdjb3JlOmNhbmNlbCcsIHRoaXMuX2JvdW5kQ2xpY2tDYW5jZWwpXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vdGU6IFRoaXMgZm9ybSBkaXNwbGF5cyBERUZBVUxUX1NFUlZFUl9DT01NQU5EX1BMQUNFSE9MREVSIGFzIHRoZSBwcmVmaWxsZWRcbiAgICogcmVtb3RlIHNlcnZlciBjb21tYW5kLiBUaGUgcmVtb3RlIHNlcnZlciBjb21tYW5kIHdpbGwgb25seSBiZSBzYXZlZCBpZiB0aGVcbiAgICogdXNlciBjaGFuZ2VzIGl0IGZyb20gdGhpcyBkZWZhdWx0LlxuICAgKi9cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgaW5pdGlhbEZpZWxkcyA9IHRoaXMucHJvcHMuaW5pdGlhbEZvcm1GaWVsZHM7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJtb2RhbCBmcm9tLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgPGxhYmVsPntQUk9GSUxFX05BTUVfTEFCRUx9OjwvbGFiZWw+XG4gICAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICAgIGluaXRpYWxWYWx1ZT1cIlwiXG4gICAgICAgICAgICAgIHJlZj1cInByb2ZpbGUtbmFtZVwiXG4gICAgICAgICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8Q29ubmVjdGlvbkRldGFpbHNGb3JtXG4gICAgICAgICAgICByZWY9XCJjb25uZWN0aW9uLWRldGFpbHNcIlxuICAgICAgICAgICAgaW5pdGlhbFVzZXJuYW1lPXtpbml0aWFsRmllbGRzLnVzZXJuYW1lfVxuICAgICAgICAgICAgaW5pdGlhbFNlcnZlcj17aW5pdGlhbEZpZWxkcy5zZXJ2ZXJ9XG4gICAgICAgICAgICBpbml0aWFsQ3dkPXtpbml0aWFsRmllbGRzLmN3ZH1cbiAgICAgICAgICAgIGluaXRpYWxSZW1vdGVTZXJ2ZXJDb21tYW5kPXtERUZBVUxUX1NFUlZFUl9DT01NQU5EX1BMQUNFSE9MREVSfVxuICAgICAgICAgICAgaW5pdGlhbFNzaFBvcnQ9e2luaXRpYWxGaWVsZHMuc3NoUG9ydH1cbiAgICAgICAgICAgIGluaXRpYWxQYXRoVG9Qcml2YXRlS2V5PXtpbml0aWFsRmllbGRzLnBhdGhUb1ByaXZhdGVLZXl9XG4gICAgICAgICAgICBpbml0aWFsQXV0aE1ldGhvZD17aW5pdGlhbEZpZWxkcy5hdXRoTWV0aG9kfVxuICAgICAgICAgICAgb25Db25maXJtPXtlbXB0eUZ1bmN0aW9ufVxuICAgICAgICAgICAgb25DYW5jZWw9e2VtcHR5RnVuY3Rpb259XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZCB0ZXh0LXJpZ2h0XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0blwiIG9uQ2xpY2s9e3RoaXMuX2JvdW5kQ2xpY2tDYW5jZWx9PlxuICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLl9ib3VuZENsaWNrU2F2ZX0+XG4gICAgICAgICAgICAgICAgU2F2ZVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICApO1xuICB9XG5cbiAgX2dldFByb2ZpbGVOYW1lKCk6IHN0cmluZyB7XG4gICAgY29uc3QgZmllbGROYW1lID0gJ3Byb2ZpbGUtbmFtZSc7XG4gICAgcmV0dXJuICh0aGlzLnJlZnNbZmllbGROYW1lXSAmJiB0aGlzLnJlZnNbZmllbGROYW1lXS5nZXRUZXh0KCkudHJpbSgpKSB8fCAnJztcbiAgfVxuXG4gIF9jbGlja1NhdmUoKTogdm9pZCB7XG4gICAgLy8gVmFsaWRhdGUgdGhlIGZvcm0gaW5wdXRzLlxuICAgIGNvbnN0IHByb2ZpbGVOYW1lID0gdGhpcy5fZ2V0UHJvZmlsZU5hbWUoKTtcbiAgICBjb25zdCBjb25uZWN0aW9uRGV0YWlsczogTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25QYXJhbXNXaXRoUGFzc3dvcmQgPVxuICAgICAgICB0aGlzLnJlZnNbJ2Nvbm5lY3Rpb24tZGV0YWlscyddLmdldEZvcm1GaWVsZHMoKTtcbiAgICBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVGb3JtSW5wdXRzKFxuICAgICAgcHJvZmlsZU5hbWUsXG4gICAgICBjb25uZWN0aW9uRGV0YWlscyxcbiAgICAgIERFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVIsXG4gICAgKTtcbiAgICBpZiAodmFsaWRhdGlvblJlc3VsdC5lcnJvck1lc3NhZ2UpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcih2YWxpZGF0aW9uUmVzdWx0LmVycm9yTWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGludmFyaWFudCh2YWxpZGF0aW9uUmVzdWx0LnZhbGlkYXRlZFByb2ZpbGUgIT0gbnVsbCk7XG4gICAgLy8gU2F2ZSB0aGUgdmFsaWRhdGVkIHByb2ZpbGUsIGFuZCBzaG93IGFueSB3YXJuaW5nIG1lc3NhZ2VzLlxuICAgIGNvbnN0IG5ld1Byb2ZpbGUgPSB2YWxpZGF0aW9uUmVzdWx0LnZhbGlkYXRlZFByb2ZpbGU7XG4gICAgaWYgKHZhbGlkYXRpb25SZXN1bHQud2FybmluZ01lc3NhZ2UpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKHZhbGlkYXRpb25SZXN1bHQud2FybmluZ01lc3NhZ2UpO1xuICAgIH1cbiAgICB0aGlzLnByb3BzLm9uU2F2ZShuZXdQcm9maWxlKTtcbiAgfVxuXG4gIF9jbGlja0NhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnByb3BzLm9uQ2FuY2VsKCk7XG4gIH1cbn1cblxuLyogZXNsaW50LWVuYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG4iXX0=