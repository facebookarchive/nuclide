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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var LIMIT = 100;
var QUALIFYING_FIELDS = ['class', 'namespace', 'struct', 'enum', 'Module'];

/**
 * If a line number is specified by the tag, jump to that line.
 * Otherwise, we'll have to look up the pattern in the file.
 */
function createCallback(tag) {
  return _asyncToGenerator(function* () {
    var lineNumber = yield (0, (_utils2 || _utils()).getLineNumberForTag)(tag);
    (0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(tag.file, lineNumber, 0);
  });
}

function commonPrefixLength(a, b) {
  var i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return i;
}

var HyperclickHelpers = (function () {
  function HyperclickHelpers() {
    _classCallCheck(this, HyperclickHelpers);
  }

  _createClass(HyperclickHelpers, null, [{
    key: 'getSuggestionForWord',
    value: _asyncToGenerator(function* (textEditor, text, range) {
      var path = textEditor.getPath();
      if (path == null) {
        return null;
      }

      var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('CtagsService', path);
      (0, (_assert2 || _assert()).default)(service);
      var ctagsService = yield service.getCtagsService(path);

      if (ctagsService == null) {
        return null;
      }

      try {
        var _ret = yield* (function* () {
          var tags = yield ctagsService.findTags(text, { limit: LIMIT });
          if (!tags.length) {
            return {
              v: null
            };
          }

          if (tags.length === 1) {
            return {
              v: { range: range, callback: createCallback(tags[0]) }
            };
          }

          // Favor tags in the nearest directory by sorting by common prefix length.
          tags.sort(function (_ref, _ref2) {
            var a = _ref.file;
            var b = _ref2.file;

            var len = commonPrefixLength(path, b) - commonPrefixLength(path, a);
            if (len === 0) {
              return a.localeCompare(b);
            }
            return len;
          });

          var tagsDir = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname((yield ctagsService.getTagsPath()));
          return {
            v: {
              range: range,
              callback: tags.map(function (tag) {
                var file = tag.file;
                var fields = tag.fields;
                var kind = tag.kind;

                var relpath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.relative(tagsDir, file);
                var title = tag.name + ' (' + relpath + ')';
                if (fields != null) {
                  // Python uses a.b.c; most other langauges use a::b::c.
                  // There are definitely other cases, but it's not a big issue.
                  var sep = file.endsWith('.py') ? '.' : '::';
                  for (var field of QUALIFYING_FIELDS) {
                    var val = fields.get(field);
                    if (val != null) {
                      title = val + sep + title;
                      break;
                    }
                  }
                }
                if (kind != null && (_utils2 || _utils()).CTAGS_KIND_NAMES[kind] != null) {
                  title = (_utils2 || _utils()).CTAGS_KIND_NAMES[kind] + ' ' + title;
                }
                return {
                  title: title,
                  callback: createCallback(tag)
                };
              })
            }
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      } finally {
        ctagsService.dispose();
      }
    })
  }]);

  return HyperclickHelpers;
})();

exports.default = HyperclickHelpers;
module.exports = exports.default;