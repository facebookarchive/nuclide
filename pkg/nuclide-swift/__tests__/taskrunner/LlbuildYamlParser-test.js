"use strict";

function _LlbuildYamlParser() {
  const data = require("../../lib/taskrunner/LlbuildYamlParser");

  _LlbuildYamlParser = function () {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
describe('llbuildYamlPath', () => {
  const chdir = '/path/to/chdir';
  let configuration;
  let buildPath;
  describe('when --build-path is not specified', () => {
    beforeEach(() => {
      buildPath = '';
    });
    describe('with --configuration debug', () => {
      beforeEach(() => {
        configuration = 'debug';
      });
      it('returns "/path/to/chdir/.build/debug.yaml"', () => {
        expect((0, _LlbuildYamlParser().llbuildYamlPath)(chdir, configuration, buildPath)).toBe('/path/to/chdir/.build/debug.yaml');
      });
    });
    describe('with --configuration release', () => {
      beforeEach(() => {
        configuration = 'release';
      });
      it('returns "/path/to/chdir/.build/release.yaml"', () => {
        expect((0, _LlbuildYamlParser().llbuildYamlPath)(chdir, configuration, buildPath)).toBe('/path/to/chdir/.build/release.yaml');
      });
    });
  });
  describe('when --build-path is specified', () => {
    beforeEach(() => {
      buildPath = '/build/path';
    });
    describe('with --configuration debug', () => {
      beforeEach(() => {
        configuration = 'debug';
      });
      it('returns "/build/path/debug.yaml"', () => {
        expect((0, _LlbuildYamlParser().llbuildYamlPath)(chdir, configuration, buildPath)).toBe('/build/path/debug.yaml');
      });
    });
    describe('with --configuration release', () => {
      beforeEach(() => {
        configuration = 'release';
      });
      it('returns "/build/path/release.yaml"', () => {
        expect((0, _LlbuildYamlParser().llbuildYamlPath)(chdir, configuration, buildPath)).toBe('/build/path/release.yaml');
      });
    });
  });
});
describe('readCompileCommands', () => {
  let path;
  describe('when the file cannot be read', () => {
    beforeEach(() => {
      path = _nuclideUri().default.join(__dirname, '../fixtures/nonexistent.yaml');
    });
    it('returns an empty mapping', async () => {
      const commands = await (0, _LlbuildYamlParser().readCompileCommands)(path);
      expect(commands.size).toBe(0);
    });
  });
  describe('when the YAML in the file cannot be parsed', () => {
    beforeEach(() => {
      path = _nuclideUri().default.join(__dirname, '../../__mocks__/fixtures/invalid.yaml');
    });
    it('throws an error', async () => {
      await expect((0, _LlbuildYamlParser().readCompileCommands)(path)).rejects.toThrow('unexpected end of the stream');
    });
  });
  describe('when the YAML in the file does not contain a "commands" key', () => {
    beforeEach(() => {
      path = _nuclideUri().default.join(__dirname, '../../__mocks__/fixtures/no-commands.yaml');
    });
    it('returns an empty mapping', async () => {
      const commands = await (0, _LlbuildYamlParser().readCompileCommands)(path);
      expect(commands.size).toBe(0);
    });
  });
  describe('when the YAML in the file does not contain any "commands.sources" keys', () => {
    beforeEach(() => {
      path = _nuclideUri().default.join(__dirname, '../fixtures/no-commands-sources.yaml');
    });
    it('returns an empty mapping', async () => {
      const commands = await (0, _LlbuildYamlParser().readCompileCommands)(path);
      expect(commands.size).toBe(0);
    });
  });
  describe('when the YAML in the file contains "commands.sources" keys', () => {
    beforeEach(() => {
      path = _nuclideUri().default.join(__dirname, '../../__mocks__/fixtures/valid.yaml');
    });
    it('returns a mapping of sources to "other-args"', async () => {
      const commands = await (0, _LlbuildYamlParser().readCompileCommands)(path);
      expect(commands.size).toBe(4);
      expect(commands.get('/path/to/MyPackage/Sources/MyPackage.swift')).toBe(['-D', 'SWIFT_PACKAGE', '-g', '/path/to/MyPackage/Sources/AnotherSource.swift', '/path/to/MyPackage/Sources/MyPackage.swift'].join(' '));
      expect(commands.get('/path/to/MyPackage/Sources/AnotherSource.swift')).toBe(['-D', 'SWIFT_PACKAGE', '-g', '/path/to/MyPackage/Sources/AnotherSource.swift', '/path/to/MyPackage/Sources/MyPackage.swift'].join(' '));
      expect(commands.get('/path/to/MyPackage/Tests/MyPackage/MyPackageTests.swift')).toBe(['-D', 'SWIFT_PACKAGE', '-g', '/path/to/MyPackage/Tests/MyPackage/MyPackageTests.swift'].join(' '));
      expect(commands.get('/path/to/YetAnotherFile.swift')).toBe('/path/to/YetAnotherFile.swift');
    });
  });
});