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

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomProjects2;

function _commonsAtomProjects() {
  return _commonsAtomProjects2 = require('../../commons-atom/projects');
}

var _commonsAtomLoadingNotification2;

function _commonsAtomLoadingNotification() {
  return _commonsAtomLoadingNotification2 = _interopRequireDefault(require('../../commons-atom/loading-notification'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var ReferenceHelpers = (function () {
  function ReferenceHelpers() {
    _classCallCheck(this, ReferenceHelpers);
  }

  _createDecoratedClass(ReferenceHelpers, null, [{
    key: 'getReferences',
    decorators: [(0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackTiming)('python.get-references')],
    value: _asyncToGenerator(function* (editor, position) {
      var src = editor.getPath();
      if (!src) {
        return null;
      }

      // Choose the project root as baseUri, or if no project exists,
      // use the dirname of the src file.
      var baseUri = (0, (_commonsAtomProjects2 || _commonsAtomProjects()).getAtomProjectRootPath)(src) || (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(src);

      var contents = editor.getText();
      var line = position.row;
      var column = position.column;

      var service = yield (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
      if (!service) {
        return null;
      }

      var result = yield (0, (_commonsAtomLoadingNotification2 || _commonsAtomLoadingNotification()).default)(service.getReferences(src, contents, line, column), 'Loading references from Jedi server...');

      if (!result || result.length === 0) {
        return { type: 'error', message: 'No usages were found.' };
      }

      var symbolName = result[0].text;

      // Process this into the format nuclide-find-references expects.
      var references = result.map(function (ref) {
        return {
          uri: ref.file,
          name: ref.parentName,
          start: {
            line: ref.line + 1,
            column: ref.column + 1
          },
          end: {
            line: ref.line + 1,
            column: ref.column + ref.text.length
          }
        };
      });

      return {
        type: 'data',
        baseUri: baseUri,
        referencedSymbolName: symbolName,
        references: references
      };
    })
  }]);

  return ReferenceHelpers;
})();

exports.default = ReferenceHelpers;
module.exports = exports.default;