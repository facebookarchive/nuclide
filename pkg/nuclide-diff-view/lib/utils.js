'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {
  FileChangeStatusValue,
} from './types';
import type {
  AmendModeValue,
} from '../../nuclide-hg-rpc/lib/HgService';

import {getDirtyFileChanges} from './RepositoryStack';
import {
  FileChangeStatus,
  FileChangeStatusToPrefix,
} from './constants';
import {hgConstants} from '../../nuclide-hg-rpc';
import {bufferUntil} from '../../commons-node/observable';
import {getLogger} from '../../nuclide-logging';
import {Observable} from 'rxjs';
import stripAnsi from 'strip-ansi';

const MAX_DIALOG_FILE_STATUS_COUNT = 20;

export function processArcanistOutput(
  stream_: Observable<{stderr?: string, stdout?: string}>,
): Observable<any> {
  let stream = stream_;
  stream = stream
    // Split stream into single lines.
    .flatMap((message: {stderr?: string, stdout?: string}) => {
      const lines = [];
      for (const fd of ['stderr', 'stdout']) {
        let out = message[fd];
        if (out != null) {
          out = out.replace(/\n$/, '');
          for (const line of out.split('\n')) {
            lines.push({[fd]: line});
          }
        }
      }
      return lines;
    })
    // Unpack JSON
    .flatMap((message: {stderr?: string, stdout?: string}) => {
      const stdout = message.stdout;
      const messages = [];
      if (stdout != null) {
        let decodedJSON = null;
        try {
          decodedJSON = JSON.parse(stdout);
        } catch (err) {
          messages.push({type: 'phutil:out', message: stdout + '\n'});
          getLogger().error('Invalid JSON encountered: ' + stdout);
        }
        if (decodedJSON != null) {
          messages.push(decodedJSON);
        }
      }
      if (message.stderr != null) {
        messages.push({type: 'phutil:err', message: message.stderr + '\n'});
      }
      return messages;
    })
    // Process message type.
    .flatMap((decodedJSON: {type: string, message: string}) => {
      const messages = [];
      switch (decodedJSON.type) {
        case 'phutil:out':
        case 'phutil:out:raw':
          messages.push({level: 'log', text: stripAnsi(decodedJSON.message)});
          break;
        case 'phutil:err':
          messages.push({level: 'error', text: stripAnsi(decodedJSON.message)});
          break;
        case 'error':
          throw new Error(`Arc Error: ${decodedJSON.message}`);
        default:
          getLogger().info(
            'Unhandled message type:',
            decodedJSON.type,
            'Message payload:',
            decodedJSON.message,
          );
          break;
      }
      return messages;
    })
    // Split messages on new line characters.
    .flatMap((message: {level: string, text: string}) => {
      const splitMessages = [];
      // Split on newlines without removing new line characters.  This will remove empty
      // strings but that's OK.
      for (const part of message.text.split(/^/m)) {
        splitMessages.push({level: message.level, text: part});
      }
      return splitMessages;
    });
  const levelStreams: Array<Observable<Array<{level: string, text: string}>>> = [];
  for (const level of ['log', 'error']) {
    const levelStream = stream
      .filter(
        (message: {level: string, text: string}) => message.level === level,
      )
      .share();
    levelStreams.push(bufferUntil(levelStream, message => message.text.endsWith('\n')));
  }

  return Observable.merge(...levelStreams)
    .map(messages => ({
      level: messages[0].level,
      text: messages.map(message => message.text).join(''),
    })).catch(error =>
        Observable.throw(new Error(
        'Failed publish to Phabricator\n' +
        'You could have missed test plan or mistyped reviewers.\n' +
        'Please fix and try again.',
      )),
    );
}

export async function promptToCleanDirtyChanges(
  repository: HgRepositoryClient,
  commitMessage: ?string,
  shouldRebaseOnAmend: boolean,
): Promise<?{allowUntracked: boolean, amended: boolean}> {
  const checkingStatusNotification = atom.notifications.addInfo(
    'Running `hg status` to check dirty changes to Add/Amend/Revert',
    {dismissable: true},
  );
  await repository.getStatuses([repository.getProjectDirectory()]);
  checkingStatusNotification.dismiss();

  const dirtyFileChanges = getDirtyFileChanges(repository);

  let shouldAmend = false;
  let amended = false;
  let allowUntracked = false;
  if (dirtyFileChanges.size === 0) {
    return {
      amended,
      allowUntracked,
    };
  }
  const untrackedChanges: Map<NuclideUri, FileChangeStatusValue> = new Map(
    Array.from(dirtyFileChanges.entries())
      .filter(fileChange => fileChange[1] === FileChangeStatus.UNTRACKED),
  );
  if (untrackedChanges.size > 0) {
    const untrackedChoice = atom.confirm({
      message: 'You have untracked files in your working copy:',
      detailedMessage: getFileStatusListMessage(untrackedChanges),
      buttons: ['Cancel', 'Add', 'Allow Untracked'],
    });
    getLogger().info('Untracked changes choice:', untrackedChoice);
    if (untrackedChoice === 0) /* Cancel */ {
      return null;
    } else if (untrackedChoice === 1) /* Add */ {
      await repository.addAll(Array.from(untrackedChanges.keys()));
      shouldAmend = true;
    } else if (untrackedChoice === 2) /* Allow Untracked */ {
      allowUntracked = true;
    }
  }
  const revertableChanges: Map<NuclideUri, FileChangeStatusValue> = new Map(
    Array.from(dirtyFileChanges.entries())
      .filter(fileChange => fileChange[1] !== FileChangeStatus.UNTRACKED),
  );
  if (revertableChanges.size > 0) {
    const cleanChoice = atom.confirm({
      message: 'You have uncommitted changes in your working copy:',
      detailedMessage: getFileStatusListMessage(revertableChanges),
      buttons: ['Cancel', 'Revert', 'Amend'],
    });
    getLogger().info('Dirty changes clean choice:', cleanChoice);
    if (cleanChoice === 0) /* Cancel */ {
      return null;
    } else if (cleanChoice === 1) /* Revert */ {
      const canRevertFilePaths: Array<NuclideUri> =
        Array.from(dirtyFileChanges.entries())
        .filter(fileChange => fileChange[1] !== FileChangeStatus.UNTRACKED)
        .map(fileChange => fileChange[0]);
      await repository.revert(canRevertFilePaths);
    } else if (cleanChoice === 2) /* Amend */ {
      shouldAmend = true;
    }
  }
  if (shouldAmend) {
    await repository
      .amend(commitMessage, getAmendMode(shouldRebaseOnAmend))
      .toArray().toPromise();
    amended = true;
  }
  return {
    amended,
    allowUntracked,
  };
}

function getFileStatusListMessage(fileChanges: Map<NuclideUri, FileChangeStatusValue>): string {
  let message = '';
  if (fileChanges.size < MAX_DIALOG_FILE_STATUS_COUNT) {
    for (const [filePath, statusCode] of fileChanges) {
      message += '\n'
        + FileChangeStatusToPrefix[statusCode]
        + atom.project.relativize(filePath);
    }
  } else {
    message = `\n more than ${MAX_DIALOG_FILE_STATUS_COUNT} files (check using \`hg status\`)`;
  }
  return message;
}

export function getAmendMode(shouldRebaseOnAmend: boolean): AmendModeValue {
  if (shouldRebaseOnAmend) {
    return hgConstants.AmendMode.REBASE;
  } else {
    return hgConstants.AmendMode.CLEAN;
  }
}
