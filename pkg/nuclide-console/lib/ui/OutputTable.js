'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Hasher;

function _load_Hasher() {
  return _Hasher = _interopRequireDefault(require('nuclide-commons/Hasher'));
}

var _react = _interopRequireWildcard(require('react'));

var _reactVirtualized;

function _load_reactVirtualized() {
  return _reactVirtualized = require('react-virtualized');
}

var _RecordView;

function _load_RecordView() {
  return _RecordView = _interopRequireDefault(require('./RecordView'));
}

var _recordsChanged;

function _load_recordsChanged() {
  return _recordsChanged = _interopRequireDefault(require('../recordsChanged'));
}

var _ResizeSensitiveContainer;

function _load_ResizeSensitiveContainer() {
  return _ResizeSensitiveContainer = require('../../../nuclide-ui/ResizeSensitiveContainer');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// The number of extra rows to render beyond what is visible
const OVERSCAN_COUNT = 5; /**
                           * Copyright (c) 2015-present, Facebook, Inc.
                           * All rights reserved.
                           *
                           * This source code is licensed under the license found in the LICENSE file in
                           * the root directory of this source tree.
                           *
                           * 
                           * @format
                           */

class OutputTable extends _react.Component {

  // The currently rendered range.
  constructor(props) {
    super(props);

    this._handleListRender = opts => {
      this._startIndex = opts.startIndex;
      this._stopIndex = opts.stopIndex;
    };

    this._getExecutor = id => {
      return this.props.getExecutor(id);
    };

    this._getProvider = id => {
      return this.props.getProvider(id);
    };

    this._renderRow = rowMetadata => {
      const { index, style } = rowMetadata;
      const displayableRecord = this.props.displayableRecords[index];
      const { record } = displayableRecord;
      return _react.createElement(
        'div',
        {
          key: this._hasher.getHash(displayableRecord.record),
          className: 'nuclide-console-table-row-wrapper',
          style: style },
        _react.createElement((_RecordView || _load_RecordView()).default, {
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
    };

    this._getRowHeight = ({ index }) => {
      return this.props.displayableRecords[index].height;
    };

    this._handleTableWrapper = tableWrapper => {
      this._wrapper = tableWrapper;
    };

    this._handleListRef = listRef => {
      this._list = listRef;
    };

    this._handleResize = (height, width) => {
      this.setState({
        width,
        height
      });

      // When this component resizes, the inner records will
      // also resize and potentially have their heights change
      // So we measure all of their heights again here
      this._renderedRecords.forEach(recordView => recordView.measureAndNotifyHeight());
    };

    this._handleRecordHeightChange = (recordId, newHeight) => {
      this.props.onDisplayableRecordHeightChange(recordId, newHeight, () => {
        // The react-virtualized List component is provided the row heights
        // through a function, so it has no way of knowing that a row's height
        // has changed unless we explicitly notify it to recompute the heights.
        if (this._list == null) {
          return;
        }
        // $FlowIgnore Untyped react-virtualized List component method
        this._list.recomputeRowHeights();

        // If the element in the viewport when its height changes, scroll to ensure that the entirety
        // of the record is in the viewport. This is important not just for if the last record changes
        // height through user interaction (e.g. expanding a debugger variable), but also because this
        // is the mechanism through which the record's true initial height is reported. Therefore, we
        // may have scrolled to the bottom, and only afterwards received its true height. In this
        // case, it's important that we then scroll to the new bottom.
        const index = this.props.displayableRecords.findIndex(record => record.id === recordId);
        if (index >= this._startIndex && index <= this._stopIndex) {
          // $FlowIgnore Untyped react-virtualized List component method
          this._list.scrollToRow(index);
        }
      });
    };

    this._onScroll = ({
      clientHeight,
      scrollHeight,
      scrollTop
    }) => {
      this.props.onScroll(clientHeight, scrollHeight, scrollTop);
    };

    this._hasher = new (_Hasher || _load_Hasher()).default();
    this._renderedRecords = new Map();
    this.state = {
      width: 0,
      height: 0
    };
    this._startIndex = 0;
    this._stopIndex = 0;
  }
  // This is a <List> from react-virtualized (untyped library)


  componentDidUpdate(prevProps, prevState) {
    if (this._list != null && (0, (_recordsChanged || _load_recordsChanged()).default)(prevProps.displayableRecords, this.props.displayableRecords)) {
      // $FlowIgnore Untyped react-virtualized List method
      this._list.recomputeRowHeights();
    }
  }

  render() {
    return (
      // $FlowFixMe(>=0.53.0) Flow suppress
      _react.createElement(
        (_ResizeSensitiveContainer || _load_ResizeSensitiveContainer()).ResizeSensitiveContainer,
        {
          className: 'nuclide-console-table-wrapper native-key-bindings',
          onResize: this._handleResize,
          tabIndex: '1' },
        this._containerRendered() ? _react.createElement((_reactVirtualized || _load_reactVirtualized()).List
        // $FlowFixMe(>=0.53.0) Flow suppress
        , { ref: this._handleListRef,
          height: this.state.height,
          width: this.state.width,
          rowCount: this.props.displayableRecords.length,
          rowHeight: this._getRowHeight,
          rowRenderer: this._renderRow,
          overscanRowCount: OVERSCAN_COUNT,
          onScroll: this._onScroll,
          onRowsRendered: this._handleListRender
        }) : null
      )
    );
  }

  scrollToBottom() {
    if (this._list != null) {
      // $FlowIgnore Untyped react-virtualized List method
      this._list.scrollToRow(this.props.displayableRecords.length - 1);
    }
  }

  _containerRendered() {
    return this.state.width !== 0 && this.state.height !== 0;
  }

}
exports.default = OutputTable;