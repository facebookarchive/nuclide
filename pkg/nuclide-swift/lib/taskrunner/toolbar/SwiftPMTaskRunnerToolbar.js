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

var _nuclideUiAtomInput2;

function _nuclideUiAtomInput() {
  return _nuclideUiAtomInput2 = require('../../../../nuclide-ui/AtomInput');
}

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../../../nuclide-ui/Button');
}

var _SwiftPMTaskRunnerTaskMetadata2;

function _SwiftPMTaskRunnerTaskMetadata() {
  return _SwiftPMTaskRunnerTaskMetadata2 = require('../SwiftPMTaskRunnerTaskMetadata');
}

var _SwiftPMBuildSettingsModal2;

function _SwiftPMBuildSettingsModal() {
  return _SwiftPMBuildSettingsModal2 = _interopRequireDefault(require('./SwiftPMBuildSettingsModal'));
}

var _SwiftPMTestSettingsModal2;

function _SwiftPMTestSettingsModal() {
  return _SwiftPMTestSettingsModal2 = _interopRequireDefault(require('./SwiftPMTestSettingsModal'));
}

var SwiftPMTaskRunnerToolbar = (function (_React$Component) {
  _inherits(SwiftPMTaskRunnerToolbar, _React$Component);

  function SwiftPMTaskRunnerToolbar(props) {
    _classCallCheck(this, SwiftPMTaskRunnerToolbar);

    _get(Object.getPrototypeOf(SwiftPMTaskRunnerToolbar.prototype), 'constructor', this).call(this, props);
    this.state = { settingsVisible: false };
    this._onChdirChange = this._onChdirChange.bind(this);
  }

  _createClass(SwiftPMTaskRunnerToolbar, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var settingsElements = [];
      switch (this.props.activeTaskType) {
        case (_SwiftPMTaskRunnerTaskMetadata2 || _SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerBuildTaskMetadata.type:
          settingsElements.push((_reactForAtom2 || _reactForAtom()).React.createElement((_SwiftPMBuildSettingsModal2 || _SwiftPMBuildSettingsModal()).default, {
            configuration: this.props.store.getConfiguration(),
            Xcc: this.props.store.getXcc(),
            Xlinker: this.props.store.getXlinker(),
            Xswiftc: this.props.store.getXswiftc(),
            buildPath: this.props.store.getBuildPath(),
            onDismiss: function () {
              return _this._hideSettings();
            },
            onSave: function (configuration, Xcc, Xlinker, Xswiftc, buildPath) {
              return _this._saveBuildSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath);
            }
          }));
          break;
        case (_SwiftPMTaskRunnerTaskMetadata2 || _SwiftPMTaskRunnerTaskMetadata()).SwiftPMTaskRunnerTestTaskMetadata.type:
          settingsElements.push((_reactForAtom2 || _reactForAtom()).React.createElement((_SwiftPMTestSettingsModal2 || _SwiftPMTestSettingsModal()).default, {
            buildPath: this.props.store.getTestBuildPath(),
            onDismiss: function () {
              return _this._hideSettings();
            },
            onSave: function (buildPath) {
              return _this._saveTestSettings(buildPath);
            }
          }));
          break;
        default:
          if (this.props.activeTaskType) {
            throw new Error('Unrecognized task type: ' + this.props.activeTaskType);
          }
          break;
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-swift-task-runner-toolbar' },
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
          className: 'inline-block',
          size: 'sm',
          initialValue: this.props.store.getChdir(),
          onDidChange: function (chdir) {
            return _this._onChdirChange(chdir);
          },
          placeholderText: 'Path to Swift package',
          width: 400
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiButton2 || _nuclideUiButton()).Button, {
          className: 'nuclide-swift-settings icon icon-gear',
          size: (_nuclideUiButton2 || _nuclideUiButton()).ButtonSizes.SMALL,
          disabled: false,
          onClick: function () {
            return _this._showSettings();
          }
        }),
        this.state.settingsVisible ? settingsElements : null
      );
    }
  }, {
    key: '_onChdirChange',
    value: function _onChdirChange(value) {
      this.props.actions.updateChdir(value);
    }
  }, {
    key: '_showSettings',
    value: function _showSettings() {
      this.setState({ settingsVisible: true });
    }
  }, {
    key: '_hideSettings',
    value: function _hideSettings() {
      this.setState({ settingsVisible: false });
    }
  }, {
    key: '_saveBuildSettings',
    value: function _saveBuildSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath) {
      this.props.actions.updateBuildSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath);
      this._hideSettings();
    }
  }, {
    key: '_saveTestSettings',
    value: function _saveTestSettings(buildPath) {
      this.props.actions.updateTestSettings(buildPath);
      this._hideSettings();
    }
  }]);

  return SwiftPMTaskRunnerToolbar;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = SwiftPMTaskRunnerToolbar;
module.exports = exports.default;