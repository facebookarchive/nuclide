"use strict";

function _ImportFormatter() {
  const data = require("../src/lib/ImportFormatter");

  _ImportFormatter = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('ImportFormatter', () => {
  it('Should properly format filenames', () => {
    const suggestedImport = {
      id: 'SomeSymbol',
      uri: '/Users/login/home/root/someFile.js',
      line: 1,
      isTypeExport: false,
      isDefault: false
    };
    const formatter = new (_ImportFormatter().ImportFormatter)([], false);
    expect(formatter.formatImportFile('/Users/login/home/root/subdirectory/file.js', suggestedImport)).toBe('../someFile');
  });
  it('Should properly format filesnames with modules', () => {
    const suggestedImport = {
      id: 'SomeSymbol',
      uri: '/Users/login/home/root/subdirectory/modules/module1/someFile.js',
      line: 1,
      isTypeExport: false,
      isDefault: false
    };
    const formatter = new (_ImportFormatter().ImportFormatter)(['/Users/login/home/root/subdirectory/modules'], false);
    expect(formatter.formatImportFile('/Users/login/home/root/subdirectory/someProject/someSubdirectory/file.js', suggestedImport)).toBe('module1/someFile');
  });
  it('Should properly format filesnames with leading period', () => {
    const suggestedImport = {
      id: 'SomeSymbol',
      uri: '/Users/login/home/root/subdirectory/types.js',
      line: 1,
      isTypeExport: false,
      isDefault: false
    };
    const formatter = new (_ImportFormatter().ImportFormatter)(['/Users/login/home/root/subdirectory/modules'], false);
    expect(formatter.formatImportFile('/Users/login/home/root/subdirectory/file.js', suggestedImport)).toBe('./types');
  });
  it('Should properly format import statement for values', () => {
    const suggestedImport = {
      id: 'SomeSymbol',
      uri: '/Users/login/home/root/someFile.js',
      line: 1,
      isTypeExport: false,
      isDefault: false
    };
    const formatter = new (_ImportFormatter().ImportFormatter)([], false);
    expect(formatter.formatImport('/Users/login/home/root/subdirectory/file.js', suggestedImport)).toBe("import {SomeSymbol} from '../someFile';");
  });
  it('Should properly format import statement for types', () => {
    const suggestedImport = {
      id: 'SomeType',
      uri: '/Users/login/home/root/someFile.js',
      line: 1,
      isTypeExport: true,
      isDefault: false
    };
    const formatter = new (_ImportFormatter().ImportFormatter)([], false);
    expect(formatter.formatImport('/Users/login/home/root/subdirectory/file.js', suggestedImport)).toBe("import type {SomeType} from '../someFile';");
  });
  it('Should properly format import statement for default exports', () => {
    const suggestedImport = {
      id: 'SomeSymbol',
      uri: '/Users/login/home/root/someFile.js',
      line: 1,
      isTypeExport: false,
      isDefault: true
    };
    const formatter = new (_ImportFormatter().ImportFormatter)([], false);
    expect(formatter.formatImport('/Users/login/home/root/subdirectory/file.js', suggestedImport)).toBe("import SomeSymbol from '../someFile';");
  });
  it('Should provide a relative import for files within the same module', () => {
    const suggestedImport = {
      id: 'SomeSymbol',
      uri: '/Users/modules/atom-ide-ui/somePackage/someFile.js',
      line: 1,
      isTypeExport: false,
      isDefault: true
    };
    const formatter = new (_ImportFormatter().ImportFormatter)(['/Users/modules'], false);
    expect(formatter.formatImport('/Users/modules/atom-ide-ui/aDifferentPackage/lib/anotherFile.js', suggestedImport)).toBe("import SomeSymbol from '../../somePackage/someFile';");
  });
  it('Should NOT provide a relative import for files NOT within the same module', () => {
    const suggestedImport = {
      id: 'SomeSymbol',
      uri: '/Users/modules/atom-ide-ui/somePackage/someFile.js',
      line: 1,
      isTypeExport: false,
      isDefault: true
    };
    const formatter = new (_ImportFormatter().ImportFormatter)(['/Users/modules'], false);
    expect(formatter.formatImport('/Users/modules/nuclide-commons/aDifferentPackage/lib/anotherFile.js', suggestedImport)).toBe("import SomeSymbol from 'atom-ide-ui/somePackage/someFile';");
  });
  it('Should correctly handle haste formatting with JS files', () => {
    const suggestedImport = {
      id: 'SomeSymbol',
      uri: '/Users/modules/somePackage/somePackage/AutoImportsManager.js',
      line: 1,
      hasteName: 'AutoImportsManagerHaste',
      isTypeExport: false,
      isDefault: true
    };
    const formatter = new (_ImportFormatter().ImportFormatter)([], true);
    expect(formatter.formatImportFile('/Users/modules/somePackage/somePackage/AutoImportsManager.js', suggestedImport)).toBe('AutoImportsManagerHaste');
  });
});