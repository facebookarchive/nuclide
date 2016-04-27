Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.createMessageStream = createMessageStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _createMessage = require('./createMessage');

var _plist = require('plist');

var _plist2 = _interopRequireDefault(_plist);

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

function createMessageStream(line$) {

  // Group the lines into valid plist strings.
  return (0, _nuclideCommons.bufferUntil)(line$, function (line) {
    return line.trim() === '</plist>';
  })
  // Don't include empty buffers. This happens if the stream completes since we opened a new
  // buffer when the previous record ended.
  .filter(function (lines) {
    return lines.length > 1;
  }).map(function (lines) {
    return lines.join('');
  })

  // Parse the plists. Each parsed plist contains an array which, in turn, *may* contain dicts
  // (that correspond to records). We just want those dicts so we use `flatMap()`.
  .flatMap(function (xml) {
    return _plist2['default'].parse(xml);
  })

  // Exclude dicts that don't have any message property.
  .filter(function (record) {
    return record.hasOwnProperty('Message');
  })

  // Exclude blacklisted senders.
  // FIXME: This is a stopgap. What we really need to do is identify the currently running app and
  //   only show its messages. ):
  .filter(function (record) {
    var blacklist = _nuclideFeatureConfig2['default'].get('nuclide-ios-simulator-logs.senderBlacklist');
    return blacklist.indexOf(record.Sender) === -1;
  })

  // Format the messages for Nuclide.
  .map(_createMessage.createMessage);
}