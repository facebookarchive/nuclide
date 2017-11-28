'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppInfoTable = undefined;

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('nuclide-commons-ui/addTooltip'));
}

var _react = _interopRequireWildcard(require('react'));

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const MAX_ERROR_LINE_LENGTH = 80;
const MAX_NUMBER_ERROR_LINES = 10;

class AppInfoTable extends _react.Component {
  render() {
    const rows = Array.from(this.props.rows.entries()).map(([row]) => ({
      data: { property: row.name, rowData: row }
    }));
    const columns = [{
      key: 'property',
      title: 'Property',
      width: 0.4
    }, {
      component: AppInfoValueCell,
      key: 'rowData',
      title: 'Value',
      width: 0.6
    }];
    const emptyComponent = () => _react.createElement(
      'div',
      { className: 'padded' },
      'No information'
    );

    return _react.createElement(
      'div',
      null,
      _react.createElement((_Table || _load_Table()).Table, {
        collapsable: false,
        columns: columns,
        maxBodyHeight: '99999px',
        emptyComponent: emptyComponent,
        rows: rows,
        headerTitle: this.props.title
      })
    );
  }
}

exports.AppInfoTable = AppInfoTable;
class AppInfoValueCell extends _react.Component {
  _prepareErrorMessage(error) {
    return error.split(/\n/g).filter(line => line.length > 0).map(line => line.slice(0, MAX_ERROR_LINE_LENGTH)).slice(0, MAX_NUMBER_ERROR_LINES).join('<br>');
  }

  _renderError(error) {
    return _react.createElement('span', {
      className: 'icon icon-alert',
      ref: (0, (_addTooltip || _load_addTooltip()).default)({
        title: this._prepareErrorMessage(error),
        delay: 0
      })
    });
  }

  render() {
    const data = this.props.data;

    if (data.isError) {
      return this._renderError(data.value);
    }

    return data.value;
  }
}