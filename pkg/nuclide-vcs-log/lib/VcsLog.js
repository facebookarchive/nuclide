/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {VcsLogEntry} from '../../nuclide-hg-rpc/lib/HgService';

import React from 'react';
import {getAtomProjectRelativePath} from '../../commons-atom/projects';
import {shell} from 'electron';
import {shortNameForAuthor} from './util';

type Props = {
  files: Array<NuclideUri>,
  showDifferentialRevision: boolean,
};

type State = {
  logEntries: ?Array<VcsLogEntry>,
};

export default class VcsLog extends React.Component {
  props: Props;
  state: State;
  _files: Array<string>;

  constructor(props: Props) {
    super(props);
    this._files = [];
    for (const file of props.files) {
      const projectPath = getAtomProjectRelativePath(file);
      if (projectPath != null) {
        this._files.push(projectPath);
      }
    }

    this.state = {
      logEntries: null,
    };
  }

  render(): React.Element<any> {
    const {logEntries} = this.state;
    if (logEntries != null) {
      // Even if the "Show Differential Revision" preference is enabled, only show the column if
      // there is at least one row with a Differential revision. This way, enabling the preference
      // by default should still work fine for non-Differential users.

      let showDifferentialRevision;
      const differentialUrls = [];
      if (this.props.showDifferentialRevision) {
        logEntries.forEach((logEntry: VcsLogEntry, index: number) => {
          const url = parseDifferentialRevision(logEntry);
          if (url != null) {
            differentialUrls[index] = url;
          }
        });
        showDifferentialRevision = differentialUrls.length > 0;
      } else {
        showDifferentialRevision = false;
      }

      const rows = logEntries.map((logEntry: VcsLogEntry, index: number) => {
        let differentialCell;
        if (showDifferentialRevision) {
          const url = differentialUrls[index];
          let revision;
          let onClick;
          if (url != null) {
            revision = url.substring(url.lastIndexOf('/') + 1);
            onClick = () => shell.openExternal(url);
          } else {
            revision = null;
            onClick = null;
          }
          differentialCell = (
            <td className="nuclide-vcs-log-differential-cell">
              <span className="nuclide-vcs-log-differential-cell-text" onClick={onClick}>
                {revision}
              </span>
            </td>
          );
        } else {
          differentialCell = null;
        }

        return (
          <tr key={logEntry.node}>
            <td className="nuclide-vcs-log-date-cell">
              {this._toDateString(logEntry.date[0])}
            </td>
            <td className="nuclide-vcs-log-id-cell">
              {logEntry.node.substring(0, 8)}
            </td>
            {differentialCell}
            <td className="nuclide-vcs-log-author-cell">
              {shortNameForAuthor(logEntry.user)}
            </td>
            <td className="nuclide-vcs-log-summary-cell" title={logEntry.desc}>
              {parseFirstLine(logEntry.desc)}
            </td>
          </tr>
        );
      });

      // Note that we use the native-key-bindings/tabIndex=-1 trick to make it possible to
      // copy/paste text from the pane. This has to be applied on a child element of
      // nuclide-vcs-log-scroll-container, or else the native-key-bindings/tabIndex=-1 will
      // interfere with scrolling.
      return (
        <div className="nuclide-vcs-log-scroll-container">
          <div className="native-key-bindings" tabIndex="-1">
            <table>
              <tbody>
                <tr>
                  <th className="nuclide-vcs-log-header-cell">Date</th>
                  <th className="nuclide-vcs-log-header-cell">ID</th>
                  {showDifferentialRevision
                    ? <th className="nuclide-vcs-log-header-cell">Revision</th>
                    : null
                  }
                  <th className="nuclide-vcs-log-header-cell">Author</th>
                  <th className="nuclide-vcs-log-header-cell">Summary</th>
                </tr>
                {rows}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <div>
            <em>Loading hg log {this._files.join(' ')}</em>
          </div>
          <div className="nuclide-vcs-log-spinner">
            <div className="loading-spinner-large inline-block" />
          </div>
        </div>
      );
    }
  }

  _toDateString(secondsSince1970: number): string {
    const date = new Date(secondsSince1970 * 1000);

    // We may want to make date formatting customizable via props.
    // The format of str is "Fri Apr 22 2016 21:32:51 GMT+0100 (BST)".
    // Note that this is date will be displayed in the local time zone of the viewer rather
    // than that of the author of the commit.
    const str = date.toString();

    // Strip the day of week from the start of the string and the seconds+TZ from the end.
    const startIndex = str.indexOf(' ') + 1;
    const endIndex = str.lastIndexOf(':');
    return str.substring(startIndex, endIndex);
  }
}

function parseFirstLine(desc: string): string {
  const index = desc.indexOf('\n');
  if (index === -1) {
    return desc;
  } else {
    return desc.substring(0, index);
  }
}

const DIFFERENTIAL_REVISION_RE = /^Differential Revision:\s*(.*)$/im;

function parseDifferentialRevision(logEntry: VcsLogEntry): ?string {
  const {desc} = logEntry;
  const match = desc.match(DIFFERENTIAL_REVISION_RE);
  if (match != null) {
    return match[1];
  } else {
    return null;
  }
}
