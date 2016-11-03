'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDefaultFlags() {
  const config = (_featureConfig || _load_featureConfig()).default.get('nuclide-clang');
  if (!config.enableDefaultFlags) {
    return null;
  }
  return config.defaultFlags;
}

const clangServices = new WeakSet();

module.exports = {
  getDiagnostics: (() => {
    var _ref = (0, _asyncToGenerator.default)(function* (editor) {
      const src = editor.getPath();
      if (src == null) {
        return null;
      }
      const contents = editor.getText();

      const defaultFlags = getDefaultFlags();
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', src);

      if (!service) {
        throw new Error('Invariant violation: "service"');
      }

      // When we fetch diagnostics for the first time, reset the server state.
      // This is so the user can easily refresh the Clang + Buck state by reloading Atom.


      if (!clangServices.has(service)) {
        clangServices.add(service);
        yield service.reset();
      }

      return service.compile(src, contents, defaultFlags).refCount().toPromise();
    });

    return function getDiagnostics(_x) {
      return _ref.apply(this, arguments);
    };
  })(),
  getCompletions: function (editor, prefix) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve();
    }
    const cursor = editor.getLastCursor();

    const line = cursor.getBufferRow();
    const column = cursor.getBufferColumn();
    const tokenStartColumn = column - prefix.length;

    const defaultFlags = getDefaultFlags();
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', src);

    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    return service.getCompletions(src, editor.getText(), line, column, tokenStartColumn, prefix, defaultFlags);
  },


  /**
   * If a location can be found for the declaration, it will be available via
   * the 'location' field on the returned object.
   */
  getDeclaration: function (editor, line, column) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve();
    }
    const defaultFlags = getDefaultFlags();

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', src);

    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    return service.getDeclaration(src, editor.getText(), line, column, defaultFlags);
  },
  getDeclarationInfo: function (editor, line, column) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve(null);
    }
    const defaultFlags = getDefaultFlags();

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', src);
    if (service == null) {
      return Promise.resolve(null);
    }

    return service.getDeclarationInfo(src, editor.getText(), line, column, defaultFlags);
  },
  getOutline: function (editor) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve();
    }
    const defaultFlags = getDefaultFlags();

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', src);

    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    return service.getOutline(src, editor.getText(), defaultFlags);
  },
  getLocalReferences: function (editor, line, column) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve(null);
    }
    const defaultFlags = getDefaultFlags();

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', src);
    if (service == null) {
      return Promise.resolve(null);
    }

    return service.getLocalReferences(src, editor.getText(), line, column, defaultFlags);
  },
  formatCode: (() => {
    var _ref2 = (0, _asyncToGenerator.default)(function* (editor, range) {
      const fileUri = editor.getPath();
      const buffer = editor.getBuffer();
      const cursor = buffer.characterIndexForPosition(editor.getLastCursor().getBufferPosition());
      if (fileUri == null) {
        return {
          formatted: editor.getText()
        };
      }
      const startIndex = buffer.characterIndexForPosition(range.start);
      const endIndex = buffer.characterIndexForPosition(range.end);

      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', fileUri);

      if (!service) {
        throw new Error('Invariant violation: "service"');
      }

      return Object.assign({}, (yield service.formatCode(fileUri, editor.getText(), cursor, startIndex, endIndex - startIndex)));
    });

    return function formatCode(_x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  })(),
  reset: function (editor) {
    const src = editor.getPath();
    if (src != null) {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', src);

      if (!service) {
        throw new Error('Invariant violation: "service"');
      }

      return service.reset(src);
    }
  }
};