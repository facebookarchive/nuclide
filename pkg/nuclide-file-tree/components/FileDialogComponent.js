'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _class, _temp;

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../nuclide-ui/Checkbox');
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Component that displays UI to create a new file.
 */
let FileDialogComponent = (_temp = _class = class FileDialogComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._isClosed = false;
    this._subscriptions = new _atom.CompositeDisposable();
    this._close = this._close.bind(this);
    this._confirm = this._confirm.bind(this);
    this._handleDocumentMouseDown = this._handleDocumentMouseDown.bind(this);
    const options = {};
    for (const name in this.props.additionalOptions) {
      options[name] = true;
    }
    this.state = {
      options: options
    };
  }

  componentDidMount() {
    const input = this.refs.input;
    this._subscriptions.add(atom.commands.add(_reactForAtom.ReactDOM.findDOMNode(input), {
      'core:confirm': this._confirm,
      'core:cancel': this._close
    }));
    const path = this.props.initialValue;
    input.focus();
    if (this.props.selectBasename && path != null) {
      var _nuclideUri$parsePath = (_nuclideUri || _load_nuclideUri()).default.parsePath(path);

      const dir = _nuclideUri$parsePath.dir,
            name = _nuclideUri$parsePath.name;

      const selectionStart = dir ? dir.length + 1 : 0;
      const selectionEnd = selectionStart + name.length;
      input.getTextEditor().setSelectedBufferRange([[0, selectionStart], [0, selectionEnd]]);
    }
    document.addEventListener('mousedown', this._handleDocumentMouseDown);
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
    document.removeEventListener('mousedown', this._handleDocumentMouseDown);
  }

  render() {
    let labelClassName;
    if (this.props.iconClassName != null) {
      labelClassName = `icon ${ this.props.iconClassName }`;
    }

    const checkboxes = [];
    for (const name in this.props.additionalOptions) {
      const message = this.props.additionalOptions[name];
      const checked = this.state.options[name];
      const checkbox = _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
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
    return _reactForAtom.React.createElement(
      'div',
      { className: 'tree-view-dialog', ref: 'dialog' },
      _reactForAtom.React.createElement(
        'label',
        { className: labelClassName },
        this.props.message
      ),
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        initialValue: this.props.initialValue,
        ref: 'input'
      }),
      checkboxes
    );
  }

  _handleAdditionalOptionChanged(name, isChecked) {
    const options = this.state.options;

    options[name] = isChecked;
    this.setState({ options: options });
  }

  _handleDocumentMouseDown(event) {
    const dialog = this.refs.dialog;
    // If the click did not happen on the dialog or on any of its descendants,
    // the click was elsewhere on the document and should close the modal.
    if (event.target !== dialog && !dialog.contains(event.target)) {
      this._close();
    }
  }

  _confirm() {
    this.props.onConfirm(this.refs.input.getText(), this.state.options);
    this._close();
  }

  _close() {
    if (!this._isClosed) {
      this._isClosed = true;
      this.props.onClose();
    }
  }
}, _class.defaultProps = {
  additionalOptions: {}
}, _temp);


module.exports = FileDialogComponent;