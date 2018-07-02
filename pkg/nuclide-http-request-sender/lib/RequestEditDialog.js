"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestEditDialog = void 0;

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function _AtomTextEditor() {
  const data = require("../../../modules/nuclide-commons-ui/AtomTextEditor");

  _AtomTextEditor = function () {
    return data;
  };

  return data;
}

function _AtomInput() {
  const data = require("../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _ParameterInput() {
  const data = require("./ParameterInput");

  _ParameterInput = function () {
    return data;
  };

  return data;
}

function _shallowequal() {
  const data = _interopRequireDefault(require("shallowequal"));

  _shallowequal = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const METHOD_DROPDOWN_OPTIONS = [{
  label: 'GET',
  value: 'GET'
}, {
  label: 'POST',
  value: 'POST'
}];

class RequestEditDialog extends React.Component {
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
    const {
      uri,
      method,
      headers,
      body,
      parameters
    } = this.props;
    return nextProps.uri !== uri || nextProps.method !== method || nextProps.body !== body || !(0, _shallowequal().default)(nextProps.headers, headers) || !(0, _shallowequal().default)(nextProps.parameters, parameters);
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
      throw new Error("Invariant violation: \"editorComponent != null\"");
    }

    const editor = editorComponent.getModel();

    if (!(editor != null)) {
      throw new Error("Invariant violation: \"editor != null\"");
    }

    const jsonGrammar = atom.grammars.grammarForScopeName('source.json');

    if (!(jsonGrammar != null)) {
      throw new Error("Invariant violation: \"jsonGrammar != null\"");
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
      const editorComponent = this._editorComponent;

      if (!(editorComponent != null)) {
        throw new Error("Invariant violation: \"editorComponent != null\"");
      }

      const editor = editorComponent.getModel();

      if (!(editor != null)) {
        throw new Error("Invariant violation: \"editor != null\"");
      }

      headers = JSON.parse(editor.getText());
    } catch (_) {
      return; // Do not store illegal JSON.
    }

    this.props.actionCreators.updateState({
      headers
    });
  }

  _renderRequestBody() {
    if (this.props.method !== 'POST') {
      return null;
    }

    return React.createElement("div", null, React.createElement("label", null, "Body"), React.createElement(_AtomInput().AtomInput, {
      onDidChange: body => this.props.actionCreators.updateState({
        body
      })
    }));
  }

  _renderRequestParameters() {
    const parameterObj = {};
    return React.createElement("div", null, React.createElement("label", null, "Parameters"), React.createElement("div", {
      className: "nuclide-parameter-input-container"
    }, React.createElement("label", null, "Key"), React.createElement("label", null, "Value")), this.props.parameters.map((parameter, index) => {
      if (!parameter) {
        return null;
      }

      const key = parameter.key;
      const value = parameter.value;
      const trimmedKey = key.trim();
      const output = React.createElement(_ParameterInput().ParameterInput, {
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
    }));
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
      parameters.push({
        key: '',
        value: ''
      });
    }

    this.props.actionCreators.updateState({
      parameters
    });
  }

  render() {
    return React.createElement("div", {
      className: "block"
    }, React.createElement("div", {
      className: "nuclide-edit-request-dialog"
    }, React.createElement("label", null, "URI: "), React.createElement(_AtomInput().AtomInput, {
      tabIndex: "1",
      placeholderText: "https://www.facebook.com",
      value: this.props.uri,
      onDidChange: uri => this.props.actionCreators.updateState({
        uri
      })
    }), React.createElement("label", null, "Method:"), React.createElement(_Dropdown().Dropdown, {
      className: "nuclide-edit-request-method-select",
      value: this.props.method,
      options: METHOD_DROPDOWN_OPTIONS,
      onChange: method => this.props.actionCreators.updateState({
        method
      })
    }), this._renderRequestParameters(), this._renderRequestBody(), React.createElement("label", null, "Headers: "), React.createElement("div", {
      className: "nuclide-http-request-sender-headers"
    }, React.createElement(_AtomTextEditor().AtomTextEditor, {
      ref: editorComponent => {
        this._editorComponent = editorComponent;
      },
      tabIndex: "3",
      autoGrow: false,
      softWrapped: true,
      onDidTextBufferChange: this._handleTextBufferChange.bind(this)
    })), React.createElement(_ButtonGroup().ButtonGroup, {
      className: "nuclide-http-request-sender-button-group"
    }, React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      tabIndex: "5",
      onClick: this._onSendHttpRequest
    }, "Send HTTP Request"), React.createElement(_Button().Button, {
      tabIndex: "4",
      onClick: this._onCancel
    }, "Cancel"))));
  }

}

exports.RequestEditDialog = RequestEditDialog;