'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import {React, PureRenderMixin} from 'react-for-atom';
import classnames from 'classnames';
import {PanelComponentScroller} from '../../nuclide-ui/lib/PanelComponentScroller';
import FileTreeHelpers from '../lib/FileTreeHelpers';
import {track} from '../../nuclide-analytics';

type OpenFileEntry = {
  name: string;
  uri: NuclideUri;
  isModified: boolean;
  isSelected: boolean;
};

type Props = {
  uris: Array<NuclideUri>;
  modifiedUris: Array<NuclideUri>;
  activeUri: ?NuclideUri;
};

type State = {
  hoveredUri: ?NuclideUri;
};

export class OpenFilesListComponent extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hoveredUri: null,
    };
    (this: any)._onListItemMouseLeave = this._onListItemMouseLeave.bind(this);
  }

  shouldComponentUpdate(nextProps: Object, nextState: State): boolean {
    return PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
  }

  componentDidUpdate(): void {
    const selectedRow = this.refs.selectedRow;
    if (selectedRow != null) {
      selectedRow.scrollIntoViewIfNeeded();
    }
  }

  _onClick(entry: OpenFileEntry, event: SyntheticEvent): void {
    if (event.defaultPrevented) {
      return;
    }

    const uri = entry.uri;
    track('filetree-open-from-open-files', {uri});
    atom.workspace.open(uri, {searchAllPanes: true});
  }

  _onCloseClick(entry: OpenFileEntry, event: SyntheticEvent): void {
    const uri = entry.uri;
    track('filetree-close-from-open-files', {uri});
    event.preventDefault();
    atom.workspace.getPanes().forEach(pane => {
      pane.getItems().filter(item => item.getPath && item.getPath() === uri).forEach(item => {
        pane.destroyItem(item);
      });
    });
  }

  _onListItemMouseEnter(entry: OpenFileEntry) {
    this.setState({
      hoveredUri: entry.uri,
    });
  }

  _onListItemMouseLeave() {
    this.setState({
      hoveredUri: null,
    });
  }

  render(): React.Element<any> {
    const sortedEntries = propsToEntries(this.props);

    return (
      <div className="nuclide-file-tree-open-files">
        <PanelComponentScroller>
          <ul className="list-tree nuclide-file-tree-open-files-list">
          {sortedEntries.map(e => {
            const isHoveredUri = this.state.hoveredUri === e.uri;
            return (
              <li
                className={classnames('list-item', {
                  'selected': e.isSelected,
                  'text-highlight': isHoveredUri,
                })}
                key={e.uri}
                onClick={this._onClick.bind(this, e)}
                onMouseEnter={this._onListItemMouseEnter.bind(this, e)}
                onMouseLeave={this._onListItemMouseLeave}
                ref={e.isSelected ? 'selectedRow' : null}>
                <span
                  className={classnames('icon', {
                    'icon-primitive-dot': e.isModified && !isHoveredUri,
                    'icon-x': isHoveredUri || !e.isModified,
                    'text-info': e.isModified,
                  })}
                  onClick={this._onCloseClick.bind(this, e)}
                />
                <span className="icon icon-file-text">
                  {e.name}
                </span>
              </li>
            );
          })}
          </ul>
        </PanelComponentScroller>
      </div>
    );
  }
}

function propsToEntries(props: Props): Array<OpenFileEntry> {
  const entries = props.uris.map(uri => {
    const isModified = props.modifiedUris.indexOf(uri) >= 0;
    const isSelected = uri === props.activeUri;
    return {uri, name: FileTreeHelpers.keyToName(uri), isModified, isSelected};
  });

  entries.sort((e1, e2) => e1.name.toLowerCase().localeCompare(e2.name.toLowerCase()));
  return entries;
}
