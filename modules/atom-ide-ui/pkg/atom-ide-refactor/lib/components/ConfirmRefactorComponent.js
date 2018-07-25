"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfirmRefactorComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _projects() {
  const data = require("../../../../../nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../../../nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _Icon() {
  const data = require("../../../../../nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

function _Tree() {
  const data = require("../../../../../nuclide-commons-ui/Tree");

  _Tree = function () {
    return data;
  };

  return data;
}

function _PathWithFileIcon() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/PathWithFileIcon"));

  _PathWithFileIcon = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../refactorActions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class ConfirmRefactorComponent extends React.PureComponent {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._execute = () => {
      this.props.store.dispatch(Actions().apply(this.props.phase.response));
    }, this._diffPreview = (uri, response) => {
      this.props.store.dispatch(Actions().loadDiffPreview(this.props.phase, uri, response));
    }, _temp;
  }

  render() {
    const {
      response
    } = this.props.phase;
    const editCount = new Map();

    for (const [path, edits] of response.edits) {
      editCount.set(path, (editCount.get(path) || 0) + edits.length);
    } // TODO: display actual diff output here.


    return React.createElement("div", null, "This refactoring will affect ", editCount.size, " files. Confirm?", React.createElement("div", {
      // Make the text copyable + selectable.
      className: "nuclide-refactorizer-confirm-list native-key-bindings",
      tabIndex: -1
    }, React.createElement(_Tree().TreeList, null, Array.from(editCount).map(([path, count]) => React.createElement(_Tree().TreeItem, {
      key: path
    }, React.createElement(_PathWithFileIcon().default, {
      className: 'nuclide-refactorizer-confirm-list-item',
      path: path
    }, React.createElement(_Icon().Icon, {
      className: "nuclide-refactorizer-diff-preview-icon",
      onClick: () => {
        this._diffPreview(path, response);
      },
      icon: "diff"
    }), React.createElement("span", {
      className: "nuclide-refactorizer-confirm-list-path"
    }, (0, _projects().getAtomProjectRelativePath)(path)), ' ', "(", count, " ", (0, _string().pluralize)('change', count), ")"))))), React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }, React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      onClick: this._execute,
      autoFocus: true
    }, "Confirm")));
  }

}

exports.ConfirmRefactorComponent = ConfirmRefactorComponent;