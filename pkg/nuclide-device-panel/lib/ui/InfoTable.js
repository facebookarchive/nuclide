'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InfoTable = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class InfoTable extends _react.Component {
  render() {
    const rows = Array.from(this.props.table.entries()).map(([key, value]) => ({
      data: { property: key, value }
    }));
    const columns = [{
      key: 'property',
      title: 'Property',
      width: 0.4
    }, {
      key: 'value',
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
exports.InfoTable = InfoTable;