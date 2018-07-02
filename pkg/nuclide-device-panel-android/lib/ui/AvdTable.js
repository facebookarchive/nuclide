"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _Table() {
  const data = require("../../../../modules/nuclide-commons-ui/Table");

  _Table = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class AvdTable extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._renderAvd = rowProps => {
      const {
        startAvd
      } = this.props;
      const avd = rowProps.data;
      return React.createElement("div", {
        className: (0, _classnames().default)('nuclide-device-panel-android-emulator-row', {
          'nuclide-device-panel-android-emulator-running': avd.running
        })
      }, avd.name, " ", avd.running ? ' (running)' : '', React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
        disabled: avd.running,
        icon: 'triangle-right',
        onClick: () => startAvd(avd),
        size: "SMALL"
      })));
    }, this._renderEmptyComponent = () => {
      const {
        avds
      } = this.props;
      return React.createElement("div", {
        className: "nuclide-device-panel-android-emulator-empty-message"
      }, avds.isError ? avds.error.message : 'No emulators found.');
    }, _temp;
  }

  render() {
    const {
      avds
    } = this.props;
    const rowData = avds.getOrDefault([]).map(avd => {
      return {
        avd
      };
    });
    return React.createElement(_Table().Table, {
      collapsable: false,
      columns: [{
        title: 'Emulators',
        key: 'avd',
        component: this._renderAvd.bind(this)
      }],
      emptyComponent: this._renderEmptyComponent,
      fixedHeader: true,
      rows: rowData.map(data => {
        return {
          data
        };
      })
    });
  }

}

exports.default = AvdTable;