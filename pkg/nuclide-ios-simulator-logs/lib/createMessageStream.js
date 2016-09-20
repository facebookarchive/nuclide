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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.createMessageStream = createMessageStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeObservable2;

function _commonsNodeObservable() {
  return _commonsNodeObservable2 = require('../../commons-node/observable');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _createMessage2;

function _createMessage() {
  return _createMessage2 = require('./createMessage');
}

var _plist2;

function _plist() {
  return _plist2 = _interopRequireDefault(require('plist'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

function createMessageStream(line$) {

  // Group the lines into valid plist strings.
  var messages = (0, (_commonsNodeObservable2 || _commonsNodeObservable()).bufferUntil)(line$, function (line) {
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
    return (_plist2 || _plist()).default.parse(xml);
  })

  // Exclude dicts that don't have any message property.
  .filter(function (record) {
    return record.hasOwnProperty('Message');
  })

  // Exclude blacklisted senders.
  // FIXME: This is a stopgap. What we really need to do is identify the currently running app and
  //   only show its messages. ):
  .filter(function (record) {
    var blacklist = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-ios-simulator-logs.senderBlacklist');
    return blacklist.indexOf(record.Sender) === -1;
  })

  // Format the messages for Nuclide.
  .map((_createMessage2 || _createMessage()).createMessage);

  return filter(messages);
}

function filter(messages) {
  var patterns = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.observeAsStream('nuclide-ios-simulator-logs.whitelistedTags').map(function (source) {
    try {
      return new RegExp(source);
    } catch (err) {
      atom.notifications.addError('The nuclide-ios-simulator-logs.whitelistedTags setting contains an invalid regular' + ' expression string. Fix it in your Atom settings.');
      return (/.*/
      );
    }
  });

  return messages.withLatestFrom(patterns).filter(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var message = _ref2[0];
    var pattern = _ref2[1];

    // Add an empty tag to untagged messages so they cfeaturean be matched by `.*` etc.
    var tags = message.tags == null ? [''] : message.tags;
    return tags.some(function (tag) {
      return pattern.test(tag);
    });
  }).map(function (_ref3) {
    var _ref32 = _slicedToArray(_ref3, 2);

    var message = _ref32[0];
    var pattern = _ref32[1];
    return message;
  });
}