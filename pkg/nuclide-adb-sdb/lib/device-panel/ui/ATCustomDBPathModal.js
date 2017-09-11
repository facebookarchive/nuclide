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

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class ATCustomDBPathModal extends _react.Component {
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
    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'label',
        null,
        'Active ',
        this.props.type,
        ' path:',
        ' ',
        _react.createElement(
          'i',
          null,
          _react.createElement(
            'strong',
            null,
            this.props.activePath
          )
        )
      ),
      _react.createElement(
        'label',
        null,
        'Active ',
        this.props.type,
        ' port:',
        ' ',
        _react.createElement(
          'i',
          null,
          _react.createElement(
            'strong',
            null,
            // flowlint-next-line sketchy-null-number:off
            this.props.activePort || 'default'
          )
        )
      )
    );
  }

  _getPathSelector() {
    return _react.createElement(
      'div',
      null,
      _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        options: this.props.registeredPaths.map(path => ({
          label: path,
          value: path
        })),
        onChange: this._handleCustomPathChange,
        placeholder: `Set a fixed ${this.props.type} from a registered path`,
        value: null
      }),
      _react.createElement(
        'div',
        { className: 'nuclide-adb-sdb-custom-path-input' },
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          size: 'sm',
          value: this.state.customPath || '',
          placeholderText: '... or from a custom path',
          onDidChange: this._handleCustomPathChange
        })
      )
    );
  }

  _getFooter() {
    return _react.createElement(
      'div',
      { className: 'nuclide-adb-sdb-custom-path-footer' },
      _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        _react.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._handleConfirm, buttonType: 'PRIMARY' },
          'Confirm'
        ),
        _react.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._handleCancel },
          'Cancel'
        )
      )
    );
  }

  _getInfoBox() {
    return _react.createElement(
      'p',
      null,
      _react.createElement(
        'small',
        null,
        'A custom ',
        this.props.type,
        ' path takes priority over any other path that nuclide knows. This is specially useful if you also use',
        ' ',
        this.props.type,
        ' from the command line along with nuclide.',
        _react.createElement('br', null),
        'Keep in mind that using two different versions of ',
        this.props.type,
        ' ',
        'simultaneously might break both tools.'
      )
    );
  }

  render() {
    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'div',
        { className: 'block' },
        this._getActiveConfig()
      ),
      _react.createElement(
        'div',
        { className: 'block' },
        this._getPathSelector()
      ),
      _react.createElement(
        'div',
        { className: 'block' },
        this._getInfoBox()
      ),
      _react.createElement(
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