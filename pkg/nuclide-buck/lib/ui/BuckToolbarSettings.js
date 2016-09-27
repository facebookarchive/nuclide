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

var _shellQuote2;

function _shellQuote() {
  return _shellQuote2 = require('shell-quote');
}

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../../commons-node/string');
}

var _nuclideUiAtomInput2;

function _nuclideUiAtomInput() {
  return _nuclideUiAtomInput2 = require('../../../nuclide-ui/AtomInput');
}

var _nuclideUiButton2;

function _nuclideUiButton() {
  return _nuclideUiButton2 = require('../../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup2;

function _nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup2 = require('../../../nuclide-ui/ButtonGroup');
}

var _nuclideUiModal2;

function _nuclideUiModal() {
  return _nuclideUiModal2 = require('../../../nuclide-ui/Modal');
}

var BuckToolbarSettings = (function (_React$Component) {
  _inherits(BuckToolbarSettings, _React$Component);

  function BuckToolbarSettings(props) {
    _classCallCheck(this, BuckToolbarSettings);

    _get(Object.getPrototypeOf(BuckToolbarSettings.prototype), 'constructor', this).call(this, props);
    var _props$settings = props.settings;
    var args = _props$settings.arguments;
    var runArguments = _props$settings.runArguments;

    this.state = {
      arguments: args == null ? '' : (0, (_shellQuote2 || _shellQuote()).quote)(args),
      runArguments: runArguments == null ? '' : (0, (_shellQuote2 || _shellQuote()).quote)(runArguments)
    };
  }

  _createClass(BuckToolbarSettings, [{
    key: 'render',
    value: function render() {
      var runArguments = undefined;
      if (this.props.buildType === 'debug' || this.props.buildType === 'run') {
        runArguments = (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'Run Arguments:'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
            tabIndex: '0',
            initialValue: this.state.runArguments,
            placeholderText: 'Custom command-line arguments to pass to the app/binary',
            onDidChange: this._onRunArgsChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
        );
      }

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiModal2 || _nuclideUiModal()).Modal,
        { onDismiss: this.props.onDismiss },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'block' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'h5',
              null,
              'Buck Settings for build type: ',
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'b',
                null,
                this.props.buildType
              )
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'label',
              null,
              'Current Buck root:'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'p',
              null,
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                'code',
                null,
                this.props.currentBuckRoot || 'No Buck project found.'
              )
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              'label',
              null,
              'Buck Arguments:'
            ),
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
              tabIndex: '0',
              initialValue: this.state.arguments,
              placeholderText: 'Extra arguments to Buck (e.g. --num-threads 4)',
              onDidChange: this._onArgsChange.bind(this),
              onConfirm: this._onSave.bind(this)
            }),
            runArguments
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { style: { display: 'flex', justifyContent: 'flex-end' } },
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_nuclideUiButtonGroup2 || _nuclideUiButtonGroup()).ButtonGroup,
              null,
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                (_nuclideUiButton2 || _nuclideUiButton()).Button,
                { onClick: this.props.onDismiss },
                'Cancel'
              ),
              (_reactForAtom2 || _reactForAtom()).React.createElement(
                (_nuclideUiButton2 || _nuclideUiButton()).Button,
                {
                  buttonType: (_nuclideUiButton2 || _nuclideUiButton()).ButtonTypes.PRIMARY,
                  onClick: this._onSave.bind(this) },
                'Save'
              )
            )
          )
        )
      );
    }
  }, {
    key: '_onArgsChange',
    value: function _onArgsChange(args) {
      this.setState({ arguments: args });
    }
  }, {
    key: '_onRunArgsChange',
    value: function _onRunArgsChange(args) {
      this.setState({ runArguments: args });
    }
  }, {
    key: '_onSave',
    value: function _onSave() {
      try {
        this.props.onSave({
          arguments: (0, (_commonsNodeString2 || _commonsNodeString()).shellParse)(this.state.arguments),
          runArguments: (0, (_commonsNodeString2 || _commonsNodeString()).shellParse)(this.state.runArguments)
        });
      } catch (err) {
        atom.notifications.addError('Could not parse arguments', { detail: err.stack });
      }
    }
  }]);

  return BuckToolbarSettings;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = BuckToolbarSettings;
module.exports = exports.default;