'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImportFormatter = undefined;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EXTENTIONS_TO_REMOVE = ['.js']; /**
                                       * Copyright (c) 2015-present, Facebook, Inc.
                                       * All rights reserved.
                                       *
                                       * This source code is licensed under the license found in the LICENSE file in
                                       * the root directory of this source tree.
                                       *
                                       * 
                                       * @format
                                       */

class ImportFormatter {

  constructor(dirs, isHaste) {
    this.moduleDirs = dirs;
    this.isHaste = isHaste;
  }

  formatImport(file, exp) {
    const { isTypeExport, id, isDefault } = exp;

    return isDefault ? `import ${id} from '${this.formatImportFile(file, exp)}'` : `import ${isTypeExport ? 'type ' : ''}{${id}} from '${this.formatImportFile(file, exp)}'`;
  }

  _formatHasteImportFile(file, exp) {
    return (_nuclideUri || _load_nuclideUri()).default.basename((_nuclideUri || _load_nuclideUri()).default.stripExtension(exp.uri));
  }

  formatImportFile(file, exp) {
    if (this.isHaste) {
      return this._formatHasteImportFile(file, exp);
    }
    const uri = abbreviateMainFiles(exp);
    const pathRelativeToModules = handleModules(uri, file, this.moduleDirs);
    // flowlint-next-line sketchy-null-string:off
    if (pathRelativeToModules) {
      return removeFileExtensions(pathRelativeToModules);
    }

    let pathRelativeToFile = (_nuclideUri || _load_nuclideUri()).default.relative((_nuclideUri || _load_nuclideUri()).default.dirname(file), uri);

    // Convert types.js => ./types.js
    pathRelativeToFile = pathRelativeToFile.startsWith('.') ? pathRelativeToFile : './' + pathRelativeToFile;

    return removeFileExtensions(pathRelativeToFile);
  }

  stripLeadingDots(file) {
    return file.startsWith('..') ? (_nuclideUri || _load_nuclideUri()).default.join('', ...(_nuclideUri || _load_nuclideUri()).default.split(file).filter(e => e !== '..')) : file;
  }
}

exports.ImportFormatter = ImportFormatter;
function handleModules(fileWithExport, fileMissingImport, moduleDirs) {
  const moduleDirOfExport = getFileModuleDirectory(fileWithExport, moduleDirs);

  // flowlint-next-line sketchy-null-string:off
  if (!moduleDirOfExport) {
    return null;
  }

  // If the export is from a module, we need to check if we are importing the
  // file from that same module. If so, the import must be relative.
  const moduleDirOfImport = getFileModuleDirectory(fileMissingImport, moduleDirs);
  if (moduleDirOfImport != null && moduleDirOfImport === moduleDirOfExport && getModule(fileMissingImport, moduleDirOfImport) === getModule(fileWithExport, moduleDirOfExport)) {
    // Import should be relative to the file we are importing from, so return null.
    return null;
  }

  // Import should be relative to the module.
  return (_nuclideUri || _load_nuclideUri()).default.relative(moduleDirOfExport, fileWithExport);
}

function abbreviateMainFiles(exp) {
  // flowlint-next-line sketchy-null-string:off
  return exp.directoryForMainFile || exp.uri;
}

function removeFileExtensions(file) {
  for (const extension of EXTENTIONS_TO_REMOVE) {
    if (file.endsWith(extension)) {
      return file.substring(0, file.length - extension.length);
    }
  }
  return file;
}

function getFileModuleDirectory(file, moduleDirs) {
  return moduleDirs.find(moduleDir => (_nuclideUri || _load_nuclideUri()).default.contains(moduleDir, file));
}

function getModule(file, moduleDirectory) {
  return (_nuclideUri || _load_nuclideUri()).default.split((_nuclideUri || _load_nuclideUri()).default.relative(moduleDirectory, file))[0];
}