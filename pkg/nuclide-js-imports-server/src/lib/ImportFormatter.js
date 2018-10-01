"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createImportStatement = createImportStatement;
exports.ImportFormatter = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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
const EXTENTIONS_TO_REMOVE = ['.js'];

class ImportFormatter {
  constructor(dirs, useRequire) {
    this.moduleDirs = dirs;
    this.useRequire = useRequire;
  }

  formatImport(file, exp) {
    const importPath = this.formatImportFile(file, exp);
    return createImportStatement(exp.id, importPath, getImportType(exp, this.useRequire));
  }

  formatImportFile(file, exp) {
    if (exp.hasteName != null) {
      return exp.hasteName;
    }

    const uri = abbreviateMainFiles(exp);
    const pathRelativeToModules = handleModules(uri, file, this.moduleDirs); // flowlint-next-line sketchy-null-string:off

    if (pathRelativeToModules) {
      return removeFileExtensions(pathRelativeToModules);
    }

    let pathRelativeToFile = _nuclideUri().default.relative(_nuclideUri().default.dirname(file), uri); // Convert types.js => ./types.js


    pathRelativeToFile = pathRelativeToFile.startsWith('.') ? pathRelativeToFile : './' + pathRelativeToFile;
    return removeFileExtensions(pathRelativeToFile);
  }

  stripLeadingDots(file) {
    return file.startsWith('..') ? _nuclideUri().default.join('', ..._nuclideUri().default.split(file).filter(e => e !== '..')) : file;
  }

}

exports.ImportFormatter = ImportFormatter;

function getImportType({
  isDefault,
  isTypeExport
}, useRequire) {
  if (isTypeExport) {
    return isDefault ? 'defaultType' : 'namedType';
  } else if (useRequire) {
    return isDefault ? 'requireImport' : 'requireDestructured';
  }

  return isDefault ? 'defaultValue' : 'namedValue';
}

function createImportStatement(id, importPath, importType) {
  switch (importType) {
    case 'namedValue':
      return `import {${id}} from '${importPath}';`;

    case 'namedType':
      return `import type {${id}} from '${importPath}';`;

    case 'requireImport':
      return `const ${id} = require('${importPath}');`;

    case 'requireDestructured':
      return `const {${id}} = require('${importPath}');`;

    case 'defaultValue':
      return `import ${id} from '${importPath}';`;

    case 'defaultType':
      return `import type ${id} from '${importPath}';`;

    default:
      importType;
      throw new Error(`Invalid import type ${importType}`);
  }
}

function handleModules(fileWithExport, fileMissingImport, moduleDirs) {
  const moduleDirOfExport = getFileModuleDirectory(fileWithExport, moduleDirs); // flowlint-next-line sketchy-null-string:off

  if (!moduleDirOfExport) {
    return null;
  } // If the export is from a module, we need to check if we are importing the
  // file from that same module. If so, the import must be relative.


  const moduleDirOfImport = getFileModuleDirectory(fileMissingImport, moduleDirs);

  if (moduleDirOfImport != null && moduleDirOfImport === moduleDirOfExport && getModule(fileMissingImport, moduleDirOfImport) === getModule(fileWithExport, moduleDirOfExport)) {
    // Import should be relative to the file we are importing from, so return null.
    return null;
  } // Import should be relative to the module.


  return _nuclideUri().default.relative(moduleDirOfExport, fileWithExport);
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
  return moduleDirs.find(moduleDir => _nuclideUri().default.contains(moduleDir, file));
}

function getModule(file, moduleDirectory) {
  return _nuclideUri().default.split(_nuclideUri().default.relative(moduleDirectory, file))[0];
}