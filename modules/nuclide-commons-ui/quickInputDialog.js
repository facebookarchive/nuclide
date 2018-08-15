"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = quickInputDialog;

function _AtomInput() {
  const data = require("./AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("./Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("./ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/* global Node */
function quickInputDialog(title, inputLabel, onConfirm, validateInput, initialValue = '') {
  const item = document.createElement('div');
  const panel = atom.workspace.addModalPanel({
    item
  });
  return new Promise((resolve, reject) => {
    const cancel = () => {
      panel.destroy();
      reject(new Error('User cancelled'));
    };

    _reactDom.default.render(React.createElement(QuickInputDialog, {
      validateInput: validateInput,
      initialValue: initialValue,
      inputLabel: inputLabel,
      onCancel: cancel,
      onConfirm: content => {
        if (onConfirm) {
          onConfirm(content);
        }

        resolve(content);
        panel.destroy();
      },
      title: title
    }), item);

    panel.onDidDestroy(() => _reactDom.default.unmountComponentAtNode(item));
  });
}

class QuickInputDialog extends React.Component {
  constructor(props) {
    super(props);

    this._handleOutsideClick = event => {
      const domNode = this._rootNode;

      if (!(event.target instanceof Node)) {
        throw new Error("Invariant violation: \"event.target instanceof Node\"");
      }

      if (!domNode || !domNode.contains(event.target)) {
        this.props.onCancel();
      }
    };

    this._handleConfirmClick = () => {
      this.props.onConfirm(this.state.content);
    };

    this._handleInputChange = content => {
      this.setState({
        content
      });
    };

    this.state = {
      content: props.initialValue
    };
    this._disposables = new (_UniversalDisposable().default)();
  }

  componentDidMount() {
    document.addEventListener('click', this._handleOutsideClick);
    const rootNode = (0, _nullthrows().default)(this._rootNode);

    this._disposables.add(() => document.removeEventListener('click', this._handleOutsideClick), atom.commands.add(rootNode, 'core:confirm', this._handleConfirmClick), atom.commands.add(rootNode, 'core:cancel', this.props.onCancel));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const errorMessage = this.props.validateInput(this.state.content);
    return React.createElement("div", {
      ref: rootNode => this._rootNode = rootNode
    }, React.createElement("h6", null, React.createElement("strong", null, this.props.title)), React.createElement("label", null, this.props.inputLabel), React.createElement(_AtomInput().AtomInput, {
      autofocus: true,
      initialValue: this.props.initialValue,
      onDidChange: this._handleInputChange,
      startSelected: true
    }), React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, React.createElement("span", null, errorMessage), React.createElement(_ButtonGroup().ButtonGroup, {
      size: _ButtonGroup().ButtonGroupSizes.SMALL
    }, React.createElement(_Button().Button, {
      onClick: this.props.onCancel
    }, "Cancel"), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      disabled: errorMessage != null,
      onClick: this._handleConfirmClick
    }, "Confirm"))));
  }

}