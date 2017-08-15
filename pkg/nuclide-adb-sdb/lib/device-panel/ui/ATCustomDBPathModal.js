'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ATCustomDBPathModal = undefined;

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../../nuclide-ui/Dropdown');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ATCustomDBPathModal extends _react.default.Component {

  constructor(props) {
    super(props);

    this._handleConfirm = () => {
      this.props.setCustomPath(this.state.customPath);
      this.props.dismiss();
    };

    this._handleCancel = () => {
      this.props.dismiss();
    };

    this._handleCustomPathChange = customPath => {
      this.setState({ customPath: customPath.length === 0 ? null : customPath });
    };

    this.state = { customPath: this.props.currentCustomPath };
  }

  _getActiveConfig() {
    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        'label',
        null,
        'Active ',
        this.props.type,
        ' path:',
        ' ',
        _react.default.createElement(
          'i',
          null,
          _react.default.createElement(
            'strong',
            null,
            this.props.activePath
          )
        )
      ),
      _react.default.createElement(
        'label',
        null,
        'Active ',
        this.props.type,
        ' port:',
        ' ',
        _react.default.createElement(
          'i',
          null,
          _react.default.createElement(
            'strong',
            null,
            this.props.activePort || 'default'
          )
        )
      )
    );
  }

  _getPathSelector() {
    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        options: this.props.registeredPaths.map(path => ({
          label: path,
          value: path
        })),
        onChange: this._handleCustomPathChange,
        placeholder: `Set a fixed ${this.props.type} from a registered path`,
        value: null
      }),
      _react.default.createElement(
        'div',
        { className: 'nuclide-adb-sdb-custom-path-input' },
        _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          size: 'sm',
          value: this.state.customPath || '',
          placeholderText: '... or from a custom path',
          onDidChange: this._handleCustomPathChange
        })
      )
    );
  }

  _getFooter() {
    return _react.default.createElement(
      'div',
      { className: 'nuclide-adb-sdb-custom-path-footer' },
      _react.default.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._handleConfirm, buttonType: 'PRIMARY' },
          'Confirm'
        ),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._handleCancel },
          'Cancel'
        )
      )
    );
  }

  _getInfoBox() {
    return _react.default.createElement(
      'p',
      null,
      _react.default.createElement(
        'small',
        null,
        'A custom ',
        this.props.type,
        ' path takes priority over any other path that nuclide knows. This is specially useful if you also use',
        ' ',
        this.props.type,
        ' from the command line along with nuclide.',
        _react.default.createElement('br', null),
        'Keep in mind that using two different versions of ',
        this.props.type,
        ' ',
        'simultaneously might break both tools.'
      )
    );
  }

  render() {
    return _react.default.createElement(
      'div',
      null,
      _react.default.createElement(
        'div',
        { className: 'block' },
        this._getActiveConfig()
      ),
      _react.default.createElement(
        'div',
        { className: 'block' },
        this._getPathSelector()
      ),
      _react.default.createElement(
        'div',
        { className: 'block' },
        this._getInfoBox()
      ),
      _react.default.createElement(
        'div',
        { className: 'block' },
        this._getFooter()
      )
    );
  }
}
exports.ATCustomDBPathModal = ATCustomDBPathModal; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    * 
                                                    * @format
                                                    */