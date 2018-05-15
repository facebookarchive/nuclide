'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.

























getGroup = getGroup;exports.




























getDisplayName = getDisplayName;exports.

















getIcon = getIcon;exports.

















getHighestPriorityGroup = getHighestPriorityGroup; /**
                                                    * Copyright (c) 2017-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the BSD-style license found in the
                                                    * LICENSE file in the root directory of this source tree. An additional grant
                                                    * of patent rights can be found in the PATENTS file in the same directory.
                                                    *
                                                    *  strict-local
                                                    * @format
                                                    */const PRIORITIZED_GROUPS = ['review', 'errors', 'warnings', 'info', 'action'];function getGroup(message) {const { kind } = message;switch (kind) {case 'lint':case null:case undefined:if (!(message.type !== 'Hint')) {throw new Error('Invariant violation: "message.type !== \'Hint\'"');} // We have a separate button for each severity.
      switch (message.type) {case 'Error':return 'errors';case 'Warning':return 'warnings';case 'Info':return 'info';default:message.type;throw new Error(`Invalid message severity: ${message.type}`);}case 'review':return 'review';case 'action':return 'action';default:kind;throw new Error(`Invalid message kind: ${kind}`);}}function getDisplayName(group) {switch (group) {case 'errors':return 'Errors';case 'warnings':return 'Warnings';case 'info':return 'Info';case 'review':return 'Review';case 'action':return 'Actions';default:group;throw new Error(`Invalid group: ${group}`);}}function getIcon(group) {switch (group) {case 'errors':return 'nuclicon-error';case 'warnings':return 'nuclicon-warning';case 'info':return 'info';case 'review':return 'nuclicon-comment-discussion';case 'action':return 'nuclicon-lightbulb-filled';default:group;throw new Error(`Invalid filter type: ${group}`);}}function getHighestPriorityGroup(groups) {for (const group of PRIORITIZED_GROUPS) {if (groups.has(group)) {return group;}}throw new Error(`Invalid group set: ${[...groups].toString()}`);}