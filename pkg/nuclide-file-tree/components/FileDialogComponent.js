'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Component that displays UI to create a new file.
 */
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

class FileDialogComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._handleDocumentMouseDown = event => {
      const dialog = this.refs.dialog;
      // If the click did not happen on the dialog or on any of its descendants,
      // the click was elsewhere on the document and should close the modal.
      if (event.target !== dialog && !dialog.contains(event.target)) {
        this._close();
      }
    };

    this._confirm = () => {
      this.props.onConfirm(this.refs.input.getText(), this.state.options);
      this._close();
    };

    this._close = () => {
      if (!this._isClosed) {
        this._isClosed = true;
        this.props.onClose();
      }
    };

    this._isClosed = false;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const options = {};
    for (const name in this.props.additionalOptions) {
      options[name] = true;
    }
    this.state = {
      options
    };
  }

  componentDidMount() {
    const input = this.refs.input;
    this._disposables.add(atom.commands.add(
    // $FlowFixMe
    _reactDom.default.findDOMNode(input), {
      'core:confirm': this._confirm,
      'core:cancel': this._close
    }));
    const path = this.props.initialValue;
    input.focus();
    if (this.props.selectBasename && path != null) {
      const { dir, name } = (_nuclideUri || _load_nuclideUri()).default.parsePath(path);
      const selectionStart = dir ? dir.length + 1 : 0;
      const selectionEnd = selectionStart + name.length;
      input.getTextEditor().setSelectedBufferRange([[0, selectionStart], [0, selectionEnd]]);
    }
    document.addEventListener('mousedown', this._handleDocumentMouseDown);
  }

  componentWillUnmount() {
    this._disposables.dispose();
    document.removeEventListener('mousedown', this._handleDocumentMouseDown);
  }

  render() {
    let labelClassName;
    if (this.props.iconClassName != null) {
      labelClassName = `icon ${this.props.iconClassName}`;
    }

    const checkboxes = [];
    for (const name in this.props.additionalOptions) {
      const message = this.props.additionalOptions[name];
      const checked = this.state.options[name];
      const checkbox = _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        key: name,
        checked: checked,
        onChange: this._handleAdditionalOptionChanged.bind(this, name),
        label: message
      });
      checkboxes.push(checkbox);
    }

    // `.tree-view-dialog` is unstyled but is added by Atom's tree-view package[1] and is styled by
    // 3rd-party themes. Add it to make this package's modals styleable the same as Atom's
    // tree-view.
    //
    // [1] https://github.com/atom/tree-view/blob/v0.200.0/lib/dialog.coffee#L7
    return _react.createElement(
      'div',
      { className: 'tree-view-dialog', ref: 'dialog' },
      _react.createElement(
        'label',
        { className: labelClassName },
        this.props.message
      ),
      _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, { initialValue: this.props.initialValue, ref: 'input' }),
      checkboxes
    );
  }

  _handleAdditionalOptionChanged(name, isChecked) {
    const { options } = this.state;
    options[name] = isChecked;
    this.setState({ options });
  }

}
exports.default = FileDialogComponent;
FileDialogComponent.defaultProps = {
  additionalOptions: {}
};