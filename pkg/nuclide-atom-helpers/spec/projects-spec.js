'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {singleton} = require('../../nuclide-commons');
const projects = require('../lib/projects');
const {PROJECT_PATH_WATCHER_INSTANCE_KEY} = projects.__test__;

describe('projects', () => {

  const firstProjectPath = '/absolute/project/path';

  beforeEach(() => {
    singleton.clear(PROJECT_PATH_WATCHER_INSTANCE_KEY);
    atom.project.setPaths([firstProjectPath]);
  });

  describe('observeProjectPaths()', () => {
    it('observes existing projects and future added projects', () => {
      const projectPaths: Array<string> = [];
      projects.observeProjectPaths(projectPath => { projectPaths.push(projectPath); });
      expect(projectPaths).toEqual([firstProjectPath]);
      atom.project.addPath('/absolute/other/path');
      expect(projectPaths).toEqual([firstProjectPath, '/absolute/other/path']);
    });
  });

  describe('onDidAddProjectPath()', () => {
    it('listens only to newly added project paths', () => {
      const addedProjectPaths: Array<string> = [];
      projects.onDidAddProjectPath(projectPath => { addedProjectPaths.push(projectPath); });
      expect(addedProjectPaths.length).toBe(0);
      atom.project.addPath('/absolute/other/path');
      expect(addedProjectPaths).toEqual(['/absolute/other/path']);
    });
  });

  describe('onDidRemoveProjectPath()', () => {
    it('listens to removed project paths', () => {
      const removedProjectPaths: Array<string> = [];
      projects.onDidRemoveProjectPath(projectPath => { removedProjectPaths.push(projectPath); });
      expect(removedProjectPaths.length).toBe(0);
      atom.project.removePath(firstProjectPath);
      expect(removedProjectPaths).toEqual([firstProjectPath]);
    });
  });
});
