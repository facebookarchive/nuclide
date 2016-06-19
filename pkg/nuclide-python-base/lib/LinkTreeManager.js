'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import nuclideUri from '../../nuclide-remote-uri';
import {BuckProject} from '../../nuclide-buck-base';

const BUCK_GEN_PATH = 'buck-out/gen';
const LINK_TREE_SUFFIXES = {
  python_binary: '#link-tree',
  python_unittest: '#binary,link-tree',
};

export default class LinkTreeManager {

  _cachedBuckProjects: Map<string, BuckProject>;
  _cachedLinkTreePaths: Map<string, ?string>;

  constructor() {
    this._cachedBuckProjects = new Map();
    this._cachedLinkTreePaths = new Map();
  }

  async _getBuckProject(src: string): Promise<?BuckProject> {
    let project = this._cachedBuckProjects.get(src);
    if (!project) {
      const buckProjectRoot = await BuckProject.getRootForPath(src);
      if (buckProjectRoot == null) {
        return null;
      }
      project = new BuckProject({rootPath: buckProjectRoot});
      this._cachedBuckProjects.set(src, project);
    }

    return project;
  }

  _getBuckTargetForDir(dirPath: string) {
    return `//${nuclideUri.basename(dirPath)}:`;
  }

  _getDirForBuckTarget(target: string) {
    return target.slice(2).replace(/:/g, '/');
  }

  async _getDependencies(src: string, kind: string): Promise<Array<string>> {
    const project = await this._getBuckProject(src);
    if (!project) {
      return [];
    }

    const searchRoot = this._getBuckTargetForDir(nuclideUri.dirname(src));

    // TODO: Currently, this attempts to find python_binary targets that are
    // defined in the same directory's BUCK/TARGETS. Once we change how Buck
    // handles global rdeps searches ("//.."), this should search globally.
    return project.query(
      `kind(${kind}, rdeps(${searchRoot}, owner(${src})))`
    );
  }

  async getLinkTreePath(src: string): Promise<?string> {
    if (this._cachedLinkTreePaths.has(src)) {
      return this._cachedLinkTreePaths.get(src);
    }
    try {
      const project = await this._getBuckProject(src);
      if (!project) {
        this._cachedLinkTreePaths.set(src, null);
        return null;
      }

      let kind = 'python_binary';
      let bins = await this._getDependencies(src, kind);
      // Attempt to find a python_unittest target if a python_binary was not found.
      if (bins.length === 0) {
        kind = 'python_unittest';
        bins = await this._getDependencies(src, kind);

        if (bins.length === 0) {
          this._cachedLinkTreePaths.set(src, null);
          return null;
        }
      }
      const bin = bins[0];
      const linkTreeSuffix = LINK_TREE_SUFFIXES[kind];

      // TODO: once we add link-tree flavor to buck, build only the link tree here.

      const basePath = await project.getPath();
      const binPath = this._getDirForBuckTarget(bin);
      const linkTreePath = nuclideUri.join(basePath, BUCK_GEN_PATH, binPath + linkTreeSuffix);
      this._cachedLinkTreePaths.set(src, linkTreePath);
      return linkTreePath;
    } catch (e) {
      return null;
    }
  }

}
