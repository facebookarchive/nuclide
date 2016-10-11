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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiAtomInput;

function _load_nuclideUiAtomInput() {
  return _nuclideUiAtomInput = require('../../../../nuclide-ui/AtomInput');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup;

function _load_nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup = require('../../../../nuclide-ui/ButtonGroup');
}

var _nuclideUiModal;

function _load_nuclideUiModal() {
  return _nuclideUiModal = require('../../../../nuclide-ui/Modal');
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
      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_nuclideUiModal || _load_nuclideUiModal()).Modal,
        { onDismiss: this.props.onDismiss },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'block' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'label',
            null,
            'Build path:'
          ),
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            'div',
            { className: 'block' },
            (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiAtomInput || _load_nuclideUiAtomInput()).AtomInput, {
              initialValue: this.state.buildPath,
              placeholderText: 'Build directory path',
              onDidChange: this._onBuildPathChange.bind(this),
              onConfirm: this._onSave.bind(this)
            })
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
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = SwiftPMTestSettingsModal;
module.exports = exports.default;