"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.separateUrls = separateUrls;
exports.DiagnosticsMessageText = void 0;

var React = _interopRequireWildcard(require("react"));

var _electron = require("electron");

function _dompurify() {
  const data = _interopRequireDefault(require("dompurify"));

  _dompurify = function () {
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
 * 
 * @format
 */
const domPurify = (0, _dompurify().default)();

// Exported for testing.
function separateUrls(message) {
  // Don't match periods at the end of URLs, because those are usually just to
  // end the sentence and not actually part of the URL. Optionally match
  // parameters following a question mark.
  // first bit before query/fragment
  const mainUrl = /https?:\/\/[\w/.%-]*[\w/-]/.source; // characters allowed in query/fragment, disallow `.` at the end

  const queryChars = /[\w-~%&+.!=:@/?]*[\w-~%&+!=:@/?]/.source;
  const urlRegex = new RegExp(`${mainUrl}(?:\\?${queryChars})?(?:#${queryChars})?`, 'g');
  const urls = message.match(urlRegex);
  const nonUrls = message.split(urlRegex);
  const parts = [{
    isUrl: false,
    text: nonUrls[0]
  }];

  for (let i = 1; i < nonUrls.length; i++) {
    if (!(urls != null)) {
      throw new Error("Invariant violation: \"urls != null\"");
    }

    parts.push({
      isUrl: true,
      url: urls[i - 1]
    });
    parts.push({
      isUrl: false,
      text: nonUrls[i]
    });
  }

  return parts;
}

const LEADING_WHITESPACE_RE = /^\s+/;
const NBSP = '\xa0';

function renderRowWithLinks(message, rowIndex, rows) {
  const messageWithWhitespace = message.replace(LEADING_WHITESPACE_RE, whitespace => NBSP.repeat(whitespace.length));
  const parts = separateUrls(messageWithWhitespace).map((part, index) => {
    if (!part.isUrl) {
      return part.text;
    } else {
      const openUrl = () => {
        _electron.shell.openExternal(part.url);
      };

      return React.createElement("a", {
        href: "#",
        key: index,
        onClick: openUrl
      }, part.url);
    }
  });
  return (// We need to use a span here instead of a div so that `text-overflow: ellipsis` works.
    React.createElement("span", {
      key: rowIndex
    }, parts, rowIndex !== rows.length - 1 && React.createElement("br", null))
  );
}

const DiagnosticsMessageText = props => {
  const {
    message
  } = props;

  if (message.html != null) {
    return React.createElement("span", {
      title: message.text,
      dangerouslySetInnerHTML: {
        __html: domPurify.sanitize(message.html)
      }
    });
  } else if (message.text != null) {
    const rows = props.preserveNewlines !== false ? message.text.split('\n') : [message.text];
    return React.createElement("span", {
      title: message.text
    }, rows.map(renderRowWithLinks));
  } else {
    return React.createElement("span", null, "Diagnostic lacks message.");
  }
};

exports.DiagnosticsMessageText = DiagnosticsMessageText;