'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.DiagnosticsMessageText = undefined;exports.





































separateUrls = separateUrls;var _react = _interopRequireWildcard(require('react'));var _electron = require('electron');var _dompurify;function _load_dompurify() {return _dompurify = _interopRequireDefault(require('dompurify'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */const domPurify = (0, (_dompurify || _load_dompurify()).default)(); // Exported for testing.
function separateUrls(message) {// Don't match periods at the end of URLs, because those are usually just to
  // end the sentence and not actually part of the URL. Optionally match
  // parameters following a question mark.
  // first bit before query/fragment
  const mainUrl = /https?:\/\/[\w/.%-]*[\w/-]/.source; // characters allowed in query/fragment, disallow `.` at the end
  const queryChars = /[\w-~%&+.!=:@/?]*[\w-~%&+!=:@/?]/.source;const urlRegex = new RegExp(`${mainUrl}(?:\\?${queryChars})?(?:#${queryChars})?`, 'g');const urls = message.match(urlRegex);const nonUrls = message.split(urlRegex);
  const parts = [
  {
    isUrl: false,
    text: nonUrls[0] }];


  for (let i = 1; i < nonUrls.length; i++) {if (!(
    urls != null)) {throw new Error('Invariant violation: "urls != null"');}
    parts.push({
      isUrl: true,
      url: urls[i - 1] });

    parts.push({
      isUrl: false,
      text: nonUrls[i] });

  }
  return parts;
}

const LEADING_WHITESPACE_RE = /^\s+/;
const NBSP = '\xa0';
function renderRowWithLinks(
message,
rowIndex,
rows)
{
  const messageWithWhitespace = message.replace(
  LEADING_WHITESPACE_RE,
  whitespace => NBSP.repeat(whitespace.length));

  const parts = separateUrls(messageWithWhitespace).map((part, index) => {
    if (!part.isUrl) {
      return part.text;
    } else {
      const openUrl = () => {
        _electron.shell.openExternal(part.url);
      };
      return (
        _react.createElement('a', { href: '#', key: index, onClick: openUrl },
          part.url));


    }
  });

  return (
    // We need to use a span here instead of a div so that `text-overflow: ellipsis` works.
    _react.createElement('span', { key: rowIndex },
      parts,
      rowIndex !== rows.length - 1 && _react.createElement('br', null)));


}

const DiagnosticsMessageText = exports.DiagnosticsMessageText = props => {
  const { message } = props;
  if (message.html != null) {
    return (
      _react.createElement('span', {
        title: message.text,
        dangerouslySetInnerHTML: {
          __html: domPurify.sanitize(message.html) } }));



  } else if (message.text != null) {
    const rows =
    props.preserveNewlines !== false ?
    message.text.split('\n') :
    [message.text];
    return _react.createElement('span', { title: message.text }, rows.map(renderRowWithLinks));
  } else {
    return _react.createElement('span', null, 'Diagnostic lacks message.');
  }
};