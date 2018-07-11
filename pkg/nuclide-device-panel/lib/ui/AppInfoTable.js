"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppInfoTable = void 0;

var React = _interopRequireWildcard(require("react"));

function _Table() {
  const data = require("../../../../modules/nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _AppInfoValueCell() {
  const data = require("./AppInfoValueCell");

  _AppInfoValueCell = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class AppInfoTable extends React.PureComponent {
  componentDidMount() {
    (0, _nuclideAnalytics().track)(_constants().AnalyticsActions.APPINFOTABLES_UI_MOUNT, {
      rows: this.props.rows.map(row => row.name)
    });
  }

  componentWillUnmount() {
    (0, _nuclideAnalytics().track)(_constants().AnalyticsActions.APPINFOTABLES_UI_UNMOUNT);
  }

  render() {
    const rows = this.props.rows.map(row => ({
      data: {
        property: row.name,
        rowData: row
      }
    }));
    const columns = [{
      key: 'property',
      title: 'Property',
      width: 0.4
    }, {
      component: _AppInfoValueCell().AppInfoValueCell,
      key: 'rowData',
      title: 'Value',
      width: 0.6
    }];

    const emptyComponent = () => React.createElement("div", {
      className: "padded"
    }, "No information");

    return React.createElement("div", null, React.createElement(_Table().Table, {
      collapsable: false,
      columns: columns,
      maxBodyHeight: "99999px",
      emptyComponent: emptyComponent,
      rows: rows,
      headerTitle: this.props.title,
      enableKeyboardNavigation: true
    }));
  }

}

exports.AppInfoTable = AppInfoTable;