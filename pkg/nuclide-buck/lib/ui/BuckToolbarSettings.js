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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _shellQuote;

function _load_shellQuote() {
  return _shellQuote = require('shell-quote');
}

var _commonsNodeString;

function _load_commonsNodeString() {
  return _commonsNodeString = require('../../../commons-node/string');
}

var _nuclideUiAtomInput;

function _load_nuclideUiAtomInput() {
  return _nuclideUiAtomInput = require('../../../nuclide-ui/AtomInput');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup;

function _load_nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup = require('../../../nuclide-ui/ButtonGroup');
}

var _nuclideUiModal;

function _load_nuclideUiModal() {
  return _nuclideUiModal = require('../../../nuclide-ui/Modal');
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
      arguments: args == null ? '' : (0, (_shellQuote || _load_shellQuote()).quote)(args),
      runArguments: runArguments == null ? '' : (0, (_shellQuote || _load_shellQuote()).quote)(runArguments)
    };
  }

  _createClass(BuckToolbarSettings, [{
    key: 'render',
    value: function render() {
      var runArguments = undefined;
      if (this.props.buildType === 'debug' || this.props.buildType === 'run') {
        runArguments = (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          null,
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'label',
            null,
            'Run Arguments:'
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
            tabIndex: '0',
            initialValue: this.state.runArguments,
            placeholderText: 'Custom command-line arguments to pass to the app/binary',
            onDidChange: this._onRunArgsChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
        );
      }

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_nuclideUiModal || _load_nuclideUiModal()).Modal,
        { onDismiss: this.props.onDismiss },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'block' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'block' },
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'h5',
              null,
              'Buck Settings for build type: ',
              (_reactForAtom || _load_reactForAtom()).React.createElement(
                'b',
                null,
                this.props.buildType
              )
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'label',
              null,
              'Current Buck root:'
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'p',
              null,
              (_reactForAtom || _load_reactForAtom()).React.createElement(
                'code',
                null,
                this.props.currentBuckRoot || 'No Buck project found.'
              )
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              'label',
              null,
              'Buck Arguments:'
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
              tabIndex: '0',
              initialValue: this.state.arguments,
              placeholderText: 'Extra arguments to Buck (e.g. --num-threads 4)',
              onDidChange: this._onArgsChange.bind(this),
              onConfirm: this._onSave.bind(this)
            }),
            runArguments
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { style: { display: 'flex', justifyContent: 'flex-end' } },
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              (_nuclideUiButtonGroup || _load_nuclideUiButtonGroup()).ButtonGroup,
              null,
              (_reactForAtom || _load_reactForAtom()).React.createElement(
                (_nuclideUiButton || _load_nuclideUiButton()).Button,
                { onClick: this.props.onDismiss },
                'Cancel'
              ),
              (_reactForAtom || _load_reactForAtom()).React.createElement(
                (_nuclideUiButton || _load_nuclideUiButton()).Button,
                {
                  buttonType: (_nuclideUiButton || _load_nuclideUiButton()).ButtonTypes.PRIMARY,
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
          arguments: (0, (_commonsNodeString || _load_commonsNodeString()).shellParse)(this.state.arguments),
          runArguments: (0, (_commonsNodeString || _load_commonsNodeString()).shellParse)(this.state.runArguments)
        });
      } catch (err) {
        atom.notifications.addError('Could not parse arguments', { detail: err.stack });
      }
    }
  }]);

  return BuckToolbarSettings;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = BuckToolbarSettings;
module.exports = exports.default;