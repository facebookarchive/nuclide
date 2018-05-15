'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _UniversalDisposable;



















function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _nullthrows;
function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _observableDom;
function _load_observableDom() {return _observableDom = require('../../../../../nuclide-commons-ui/observable-dom');}var _Hasher;
function _load_Hasher() {return _Hasher = _interopRequireDefault(require('../../../../../nuclide-commons/Hasher'));}
var _react = _interopRequireWildcard(require('react'));var _List;
function _load_List() {return _List = _interopRequireDefault(require('react-virtualized/dist/commonjs/List'));}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _RecordView;
function _load_RecordView() {return _RecordView = _interopRequireDefault(require('./RecordView'));}var _recordsChanged;
function _load_recordsChanged() {return _recordsChanged = _interopRequireDefault(require('../recordsChanged'));}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}






































/* eslint-enable react/no-unused-prop-types */

// The number of extra rows to render beyond what is visible
/* eslint-disable react/no-unused-prop-types */ /**
                                                 * Copyright (c) 2017-present, Facebook, Inc.
                                                 * All rights reserved.
                                                 *
                                                 * This source code is licensed under the BSD-style license found in the
                                                 * LICENSE file in the root directory of this source tree. An additional grant
                                                 * of patent rights can be found in the PATENTS file in the same directory.
                                                 *
                                                 * 
                                                 * @format
                                                 */const OVERSCAN_COUNT = 5;class OutputTable extends _react.Component {// This is a <List> from react-virtualized (untyped library)




  constructor(props) {
    super(props);this.











































    _handleRef = node => {
      this._refs.next(node);
    };this.

























    _handleListRender = opts => {
      this._startIndex = opts.startIndex;
      this._stopIndex = opts.stopIndex;
    };this.








    _getExecutor = id => {
      return this.props.getExecutor(id);
    };this.

    _getProvider = id => {
      return this.props.getProvider(id);
    };this.

    _renderRow = rowMetadata => {
      const { index, style } = rowMetadata;
      const displayableRecord = this.props.displayableRecords[index];
      const { record } = displayableRecord;
      return (
        _react.createElement('div', {
            key: this._hasher.getHash(displayableRecord.record),
            className: 'console-table-row-wrapper',
            style: style },
          _react.createElement((_RecordView || _load_RecordView()).default
          // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
          , { ref: view => {
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
            onHeightChange: this._handleRecordHeightChange })));



    };this.





    _getRowHeight = ({ index }) => {
      return this.props.displayableRecords[index].height;
    };this.

    _handleTableWrapper = tableWrapper => {
      this._wrapper = tableWrapper;
    };this.

    _handleListRef = listRef => {
      this._list = listRef;
    };this.

    _handleResize = (height, width) => {
      if (height === this.state.height && width === this.state.width) {
        return;
      }
      this.setState({
        width,
        height });


      // When this component resizes, the inner records will
      // also resize and potentially have their heights change
      // So we measure all of their heights again here
      this._renderedRecords.forEach(recordView =>
      recordView.measureAndNotifyHeight());

    };this.

    _handleRecordHeightChange = (recordId, newHeight) => {
      this.props.onDisplayableRecordHeightChange(recordId, newHeight, () => {
        // The react-virtualized List component is provided the row heights
        // through a function, so it has no way of knowing that a row's height
        // has changed unless we explicitly notify it to recompute the heights.
        if (this._list == null) {
          return;
        }
        // $FlowIgnore Untyped react-virtualized List component method
        this._list.recomputeRowHeights();

        // If we are already scrolled to the bottom, scroll to ensure that the scrollbar remains at
        // the bottom. This is important not just for if the last record changes height through user
        // interaction (e.g. expanding a debugger variable), but also because this is the mechanism
        // through which the record's true initial height is reported. Therefore, we may have scrolled
        // to the bottom, and only afterwards received its true height. In this case, it's important
        // that we then scroll to the new bottom.
        if (this.props.shouldScrollToBottom()) {
          this.scrollToBottom();
        }
      });
    };this.

    _onScroll = ({
      clientHeight,
      scrollHeight,
      scrollTop }) =>
    {
      this.props.onScroll(clientHeight, scrollHeight, scrollTop);
    };this._disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();this._hasher = new (_Hasher || _load_Hasher()).default();this._renderedRecords = new Map();this.state = { width: 0, height: 0 };this._startIndex = 0;this._stopIndex = 0;this._refs = new _rxjsBundlesRxMinJs.Subject();this._disposable.add(this._refs.filter(Boolean).switchMap(node => new (_observableDom || _load_observableDom()).ResizeObservable((0, (_nullthrows || _load_nullthrows()).default)(node)).mapTo(node)).subscribe(node => {const { offsetHeight, offsetWidth } = (0, (_nullthrows || _load_nullthrows()).default)(node);this._handleResize(offsetHeight, offsetWidth);}));} // The currently rendered range.
  componentDidUpdate(prevProps, prevState) {if (this._list != null && (0, (_recordsChanged || _load_recordsChanged()).default)(prevProps.displayableRecords, this.props.displayableRecords)) {// $FlowIgnore Untyped react-virtualized List method
      this._list.recomputeRowHeights();}if (prevProps.fontSize !== this.props.fontSize) {this._renderedRecords.forEach(recordView => recordView.measureAndNotifyHeight());}}componentWillUnmount() {this._disposable.dispose();}render() {return _react.createElement('div', { className: 'console-table-wrapper native-key-bindings', ref: this._handleRef, tabIndex: '1' }, this._containerRendered() ? _react.createElement((_List || _load_List()).default // $FlowFixMe(>=0.53.0) Flow suppress
      , { ref: this._handleListRef, height: this.state.height, width: this.state.width, rowCount: this.props.displayableRecords.length, rowHeight: this._getRowHeight, rowRenderer: this._renderRow, overscanRowCount: OVERSCAN_COUNT, onScroll: this._onScroll, onRowsRendered: this._handleListRender }) : null);}scrollToBottom() {if (this._list != null) {// $FlowIgnore Untyped react-virtualized List method
      this._list.scrollToRow(this.props.displayableRecords.length - 1);}}_containerRendered() {return this.state.width !== 0 && this.state.height !== 0;}}exports.default = OutputTable;