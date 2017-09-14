'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestEditDialog = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _AtomTextEditor;

function _load_AtomTextEditor() {
  return _AtomTextEditor = require('nuclide-commons-ui/AtomTextEditor');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _ParameterInput;

function _load_ParameterInput() {
  return _ParameterInput = require('./ParameterInput');
}

var _shallowequal;

function _load_shallowequal() {
  return _shallowequal = _interopRequireDefault(require('shallowequal'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const METHOD_DROPDOWN_OPTIONS = [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }]; /**
                                                                                                     * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                     * All rights reserved.
                                                                                                     *
                                                                                                     * This source code is licensed under the license found in the LICENSE file in
                                                                                                     * the root directory of this source tree.
                                                                                                     *
                                                                                                     * 
                                                                                                     * @format
                                                                                                     */

class RequestEditDialog extends _react.Component {

  constructor(props) {
    super(props);

    this._onSendHttpRequest = () => {
      this.props.actionCreators.sendHttpRequest();
      this._toggleDialog();
    };

    this._onCancel = () => {
      this._toggleDialog();
    };

    this._editorComponent = null;
    this._onCancel = this._onCancel.bind(this);
    this._onSendHttpRequest = this._onSendHttpRequest.bind(this);
    this._handleParameterChange = this._handleParameterChange.bind(this);
    this._handleRemoveParameter = this._handleRemoveParameter.bind(this);
    this._getParameters = this._getParameters.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    const { uri, method, headers, body, parameters } = this.props;
    return nextProps.uri !== uri || nextProps.method !== method || nextProps.body !== body || !(0, (_shallowequal || _load_shallowequal()).default)(nextProps.headers, headers) || !(0, (_shallowequal || _load_shallowequal()).default)(nextProps.parameters, parameters);
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

  _renderRequestBody() {
    if (this.props.method !== 'POST') {
      return null;
    }

    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'label',
        null,
        'Body'
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        onDidChange: body => this.props.actionCreators.updateState({ body })
      })
    );
  }

  _renderRequestParameters() {
    const parameterObj = {};
    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'label',
        null,
        'Parameters'
      ),
      _react.createElement(
        'div',
        { className: 'nuclide-parameter-input-container' },
        _react.createElement(
          'label',
          null,
          'Key'
        ),
        _react.createElement(
          'label',
          null,
          'Value'
        )
      ),
      this.props.parameters.map((parameter, index) => {
        if (!parameter) {
          return null;
        }
        const key = parameter.key;
        const value = parameter.value;
        const trimmedKey = key.trim();
        const output = _react.createElement((_ParameterInput || _load_ParameterInput()).ParameterInput, {
          key: index,
          index: index,
          paramKey: key,
          paramValue: value,
          isDuplicate: Boolean(key && parameterObj[trimmedKey]),
          updateParameter: this._handleParameterChange,
          removeParameter: this._handleRemoveParameter
        });

        parameterObj[trimmedKey] = true;
        return output;
      })
    );
  }

  _getParameters() {
    return this.props.parameters.map(param => param == null ? null : Object.assign({}, param));
  }

  _handleParameterChange(index, parameter) {
    const parameters = this._getParameters();
    parameters[index] = parameter;
    this._updateParameterState(index, parameters);
  }

  _handleRemoveParameter(index) {
    const parameters = this._getParameters();
    parameters[index] = null;
    this._updateParameterState(index, parameters);
  }

  _updateParameterState(modifiedIndex, parameters) {
    // If last parameter is modified, add new parameter
    if (modifiedIndex === parameters.length - 1) {
      parameters.push({ key: '', value: '' });
    }

    this.props.actionCreators.updateState({ parameters });
  }

  render() {
    return _react.createElement(
      'div',
      { className: 'block' },
      _react.createElement(
        'div',
        { className: 'nuclide-edit-request-dialog' },
        _react.createElement(
          'label',
          null,
          'URI: '
        ),
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          tabIndex: '1',
          placeholderText: 'https://www.facebook.com',
          value: this.props.uri,
          onDidChange: uri => this.props.actionCreators.updateState({ uri })
        }),
        _react.createElement(
          'label',
          null,
          'Method:'
        ),
        _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          className: 'nuclide-edit-request-method-select',
          value: this.props.method,
          options: METHOD_DROPDOWN_OPTIONS,
          onChange: method => this.props.actionCreators.updateState({ method })
        }),
        this._renderRequestParameters(),
        this._renderRequestBody(),
        _react.createElement(
          'label',
          null,
          'Headers: '
        ),
        _react.createElement(
          'div',
          { className: 'nuclide-http-request-sender-headers' },
          _react.createElement((_AtomTextEditor || _load_AtomTextEditor()).AtomTextEditor, {
            ref: editorComponent => {
              this._editorComponent = editorComponent;
            },
            tabIndex: '3',
            autoGrow: false,
            softWrapped: true,
            onDidTextBufferChange: this._handleTextBufferChange.bind(this)
          })
        ),
        _react.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          { className: 'nuclide-http-request-sender-button-group' },
          _react.createElement(
            (_Button || _load_Button()).Button,
            {
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              tabIndex: '5',
              onClick: this._onSendHttpRequest },
            'Send HTTP Request'
          ),
          _react.createElement(
            (_Button || _load_Button()).Button,
            { tabIndex: '4', onClick: this._onCancel },
            'Cancel'
          )
        )
      )
    );
  }
}
exports.RequestEditDialog = RequestEditDialog;