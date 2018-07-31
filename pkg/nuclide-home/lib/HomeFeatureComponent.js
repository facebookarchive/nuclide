"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
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
class HomeFeatureComponent extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._tryIt = () => {
      const {
        command,
        title
      } = this.props;

      if (command == null) {
        return;
      }

      (0, _nuclideAnalytics().track)('home-feature-tried', {
        title
      });

      switch (typeof command) {
        case 'string':
          atom.commands.dispatch(atom.views.getView(atom.workspace), command, {
            _source: 'nuclide-home'
          });
          return;

        case 'function':
          command();
          return;

        default:
          throw new Error('Invalid command value');
      }
    }, _temp;
  }

  render() {
    const {
      title,
      command
    } = this.props;
    return React.createElement("details", {
      className: "nuclide-home-card"
    }, React.createElement("summary", {
      className: `nuclide-home-summary icon icon-${this.props.icon}`
    }, title, // flowlint-next-line sketchy-null-string:off
    command ? React.createElement(_Button().Button, {
      className: "pull-right nuclide-home-tryit",
      size: _Button().ButtonSizes.SMALL,
      onClick: this._tryIt
    }, "Try it") : null), React.createElement("div", {
      className: "nuclide-home-detail"
    }, this.props.description));
  }

}

exports.default = HomeFeatureComponent;