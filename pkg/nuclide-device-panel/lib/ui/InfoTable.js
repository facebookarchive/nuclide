"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InfoTable = void 0;

var React = _interopRequireWildcard(require("react"));

function _Table() {
  const data = require("../../../../modules/nuclide-commons-ui/Table");

  _Table = function () {
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
 * 
 * @format
 */
class InfoTable extends React.Component {
  render() {
    const rows = Array.from(this.props.table.entries()).map(([key, value]) => ({
      data: {
        property: key,
        value
      }
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

    const emptyComponent = () => React.createElement("div", {
      className: "padded"
    }, "No information");

    return React.createElement("div", null, React.createElement(_Table().Table, {
      collapsable: false,
      columns: columns,
      maxBodyHeight: "99999px",
      emptyComponent: emptyComponent,
      rows: rows,
      headerTitle: this.props.title
    }));
  }

}

exports.InfoTable = InfoTable;