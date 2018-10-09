"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _marked() {
  const data = _interopRequireDefault(require("marked"));

  _marked = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _MarkedStringSnippet() {
  const data = _interopRequireDefault(require("./MarkedStringSnippet"));

  _MarkedStringSnippet = function () {
    return data;
  };

  return data;
}

function _dompurify() {
  const data = _interopRequireDefault(require("dompurify"));

  _dompurify = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const domPurify = (0, _dompurify().default)();

class MarkedStringDatatip extends React.PureComponent {
  render() {
    const elements = this.props.markedStrings.map((chunk, i) => {
      if (chunk.type === 'markdown') {
        return React.createElement("div", {
          className: "datatip-marked-container",
          dangerouslySetInnerHTML: {
            __html: domPurify.sanitize((0, _marked().default)(chunk.value, {
              breaks: true
            }))
          },
          key: i
        });
      } else {
        return React.createElement(_MarkedStringSnippet().default, Object.assign({
          key: i
        }, chunk));
      }
    });
    return React.createElement("div", {
      className: "datatip-marked"
    }, elements);
  }

}

exports.default = MarkedStringDatatip;