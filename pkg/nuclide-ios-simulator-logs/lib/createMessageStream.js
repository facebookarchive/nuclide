'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createMessageStream = createMessageStream;

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _createMessage;

function _load_createMessage() {
  return _createMessage = require('./createMessage');
}

var _plist;

function _load_plist() {
  return _plist = _interopRequireDefault(require('plist'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createMessageStream(line$) {

  // Group the lines into valid plist strings.
  const messages = (0, (_observable || _load_observable()).bufferUntil)(line$, line => line.trim() === '</plist>')
  // Don't include empty buffers. This happens if the stream completes since we opened a new
  // buffer when the previous record ended.
  .filter(lines => lines.length > 1).map(lines => lines.join(''))

  // Parse the plists. Each parsed plist contains an array which, in turn, *may* contain dicts
  // (that correspond to records). We just want those dicts so we use `flatMap()`.
  .flatMap(xml => (_plist || _load_plist()).default.parse(xml))

  // Exclude dicts that don't have any message property.
  .filter(record => record.hasOwnProperty('Message'))

  // Exclude blacklisted senders.
  // FIXME: This is a stopgap. What we really need to do is identify the currently running app and
  //   only show its messages. ):
  .filter(record => {
    const blacklist = (_featureConfig || _load_featureConfig()).default.get('nuclide-ios-simulator-logs.senderBlacklist');
    return blacklist.indexOf(record.Sender) === -1;
  })

  // Format the messages for Nuclide.
  .map((_createMessage || _load_createMessage()).createMessage);

  return filter(messages);
}

function filter(messages) {
  const patterns = (_featureConfig || _load_featureConfig()).default.observeAsStream('nuclide-ios-simulator-logs.whitelistedTags').map(source => {
    try {
      return new RegExp(source);
    } catch (err) {
      atom.notifications.addError('The nuclide-ios-simulator-logs.whitelistedTags setting contains an invalid regular' + ' expression string. Fix it in your Atom settings.');
      return (/.*/
      );
    }
  });

  return messages.withLatestFrom(patterns).filter((_ref) => {
    var _ref2 = _slicedToArray(_ref, 2);

    let message = _ref2[0],
        pattern = _ref2[1];

    // Add an empty tag to untagged messages so they cfeaturean be matched by `.*` etc.
    const tags = message.tags == null ? [''] : message.tags;
    return tags.some(tag => pattern.test(tag));
  }).map((_ref3) => {
    var _ref4 = _slicedToArray(_ref3, 2);

    let message = _ref4[0],
        pattern = _ref4[1];
    return message;
  });
}