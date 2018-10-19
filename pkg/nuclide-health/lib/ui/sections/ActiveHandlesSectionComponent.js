"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _HandlesTableComponent() {
  const data = _interopRequireDefault(require("./HandlesTableComponent"));

  _HandlesTableComponent = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class ActiveHandlesSectionComponent extends React.Component {
  render() {
    if (!this.props.activeHandlesByType || Object.keys(this.props.activeHandlesByType).length === 0) {
      return React.createElement("div", null);
    } // Note that widthPercentage properties should add up to 90 since the ID column always adds 10.


    return React.createElement("div", null, React.createElement(_HandlesTableComponent().default, {
      key: 2,
      title: "TLS Sockets",
      handles: this.props.activeHandlesByType.tlssocket,
      keyed: socket => socket.localPort,
      columns: [{
        title: 'Host',
        value: socket => socket._host || socket.remoteAddress,
        widthPercentage: 70
      }, {
        title: 'Read',
        value: socket => socket.bytesRead,
        widthPercentage: 10
      }, {
        title: 'Written',
        value: socket => socket.bytesWritten,
        widthPercentage: 10
      }]
    }), React.createElement(_HandlesTableComponent().default, {
      key: 3,
      title: "Other handles",
      handles: this.props.activeHandlesByType.other,
      keyed: (handle, h) => h,
      columns: [{
        title: 'Type',
        value: handle => handle.constructor.name,
        widthPercentage: 90
      }]
    }));
  }

}

exports.default = ActiveHandlesSectionComponent;