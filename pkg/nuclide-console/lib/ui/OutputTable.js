'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Hasher;

function _load_Hasher() {
  return _Hasher = _interopRequireDefault(require('../../../commons-node/Hasher'));
}

var _react = _interopRequireDefault(require('react'));

var _RecordView;

function _load_RecordView() {
  return _RecordView = _interopRequireDefault(require('./RecordView'));
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

class OutputTable extends _react.default.Component {

  constructor(props) {
    super(props);
    this._hasher = new (_Hasher || _load_Hasher()).default();
    this._getExecutor = this._getExecutor.bind(this);
    this._getProvider = this._getProvider.bind(this);
  }

  render() {
    return _react.default.createElement(
      'div',
      {
        className: 'nuclide-console-table-wrapper native-key-bindings',
        tabIndex: '1' },
      this.props.records.map(this._renderRow, this)
    );
  }

  _getExecutor(id) {
    return this.props.getExecutor(id);
  }

  _getProvider(id) {
    return this.props.getProvider(id);
  }

  _renderRow(record, index) {
    return _react.default.createElement((_RecordView || _load_RecordView()).default, {
      key: this._hasher.getHash(record),
      getExecutor: this._getExecutor,
      getProvider: this._getProvider,
      record: record,
      showSourceLabel: this.props.showSourceLabels
    });
  }
}
exports.default = OutputTable;