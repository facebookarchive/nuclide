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
import nuclideUri from '../../../commons-node/nuclideUri';

type Props = {
  uri: string,
  grammar: atom$Grammar,
  previewText: Array<string>,
  refGroups: Array<ReferenceGroup>,
  basePath: string,
  clickCallback: () => void,
  isSelected: boolean,
};

type State = {
  isExpanded: boolean,
};

export default class FileReferencesView extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      isExpanded: true,
    };
    (this: any)._onFileClick = this._onFileClick.bind(this);
    (this: any)._onFileNameClick = this._onFileNameClick.bind(this);
  }

  _onRefClick(evt: SyntheticEvent, ref: Reference) {
    atom.workspace.open(this.props.uri, {
      initialLine: ref.start.line - 1,
      initialColumn: ref.start.column - 1,
    });
    evt.stopPropagation();
  }

  _onFileClick() {
    this.props.clickCallback();
    this.setState({
      isExpanded: !this.state.isExpanded,
    });
  }

  _onFileNameClick(evt: SyntheticEvent, line?: number) {
    atom.workspace.open(this.props.uri, {
      initialLine: line,
    });
    evt.stopPropagation();
  }

  render(): React.Element<any> {
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
            onClick={evt => this._onRefClick(evt, ref)}>
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
            onClick={evt => this._onRefClick(evt, group.references[0])}
            onLineClick={this._onFileNameClick}
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
      <li className={`${outerClassName}`}>
        <div
          className="nuclide-find-references-filename list-item"
          onClick={this._onFileClick}>
          <span className="icon-file-text icon" />
          <a onClick={this._onFileNameClick}>
            {nuclideUri.relative(this.props.basePath, this.props.uri)}
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
  }
}
