/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {TaskRunnerBulletinStatus} from '../../nuclide-task-runner/lib/types';
import {createStatus} from '../../commons-node/tasks';
import {getLogger} from 'log4js';
import type {BuckEvent} from './BuckEventStream';
import type {TaskEvent} from 'nuclide-commons/process';
import {Observable} from 'rxjs';

import React from 'react';

export class BuckConsoleParser {
  /**
   * _statusMemory is a memory structure used here to keep state across
   *  "status" events in order to construct full frame strings due to the
   *  nature of buck's serial output stream.
   */
  _statusMemory: {
    addedBuildTargetToTitle: boolean,
    bulletin: TaskRunnerBulletinStatus,
    body: Array<string>,
  } = {
    addedBuildTargetToTitle: false,
    bulletin: {
      title: {message: '', seconds: null, error: false},
      detail: <div />,
    },
    body: [],
  };

  /*
   * _processStatusEvent recieves an ANSI-stripped line of Buck superconsole
   *  stdout as input with flags set by the ANSI. This function combines the
   *  _statusMemory to reconstruct the buck superconsole. State is also used
   *  for summarized title for the element. The TaskEvent we return contains:
   *  title: the summarized one-line info based on buck state (max len: 35)
   *  body: the combined stream inbetween reset flags which constitutes the
   *         state that the buck superconsole wants to represent.
   *
   * TODO refactor this logic into a react scoped class that can construct
   *  these as react elements.
   */
  processStatusEvent(event: BuckEvent): Observable<TaskEvent> {
    if (event == null || event.type !== 'buck-status') {
      return Observable.empty();
    }
    let result = Observable.empty();
    if (this._statusMemory.bulletin.title.message !== '') {
      const detail = (
        <div>
          {this._statusMemory.body.map((line: string) => {
            return <div key={line}>{line}</div>;
          })}
        </div>
      );
      const bulletin = {
        title: JSON.parse(JSON.stringify(this._statusMemory.bulletin.title)),
        detail,
      };
      result = createStatus('bulletin', bulletin);
    }

    if (event.reset) {
      this._statusMemory.addedBuildTargetToTitle = false;
      this._statusMemory.body = [];
    }

    const PARSING_BUCK_FILES_REGEX = /(Pars.* )([\d:]+\d*\.?\d*)\s(min|sec)/g;
    const CREATING_ACTION_GRAPH_REGEX = /(Creat.* )([\d:]+\d*\.?\d*)\s(min|sec)/g;
    const BUILDING_REGEX = /(Buil.* )([\d:]+\d*\.?\d*)\s(min|sec)/g;
    const BUILD_TARGET_REGEX = /\s-\s.*\/(?!.*\/)(.*)\.\.\.\s([\d:]+\d*\.?\d*)\s(min|sec)/g;
    const ERROR_REGEX = /(Error.*)/g;
    const STARTING_BUCK_REGEX = /(Starting.*)/g;

    /* We'll attempt to match the event.message to a few known regex matches,
   * otherwise we'll ignore it. When we find a match, we'll parse it for
   * length, markup, and set the title.
   */
    let match = PARSING_BUCK_FILES_REGEX.exec(event.message);
    if (match == null) {
      match = CREATING_ACTION_GRAPH_REGEX.exec(event.message);
    }
    if (match == null) {
      match = BUILDING_REGEX.exec(event.message);
    }
    if (match != null && match.length > 1) {
      let prefix = match[1];
      if (prefix.length > 24) {
        prefix = prefix.slice(0, 24);
      }
      // TODO refactor this logic into a react scoped class that can construct
      // these as react elements.
      this._statusMemory.bulletin.title.message = `${prefix}<span>${
        match[2]
      }</span> ${match[3]}`;
    }
    /* this block parses the first subsequent Building... line
   * (i.e. " - fldr/com/facebook/someTarget:someTarget#header-info 2.3 sec")
   * into: "Building... someTarget:som 2.3 sec". & gates itself with addedBuildTargetToTitle
   */
    if (match == null && !this._statusMemory.addedBuildTargetToTitle) {
      match = BUILD_TARGET_REGEX.exec(event.message);
      if (match != null) {
        let target = match[1].split('#')[0];
        if (target.length > 12) {
          target = target.slice(0, 12);
        }
        this._statusMemory.bulletin.title.message = `Building ../${target} <span>${
          match[2]
        }</span> ${match[3]}`;
        this._statusMemory.addedBuildTargetToTitle = true;
      }
    }

    if (match == null) {
      match = STARTING_BUCK_REGEX.exec(event.message);
      if (match != null) {
        let target = match[0];
        if (target.length > 35) {
          target = target.slice(0, 35);
        }
        this._statusMemory.bulletin.title.message = target;
      }
    }

    if (match == null) {
      if (event.error || ERROR_REGEX.exec(event.message) != null) {
        this._statusMemory.bulletin.title.message = event.message.slice(0, 35);
      }
    }
    // logging lines that don't match our REGEX so we can manually add them later
    if (match == null && !event.error) {
      getLogger('nuclide-buck-superconsole').warn('no match:' + event.message);
    }
    // body is cleared by event.reset, otherwise we append a newline & message
    this._statusMemory.body.push(event.message.trim());
    return result;
  }
}
