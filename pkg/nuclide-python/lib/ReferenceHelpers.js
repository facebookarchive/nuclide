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
exports.default = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dec, _desc, _value, _class;

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _projects;

function _load_projects() {
  return _projects = require('../../commons-atom/projects');
}

var _loadingNotification;

function _load_loadingNotification() {
  return _loadingNotification = _interopRequireDefault(require('../../commons-atom/loading-notification'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

let ReferenceHelpers = (_dec = (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('python.get-references'), (_class = class ReferenceHelpers {
  static getReferences(editor, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (!src) {
        return null;
      }

      // Choose the project root as baseUri, or if no project exists,
      // use the dirname of the src file.
      const baseUri = (0, (_projects || _load_projects()).getAtomProjectRootPath)(src) || (_nuclideUri || _load_nuclideUri()).default.dirname(src);

      const contents = editor.getText();
      const line = position.row;
      const column = position.column;

      const service = yield (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('PythonService', src);
      if (!service) {
        return null;
      }

      const result = yield (0, (_loadingNotification || _load_loadingNotification()).default)(service.getReferences(src, contents, line, column), 'Loading references from Jedi server...');

      if (!result || result.length === 0) {
        return { type: 'error', message: 'No usages were found.' };
      }

      const symbolName = result[0].text;

      // Process this into the format nuclide-find-references expects.
      const references = result.map(function (ref) {
        return {
          uri: ref.file,
          name: ref.parentName,
          range: new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(ref.line, ref.column), new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(ref.line, ref.column + ref.text.length))
        };
      });

      return {
        type: 'data',
        baseUri: baseUri,
        referencedSymbolName: symbolName,
        references: references
      };
    })();
  }

}, (_applyDecoratedDescriptor(_class, 'getReferences', [_dec], Object.getOwnPropertyDescriptor(_class, 'getReferences'), _class)), _class));
exports.default = ReferenceHelpers;
module.exports = exports['default'];