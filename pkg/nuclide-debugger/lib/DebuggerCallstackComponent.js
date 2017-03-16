'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerCallstackComponent = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class DebuggerCallstackComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleCallframeClick = this._handleCallframeClick.bind(this);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      callstack: props.callstackStore.getCallstack(),
      selectedCallFrameIndex: props.callstackStore.getSelectedCallFrameIndex()
    };
  }

  componentDidMount() {
    const { callstackStore } = this.props;
    this._disposables.add(callstackStore.onChange(() => {
      this.setState({
        selectedCallFrameIndex: callstackStore.getSelectedCallFrameIndex(),
        callstack: callstackStore.getCallstack()
      });
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  _handleCallframeClick(callFrameIndex, clickedCallframe) {
    this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
    this.props.actions.setSelectedCallFrameIndex(callFrameIndex);
  }

  render() {
    const { callstack } = this.state;
    const items = callstack == null ? [] : callstack.map((callstackItem, i) => {
      const {
        name,
        location
      } = callstackItem;
      // Callstack paths may have a format like file://foo/bar, or
      // lldb://asm/0x1234. These are not valid paths that can be used to
      // construct a nuclideUri so we need to skip the protocol prefix.
      const path = (_nuclideUri || _load_nuclideUri()).default.basename(location.path.replace(/^[a-zA-Z]+:\/\//, ''));
      const content = _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-callstack-item', key: i },
        _react.default.createElement(
          'span',
          { className: 'nuclide-debugger-callstack-name' },
          name
        ),
        _react.default.createElement(
          'span',
          null,
          path,
          ':',
          location.line + 1
        )
      );
      const itemClassNames = (0, (_classnames || _load_classnames()).default)({
        'nuclide-debugger-callstack-item-selected': this.state.selectedCallFrameIndex === i
      });
      return _react.default.createElement(
        (_ListView || _load_ListView()).ListViewItem,
        {
          key: i,
          className: itemClassNames,
          value: callstackItem },
        content
      );
    });
    return callstack == null ? _react.default.createElement(
      'span',
      null,
      '(callstack unavailable)'
    ) : _react.default.createElement(
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