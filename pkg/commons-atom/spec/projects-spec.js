/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import temp from 'temp';
import {
  observeProjectPaths,
  onDidAddProjectPath,
  onDidRemoveProjectPath,
} from '../projects';

describe('projects', () => {
  let firstProjectPath: string = (null: any);
  let otherProjectPath: string = (null: any);

  beforeEach(() => {
    temp.track();
    // `atom.project.addPath` only works for paths that actually exist.
    firstProjectPath = temp.mkdirSync('firstProjectPath');
    otherProjectPath = temp.mkdirSync('otherProjectPath');
  });

  describe('observeProjectPaths()', () => {
    it('observes existing projects and future added projects', () => {
      const projectPaths: Array<string> = [];
      atom.project.setPaths([firstProjectPath]);
      observeProjectPaths(projectPath => { projectPaths.push(projectPath); });
      expect(projectPaths).toEqual([firstProjectPath]);
      atom.project.addPath(otherProjectPath);
      expect(projectPaths).toEqual([firstProjectPath, otherProjectPath]);
    });
  });

  describe('onDidAddProjectPath()', () => {
    it('listens only to newly added project paths', () => {
      const addedProjectPaths: Array<string> = [];
      atom.project.setPaths([firstProjectPath]);
      onDidAddProjectPath(projectPath => { addedProjectPaths.push(projectPath); });
      expect(addedProjectPaths.length).toBe(0);
      atom.project.addPath(otherProjectPath);
      expect(addedProjectPaths).toEqual([otherProjectPath]);
    });

    it('throws when doing updates within updates', () => {
      expect(() => {
        onDidAddProjectPath(projectPath => {
          atom.project.addPath(otherProjectPath);
        });
        atom.project.setPaths([firstProjectPath]);
      }).toThrow('Cannot update projects in the middle of an update');
      expect(() => {
        onDidAddProjectPath(projectPath => {
          atom.project.removePath(firstProjectPath);
        });
        atom.project.setPaths([firstProjectPath]);
      }).toThrow('Cannot update projects in the middle of an update');
    });
  });

  describe('onDidRemoveProjectPath()', () => {
    it('listens to removed project paths', () => {
      const removedProjectPaths: Array<string> = [];
      atom.project.setPaths([firstProjectPath]);
      onDidRemoveProjectPath(projectPath => { removedProjectPaths.push(projectPath); });
      expect(removedProjectPaths.length).toBe(0);
      atom.project.removePath(firstProjectPath);
      expect(removedProjectPaths).toEqual([firstProjectPath]);
    });

    it('throws when doing updates within updates', () => {
      expect(() => {
        onDidRemoveProjectPath(projectPath => {
          atom.project.addPath(otherProjectPath);
        });
        atom.project.setPaths([firstProjectPath]);
      }).toThrow('Cannot update projects in the middle of an update');
      expect(() => {
        onDidRemoveProjectPath(projectPath => {
          atom.project.removePath(firstProjectPath);
        });
        atom.project.setPaths([firstProjectPath]);
      }).toThrow('Cannot update projects in the middle of an update');
    });
  });
});
