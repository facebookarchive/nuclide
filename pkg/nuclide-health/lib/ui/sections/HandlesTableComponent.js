"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class HandlesTableComponent extends _react.Component {

  constructor(props) {
    super(props);
    this.previousHandleSummaries = {};
  }

  getHandleSummaries(handles) {
    const handleSummaries = {};
    handles.forEach((handle, h) => {
      const summarizedHandle = {};
      this.props.columns.forEach((column, c) => {
        summarizedHandle[c] = column.value(handle, h);
      });
      handleSummaries[this.props.keyed(handle, h)] = summarizedHandle;
    });
    return handleSummaries;
  }

  render() {
    if (this.props.handles.length === 0) {
      return _react.createElement("div", null);
    }

    const handleSummaries = this.getHandleSummaries(this.props.handles);
    const component = _react.createElement(
      "div",
      null,
      _react.createElement(
        "h3",
        null,
        this.props.title
      ),
      _react.createElement(
        "table",
        { className: "table" },
        _react.createElement(
          "thead",
          null,
          _react.createElement(
            "tr",
            null,
            _react.createElement(
              "th",
              { width: "10%" },
              "ID"
            ),
            this.props.columns.map((column, c) => _react.createElement(
              "th",
              { key: c, width: `${column.widthPercentage}%` },
              column.title
            ))
          )
        ),
        _react.createElement(
          "tbody",
          null,
          Object.keys(handleSummaries).map(key => {
            const handleSummary = handleSummaries[key];
            const previousHandle = this.previousHandleSummaries[key];
            return _react.createElement(
              "tr",
              {
                key: key,
                className: previousHandle ? '' : 'nuclide-health-handle-new' },
              _react.createElement(
                "th",
                null,
                key
              ),
              this.props.columns.map((column, c) => {
                let className = '';
                if (previousHandle && previousHandle[c] !== handleSummary[c]) {
                  className = 'nuclide-health-handle-updated';
                }
                return _react.createElement(
                  "td",
                  { key: c, className: className },
                  handleSummary[c]
                );
              })
            );
          })
        )
      )
    );
    this.previousHandleSummaries = handleSummaries;
    return component;
  }
}
exports.default = HandlesTableComponent; /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */