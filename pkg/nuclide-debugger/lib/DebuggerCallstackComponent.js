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
exports.DebuggerCallstackComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _ListView;

function _load_ListView() {
  return _ListView = require('../../nuclide-ui/ListView');
}

var _Bridge;

function _load_Bridge() {
  return _Bridge = _interopRequireDefault(require('./Bridge'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let DebuggerCallstackComponent = exports.DebuggerCallstackComponent = class DebuggerCallstackComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleCallframeClick = this._handleCallframeClick.bind(this);
  }

  _handleCallframeClick(callFrameIndex, clickedCallframe) {
    this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
  }

  render() {
    const callstack = this.props.callstack;

    const items = callstack == null ? [] : callstack.map((callstackItem, i) => {
      const name = callstackItem.name,
            location = callstackItem.location;

      const path = (_nuclideUri || _load_nuclideUri()).default.basename(location.path);
      const content = _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-callstack-item', key: i },
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-debugger-callstack-name' },
          name
        ),
        _reactForAtom.React.createElement(
          'div',
          null,
          path,
          ':',
          location.line + 1
        )
      );
      return _reactForAtom.React.createElement(
        (_ListView || _load_ListView()).ListViewItem,
        { key: i, value: callstackItem },
        content
      );
    });
    return callstack == null ? _reactForAtom.React.createElement(
      'span',
      null,
      '(callstack unavailable)'
    ) : _reactForAtom.React.createElement(
      (_ListView || _load_ListView()).ListView,
      {
        alternateBackground: true,
        selectable: true,
        onSelect: this._handleCallframeClick },
      items
    );
  }
};