/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ConsoleLevel, ConsoleService} from 'atom-ide-ui';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import marked from 'marked';
import createPackage from 'nuclide-commons-atom/createPackage';
import createDOMPurify from 'dompurify';

const domPurify = createDOMPurify();

class Activation {
  _disposables: UniversalDisposable;

  constructor() {
    this._disposables = new UniversalDisposable();
  }

  consumeConsoleService(createConsole: ConsoleService): IDisposable {
    const consoleApi = createConsole({
      id: 'Atom',
      name: 'Atom',
    });
    const notificationDisposable = atom.notifications.onDidAddNotification(
      notification => {
        consoleApi.append({
          text: stripFormatting(notification.getMessage()),
          level: getLevel(notification.getType()),
        });
      },
    );
    this._disposables.add(consoleApi, notificationDisposable);
    return notificationDisposable;
  }

  dispose() {
    this._disposables.dispose();
  }
}

function getLevel(atomNotificationType: string): ConsoleLevel {
  switch (atomNotificationType) {
    case 'error':
    case 'fatal':
      return 'error';
    case 'info':
      return 'info';
    case 'warning':
      return 'warning';
    case 'success':
      return 'success';
    default:
      return 'log';
  }
}

/**
 * Markdown and HTML can be used with Atom notifications, but not in the console.
 */
function stripFormatting(raw: string): string {
  return domPurify.sanitize(marked(raw), {ALLOWED_TAGS: []});
}

createPackage(module.exports, Activation);
