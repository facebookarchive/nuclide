'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Reference, ReferenceGroup} from '../types';

var React = require('react-for-atom');
var FilePreview = require('./FilePreview');
var {relative} = require('nuclide-remote-uri');

var FileReferencesView = React.createClass({
  propTypes: {
    uri: React.PropTypes.string.isRequired,
    grammar: React.PropTypes.object.isRequired,
    previewText: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    refGroups: React.PropTypes.arrayOf(React.PropTypes.object /*ReferenceGroup*/).isRequired,
    basePath: React.PropTypes.string.isRequired,
  },

  _onRefClick(ref: Reference) {
    atom.workspace.open(this.props.uri, {
      initialLine: ref.start.line - 1,
      initialColumn: ref.start.column - 1,
    });
  },

  _onFileClick() {
    atom.workspace.open(this.props.uri);
  },

  render(): ReactElement {
    var groups = this.props.refGroups.map((group: ReferenceGroup, i) => {
      var previewText = this.props.previewText[i];
      var ranges = group.references.map((ref, j) => {
        var range = ref.start.line;
        if (ref.end.line !== ref.start.line) {
          range += '-' + ref.end.line;
        } else {
          range += ', column ' + ref.start.column;
        }
        var caller;
        if (ref.name) {
          caller = <span>{' '}in <code>{ref.name}</code></span>;
        }
        return (
          <div
            key={j}
            className="nuclide-find-references-ref-name"
            onClick={this._onRefClick.bind(this, ref)}>
            Line {range} {caller}
          </div>
        );
      });

      return (
        <div key={group.startLine} className="nuclide-find-references-ref">
          {ranges}
          <FilePreview
            grammar={this.props.grammar}
            text={previewText}
            {...group}
          />
        </div>
      );
    });

    return (
      <div className="nuclide-find-references-file">
        <div className="nuclide-find-references-filename">
          <a onClick={this._onFileClick}>
            {relative(this.props.basePath, this.props.uri)}
          </a>
        </div>
        <div className="nuclide-find-references-refs">
          {groups}
        </div>
      </div>
    );
  },
});

module.exports = FileReferencesView;
