"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMessageStream;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _createMessage() {
  const data = _interopRequireDefault(require("./createMessage"));

  _createMessage = function () {
    return data;
  };

  return data;
}

function _parseLogcatMetadata() {
  const data = _interopRequireDefault(require("./parseLogcatMetadata"));

  _parseLogcatMetadata = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
function createMessageStream(line$) {
  // Separate the lines into groups, beginning with metadata lines.
  const messages = _RxMin.Observable.create(observer => {
    let buffer = [];
    let prevMetadata = null;

    const prevLineIsBlank = () => buffer[buffer.length - 1] === '';

    const flush = () => {
      if (buffer.length === 0) {
        return;
      } // Remove the empty line, which is a message separator.


      if (prevLineIsBlank()) {
        buffer.pop();
      }

      observer.next({
        metadata: prevMetadata,
        message: buffer.join('\n')
      });
      buffer = [];
      prevMetadata = null;
    };

    const sharedLine$ = line$.share();
    return new (_UniversalDisposable().default)( // Buffer incoming lines.
    sharedLine$.subscribe( // onNext
    line => {
      let metadata;
      const hasPreviousLines = buffer.length > 0;

      if (!hasPreviousLines || prevLineIsBlank()) {
        metadata = (0, _parseLogcatMetadata().default)(line);
      }

      if (metadata) {
        // We've reached a new message so the other one must be done.
        flush();
        prevMetadata = metadata;
      } else {
        buffer.push(line);
      }
    }, // onError
    error => {
      flush();
      observer.error(error);
    }, // onCompleted
    () => {
      flush();
      observer.complete();
    }), // We know *for certain* that we have a complete entry once we see the metadata for the next
    // one. But what if the next one takes a long time to happen? After a certain point, we need
    // to just assume we have the complete entry and move on.
    sharedLine$.let((0, _observable().fastDebounce)(200)).subscribe(flush));
  }).map(_createMessage().default);

  return filter(messages).share();
}

function filter(messages) {
  const patterns = _featureConfig().default.observeAsStream('nuclide-adb-logcat.whitelistedTags').map(source => {
    try {
      return new RegExp(source);
    } catch (err) {
      atom.notifications.addError('The nuclide-adb-logcat.whitelistedTags setting contains an invalid regular expression' + ' string. Fix it in your Atom settings.');
      return /.*/;
    }
  });

  return messages.withLatestFrom(patterns).filter(([message, pattern]) => {
    // Add an empty tag to untagged messages so they cfeaturean be matched by `.*` etc.
    const tags = message.tags == null ? [''] : message.tags;
    return tags.some(tag => pattern.test(tag));
  }).map(([message, pattern]) => message);
}