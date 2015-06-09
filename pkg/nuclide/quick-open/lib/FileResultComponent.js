'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileResult} from './types';

var React = require('react-for-atom');
var {fileTypeClass} = require('nuclide-atom-helpers');
var path = require('path');

class FileResultComponent {

  static getComponentForItem(item: FileResult): ReactElement {
    var filePath = item.path;

    var filenameStart = filePath.lastIndexOf(path.sep);
    var importantIndexes = [filenameStart, filePath.length].concat(item.matchIndexes)
                                                           .sort((index1, index2) => index1 - index2);

    var folderComponents = [];
    var filenameComponents = [];

    var last = -1;
    // Split the path into it's path and directory, with matching characters pulled out and highlighted.
    //
    // When there's no matches, the ouptut is equivalent to just calling path.dirname/basename.
    importantIndexes.forEach((index) => {
      // If the index is after the filename start, push the new text elements
      // into `filenameComponents`, otherwise push them into `folderComponents`.
      var target = index <= filenameStart ? folderComponents : filenameComponents;

      // If there was text before the `index`, push it onto `target` unstyled.
      var previousString = filePath.slice(last + 1, index);
      if (previousString.length !== 0) {
        target.push(<span key={index + 'prev'}>{previousString}</span>);
      }

      // Don't put the '/' between the folder path and the filename on either line.
      if (index !== filenameStart && index < filePath.length) {
        var character = filePath.charAt(index);
        target.push(<span key={index} className="quick-open-file-search-match">{character}</span>);
      }

      last = index;
    });

    var filenameClasses = ['file', 'icon', fileTypeClass(filePath)].join(' ');
    var folderClasses = ['path', 'no-icon'].join(' ');

    // `data-name` is support for the "file-icons" package.
    // See: https://atom.io/packages/file-icons
    return (
      <div>
        <span className={filenameClasses} data-name={path.basename(filePath)}>
          {filenameComponents}
        </span>
        <span className={folderClasses}>{folderComponents}</span>
      </div>
    );
  };
}

module.exports = FileResultComponent;
