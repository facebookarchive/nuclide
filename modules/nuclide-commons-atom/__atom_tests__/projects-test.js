"use strict";

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _projects() {
  const data = require("../projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
describe('projects', () => {
  let firstProjectPath = null;
  let otherProjectPath = null;
  beforeEach(() => {
    _temp().default.track(); // `atom.project.addPath` only works for paths that actually exist.


    firstProjectPath = _temp().default.mkdirSync('firstProjectPath');
    otherProjectPath = _temp().default.mkdirSync('otherProjectPath');
  });
  describe('getFileForPath', () => {
    it('works for paths both above and below the project path', () => {
      atom.project.setPaths([firstProjectPath]);

      const path1 = _nuclideUri().default.join(firstProjectPath, '../test');

      const file1 = (0, _projects().getFileForPath)(path1);

      if (!(file1 != null)) {
        throw new Error("Invariant violation: \"file1 != null\"");
      }

      expect(file1.getPath()).toBe(path1);

      const path2 = _nuclideUri().default.join(firstProjectPath, 'child/path');

      const file2 = (0, _projects().getFileForPath)(path2);

      if (!(file2 != null)) {
        throw new Error("Invariant violation: \"file2 != null\"");
      }

      expect(file2.getPath()).toBe(path2);
    });
  });
  describe('observeProjectPaths()', () => {
    it('observes existing projects and future added projects', () => {
      const projectPaths = [];
      (0, _projects().observeProjectPaths)(projectPath => projectPaths.push(projectPath));
      atom.project.setPaths([firstProjectPath]);
      expect(projectPaths).toEqual([firstProjectPath]);
      atom.project.addPath(otherProjectPath);
      expect(projectPaths).toEqual([firstProjectPath, otherProjectPath]);
    });
  });
  describe('observeProjectPathsAll()', () => {
    it('observes all existing projects and future added projects', () => {
      let projectPaths = [];
      (0, _projects().observeProjectPathsAll)(newPaths => projectPaths = newPaths);
      atom.project.setPaths([firstProjectPath]);
      expect(projectPaths).toEqual([firstProjectPath]);
      atom.project.addPath(otherProjectPath);
      expect(projectPaths).toEqual([firstProjectPath, otherProjectPath]);
    });
  });
  describe('onDidAddProjectPath()', () => {
    it('listens only to newly added project paths', () => {
      const addedProjectPaths = [];
      atom.project.setPaths([firstProjectPath]);
      (0, _projects().onDidAddProjectPath)(projectPath => {
        addedProjectPaths.push(projectPath);
      });
      expect(addedProjectPaths.length).toBe(0);
      atom.project.addPath(otherProjectPath);
      expect(addedProjectPaths).toEqual([otherProjectPath]);
    });
    it('throws when doing updates within updates', () => {
      expect(() => {
        (0, _projects().onDidAddProjectPath)(projectPath => {
          atom.project.addPath(otherProjectPath);
        });
        atom.project.setPaths([firstProjectPath]);
      }).toThrow('Cannot update projects in the middle of an update');
      expect(() => {
        (0, _projects().onDidAddProjectPath)(projectPath => {
          atom.project.removePath(firstProjectPath);
        });
        atom.project.setPaths([firstProjectPath]);
      }).toThrow('Cannot update projects in the middle of an update');
    });
  });
  describe('onDidRemoveProjectPath()', () => {
    it('listens to removed project paths', () => {
      const removedProjectPaths = [];
      atom.project.setPaths([firstProjectPath]);
      (0, _projects().onDidRemoveProjectPath)(projectPath => {
        removedProjectPaths.push(projectPath);
      });
      expect(removedProjectPaths.length).toBe(0);
      atom.project.removePath(firstProjectPath);
      expect(removedProjectPaths).toEqual([firstProjectPath]);
    });
  });
});