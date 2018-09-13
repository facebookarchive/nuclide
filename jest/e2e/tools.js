/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import uuid4 from 'uuid/v4';

import _waitsFor from '../waits_for';

export const invariant = (condition: any, message: string) => {
  if (!condition) {
    throw new Error('message');
  }
};
export const makeTempDir = (name: string = 'nuclide_temp_dir') => {
  const dirPath = path.resolve(os.tmpdir(), `${name}-${uuid4()}`);
  fs.mkdirpSync(dirPath);
  return dirPath;
};

export const openLocalDirectory = (dir: string) => atom.project.addPath(dir);

export const writeFiles = (dir: string, files: {[path: string]: string}) => {
  for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(path.resolve(dir, filePath), content);
  }
};

export const sleep = (n: number): Promise<void> =>
  new Promise(r => setTimeout(r, n));

export const waitsFor = _waitsFor;

export const closeAllTabs = async () => {
  await atom.commands.dispatch(
    atom.workspace.getElement(),
    'tabs:close-all-tabs',
  );
};

const FILE_TREE_SELECTOR =
  '.atom-dock-open .nuclide-file-tree-toolbar-container';
export const openFileTree = async () => {
  atom.commands.dispatch(atom.workspace.getElement(), 'tree-view:toggle');
  await waitsFor(() => !!document.querySelector(FILE_TREE_SELECTOR));
  const element = document.querySelector(FILE_TREE_SELECTOR);
  invariant(element, 'File tree must be present');
  const fileTree = new FileTree(element);
  return fileTree;
};

export const getAllPanes = () => {
  // $FlowFixMe
  return new Panes(document.body);
};

const TEXT_FILE_SELECTOR = '.nuclide-file-tree-path.icon-file-text';

class FileTree {
  element: Element;
  constructor(element: Element) {
    this.element = element;
  }

  findTextFilesWithNameMatching(pattern: string): Array<Element> {
    return [...this.element.querySelectorAll(TEXT_FILE_SELECTOR)].filter(el => {
      const name = el.getAttribute('data-name');
      return name != null && name.indexOf(pattern) !== -1;
    });
  }

  async previewFile(name: string) {
    const files = this.findTextFilesWithNameMatching(name);
    expect(files).toHaveLength(1);
    const file = files[0];
    expect(file).toBeDefined();
    expect(file.getAttribute('data-name')).toBe(name);
    (file: any).click();
    await waitsFor(
      () => !!document.querySelector(`[is=tabs-tab] div[data-name="${name}"]`),
    );
  }
}

class Panes {
  element: Element;
  panes: Array<Pane>;
  constructor(element: Element) {
    this.element = element;
    this.panes = [...this.element.querySelectorAll('.pane')].map(
      el => new Pane(el),
    );
  }

  getAllTabNames() {
    return this.panes.reduce((tabNames, pane) => {
      const names = pane.tabs.map(tab => tab.getName());
      return [...(tabNames || []), ...(names || [])];
    }, []);
  }
}

class Pane {
  element: Element;
  tabs: Array<Tab>;

  constructor(element: Element) {
    this.element = element;
    this.tabs = [...this.element.querySelectorAll('[is=tabs-tab]')].map(
      el => new Tab(el),
    );
  }

  getTabNames() {
    return this.tabs.map(tab => tab.getName());
  }
}

class Tab {
  element: Element;
  constructor(element: Element) {
    this.element = element;
  }

  getName() {
    const div = this.element.querySelector('div');
    invariant(div);
    return div.getAttribute('data-name');
  }
}
