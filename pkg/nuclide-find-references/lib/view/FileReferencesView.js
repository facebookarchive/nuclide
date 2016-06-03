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

import {React} from 'react-for-atom';
import classnames from 'classnames';
import FilePreview from './FilePreview';
import {relative} from '../../../nuclide-remote-uri';

const FileReferencesView = React.createClass({
  propTypes: {
    uri: React.PropTypes.string.isRequired,
    grammar: React.PropTypes.object.isRequired,
    previewText: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    refGroups: React.PropTypes.arrayOf(React.PropTypes.object /*ReferenceGroup*/).isRequired,
    basePath: React.PropTypes.string.isRequired,
    clickCallback: React.PropTypes.func.isRequired,
    isSelected: React.PropTypes.bool.isRequired,
  },

  getInitialState() {
    return {
      isExpanded: true,
    };
  },

  _onRefClick(ref: Reference) {
    atom.workspace.open(this.props.uri, {
      initialLine: ref.start.line - 1,
      initialColumn: ref.start.column - 1,
    });
  },

  _onFileClick() {
    this.props.clickCallback();
    this.setState({
      isExpanded: !this.state.isExpanded,
    });
  },

  _onFileNameClick() {
    atom.workspace.open(this.props.uri);
  },

  render(): React.Element {
    const groups = this.props.refGroups.map((group: ReferenceGroup, i) => {
      const previewText = this.props.previewText[i];
      const ranges = group.references.map((ref, j) => {
        let range = ref.start.line;
        if (ref.end.line !== ref.start.line) {
          range += '-' + ref.end.line;
        } else {
          range += ', column ' + ref.start.column;
        }
        let caller;
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
        <li key={group.startLine} className="nuclide-find-references-ref">
          {ranges}
          <FilePreview
            grammar={this.props.grammar}
            text={previewText}
            {...group}
          />
        </li>
      );
    });
    const outerClassName = classnames('nuclide-find-references-file list-nested-item', {
      collapsed: !this.state.isExpanded,
      expanded: this.state.isExpanded,
      selected: this.props.isSelected,
    });

    return (
      <li className={`${outerClassName}`}
          onClick={this._onFileClick}>
        <div className="nuclide-find-references-filename list-item">
          <span className="icon-file-text icon" />
          <a onClick={this._onFileNameClick}>
            {relative(this.props.basePath, this.props.uri)}
          </a>
          <span className="nuclide-find-references-ref-count badge badge-small">
            {groups.length}
          </span>
        </div>
        <ul className="nuclide-find-references-refs list-tree">
          {groups}
        </ul>
      </li>
    );
  },
});

module.exports = FileReferencesView;
