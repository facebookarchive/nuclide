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

type Props = {
  uris: Array<NuclideUri>;
  modifiedUris: Array<NuclideUri>;
  activeUri: ?NuclideUri;
};

type OpenFileEntry = {
  name: string;
  uri: NuclideUri;
  isModified: boolean;
  isSelected: boolean;
};

export class OpenFilesListComponent extends React.Component {
  props: Props;

  shouldComponentUpdate(nextProps: Object, nextState: void): boolean {
    return PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
  }

  componentDidUpdate(): void {
    const selectedRow = this.refs.selectedRow;
    if (selectedRow != null) {
      selectedRow.scrollIntoViewIfNeeded();
    }
  }

  render(): React.Element {
    const sortedEntries = propsToEntries(this.props);

    return (
      <div className="nuclide-file-tree-open-files">
        <PanelComponentScroller>
          <ul className="list-group nuclide-file-tree-open-files-list">
          {sortedEntries.map(e => {
            return (
              <li className={classnames(
                'list-item nuclide-file-tree-open-files-row',
                {selected: e.isSelected},
              )}
              ref={e.isSelected ? 'selectedRow' : null}
              key={e.uri}>
                <div className="nuclide-file-tree-open-files-row">
                  <span className={classnames(
                      'nuclide-file-tree-open-close-icon',
                      {modified: e.isModified},
                    )}
                    onClick={() => this._onCloseClick(e.uri)}
                  />
                  <span className="icon icon-file-text" />
                  <span
                    className=" nuclide-file-tree-open-files-row-name"
                    onClick={() => this._onClick(e.uri)}>{e.name}
                  </span>
                </div>
              </li>
            );
          })}
          </ul>
        </PanelComponentScroller>
      </div>
    );
  }

  _onClick(uri: NuclideUri): void {
    track('filetree-open-from-open-files', {uri});
    atom.workspace.open(uri, {searchAllPanes: true});
  }

  _onCloseClick(uri: NuclideUri): void {
    track('filetree-close-from-open-files', {uri});
    atom.workspace.getPanes().forEach(pane => {
      pane.getItems().filter(item => item.getPath && item.getPath() === uri).forEach(item => {
        pane.destroyItem(item);
      });
    });
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
