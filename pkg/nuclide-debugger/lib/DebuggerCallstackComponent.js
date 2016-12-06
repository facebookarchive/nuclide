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

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

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

class DebuggerCallstackComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleCallframeClick = this._handleCallframeClick.bind(this);
  }

  _handleCallframeClick(callFrameIndex, clickedCallframe) {
    this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
    this.props.actions.setSelectedCallFrameIndex(callFrameIndex);
  }

  render() {
    const { callstack } = this.props;
    const items = callstack == null ? [] : callstack.map((callstackItem, i) => {
      const {
        name,
        location
      } = callstackItem;
      const path = (_nuclideUri || _load_nuclideUri()).default.basename(location.path);
      const content = _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-callstack-item', key: i },
        _reactForAtom.React.createElement(
          'span',
          { className: 'nuclide-debugger-callstack-name' },
          name
        ),
        _reactForAtom.React.createElement(
          'span',
          null,
          path,
          ':',
          location.line + 1
        )
      );
      const itemClassNames = (0, (_classnames || _load_classnames()).default)({
        'nuclide-debugger-callstack-item-selected': this.props.selectedCallFrameIndex === i
      });
      return _reactForAtom.React.createElement(
        (_ListView || _load_ListView()).ListViewItem,
        {
          key: i,
          className: itemClassNames,
          value: callstackItem },
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
}
exports.DebuggerCallstackComponent = DebuggerCallstackComponent;