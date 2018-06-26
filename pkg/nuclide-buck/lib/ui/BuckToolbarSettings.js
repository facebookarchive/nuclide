'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _string;

function _load_string() {
  return _string = require('../../../../modules/nuclide-commons/string');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../../modules/nuclide-commons-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../../../modules/nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../../modules/nuclide-commons-ui/ButtonGroup');
}

var _LoadingSpinner;

function _load_LoadingSpinner() {
  return _LoadingSpinner = require('../../../../modules/nuclide-commons-ui/LoadingSpinner');
}

var _Modal;

function _load_Modal() {
  return _Modal = require('../../../../modules/nuclide-commons-ui/Modal');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('../../../../modules/nuclide-commons-ui/Icon');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class BuckToolbarSettings extends _react.Component {
  constructor(props) {
    super(props);
    const { buildArguments, runArguments } = props.settings;
    this.state = {
      buildArguments: buildArguments == null ? '' : (0, (_string || _load_string()).shellQuote)(buildArguments),
      runArguments: runArguments == null ? '' : (0, (_string || _load_string()).shellQuote)(runArguments)
    };
  }

  render() {
    const extraSettingsUi = this.props.platformProviderSettings != null ? this.props.platformProviderSettings.ui : null;

    return _react.createElement(
      (_Modal || _load_Modal()).Modal,
      { onDismiss: this.props.onDismiss },
      _react.createElement(
        'div',
        { className: 'block' },
        _react.createElement(
          'div',
          { className: 'block' },
          _react.createElement(
            'label',
            null,
            'Current Buck root:'
          ),
          _react.createElement(
            'p',
            null,
            _react.createElement(
              'code',
              null,
              this.props.buckRoot
            )
          ),
          _react.createElement(
            'div',
            null,
            _react.createElement(
              'label',
              null,
              'Buck version:'
            ),
            this._getBuckversionFileComponent()
          ),
          _react.createElement(
            'label',
            null,
            'Build Arguments:'
          ),
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            tabIndex: '0',
            initialValue: this.state.buildArguments,
            placeholderText: 'Extra arguments to Buck itself (e.g. --num-threads 4)',
            onDidChange: this._onBuildArgsChange.bind(this),
            onConfirm: this._onSave.bind(this)
          }),
          _react.createElement(
            'label',
            null,
            'Run Arguments:'
          ),
          _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            tabIndex: '0',
            initialValue: this.state.runArguments,
            placeholderText: 'Custom command-line arguments to pass to the app/binary',
            onDidChange: this._onRunArgsChange.bind(this),
            onConfirm: this._onSave.bind(this)
          }),
          extraSettingsUi
        ),
        _react.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'flex-end' } },
          _react.createElement(
            (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
            null,
            _react.createElement(
              (_Button || _load_Button()).Button,
              { onClick: this.props.onDismiss },
              'Cancel'
            ),
            _react.createElement(
              (_Button || _load_Button()).Button,
              {
                buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
                onClick: this._onSave.bind(this) },
              'Save'
            )
          )
        )
      )
    );
  }

  _getBuckversionFileComponent() {
    const label = ' .buckversion file:';
    const { buckversionFileContents } = this.props;
    if (buckversionFileContents == null) {
      return _react.createElement(
        'p',
        null,
        _react.createElement(
          'div',
          { className: 'inline-block' },
          _react.createElement((_LoadingSpinner || _load_LoadingSpinner()).LoadingSpinner, {
            size: 'EXTRA_SMALL',
            className: 'nuclide-buck-buckversion-file-spinner'
          })
        ),
        label
      );
    } else if (buckversionFileContents instanceof Error) {
      let errorMessage;
      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      if (buckversionFileContents.code === 'ENOENT') {
        errorMessage = 'not found';
      } else {
        errorMessage = buckversionFileContents.message;
      }
      return _react.createElement(
        'p',
        null,
        _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'x', className: 'inline-block' }),
        label,
        ' ',
        errorMessage
      );
    } else {
      return _react.createElement(
        'p',
        null,
        _react.createElement((_Icon || _load_Icon()).Icon, { icon: 'check', className: 'inline-block' }),
        label,
        ' ',
        _react.createElement(
          'code',
          null,
          buckversionFileContents
        )
      );
    }
  }

  _onBuildArgsChange(args) {
    this.setState({ buildArguments: args });
  }

  _onRunArgsChange(args) {
    this.setState({ runArguments: args });
  }

  _onSave() {
    try {
      this.props.onSave({
        buildArguments: (0, (_string || _load_string()).shellParse)(this.state.buildArguments),
        runArguments: (0, (_string || _load_string()).shellParse)(this.state.runArguments)
      });
    } catch (err) {
      atom.notifications.addError('Could not parse arguments', {
        detail: err.stack
      });
    }
    if (this.props.platformProviderSettings != null) {
      this.props.platformProviderSettings.onSave();
    }
  }
}
exports.default = BuckToolbarSettings; /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        *  strict-local
                                        * @format
                                        */