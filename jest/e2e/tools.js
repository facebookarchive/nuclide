"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllPanes = exports.openFileTree = exports.closeAllTabs = exports.waitsFor = exports.sleep = exports.writeFiles = exports.openLocalDirectory = exports.makeTempDir = exports.invariant = void 0;

function _fsExtra() {
  const data = _interopRequireDefault(require("fs-extra"));

  _fsExtra = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

var _path = _interopRequireDefault(require("path"));

function _v() {
  const data = _interopRequireDefault(require("uuid/v4"));

  _v = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../waits_for"));

  _waits_for = function () {
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
const invariant = (condition, message) => {
  if (!condition) {
    throw new Error('message');
  }
};

exports.invariant = invariant;

const makeTempDir = (name = 'nuclide_temp_dir') => {
  const dirPath = _path.default.resolve(_os.default.tmpdir(), `${name}-${(0, _v().default)()}`);

  _fsExtra().default.mkdirpSync(dirPath);

  return dirPath;
};

exports.makeTempDir = makeTempDir;

const openLocalDirectory = dir => atom.project.addPath(dir);

exports.openLocalDirectory = openLocalDirectory;

const writeFiles = (dir, files) => {
  for (const [filePath, content] of Object.entries(files)) {
    _fsExtra().default.writeFileSync(_path.default.resolve(dir, filePath), content);
  }
};

exports.writeFiles = writeFiles;

const sleep = n => new Promise(r => setTimeout(r, n));

exports.sleep = sleep;

const waitsFor = _waits_for().default;

exports.waitsFor = waitsFor;

const closeAllTabs = async () => {
  await atom.commands.dispatch(atom.workspace.getElement(), 'tabs:close-all-tabs');
};

exports.closeAllTabs = closeAllTabs;
const FILE_TREE_SELECTOR = '.atom-dock-open .nuclide-file-tree-toolbar-container';

const openFileTree = async () => {
  atom.commands.dispatch(atom.workspace.getElement(), 'tree-view:toggle');
  await waitsFor(() => !!document.querySelector(FILE_TREE_SELECTOR));
  const element = document.querySelector(FILE_TREE_SELECTOR);
  invariant(element, 'File tree must be present');
  const fileTree = new FileTree(element);
  return fileTree;
};

exports.openFileTree = openFileTree;

const getAllPanes = () => {
  // $FlowFixMe
  return new Panes(document.body);
};

exports.getAllPanes = getAllPanes;
const TEXT_FILE_SELECTOR = '.nuclide-file-tree-path.icon-file-text';

class FileTree {
  constructor(element) {
    this.element = element;
  }

  findTextFilesWithNameMatching(pattern) {
    return [...this.element.querySelectorAll(TEXT_FILE_SELECTOR)].filter(el => {
      const name = el.getAttribute('data-name');
      return name != null && name.indexOf(pattern) !== -1;
    });
  }

  async previewFile(name) {
    const files = this.findTextFilesWithNameMatching(name);
    expect(files).toHaveLength(1);
    const file = files[0];
    expect(file).toBeDefined();
    expect(file.getAttribute('data-name')).toBe(name);
    file.click();
    await waitsFor(() => !!document.querySelector(`[is=tabs-tab] div[data-name="${name}"]`));
  }

}

class Panes {
  constructor(element) {
    this.element = element;
    this.panes = [...this.element.querySelectorAll('.pane')].map(el => new Pane(el));
  }

  getAllTabNames() {
    return this.panes.reduce((tabNames, pane) => {
      const names = pane.tabs.map(tab => tab.getName());
      return [...(tabNames || []), ...(names || [])];
    }, []);
  }

}

class Pane {
  constructor(element) {
    this.element = element;
    this.tabs = [...this.element.querySelectorAll('[is=tabs-tab]')].map(el => new Tab(el));
  }

  getTabNames() {
    return this.tabs.map(tab => tab.getName());
  }

}

class Tab {
  constructor(element) {
    this.element = element;
  }

  getName() {
    const div = this.element.querySelector('div');
    invariant(div);
    return div.getAttribute('data-name');
  }

}