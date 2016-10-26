'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import temp from 'temp';
import singleton from '../../commons-node/singleton';
import projects from '../projects';

const {PROJECT_PATH_WATCHER_INSTANCE_KEY} = projects.__test__;
let firstProjectPath;
let otherProjectPath;

describe('projects', () => {

  beforeEach(() => {
    temp.track();
    // `atom.project.addPath` only works for paths that actually exist.
    firstProjectPath = temp.mkdirSync('firstProjectPath');
    otherProjectPath = temp.mkdirSync('otherProjectPath');
    singleton.clear(PROJECT_PATH_WATCHER_INSTANCE_KEY);
    atom.project.setPaths([firstProjectPath]);
  });

  describe('observeProjectPaths()', () => {
    it('observes existing projects and future added projects', () => {
      const projectPaths: Array<string> = [];
      projects.observeProjectPaths(projectPath => { projectPaths.push(projectPath); });
      expect(projectPaths).toEqual([firstProjectPath]);
      atom.project.addPath(otherProjectPath);
      expect(projectPaths).toEqual([firstProjectPath, otherProjectPath]);
    });
  });

  describe('onDidAddProjectPath()', () => {
    it('listens only to newly added project paths', () => {
      const addedProjectPaths: Array<string> = [];
      projects.onDidAddProjectPath(projectPath => { addedProjectPaths.push(projectPath); });
      expect(addedProjectPaths.length).toBe(0);
      atom.project.addPath(otherProjectPath);
      expect(addedProjectPaths).toEqual([otherProjectPath]);
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
