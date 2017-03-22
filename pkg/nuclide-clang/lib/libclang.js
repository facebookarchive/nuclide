'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getCompilationDatabaseFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src) {
    const compilationDatabases = yield Promise.all(Array.from(compilationDatabaseProviders.values()).map(function (provider) {
      return provider.getCompilationDatabaseFile(src);
    }));
    for (const compilationDatabase of compilationDatabases) {
      if (compilationDatabase != null) {
        return compilationDatabase;
      }
    }
    return null;
  });

  return function getCompilationDatabaseFile(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const compilationDatabaseProviders = new Set();

function getDefaultFlags() {
  const config = (_featureConfig || _load_featureConfig()).default.get('nuclide-clang');
  if (!config.enableDefaultFlags) {
    return null;
  }
  return config.defaultFlags;
}

const clangServices = new WeakSet();

module.exports = {
  registerCompilationDatabaseProvider(provider) {
    compilationDatabaseProviders.add(provider);
    return new _atom.Disposable(() => compilationDatabaseProviders.delete(provider));
  },

  getRelatedSourceOrHeader(src) {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);
    return getCompilationDatabaseFile(src).then(compilationDBFile => service.getRelatedSourceOrHeader(src, compilationDBFile));
  },

  getDiagnostics(editor) {
    return (0, _asyncToGenerator.default)(function* () {
      const src = editor.getPath();
      if (src == null) {
        return null;
      }
      const contents = editor.getText();

      const defaultFlags = getDefaultFlags();
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);

      // When we fetch diagnostics for the first time, reset the server state.
      // This is so the user can easily refresh the Clang + Buck state by reloading Atom.
      if (!clangServices.has(service)) {
        clangServices.add(service);
        yield service.reset();
      }

      return service.compile(src, contents, (yield getCompilationDatabaseFile(src)), defaultFlags).refCount().toPromise();
    })();
  },

  getCompletions(editor, prefix) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve();
    }
    const cursor = editor.getLastCursor();

    const line = cursor.getBufferRow();
    const column = cursor.getBufferColumn();
    const tokenStartColumn = column - prefix.length;

    const defaultFlags = getDefaultFlags();
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);

    return getCompilationDatabaseFile(src).then(compilationDBFile => service.getCompletions(src, editor.getText(), line, column, tokenStartColumn, prefix, compilationDBFile, defaultFlags));
  },

  /**
   * If a location can be found for the declaration, it will be available via
   * the 'location' field on the returned object.
   */
  getDeclaration(editor, line, column) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve();
    }
    const defaultFlags = getDefaultFlags();
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);
    return getCompilationDatabaseFile(src).then(compilationDBFile => service.getDeclaration(src, editor.getText(), line, column, compilationDBFile, defaultFlags));
  },

  getDeclarationInfo(editor, line, column) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve(null);
    }
    const defaultFlags = getDefaultFlags();

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', src);
    if (service == null) {
      return Promise.resolve(null);
    }

    return getCompilationDatabaseFile(src).then(compilationDBFile => service.getDeclarationInfo(src, editor.getText(), line, column, compilationDBFile, defaultFlags));
  },

  getOutline(editor) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve();
    }
    const defaultFlags = getDefaultFlags();
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);
    return getCompilationDatabaseFile(src).then(compilationDBFile => service.getOutline(src, editor.getText(), compilationDBFile, defaultFlags));
  },

  getLocalReferences(editor, line, column) {
    const src = editor.getPath();
    if (src == null) {
      return Promise.resolve(null);
    }
    const defaultFlags = getDefaultFlags();

    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('ClangService', src);
    if (service == null) {
      return Promise.resolve(null);
    }

    return getCompilationDatabaseFile(src).then(compilationDBFile => service.getLocalReferences(src, editor.getText(), line, column, compilationDBFile, defaultFlags));
  },

  formatCode(editor, range) {
    return (0, _asyncToGenerator.default)(function* () {
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
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(fileUri);
      return Object.assign({}, (yield service.formatCode(fileUri, editor.getText(), cursor, startIndex, endIndex - startIndex)));
    })();
  },

  reset(editor) {
    const src = editor.getPath();
    if (src != null) {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangServiceByNuclideUri)(src);
      return service.reset(src);
    }
  }

};