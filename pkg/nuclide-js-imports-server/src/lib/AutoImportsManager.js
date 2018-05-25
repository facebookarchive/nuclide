'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AutoImportsManager = exports.babylonOptions = undefined;
exports.parseFile = parseFile;

var _child_process = _interopRequireDefault(require('child_process'));

var _ExportManager;

function _load_ExportManager() {
  return _ExportManager = require('./ExportManager');
}

var _UndefinedSymbolManager;

function _load_UndefinedSymbolManager() {
  return _UndefinedSymbolManager = require('./UndefinedSymbolManager');
}

var _babylon;

function _load_babylon() {
  return _babylon = _interopRequireWildcard(require('babylon'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _util;

function _load_util() {
  return _util = require('../utils/util');
}

var _lspUtils;

function _load_lspUtils() {
  return _lspUtils = require('../../../nuclide-lsp-implementation-common/lsp-utils');
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const babylonOptions = exports.babylonOptions = {
  sourceType: 'module',
  plugins: ['jsx', 'flow', 'exportExtensions', 'objectRestSpread', 'classProperties', 'optionalChaining']
};

const logger = (0, (_log4js || _load_log4js()).getLogger)();

// Whether files that have disabled eslint with a comment should be ignored.
const IGNORE_ESLINT_DISABLED_FILES = true;

// Large files are slow to parse. Bail after a certain limit.
const LARGE_FILE_LIMIT = 2000000;

const MAX_CRASHES = 3;

class AutoImportsManager {

  constructor(globals) {
    this.suggestedImports = new Map();
    this.exportsManager = new (_ExportManager || _load_ExportManager()).ExportManager();
    this.undefinedSymbolsManager = new (_UndefinedSymbolManager || _load_UndefinedSymbolManager()).UndefinedSymbolManager(globals);
    this.crashes = 0;
  }

  // Only indexes the file (used for testing purposes)
  indexFile(fileUri, code) {
    const ast = parseFile(code);
    if (ast) {
      this.exportsManager.addFile(fileUri, ast);
    }
  }

  // Indexes an entire directory recursively in another process, watches for changes
  // and listens for messages from this process to index a file.
  indexAndWatchDirectory(root) {
    logger.debug('Indexing the directory', root, 'recursively');
    const worker = _child_process.default.fork((_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'AutoImportsWorker-entry.js'), [root]);
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
  }

  // Tells the AutoImportsWorker to index a file. indexAndWatchDirectory must be
  // called first on a directory that is a parent of fileUri.
  workerIndexFile(fileUri, fileContents) {
    if (this.worker == null) {
      logger.debug(`Worker is not running when asked to index ${fileUri}`);
      return;
    }
    this.worker.send({ fileUri, fileContents });
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
    const { updateType, file, exports } = update;
    switch (updateType) {
      case 'setExports':
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
      return (_simpleTextBuffer || _load_simpleTextBuffer()).Range.fromObject((0, (_lspUtils || _load_lspUtils()).lspRangeToAtomRange)(range)).intersectsWith((0, (_util || _load_util()).babelLocationToAtomRange)(suggestedImport.symbol.location), true);
    });
  }
}

exports.AutoImportsManager = AutoImportsManager;
function parseFile(code) {
  if (code.length >= LARGE_FILE_LIMIT) {
    return null;
  }
  try {
    return (_babylon || _load_babylon()).parse(code, babylonOptions);
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
        }
        // No self imports.
        return jsExport.uri !== fileUri;
      })
    };
  }).filter(result => !onlyAvailableExports || result.filesWithExport.length > 0);
}

function checkEslint(ast) {
  return IGNORE_ESLINT_DISABLED_FILES && ast.comments && ast.comments.find(comment => comment.type === 'CommentBlock' && comment.value.trim() === 'eslint-disable');
}