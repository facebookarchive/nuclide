'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');
var FileListProvider = require('../lib/FileListProvider');

function toArray(nodes: NodeList): Array<Node> {
  return Array.prototype.slice.call(nodes);
}

describe('FileListProvider', () => {
  var listProvider: FileListProvider;

  beforeEach(() => {
    listProvider = new FileListProvider();
  });

  describe('Path/Filename splitting', () => {
    it('should split filenames from paths appropriately', () => {
      var output = listProvider.getComponentForItem({path: '/a/path/to/a/file', matchIndexes: []});

      var containerDiv = document.createElement('div');
      React.render(output, containerDiv);

      // The path should be shown completely, without a trailing slash.
      expect(containerDiv.querySelector('.path span').innerHTML).toBe('/a/path/to/a');

      // The filename should be shown completely, without a leading slash.
      expect(containerDiv.querySelector('.file span').innerHTML).toBe('file');
    });
  });

  describe('Match Highlighting', () => {
    it('should split filenames from paths appropriately', () => {
      var output = listProvider.getComponentForItem({path: '/some/file', matchIndexes: [1, 6]});
      var containerDiv = document.createElement('div');
      React.render(output, containerDiv);

      var pathHighlights = toArray(containerDiv.querySelectorAll('.path .quick-open-file-search-match')).map((node) => node.innerHTML);
      var pathPlain = toArray(containerDiv.querySelectorAll('.path :not(.quick-open-file-search-match)')).map((node) => node.innerHTML);

      // Expect the 's' at index 1 to be highlighted, and the text before/after to not be.
      expect(pathHighlights).toEqual(['s']);
      expect(pathPlain).toEqual(['/', 'ome']);

      var fileHighlights = toArray(containerDiv.querySelectorAll('.file .quick-open-file-search-match')).map((node) => node.innerHTML);
      var filePlain = toArray(containerDiv.querySelectorAll('.file :not(.quick-open-file-search-match)')).map((node) => node.innerHTML);

      // Expect the 'f' at index 6 to be highlighted, and the text after to not be.
      expect(fileHighlights).toEqual(['f']);
      expect(filePlain).toEqual(['ile']);
    });
  });
});
