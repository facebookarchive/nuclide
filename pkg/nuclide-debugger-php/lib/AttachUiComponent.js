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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _AttachProcessInfo;

function _load_AttachProcessInfo() {
  return _AttachProcessInfo = require('./AttachProcessInfo');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideUiDropdown;

function _load_nuclideUiDropdown() {
  return _nuclideUiDropdown = require('../../nuclide-ui/Dropdown');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsAtomConsumeFirstProvider;

function _load_commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
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
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'block' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-debugger-php-launch-attach-ui-select-project' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'label',
            null,
            'Selected Project Directory: '
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiDropdown || _load_nuclideUiDropdown()).Dropdown, {
            className: 'inline-block nuclide-debugger-connection-box',
            options: this.state.pathMenuItems,
            onChange: this._handlePathsDropdownChange,
            value: this.state.selectedPathIndex
          })
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'padded text-right' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButton || _load_nuclideUiButton()).Button,
            { onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButton || _load_nuclideUiButton()).Button,
            {
              buttonType: (_nuclideUiButton || _load_nuclideUiButton()).ButtonTypes.PRIMARY,
              onClick: this._handleAttachButtonClick },
            'Attach'
          )
        )
      );
    }
  }, {
    key: '_getPathMenuItems',
    value: function _getPathMenuItems() {
      var connections = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getByHostname((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getHostname(this.props.targetUri));
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

      var _default$parseRemoteUri = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.parseRemoteUri(this.props.targetUri);

      var hostname = _default$parseRemoteUri.hostname;

      var selectedPath = this.state.pathMenuItems[this.state.selectedPathIndex].label;
      var processInfo = new (_AttachProcessInfo || _load_AttachProcessInfo()).AttachProcessInfo((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.createRemoteUri(hostname, selectedPath));
      (0, (_commonsAtomConsumeFirstProvider || _load_commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote').then(function (debuggerService) {
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
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.AttachUiComponent = AttachUiComponent;