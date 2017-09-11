'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerCallstackComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _Bridge;

function _load_Bridge() {
  return _Bridge = _interopRequireDefault(require('./Bridge'));
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class DebuggerCallstackComponent extends _react.Component {

  constructor(props) {
    super(props);

    _initialiseProps.call(this);

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

  render() {
    const { callstack } = this.state;
    const rows = callstack == null ? [] : callstack.map((callstackItem, i) => {
      const { location } = callstackItem;
      const isSelected = this.state.selectedCallFrameIndex === i;
      const cellData = {
        data: {
          frame: i,
          address: callstackItem.name,
          location,
          isSelected
        }
      };

      if (isSelected) {
        // $FlowIssue className is an optional property of a table row
        cellData.className = 'nuclide-debugger-callstack-item-selected';
      }

      return cellData;
    });

    const columns = [{
      title: '',
      key: 'frame',
      width: 0.05
    }, {
      title: 'Address',
      key: 'address'
    }, {
      component: this._locationComponent,
      title: 'File Location',
      key: 'location'
    }];

    const emptyComponent = () => _react.createElement(
      'div',
      { className: 'nuclide-debugger-callstack-list-empty' },
      'callstack unavailable'
    );

    return _react.createElement((_Table || _load_Table()).Table, {
      className: 'nuclide-debugger-callstack-table',
      columns: columns,
      emptyComponent: emptyComponent,
      rows: rows,
      selectable: true,
      resizable: true,
      onSelect: this._handleCallframeClick,
      sortable: false,
      ref: 'callstackTable'
    });
  }
}
exports.DebuggerCallstackComponent = DebuggerCallstackComponent; /**
                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                  * All rights reserved.
                                                                  *
                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                  * the root directory of this source tree.
                                                                  *
                                                                  * 
                                                                  * @format
                                                                  */

var _initialiseProps = function () {
  this._locationComponent = props => {
    const missingSourceItem = this.props.callstackStore.getDebuggerStore().getCanSetSourcePaths() && !props.data.hasSource ? _react.createElement('span', {
      className: (0, (_classnames || _load_classnames()).default)('text-error', 'icon', 'icon-alert'),
      onClick: () => this.props.actions.configureSourcePaths()
      // $FlowFixMe(>=0.53.0) Flow suppress
      , ref: (0, (_addTooltip || _load_addTooltip()).default)({
        title: 'Source file not found! Some debugger features will not work without source.' + '<br/><br/>' + 'Click to configure source file paths...'
      })
    }) : null;

    // Callstack paths may have a format like file://foo/bar, or
    // lldb://asm/0x1234. These are not valid paths that can be used to
    // construct a nuclideUri so we need to skip the protocol prefix.
    const path = (_nuclideUri || _load_nuclideUri()).default.basename(props.data.path.replace(/^[a-zA-Z]+:\/\//, ''));

    // Chrome line numbers are actually 0-based, so add 1.
    const line = props.data.line + 1;
    return _react.createElement(
      'div',
      { title: `${path}:${line}` },
      missingSourceItem,
      _react.createElement(
        'span',
        null,
        path,
        ':',
        line
      )
    );
  };

  this._handleCallframeClick = (clickedCallframe, callFrameIndex) => {
    this.props.bridge.setSelectedCallFrameIndex(callFrameIndex);
    this.props.actions.setSelectedCallFrameIndex(callFrameIndex);
  };
};