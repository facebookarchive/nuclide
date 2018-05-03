'use strict';Object.defineProperty(exports, "__esModule", { value: true });











var _react = _interopRequireWildcard(require('react'));var _anser;
function _load_anser() {return _anser = _interopRequireDefault(require('anser'));}var _escapeCarriage;
function _load_escapeCarriage() {return _escapeCarriage = _interopRequireDefault(require('escape-carriage'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */function ansiToJSON(input) {return (_anser || _load_anser()).default.ansiToJson((0, (_escapeCarriage || _load_escapeCarriage()).default)(input), { json: true, remove_empty: true });}function ansiJSONtoStyleBundle(ansiBundle) {const style = {};
  if (ansiBundle.bg) {
    style.backgroundColor = `rgb(${ansiBundle.bg})`;
  }
  if (ansiBundle.fg) {
    style.color = `rgb(${ansiBundle.fg})`;
  }
  return {
    content: ansiBundle.content,
    style };

}

function ansiToInlineStyle(text) {
  return ansiToJSON(text).map(ansiJSONtoStyleBundle);
}








function defaultRenderSegment({ key, style, content }) {
  return (
    _react.createElement('span', { key: key, style: style },
      content));


}

class Ansi extends _react.PureComponent {
  render() {
    const _props =



    this.props,{ children, renderSegment = defaultRenderSegment } = _props,passThroughProps = _objectWithoutProperties(_props, ['children', 'renderSegment']);
    return (
      _react.createElement('code', passThroughProps,
        ansiToInlineStyle(children).map(({ style, content }, key) =>
        renderSegment({ key: String(key), style, content }))));



  }}exports.default = Ansi;