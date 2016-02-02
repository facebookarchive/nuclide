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
      var root = _reactForAtom.ReactDOM.findDOMNode(this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNyZWF0ZUNvbm5lY3Rpb25Qcm9maWxlRm9ybS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzJCQWlCc0IscUJBQXFCOzs7OzRCQUlwQyxnQkFBZ0I7O3NCQUNELFFBQVE7Ozs7b0JBQ0ksTUFBTTs7cUNBQ04seUJBQXlCOzs7O21DQUMxQix5QkFBeUI7O0FBYzFELElBQU0sa0JBQWtCLEdBQUcsY0FBYyxDQUFDO0FBQzFDLElBQU0sa0NBQWtDLEdBQUcsV0FBVyxDQUFDOztBQUV2RCxJQUFNLGFBQWEsR0FBRyxTQUFoQixhQUFhLEdBQVMsRUFBRSxDQUFDOzs7Ozs7O0lBTVYsMkJBQTJCO1lBQTNCLDJCQUEyQjs7QUFJbkMsV0FKUSwyQkFBMkIsQ0FJbEMsS0FBWSxFQUFFOzBCQUpQLDJCQUEyQjs7QUFLNUMsK0JBTGlCLDJCQUEyQiw2Q0FLdEMsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRCxRQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsUUFBSSxDQUFDLFdBQVcsR0FBRywrQkFBeUIsQ0FBQztHQUM5Qzs7OztlQVRrQiwyQkFBMkI7O1dBVzdCLDZCQUFTO0FBQ3hCLFVBQU0sSUFBSSxHQUFHLHVCQUFTLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4QyxVQUFJLENBQUMsV0FBVyxDQUFDLEdBQUc7O0FBRWxCLFVBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQzs7QUFFN0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FDL0QsQ0FBQztLQUNIOzs7V0FF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Q29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIE51Y2xpZGVOZXdDb25uZWN0aW9uUHJvZmlsZUluaXRpYWxGaWVsZHMsXG4gIE51Y2xpZGVSZW1vdGVDb25uZWN0aW9uUGFyYW1zV2l0aFBhc3N3b3JkLFxuICBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblByb2ZpbGUsXG59IGZyb20gJy4vY29ubmVjdGlvbi10eXBlcyc7XG5cbmltcG9ydCBBdG9tSW5wdXQgZnJvbSAnLi4vLi4vdWkvYXRvbS1pbnB1dCc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgQ29ubmVjdGlvbkRldGFpbHNGb3JtIGZyb20gJy4vQ29ubmVjdGlvbkRldGFpbHNGb3JtJztcbmltcG9ydCB7dmFsaWRhdGVGb3JtSW5wdXRzfSBmcm9tICcuL2Zvcm0tdmFsaWRhdGlvbi11dGlscyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIC8vIEEgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIFwiQ2FuY2VsXCIgYnV0dG9uIGlzIGNsaWNrZWQuXG4gIG9uQ2FuY2VsOiAoKSA9PiBtaXhlZDtcbiAgLy8gQSBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgXCJTYXZlXCIgYnV0dG9uIGlzIGNsaWNrZWQuIFRoZSBwcm9maWxlIHBhc3NlZFxuICAvLyB0byB0aGUgZnVuY3Rpb24gaXMgdGhlIHByb2ZpbGUgdGhhdCB0aGUgdXNlciBoYXMganVzdCBjcmVhdGVkLlxuICAvLyBUaGUgQ3JlYXRlQ29ubmVjdGlvblByb2ZpbGVGb3JtIHdpbGwgZG8gYmFzaWMgdmFsaWRhdGlvbiBvbiB0aGUgaW5wdXRzOiBJdFxuICAvLyBjaGVja3MgdGhhdCB0aGUgZmllbGRzIGFyZSBub24tZW1wdHkgYmVmb3JlIGNhbGxpbmcgdGhpcyBmdW5jdGlvbi5cbiAgb25TYXZlOiAocHJvZmlsZTogTnVjbGlkZVJlbW90ZUNvbm5lY3Rpb25Qcm9maWxlKSA9PiBtaXhlZDtcbiAgLy8gVGhlIGlucHV0cyB0byBwcmUtZmlsbCB0aGUgZm9ybSB3aXRoLlxuICBpbml0aWFsRm9ybUZpZWxkczogTnVjbGlkZU5ld0Nvbm5lY3Rpb25Qcm9maWxlSW5pdGlhbEZpZWxkcyxcbn07XG5cbmNvbnN0IFBST0ZJTEVfTkFNRV9MQUJFTCA9ICdQcm9maWxlIE5hbWUnO1xuY29uc3QgREVGQVVMVF9TRVJWRVJfQ09NTUFORF9QTEFDRUhPTERFUiA9ICcoREVGQVVMVCknO1xuXG5jb25zdCBlbXB0eUZ1bmN0aW9uID0gKCkgPT4ge307XG5cbi8qKlxuICogQSBmb3JtIHRoYXQgaXMgdXNlZCB0byBjcmVhdGUgYSBuZXcgY29ubmVjdGlvbiBwcm9maWxlLlxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDcmVhdGVDb25uZWN0aW9uUHJvZmlsZUZvcm0gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcblxuICBkaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fYm91bmRDbGlja1NhdmUgPSB0aGlzLl9jbGlja1NhdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZENsaWNrQ2FuY2VsID0gdGhpcy5fY2xpY2tDYW5jZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3QgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChcbiAgICAgIC8vIEhpdHRpbmcgZW50ZXIgd2hlbiB0aGlzIHBhbmVsIGhhcyBmb2N1cyBzaG91bGQgY29uZmlybSB0aGUgZGlhbG9nLlxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQocm9vdCwgJ2NvcmU6Y29uZmlybScsIHRoaXMuX2JvdW5kQ2xpY2tTYXZlKSxcbiAgICAgIC8vIEhpdHRpbmcgZXNjYXBlIHdoZW4gdGhpcyBwYW5lbCBoYXMgZm9jdXMgc2hvdWxkIGNhbmNlbCB0aGUgZGlhbG9nLlxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQocm9vdCwgJ2NvcmU6Y2FuY2VsJywgdGhpcy5fYm91bmRDbGlja0NhbmNlbClcbiAgICApO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICAvKipcbiAgICogTm90ZTogVGhpcyBmb3JtIGRpc3BsYXlzIERFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVIgYXMgdGhlIHByZWZpbGxlZFxuICAgKiByZW1vdGUgc2VydmVyIGNvbW1hbmQuIFRoZSByZW1vdGUgc2VydmVyIGNvbW1hbmQgd2lsbCBvbmx5IGJlIHNhdmVkIGlmIHRoZVxuICAgKiB1c2VyIGNoYW5nZXMgaXQgZnJvbSB0aGlzIGRlZmF1bHQuXG4gICAqL1xuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBpbml0aWFsRmllbGRzID0gdGhpcy5wcm9wcy5pbml0aWFsRm9ybUZpZWxkcztcblxuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS1wYW5lbCBjbGFzcz1cIm1vZGFsIGZyb20tdG9wXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XG4gICAgICAgICAgICA8bGFiZWw+e1BST0ZJTEVfTkFNRV9MQUJFTH06PC9sYWJlbD5cbiAgICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgICAgaW5pdGlhbFZhbHVlPVwiXCJcbiAgICAgICAgICAgICAgcmVmPVwicHJvZmlsZS1uYW1lXCJcbiAgICAgICAgICAgICAgdW5zdHlsZWQ9e3RydWV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxDb25uZWN0aW9uRGV0YWlsc0Zvcm1cbiAgICAgICAgICAgIHJlZj1cImNvbm5lY3Rpb24tZGV0YWlsc1wiXG4gICAgICAgICAgICBpbml0aWFsVXNlcm5hbWU9e2luaXRpYWxGaWVsZHMudXNlcm5hbWV9XG4gICAgICAgICAgICBpbml0aWFsU2VydmVyPXtpbml0aWFsRmllbGRzLnNlcnZlcn1cbiAgICAgICAgICAgIGluaXRpYWxDd2Q9e2luaXRpYWxGaWVsZHMuY3dkfVxuICAgICAgICAgICAgaW5pdGlhbFJlbW90ZVNlcnZlckNvbW1hbmQ9e0RFRkFVTFRfU0VSVkVSX0NPTU1BTkRfUExBQ0VIT0xERVJ9XG4gICAgICAgICAgICBpbml0aWFsU3NoUG9ydD17aW5pdGlhbEZpZWxkcy5zc2hQb3J0fVxuICAgICAgICAgICAgaW5pdGlhbFBhdGhUb1ByaXZhdGVLZXk9e2luaXRpYWxGaWVsZHMucGF0aFRvUHJpdmF0ZUtleX1cbiAgICAgICAgICAgIGluaXRpYWxBdXRoTWV0aG9kPXtpbml0aWFsRmllbGRzLmF1dGhNZXRob2R9XG4gICAgICAgICAgICBvbkNvbmZpcm09e2VtcHR5RnVuY3Rpb259XG4gICAgICAgICAgICBvbkNhbmNlbD17ZW1wdHlGdW5jdGlvbn1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFkZGVkIHRleHQtcmlnaHRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYnRuLWdyb3VwXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5fYm91bmRDbGlja0NhbmNlbH0+XG4gICAgICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX2JvdW5kQ2xpY2tTYXZlfT5cbiAgICAgICAgICAgICAgICBTYXZlXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hdG9tLXBhbmVsPlxuICAgICk7XG4gIH1cblxuICBfZ2V0UHJvZmlsZU5hbWUoKTogc3RyaW5nIHtcbiAgICBjb25zdCBmaWVsZE5hbWUgPSAncHJvZmlsZS1uYW1lJztcbiAgICByZXR1cm4gKHRoaXMucmVmc1tmaWVsZE5hbWVdICYmIHRoaXMucmVmc1tmaWVsZE5hbWVdLmdldFRleHQoKS50cmltKCkpIHx8ICcnO1xuICB9XG5cbiAgX2NsaWNrU2F2ZSgpOiB2b2lkIHtcbiAgICAvLyBWYWxpZGF0ZSB0aGUgZm9ybSBpbnB1dHMuXG4gICAgY29uc3QgcHJvZmlsZU5hbWUgPSB0aGlzLl9nZXRQcm9maWxlTmFtZSgpO1xuICAgIGNvbnN0IGNvbm5lY3Rpb25EZXRhaWxzOiBOdWNsaWRlUmVtb3RlQ29ubmVjdGlvblBhcmFtc1dpdGhQYXNzd29yZCA9XG4gICAgICAgIHRoaXMucmVmc1snY29ubmVjdGlvbi1kZXRhaWxzJ10uZ2V0Rm9ybUZpZWxkcygpO1xuICAgIGNvbnN0IHZhbGlkYXRpb25SZXN1bHQgPSB2YWxpZGF0ZUZvcm1JbnB1dHMoXG4gICAgICBwcm9maWxlTmFtZSxcbiAgICAgIGNvbm5lY3Rpb25EZXRhaWxzLFxuICAgICAgREVGQVVMVF9TRVJWRVJfQ09NTUFORF9QTEFDRUhPTERFUixcbiAgICApO1xuICAgIGlmICh2YWxpZGF0aW9uUmVzdWx0LmVycm9yTWVzc2FnZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKHZhbGlkYXRpb25SZXN1bHQuZXJyb3JNZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaW52YXJpYW50KHZhbGlkYXRpb25SZXN1bHQudmFsaWRhdGVkUHJvZmlsZSAhPSBudWxsKTtcbiAgICAvLyBTYXZlIHRoZSB2YWxpZGF0ZWQgcHJvZmlsZSwgYW5kIHNob3cgYW55IHdhcm5pbmcgbWVzc2FnZXMuXG4gICAgY29uc3QgbmV3UHJvZmlsZSA9IHZhbGlkYXRpb25SZXN1bHQudmFsaWRhdGVkUHJvZmlsZTtcbiAgICBpZiAodmFsaWRhdGlvblJlc3VsdC53YXJuaW5nTWVzc2FnZSkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcodmFsaWRhdGlvblJlc3VsdC53YXJuaW5nTWVzc2FnZSk7XG4gICAgfVxuICAgIHRoaXMucHJvcHMub25TYXZlKG5ld1Byb2ZpbGUpO1xuICB9XG5cbiAgX2NsaWNrQ2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgfVxufVxuXG4vKiBlc2xpbnQtZW5hYmxlIHJlYWN0L3Byb3AtdHlwZXMgKi9cbiJdfQ==