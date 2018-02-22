'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _Table;

function _load_Table() {
  return _Table = require('nuclide-commons-ui/Table');
}

var _react = _interopRequireWildcard(require('react'));

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

class AvdTable extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._renderAvd = rowProps => {
      const { startAvd } = this.props;
      const avd = rowProps.data;
      return _react.createElement(
        'div',
        { className: 'nuclide-adb-sdb-emulator-row' },
        avd,
        _react.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.createElement((_Button || _load_Button()).Button, {
            icon: 'triangle-right',
            onClick: () => startAvd(avd),
            size: 'SMALL'
          })
        )
      );
    }, this._renderEmptyComponent = () => {
      const { avds } = this.props;
      return _react.createElement(
        'div',
        { className: 'nuclide-adb-sdb-emulator-empty-message' },
        avds.isError ? avds.error.message : 'No emulators found.'
      );
    }, _temp;
  }

  render() {
    const { avds, headerElement } = this.props;

    const rowData = avds.getOrDefault([]).map(avd => {
      return { avd };
    });

    return _react.createElement((_Table || _load_Table()).Table, {
      collapsable: false,
      columns: [{
        title: 'Emulators',
        key: 'avd',
        component: this._renderAvd.bind(this)
      }],
      emptyComponent: this._renderEmptyComponent,
      fixedHeader: true,
      headerElement: headerElement,
      rows: rowData.map(data => {
        return { data };
      })
    });
  }
}
exports.default = AvdTable;