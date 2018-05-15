'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _marked;













function _load_marked() {return _marked = _interopRequireDefault(require('marked'));}
var _react = _interopRequireWildcard(require('react'));var _MarkedStringSnippet;

function _load_MarkedStringSnippet() {return _MarkedStringSnippet = _interopRequireDefault(require('./MarkedStringSnippet'));}var _dompurify;
function _load_dompurify() {return _dompurify = _interopRequireDefault(require('dompurify'));}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const domPurify = (0, (_dompurify || _load_dompurify()).default)(); /**
                                                                     * Copyright (c) 2017-present, Facebook, Inc.
                                                                     * All rights reserved.
                                                                     *
                                                                     * This source code is licensed under the BSD-style license found in the
                                                                     * LICENSE file in the root directory of this source tree. An additional grant
                                                                     * of patent rights can be found in the PATENTS file in the same directory.
                                                                     *
                                                                     * 
                                                                     * @format
                                                                     */class MarkedStringDatatip extends _react.PureComponent {render() {const elements = this.props.markedStrings.map((chunk, i) => {if (chunk.type === 'markdown') {return (
          _react.createElement('div', {
            className: 'datatip-marked-container',
            dangerouslySetInnerHTML: {
              __html: domPurify.sanitize((0, (_marked || _load_marked()).default)(chunk.value)) },

            key: i }));


      } else {
        return _react.createElement((_MarkedStringSnippet || _load_MarkedStringSnippet()).default, Object.assign({ key: i }, chunk));
      }
    });

    return _react.createElement('div', { className: 'datatip-marked' }, elements);
  }}exports.default = MarkedStringDatatip;