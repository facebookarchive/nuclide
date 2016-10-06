Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var _nuclideUiButtonGroup2;

function _nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup2 = require('../../../../nuclide-ui/ButtonGroup');
}

var _nuclideUiModal2;

function _nuclideUiModal() {
  return _nuclideUiModal2 = require('../../../../nuclide-ui/Modal');
}

var SwiftPMTestSettingsModal = (function (_React$Component) {
  _inherits(SwiftPMTestSettingsModal, _React$Component);

  function SwiftPMTestSettingsModal(props) {
    _classCallCheck(this, SwiftPMTestSettingsModal);

    _get(Object.getPrototypeOf(SwiftPMTestSettingsModal.prototype), 'constructor', this).call(this, props);
    this.state = {
      buildPath: props.buildPath
    };
  }

  _createClass(SwiftPMTestSettingsModal, [{
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_nuclideUiModal2 || _nuclideUiModal()).Modal,
        { onDismiss: this.props.onDismiss },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'block' },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            null,
            'Build path:'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            { className: 'block' },
            (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiAtomInput2 || _nuclideUiAtomInput()).AtomInput, {
              initialValue: this.state.buildPath,
              placeholderText: 'Build directory path',
              onDidChange: this._onBuildPathChange.bind(this),
              onConfirm: this._onSave.bind(this)
            })
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
    key: '_onBuildPathChange',
    value: function _onBuildPathChange(buildPath) {
      this.setState({ buildPath: buildPath });
    }
  }, {
    key: '_onSave',
    value: function _onSave() {
      this.props.onSave(this.state.buildPath);
    }
  }]);

  return SwiftPMTestSettingsModal;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = SwiftPMTestSettingsModal;
module.exports = exports.default;