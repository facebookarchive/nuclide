'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestEditDialog = undefined;

var _react = _interopRequireDefault(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('../../nuclide-ui/AtomTextEditor');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const METHOD_DROPDOWN_OPTIONS = [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }];

class RequestEditDialog extends _react.default.Component {

  constructor(props) {
    super(props);
    this._editorComponent = null;
    this._onCancel = this._onCancel.bind(this);
    this._onSendHttpRequest = this._onSendHttpRequest.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { uri, method, headers, body } = this.props;
    return nextProps.uri !== uri || nextProps.method !== method || nextProps.body !== body || !(0, (_shallowequal || _load_shallowequal()).default)(nextProps.headers, headers);
  }

  componentDidMount() {
    this._componentDidRender();
  }

  componentDidUpdate() {
    this._componentDidRender();
  }

  /**
   * This method should be called after every render to set the AtomTextEditor text.
   */
  _componentDidRender() {
    const editorComponent = this._editorComponent;

    if (!(editorComponent != null)) {
      throw new Error('Invariant violation: "editorComponent != null"');
    }

    const editor = editorComponent.getModel();

    if (!(editor != null)) {
      throw new Error('Invariant violation: "editor != null"');
    }

    const jsonGrammar = atom.grammars.grammarForScopeName('source.json');

    if (!(jsonGrammar != null)) {
      throw new Error('Invariant violation: "jsonGrammar != null"');
    }

    editor.setGrammar(jsonGrammar);
    editor.setText(JSON.stringify(this.props.headers, null, 2));
  }

  _onSendHttpRequest() {
    this.props.actionCreators.sendHttpRequest();
    this._toggleDialog();
  }

  _onCancel() {
    this._toggleDialog();
  }

  _toggleDialog() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-http-request-sender:toggle-http-request-edit-dialog');
  }

  _handleTextBufferChange(event) {
    // TODO: It's better to store changes, even if they are illegal JSON.
    let headers;
    try {
      headers = JSON.parse(event.newText);
    } catch (_) {
      return; // Do not store illegal JSON.
    }
    this.props.actionCreators.updateState({ headers });
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'block' },
      _react.default.createElement(
        'div',
        { className: 'nuclide-edit-request-dialog' },
        _react.default.createElement(
          'label',
          null,
          'URI: '
        ),
        _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          tabIndex: '1',
          placeholderText: 'https://www.facebook.com',
          value: this.props.uri,
          onDidChange: uri => this.props.actionCreators.updateState({ uri })
        }),
        _react.default.createElement(
          'label',
          null,
          'Method: '
        ),
        _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          value: this.props.method,
          options: METHOD_DROPDOWN_OPTIONS,
          onChange: method => this.props.actionCreators.updateState({ method })
        }),
        this.props.method !== 'POST' ? null : _react.default.createElement(
          'div',
          null,
          _react.default.createElement(
            'label',
            null,
            'Body'
          ),
          _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            tabIndex: '2',
            onDidChange: body => this.props.actionCreators.updateState({ body })
          })
        ),
        _react.default.createElement(
          'label',
          null,
          'Headers: '
        ),
        _react.default.createElement(
          'div',
          { className: 'nuclide-http-request-sender-headers' },
          _react.default.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
            ref: editorComponent => {
              this._editorComponent = editorComponent;
            },
            tabIndex: '3',
            autoGrow: false,
            softWrapped: true,
            onDidTextBufferChange: this._handleTextBufferChange.bind(this)
          })
        ),
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { className: 'nuclide-http-request-sender-button-group' },
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              tabIndex: '5',
              onClick: this._onSendHttpRequest },
            'Send HTTP Request'
          ),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              tabIndex: '4',
              onClick: this._onCancel },
            'Cancel'
          )
        )
      )
    );
  }
}
exports.RequestEditDialog = RequestEditDialog;