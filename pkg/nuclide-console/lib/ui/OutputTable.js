'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Hasher;

function _load_Hasher() {
  return _Hasher = _interopRequireDefault(require('../../../commons-node/Hasher'));
}

var _react = _interopRequireDefault(require('react'));

var _reactVirtualized;

function _load_reactVirtualized() {
  return _reactVirtualized = require('react-virtualized');
}

var _RecordView;

function _load_RecordView() {
  return _RecordView = _interopRequireDefault(require('./RecordView'));
}

var _ResizeSensitiveContainer;

function _load_ResizeSensitiveContainer() {
  return _ResizeSensitiveContainer = require('../../../nuclide-ui/ResizeSensitiveContainer');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The number of extra rows to render beyond what is visible
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const OVERSCAN_COUNT = 5;

class OutputTable extends _react.default.Component {

  // This is a <List> from react-virtualized (untyped library)
  constructor(props) {
    super(props);
    this._hasher = new (_Hasher || _load_Hasher()).default();
    this._renderedRecords = new Map();
    this._getExecutor = this._getExecutor.bind(this);
    this._getProvider = this._getProvider.bind(this);
    this._getRowHeight = this._getRowHeight.bind(this);
    this._handleListRef = this._handleListRef.bind(this);
    this._handleTableWrapper = this._handleTableWrapper.bind(this);
    this._handleRecordHeightChange = this._handleRecordHeightChange.bind(this);
    this._handleResize = this._handleResize.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._renderRow = this._renderRow.bind(this);
    this.state = {
      width: 0,
      height: 0
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this._list != null && prevProps.displayableRecords.length !== this.props.displayableRecords.length) {
      // $FlowIgnore Untyped react-virtualized List method
      this._list.recomputeRowHeights();
    }
  }

  render() {
    return _react.default.createElement(
      (_ResizeSensitiveContainer || _load_ResizeSensitiveContainer()).ResizeSensitiveContainer,
      {
        className: 'nuclide-console-table-wrapper native-key-bindings',
        onResize: this._handleResize,
        tabIndex: '1' },
      this._containerRendered() ? _react.default.createElement((_reactVirtualized || _load_reactVirtualized()).List, {
        ref: this._handleListRef,
        height: this.state.height,
        width: this.state.width,
        rowCount: this.props.displayableRecords.length,
        rowHeight: this._getRowHeight,
        rowRenderer: this._renderRow,
        overscanRowCount: OVERSCAN_COUNT,
        onScroll: this._onScroll
      }) : null
    );
  }

  scrollToBottom() {
    if (this._list != null) {
      // $FlowIgnore Untyped react-virtualized List method
      this._list.scrollToRow(this.props.displayableRecords.length - 1);
    }
  }

  _getExecutor(id) {
    return this.props.getExecutor(id);
  }

  _getProvider(id) {
    return this.props.getProvider(id);
  }

  _renderRow(rowMetadata) {
    const { index, style } = rowMetadata;
    const displayableRecord = this.props.displayableRecords[index];
    const { record } = displayableRecord;
    return _react.default.createElement(
      'div',
      {
        key: this._hasher.getHash(displayableRecord.record),
        className: 'nuclide-console-table-row-wrapper',
        style: style },
      _react.default.createElement((_RecordView || _load_RecordView()).default, {
        ref: view => {
          if (view != null) {
            this._renderedRecords.set(record, view);
          } else {
            this._renderedRecords.delete(record);
          }
        },
        getExecutor: this._getExecutor,
        getProvider: this._getProvider,
        displayableRecord: displayableRecord,
        showSourceLabel: this.props.showSourceLabels,
        onHeightChange: this._handleRecordHeightChange
      })
    );
  }

  _containerRendered() {
    return this.state.width !== 0 && this.state.height !== 0;
  }

  _getRowHeight({ index }) {
    return this.props.displayableRecords[index].height;
  }

  _handleTableWrapper(tableWrapper) {
    this._wrapper = tableWrapper;
  }

  _handleListRef(listRef) {
    this._list = listRef;
  }

  _handleResize(height, width) {
    this.setState({
      width,
      height
    });

    // When this component resizes, the inner records will
    // also resize and potentially have their heights change
    // So we measure all of their heights again here
    this._renderedRecords.forEach(recordView => recordView.measureAndNotifyHeight());
  }

  _handleRecordHeightChange(recordId, newHeight) {
    this.props.onDisplayableRecordHeightChange(recordId, newHeight, () => {
      // The react-virtualized List component is provided the row heights
      // through a function, so it has no way of knowing that a row's height
      // has changed unless we explicitly notify it to recompute the heights.
      if (this._list != null) {
        // $FlowIgnore Untyped react-virtualized List component method
        this._list.recomputeRowHeights();
      }
    });
  }

  _onScroll({ clientHeight, scrollHeight, scrollTop }) {
    this.props.onScroll(clientHeight, scrollHeight, scrollTop);
  }
}
exports.default = OutputTable;