"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseFile = parseFile;
exports.AutoImportsManager = exports.babylonOptions = void 0;

var _child_process = _interopRequireDefault(require("child_process"));

function _definitionManager() {
  const data = _interopRequireDefault(require("../../../nuclide-ui-component-tools-common/lib/definitionManager"));

  _definitionManager = function () {
    return data;
  };

  return data;
}

function _ExportManager() {
  const data = require("./ExportManager");

  _ExportManager = function () {
    return data;
  };

  return data;
}

function _UndefinedSymbolManager() {
  const data = require("./UndefinedSymbolManager");

  _UndefinedSymbolManager = function () {
    return data;
  };

  return data;
}

function babylon() {
  const data = _interopRequireWildcard(require("@babel/parser"));

  babylon = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _util() {
  const data = require("../utils/util");

  _util = function () {
    return data;
  };

  return data;
}

function _lspUtils() {
  const data = require("../../../nuclide-lsp-implementation-common/lsp-utils");

  _lspUtils = function () {
    return data;
  };

  return data;
}

function _simpleTextBuffer() {
  const data = require("simple-text-buffer");

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
}

function _vscodeLanguageserver() {
  const data = require("vscode-languageserver");

  _vscodeLanguageserver = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const babylonOptions = {
  sourceType: 'module',
  plugins: ['jsx', 'flow', 'exportExtensions', 'objectRestSpread', 'classProperties', 'nullishCoalescingOperator', 'optionalChaining', 'optionalCatchBinding']
};
exports.babylonOptions = babylonOptions;
const logger = (0, _log4js().getLogger)(); // Whether files that have disabled eslint with a comment should be ignored.

const IGNORE_ESLINT_DISABLED_FILES = true; // Large files are slow to parse. Bail after a certain limit.

const LARGE_FILE_LIMIT = 2000000;
const MAX_CRASHES = 3;

class AutoImportsManager {
  constructor(globals, componentModulePathFilter) {
    this.componentModulePathFilter = componentModulePathFilter;
    this.definitionManager = new (_definitionManager().default)();
    this.suggestedImports = new Map();
    this.exportsManager = new (_ExportManager().ExportManager)();
    this.undefinedSymbolsManager = new (_UndefinedSymbolManager().UndefinedSymbolManager)(globals);
    this.crashes = 0;
  }

  getDefinitionManager() {
    return this.definitionManager;
  } // Only indexes the file (used for testing purposes)


  indexFile(fileUri, code) {
    const ast = parseFile(code);

    if (ast) {
      this.exportsManager.addFile(fileUri, ast);
    }
  } // Indexes an entire directory recursively in another process, watches for changes
  // and listens for messages from this process to index a file.


  indexAndWatchDirectory(root) {
    logger.debug('Indexing the directory', root, 'recursively');

    const worker = _child_process.default.fork(_nuclideUri().default.join(__dirname, 'AutoImportsWorker-entry.js'), [root], {
      env: {
        componentModulePathFilter: this.componentModulePathFilter
      }
    });

    worker.on('message', updateForFile => {
      updateForFile.forEach(this.handleUpdateForFile.bind(this));
    });
    worker.on('exit', code => {
      logger.error(`AutoImportsWorker exited with code ${code} (retry: ${this.crashes})`);
      this.crashes += 1;

      if (this.crashes < MAX_CRASHES) {
        this.indexAndWatchDirectory(root);
      } else {
        this.worker = null;
      }
    });
    this.worker = worker;
  } // Tells the AutoImportsWorker to index a file. indexAndWatchDirectory must be
  // called first on a directory that is a parent of fileUri.


  workerIndexFile(fileUri, fileContents) {
    if (this.worker == null) {
      logger.debug(`Worker is not running when asked to index ${fileUri}`);
      return;
    }

    this.worker.send({
      fileUri,
      fileContents
    });
  }

  findMissingImports(fileUri, code, onlyAvailableExports = true) {
    const ast = parseFile(code);
    return this.findMissingImportsInAST(fileUri, ast, onlyAvailableExports);
  }

  findMissingImportsInAST(fileUri, ast, onlyAvailableExports) {
    if (ast == null || checkEslint(ast)) {
      return [];
    }

    const missingImports = undefinedSymbolsToMissingImports(fileUri, this.undefinedSymbolsManager.findUndefined(ast), this.exportsManager, onlyAvailableExports);
    this.suggestedImports.set(fileUri, missingImports);
    return missingImports;
  }

  handleUpdateForFile(update) {
    const {
      componentDefinition,
      updateType,
      file,
      exports
    } = update;

    switch (updateType) {
      case 'setExports':
        if (componentDefinition != null) {
          this.definitionManager.addDefinition(componentDefinition);
        }

        this.exportsManager.setExportsForFile(file, exports);
        break;

      case 'deleteExports':
        this.exportsManager.clearExportsFromFile(file);
        break;
    }
  }

  findFilesWithSymbol(id) {
    return this.exportsManager.getExportsIndex().getExportsFromId(id);
  }

  getSuggestedImportsForRange(file, range) {
    const suggestedImports = this.suggestedImports.get(file) || [];
    return suggestedImports.filter(suggestedImport => {
      // We use intersectsWith instead of containsRange to be compatible with clients
      // like VSCode which may request small ranges (the range of the current word).
      return _simpleTextBuffer().Range.fromObject((0, _lspUtils().lspRangeToAtomRange)(range)).intersectsWith((0, _util().babelLocationToAtomRange)(suggestedImport.symbol.location), true);
    });
  }

}

exports.AutoImportsManager = AutoImportsManager;

function parseFile(code) {
  if (code.length >= LARGE_FILE_LIMIT) {
    return null;
  }

  try {
    return babylon().parse(code, babylonOptions);
  } catch (error) {
    // Encountered a parsing error. We don't log anything because this will be
    // quite common as this function can and will be called on every file edit.
    return null;
  }
}

function undefinedSymbolsToMissingImports(fileUri, undefinedSymbols, exportsManager, onlyAvailableExports) {
  return undefinedSymbols.map(symbol => {
    const isValue = symbol.type === 'value';
    return {
      symbol,
      filesWithExport: exportsManager.getExportsIndex().getExportsFromId(symbol.id).filter(jsExport => {
        // Value imports cannot use type exports.
        if (isValue && jsExport.isTypeExport) {
          return false;
        } // No self imports.


        return jsExport.uri !== fileUri;
      })
    };
  }).filter(result => !onlyAvailableExports || result.filesWithExport.length > 0);
}

function checkEslint(ast) {
  return IGNORE_ESLINT_DISABLED_FILES && ast.comments && ast.comments.find(comment => comment.type === 'CommentBlock' && comment.value.trim() === 'eslint-disable');
}