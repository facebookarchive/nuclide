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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibAtomInput2;

function _nuclideUiLibAtomInput() {
  return _nuclideUiLibAtomInput2 = require('../../nuclide-ui/lib/AtomInput');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibButtonGroup2;

function _nuclideUiLibButtonGroup() {
  return _nuclideUiLibButtonGroup2 = require('../../nuclide-ui/lib/ButtonGroup');
}

var LaunchUIComponent = (function (_React$Component) {
  _inherits(LaunchUIComponent, _React$Component);

  function LaunchUIComponent(props) {
    _classCallCheck(this, LaunchUIComponent);

    _get(Object.getPrototypeOf(LaunchUIComponent.prototype), 'constructor', this).call(this, props);
    this._handleLaunchClick = this._handleLaunchClick.bind(this);
    this._cancelClick = this._cancelClick.bind(this);
  }

  _createClass(LaunchUIComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var launchExecutableInput = this.refs.launchExecutable;
      if (launchExecutableInput != null) {
        launchExecutableInput.focus();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      // TODO: smart fill the working directory textbox.
      // TODO: make tab stop between textbox work.
      // Reserve tabIndex [1~10] to header portion of the UI so we start from "11" here.
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'block' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'label',
          null,
          'Executable: '
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
          ref: 'launchExecutable',
          tabIndex: '11',
          placeholderText: 'Input the executable path you want to launch',
          onConfirm: this._handleLaunchClick
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'label',
          null,
          'Arguments: '
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
          ref: 'launchArguments',
          tabIndex: '12',
          placeholderText: 'Arguments to the executable',
          onConfirm: this._handleLaunchClick
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'label',
          null,
          'Working directory: '
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibAtomInput2 || _nuclideUiLibAtomInput()).AtomInput, {
          ref: 'launchWorkingDirectory',
          tabIndex: '13',
          placeholderText: 'Working directory for the launched executable',
          onConfirm: this._handleLaunchClick
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'row-reverse' } },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_nuclideUiLibButtonGroup2 || _nuclideUiLibButtonGroup()).ButtonGroup,
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
              {
                tabIndex: '15',
                onClick: this._cancelClick },
              'Cancel'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiLibButton2 || _nuclideUiLibButton()).Button,
              {
                buttonType: (_nuclideUiLibButton2 || _nuclideUiLibButton()).ButtonTypes.PRIMARY,
                tabIndex: '14',
                onClick: this._handleLaunchClick },
              'Launch'
            )
          )
        )
      );
    }
  }, {
    key: '_cancelClick',
    value: function _cancelClick() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
    }
  }, {
    key: '_handleLaunchClick',
    value: function _handleLaunchClick() {
      // TODO: perform some validation for the input.
      var launchExecutable = this.refs.launchExecutable.getText().trim();
      var launchArguments = this.refs.launchArguments.getText().trim();
      var launchWorkingDirectory = this.refs.launchWorkingDirectory.getText().trim();
      // TODO: fill other fields from UI.
      var launchTarget = {
        executablePath: launchExecutable,
        arguments: launchArguments,
        environmentVariables: [],
        workingDirectory: launchWorkingDirectory
      };
      // Fire and forget.
      this.props.actions.launchDebugger(launchTarget);
      this.props.actions.showDebuggerPanel();
      this.props.actions.toggleLaunchAttachDialog();
    }
  }]);

  return LaunchUIComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.LaunchUIComponent = LaunchUIComponent;