"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMessageStream = createMessageStream;

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _createMessage() {
  const data = require("./createMessage");

  _createMessage = function () {
    return data;
  };

  return data;
}

function _plist() {
  const data = _interopRequireDefault(require("plist"));

  _plist = function () {
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
  // Group the lines into valid plist strings.
  const messages = line$.let((0, _observable().bufferUntil)(line => line.trim() === '</plist>')) // Don't include empty buffers. This happens if the stream completes since we opened a new
  // buffer when the previous record ended.
  .filter(lines => lines.length > 1).map(lines => lines.join('')) // Parse the plists. Each parsed plist contains an array which, in turn, *may* contain dicts
  // (that correspond to records). We just want those dicts so we use `flatMap()`.
  .flatMap(xml => _plist().default.parse(xml)) // Exclude dicts that don't have any message property.
  .filter(record => record.hasOwnProperty('Message')) // Exclude blacklisted senders.
  // FIXME: This is a stopgap. What we really need to do is identify the currently running app and
  //   only show its messages. ):
  .filter(record => {
    const blacklist = _featureConfig().default.get('nuclide-ios-simulator-logs.senderBlacklist');

    return blacklist.indexOf(record.Sender) === -1;
  }) // Format the messages for Nuclide.
  .map(_createMessage().createMessage);
  return filter(messages);
}

function filter(messages) {
  const patterns = _featureConfig().default.observeAsStream('nuclide-ios-simulator-logs.whitelistedTags').map(source => {
    try {
      return new RegExp(source);
    } catch (err) {
      atom.notifications.addError('The nuclide-ios-simulator-logs.whitelistedTags setting contains an invalid regular' + ' expression string. Fix it in your Atom settings.');
      return /.*/;
    }
  });

  return messages.withLatestFrom(patterns).filter(([message, pattern]) => {
    // Add an empty tag to untagged messages so they cfeaturean be matched by `.*` etc.
    const tags = message.tags == null ? [''] : message.tags;
    return tags.some(tag => pattern.test(tag));
  }).map(([message, pattern]) => message);
}