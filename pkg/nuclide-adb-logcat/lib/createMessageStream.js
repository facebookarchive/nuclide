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

exports.default = createMessageStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _createMessage2;

function _createMessage() {
  return _createMessage2 = _interopRequireDefault(require('./createMessage'));
}

var _parseLogcatMetadata2;

function _parseLogcatMetadata() {
  return _parseLogcatMetadata2 = _interopRequireDefault(require('./parseLogcatMetadata'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

function createMessageStream(line$) {

  // Separate the lines into groups, beginning with metadata lines.
  var messages = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    var buffer = [];
    var prevMetadata = null;
    var prevLineIsBlank = function prevLineIsBlank() {
      return buffer[buffer.length - 1] === '';
    };

    var flush = function flush() {
      if (buffer.length === 0) {
        return;
      }

      // Remove the empty line, which is a message separator.
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

    var sharedLine$ = line$.share();

    return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(
    // Buffer incoming lines.
    sharedLine$.subscribe(
    // onNext
    function (line) {
      var metadata = undefined;
      var hasPreviousLines = buffer.length > 0;

      if (!hasPreviousLines || prevLineIsBlank()) {
        metadata = (0, (_parseLogcatMetadata2 || _parseLogcatMetadata()).default)(line);
      }

      if (metadata) {
        // We've reached a new message so the other one must be done.
        flush();
        prevMetadata = metadata;
      } else {
        buffer.push(line);
      }
    },

    // onError
    function (error) {
      flush();
      observer.error(error);
    },

    // onCompleted
    function () {
      flush();
      observer.complete();
    }),

    // We know *for certain* that we have a complete entry once we see the metadata for the next
    // one. But what if the next one takes a long time to happen? After a certain point, we need
    // to just assume we have the complete entry and move on.
    sharedLine$.debounceTime(200).subscribe(flush));
  }).map((_createMessage2 || _createMessage()).default);

  return filter(messages).share();
}

function filter(messages) {
  var patterns = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.observeAsStream('nuclide-adb-logcat.whitelistedTags').map(function (source) {
    try {
      return new RegExp(source);
    } catch (err) {
      atom.notifications.addError('The nuclide-adb-logcat.whitelistedTags setting contains an invalid regular expression' + ' string. Fix it in your Atom settings.');
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
module.exports = exports.default;