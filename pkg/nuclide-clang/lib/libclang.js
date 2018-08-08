"use strict";

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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

function _utils() {
  const data = require("../../nuclide-clang-rpc/lib/utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
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
 * @format
 */
const clangProviders = new Set();

function getServerSettings() {
  const config = _featureConfig().default.get('nuclide-clang');

  let {
    defaultFlags,
    libclangPath
  } = config;

  if (!config.enableDefaultFlags) {
    defaultFlags = null;
  } // If the path is empty then don't set it, let server use the default.


  if (libclangPath === '') {
    libclangPath = null;
  }

  return {
    defaultFlags,
    libclangPath
  };
}

async function findSourcePath(path) {
  if ((0, _utils().isHeaderFile)(path)) {
    const service = (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(path);

    if (service != null) {
      const source = await service.getRelatedSourceOrHeader(path);

      if (source != null) {
        return source;
      }
    }
  }

  return path;
}

async function getClangProvidersForSource(_src) {
  const src = await findSourcePath(_src);
  return (0, _collection().arrayCompact)((await Promise.all([...clangProviders].map(async provider => {
    if (await provider.supportsSource(src)) {
      return provider;
    }

    return null;
  })))).sort(provider => -provider.priority);
}

async function getClangRequestSettings(src) {
  const provider = (await getClangProvidersForSource(src))[0];

  if (provider != null) {
    return provider.getSettings(src);
  }
}

const clangServices = new WeakSet(); // eslint-disable-next-line nuclide-internal/no-commonjs

module.exports = {
  getServerSettings,
  getClangRequestSettings,

  registerClangProvider(provider) {
    clangProviders.add(provider);
    return new (_UniversalDisposable().default)(() => clangProviders.delete(provider));
  },

  async getRelatedSourceOrHeader(src) {
    return (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(src).getRelatedSourceOrHeader(src, (await getClangRequestSettings(src)));
  },

  async getDiagnostics(editor) {
    const src = editor.getPath();

    if (src == null) {
      return null;
    }

    const contents = editor.getText();
    const defaultSettings = getServerSettings();
    const service = (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(src); // When we fetch diagnostics for the first time, reset the server state.
    // This is so the user can easily refresh the Clang + Buck state by reloading Atom.
    // At this time we also set the memory limit of the service.

    if (!clangServices.has(service)) {
      const config = _featureConfig().default.get('nuclide-clang');

      clangServices.add(service);
      await service.setMemoryLimit(config.serverProcessMemoryLimit);
      await service.reset();
    }

    return service.compile(src, contents, (await getClangRequestSettings(src)), defaultSettings).refCount().toPromise();
  },

  async getCompletions(editor, prefix) {
    const src = editor.getPath();

    if (src == null) {
      return null;
    }

    const cursor = editor.getLastCursor();
    const line = cursor.getBufferRow();
    const column = cursor.getBufferColumn();
    const tokenStartColumn = column - prefix.length;
    const defaultSettings = getServerSettings();
    const service = (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(src);
    return service.getCompletions(src, editor.getText(), line, column, tokenStartColumn, prefix, (await getClangRequestSettings(src)), defaultSettings);
  },

  /**
   * If a location can be found for the declaration, it will be available via
   * the 'location' field on the returned object.
   */
  async getDeclaration(editor, line, column) {
    const src = editor.getPath();

    if (src == null) {
      return null;
    }

    const defaultSettings = getServerSettings();
    const service = (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(src);
    return service.getDeclaration(src, editor.getText(), line, column, (await getClangRequestSettings(src)), defaultSettings);
  },

  async getDeclarationInfo(editor, line, column) {
    const src = editor.getPath();

    if (src == null) {
      return Promise.resolve(null);
    }

    const defaultSettings = getServerSettings();
    const service = (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(src);

    if (service == null) {
      return Promise.resolve(null);
    }

    return service.getDeclarationInfo(src, editor.getText(), line, column, (await getClangRequestSettings(src)), defaultSettings);
  },

  async getOutline(editor) {
    const src = editor.getPath();

    if (src == null) {
      return Promise.resolve();
    }

    const defaultSettings = getServerSettings();
    const service = (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(src);
    return service.getOutline(src, editor.getText(), (await getClangRequestSettings(src)), defaultSettings);
  },

  async getLocalReferences(editor, line, column) {
    const src = editor.getPath();

    if (src == null) {
      return Promise.resolve(null);
    }

    const defaultSettings = getServerSettings();
    const service = (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(src);

    if (service == null) {
      return Promise.resolve(null);
    }

    return service.getLocalReferences(src, editor.getText(), line, column, (await getClangRequestSettings(src)), defaultSettings);
  },

  async formatCode(editor, range) {
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
    const service = (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(fileUri);
    return Object.assign({}, (await service.formatCode(fileUri, editor.getText(), cursor, startIndex, endIndex - startIndex)));
  },

  async resetForSource(editor) {
    const src = editor.getPath();

    if (src != null) {
      (await getClangProvidersForSource(src)).forEach(provider => provider.resetForSource(src));
      const service = (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(src);
      return service.resetForSource(src);
    }
  },

  async reset(src) {
    (await getClangProvidersForSource(src)).forEach(provider => provider.reset(src));
    await (0, _nuclideRemoteConnection().getClangServiceByNuclideUri)(src).reset();
  }

};