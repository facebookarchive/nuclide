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

var _nuclideUiAtomInput;

function _load_nuclideUiAtomInput() {
  return _nuclideUiAtomInput = require('../../nuclide-ui/AtomInput');
}

var _LaunchProcessInfo;

function _load_LaunchProcessInfo() {
  return _LaunchProcessInfo = require('./LaunchProcessInfo');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideUiDropdown;

function _load_nuclideUiDropdown() {
  return _nuclideUiDropdown = require('../../nuclide-ui/Dropdown');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../nuclide-ui/Button');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _commonsAtomConsumeFirstProvider;

function _load_commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var LaunchUiComponent = (function (_React$Component) {
  _inherits(LaunchUiComponent, _React$Component);

  function LaunchUiComponent(props) {
    _classCallCheck(this, LaunchUiComponent);

    _get(Object.getPrototypeOf(LaunchUiComponent.prototype), 'constructor', this).call(this, props);
    this._getActiveFilePath = this._getActiveFilePath.bind(this);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleLaunchButtonClick = this._handleLaunchButtonClick.bind(this);
    this._handlePathsDropdownChange = this._handlePathsDropdownChange.bind(this);
    this.state = {
      pathsDropdownIndex: 0,
      pathMenuItems: this._getPathMenuItems()
    };
  }

  _createClass(LaunchUiComponent, [{
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
            value: this.state.pathsDropdownIndex
          })
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'label',
          null,
          'Command: '
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
          ref: 'scriptPath',
          tabIndex: '11',
          placeholderText: '/path/to/my/script.php arg1 arg2',
          initialValue: this._getActiveFilePath()
        }),
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
              onClick: this._handleLaunchButtonClick },
            'Launch'
          )
        )
      );
    }
  }, {
    key: '_getPathMenuItems',
    value: function _getPathMenuItems() {
      var hostname = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getHostname(this.props.targetUri);
      var connections = (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteConnection.getByHostname(hostname);
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
        pathsDropdownIndex: newIndex,
        pathMenuItems: this._getPathMenuItems()
      });
    }
  }, {
    key: '_handleLaunchButtonClick',
    value: function _handleLaunchButtonClick() {
      var scriptPath = this.refs.scriptPath.getText().trim();
      var processInfo = new (_LaunchProcessInfo || _load_LaunchProcessInfo()).LaunchProcessInfo(this.props.targetUri, scriptPath);
      (0, (_commonsAtomConsumeFirstProvider || _load_commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote').then(function (debuggerService) {
        return debuggerService.startDebugging(processInfo);
      });
      this._showDebuggerPanel();
      this._handleCancelButtonClick();
    }
  }, {
    key: '_getActiveFilePath',
    value: function _getActiveFilePath() {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor != null) {
        var fileUri = editor.getPath();
        if (fileUri != null && this._isValidScriptUri(fileUri)) {
          return (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(fileUri);
        }
      }
      return '';
    }
  }, {
    key: '_isValidScriptUri',
    value: function _isValidScriptUri(uri) {
      if (!(_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isRemote(uri)) {
        return false;
      }
      var scriptPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(uri);
      return scriptPath.endsWith('.php') || scriptPath.endsWith('.hh');
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

  return LaunchUiComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.LaunchUiComponent = LaunchUiComponent;