'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../nuclide-ui/Checkbox');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let CreateBookmarkModal = class CreateBookmarkModal extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.disposables = new _atom.CompositeDisposable();

    this._handleCreateClick = this._handleCreateClick.bind(this);
  }

  componentDidMount() {
    this.disposables.add(atom.commands.add(_reactForAtom.ReactDOM.findDOMNode(this), 'core:confirm', this._handleCreateClick), (_featureConfig || _load_featureConfig()).default.observe((_constants || _load_constants()).STACKED_CONFIG_KEY, () => this.forceUpdate()));
    this.refs.atomTextEditor.focus();
  }

  componentWillUnmount() {
    this.disposables.dispose();
  }

  _handleCreateClick() {
    this.props.onCreate(this.refs.atomTextEditor.getModel().getText(), this.props.repo);
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement(
        'h6',
        { style: { marginTop: 0 } },
        _reactForAtom.React.createElement(
          'strong',
          null,
          'Create bookmark'
        )
      ),
      _reactForAtom.React.createElement(
        'label',
        null,
        'Bookmark name:'
      ),
      _reactForAtom.React.createElement('atom-text-editor', { mini: true, ref: 'atomTextEditor', tabIndex: '0' }),
      _reactForAtom.React.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        label: 'Stack the feature on top of the current one',
        checked: (_featureConfig || _load_featureConfig()).default.get((_constants || _load_constants()).STACKED_CONFIG_KEY),
        onChange: stacked => (_featureConfig || _load_featureConfig()).default.set((_constants || _load_constants()).STACKED_CONFIG_KEY, stacked)
      }),
      _reactForAtom.React.createElement(
        'div',
        { className: 'text-right' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'btn-group btn-group-sm' },
          _reactForAtom.React.createElement(
            'button',
            { className: 'btn', onClick: this.props.onCancel },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn btn-primary',
              onClick: this._handleCreateClick },
            'Create'
          )
        )
      )
    );
  }
};
exports.default = CreateBookmarkModal;
module.exports = exports['default'];