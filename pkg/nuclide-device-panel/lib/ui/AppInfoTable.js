'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppInfoTable = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Table;

function _load_Table() {
  return _Table = require('../../../../modules/nuclide-commons-ui/Table');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../../nuclide-analytics');
}

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

var _AppInfoValueCell;

function _load_AppInfoValueCell() {
  return _AppInfoValueCell = require('./AppInfoValueCell');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

class AppInfoTable extends _react.PureComponent {
  componentDidMount() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsActions.APPINFOTABLES_UI_MOUNT, {
      rows: this.props.rows.map(row => row.name)
    });
  }

  componentWillUnmount() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsActions.APPINFOTABLES_UI_UNMOUNT);
  }

  render() {
    const rows = this.props.rows.map(row => ({
      data: { property: row.name, rowData: row }
    }));
    const columns = [{
      key: 'property',
      title: 'Property',
      width: 0.4
    }, {
      component: (_AppInfoValueCell || _load_AppInfoValueCell()).AppInfoValueCell,
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
        headerTitle: this.props.title,
        enableKeyboardNavigation: true
      })
    );
  }
}
exports.AppInfoTable = AppInfoTable;