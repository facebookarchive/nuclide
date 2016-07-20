Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _AttachProcessInfo2;

function _AttachProcessInfo() {
  return _AttachProcessInfo2 = require('./AttachProcessInfo');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibDropdown2;

function _nuclideUiLibDropdown() {
  return _nuclideUiLibDropdown2 = require('../../nuclide-ui/lib/Dropdown');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _commonsAtomConsumeFirstProvider2;

function _commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider2 = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var AttachUiComponent = (function (_React$Component) {
  _inherits(AttachUiComponent, _React$Component);

  function AttachUiComponent(props) {
    _classCallCheck(this, AttachUiComponent);

    _get(Object.getPrototypeOf(AttachUiComponent.prototype), 'constructor', this).call(this, props);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);
    this._handlePathsDropdownChange = this._handlePathsDropdownChange.bind(this);
    this.state = {
      selectedPathIndex: 0,
      pathMenuItems: this._getPathMenuItems()
    };
  }

  _createClass(AttachUiComponent, [{
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'block' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-php-launch-attach-ui-select-project' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'Selected Project Directory: '
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibDropdown2 || _nuclideUiLibDropdown()).Dropdown, {
            className: 'inline-block nuclide-debugger-atom-connection-box',
            options: this.state.pathMenuItems,
            onChange: this._handlePathsDropdownChange,
            value: this.state.selectedPathIndex
          })
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'padded text-right' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
            { onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
            {
              buttonType: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonTypes.PRIMARY,
              onClick: this._handleAttachButtonClick },
            'Attach'
          )
        )
      );
    }
  }, {
    key: '_getPathMenuItems',
    value: function _getPathMenuItems() {
      var connections = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).RemoteConnection.getByHostname((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getHostname(this.props.targetUri));
      return connections.map(function (connection, index) {
        var pathToProject = connection.getPathForInitialWorkingDirectory();
        return {
          label: pathToProject,
          value: index
        };
      });
    }
  }, {
    key: '_handlePathsDropdownChange',
    value: function _handlePathsDropdownChange(newIndex) {
      this.setState({
        selectedPathIndex: newIndex,
        pathMenuItems: this._getPathMenuItems()
      });
    }
  }, {
    key: '_handleAttachButtonClick',
    value: function _handleAttachButtonClick() {
      // Start a debug session with the user-supplied information.

      var _default$parseRemoteUri = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.parseRemoteUri(this.props.targetUri);

      var hostname = _default$parseRemoteUri.hostname;

      var selectedPath = this.state.pathMenuItems[this.state.selectedPathIndex].label;
      var processInfo = new (_AttachProcessInfo2 || _AttachProcessInfo()).AttachProcessInfo((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.createRemoteUri(hostname, selectedPath));
      (0, (_commonsAtomConsumeFirstProvider2 || _commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote').then(function (debuggerService) {
        return debuggerService.startDebugging(processInfo);
      });
      this._showDebuggerPanel();
      this._handleCancelButtonClick();
    }
  }, {
    key: '_showDebuggerPanel',
    value: function _showDebuggerPanel() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
    }
  }, {
    key: '_handleCancelButtonClick',
    value: function _handleCancelButtonClick() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
    }
  }]);

  return AttachUiComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.AttachUiComponent = AttachUiComponent;