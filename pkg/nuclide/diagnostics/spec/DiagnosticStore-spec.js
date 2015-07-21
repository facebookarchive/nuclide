'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var DiagnosticStore = require('../lib/DiagnosticStore');


// Test Constants
var dummyProviderA = {};
var dummyProviderB = {};

var fileMessageA = {
  scope: 'file',
  providerName: 'dummyProviderA',
  type: 'Error',
  filePath: 'fileA',
};
var fileMessageA2 = { // Warning instead of Error
  scope: 'file',
  providerName: 'dummyProviderA',
  type: 'Warning',
  filePath: 'fileA',
};
var fileMessageB = {
  scope: 'file',
  providerName: 'dummyProviderB',
  type: 'Error',
  filePath: 'fileB',
};

var projectMessageA = {
  scope: 'project',
  providerName: 'dummyProviderA',
  type: 'Error',
};
var projectMessageA2 = { // Warning instead of Error
  scope: 'project',
  providerName: 'dummyProviderA',
  type: 'Warning',
};
var projectMessageB = {
  scope: 'project',
  providerName: 'dummyProviderB',
  type: 'Error',
};


describe('DiagnosticStore', () => {
  var diagnosticStore;
  var spy_fileA;
  var spy_fileA_subscription;
  var spy_fileB;
  var spy_fileB_subscription;
  var spy_project;
  var spy_project_subscription;
  var spy_allMessages;
  var spy_allMessages_subscription;

  var resetSpies = () => {
    if (spy_fileA_subscription) {
      spy_fileA_subscription.dispose();
    }
    if (spy_fileB_subscription) {
      spy_fileB_subscription.dispose();
    }
    if (spy_project_subscription) {
      spy_project_subscription.dispose();
    }
    if (spy_allMessages_subscription) {
      spy_allMessages_subscription.dispose();
    }

    spy_fileA = jasmine.createSpy();
    spy_fileB = jasmine.createSpy();
    spy_project = jasmine.createSpy();
    spy_allMessages = jasmine.createSpy();

    spy_fileA_subscription = diagnosticStore.onFileMessagesDidUpdate(spy_fileA, 'fileA');
    spy_fileB_subscription = diagnosticStore.onFileMessagesDidUpdate(spy_fileB, 'fileB');
    spy_project_subscription = diagnosticStore.onProjectMessagesDidUpdate(spy_project);
    spy_allMessages_subscription = diagnosticStore.onAllMessagesDidUpdate(spy_allMessages);
  };

  beforeEach(() => {
    diagnosticStore = new DiagnosticStore();
    resetSpies();
  });

  afterEach(() => {
    diagnosticStore.dispose();
  });

  it('Test updating and invalidating messages, and emitting events.', () => {
    // 1. Add file and project messages from one provider.
    var updateA = {
      filePathToMessages: new Map([['fileA', [fileMessageA]]]),
      projectMessages: [projectMessageA],
    };
    diagnosticStore.updateMessages(dummyProviderA, updateA);

    // Expect all spies except spy_fileB to have been called.
    expect(spy_fileB).not.toHaveBeenCalled();

    expect(spy_fileA.calls.length).toBe(1);
    expect(spy_fileA.mostRecentCall.args).toEqual(
      [{filePath: 'fileA', messages:[fileMessageA]}]
    );
    expect(spy_project.calls.length).toBe(1);
    expect(spy_project.mostRecentCall.args).toEqual(
      [[projectMessageA]]
    );
    expect(spy_allMessages.calls.length).toBe(1);
    expect(spy_allMessages.mostRecentCall.args[0].length).toBe(2);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(fileMessageA);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(projectMessageA);

    // Expect the getter methods on DiagnosticStore to return correct info.
    expect(diagnosticStore.getFileMessages('fileA')).toEqual([fileMessageA]);
    expect(diagnosticStore.getProjectMessages()).toEqual([projectMessageA]);
    var allMessages = diagnosticStore.getAllMessages();
    expect(allMessages.length).toBe(2);
    expect(allMessages).toContain(fileMessageA);
    expect(allMessages).toContain(projectMessageA);

    // 1 - End. Reset spies.
    resetSpies();


    // 2. Add file and project messages from a second provider.
    // They should not interfere with messages from the first provider.
    var updateB = {
      filePathToMessages: new Map([['fileB', [fileMessageB]]]),
      projectMessages: [projectMessageB],
    };
    diagnosticStore.updateMessages(dummyProviderB, updateB);

    // Expect all spies except spy_fileA to have been called.
    expect(spy_fileA).not.toHaveBeenCalled();

    expect(spy_fileB.calls.length).toBe(1);
    expect(spy_fileB.mostRecentCall.args).toEqual(
      [{filePath: 'fileB', messages:[fileMessageB]}]
    );
    expect(spy_project.calls.length).toBe(1);
    expect(spy_project.mostRecentCall.args[0].length).toBe(2);
    expect(spy_project.mostRecentCall.args[0]).toContain(projectMessageA);
    expect(spy_project.mostRecentCall.args[0]).toContain(projectMessageB);
    expect(spy_allMessages.calls.length).toBe(1);
    expect(spy_allMessages.mostRecentCall.args[0].length).toBe(4);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(fileMessageA);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(projectMessageA);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(fileMessageB);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(projectMessageB);

    // Expect the getter methods on DiagnosticStore to return the info from
    // updateA (from Part 1.) and updateB.
    expect(diagnosticStore.getFileMessages('fileA')).toEqual([fileMessageA]);
    expect(diagnosticStore.getFileMessages('fileB')).toEqual([fileMessageB]);
    var projectMessages = diagnosticStore.getProjectMessages();
    expect(projectMessages.length).toBe(2);
    expect(projectMessages).toContain(projectMessageA);
    expect(projectMessages).toContain(projectMessageB);
    var allMessages = diagnosticStore.getAllMessages();
    expect(allMessages.length).toBe(4);
    expect(allMessages).toContain(fileMessageA);
    expect(allMessages).toContain(projectMessageA);
    expect(allMessages).toContain(fileMessageB);
    expect(allMessages).toContain(projectMessageB);

    // 2 - End. Reset spies.
    resetSpies();


    // 3. Add new messages from ProviderA. They should overwrite existing
    // messages from ProviderA at the same scope.
    var updateA2 = {
      filePathToMessages: new Map([['fileA', [fileMessageA2]]]),
      projectMessages: [projectMessageA2],
    };
    diagnosticStore.updateMessages(dummyProviderA, updateA2);

    // Expect all spies except spy_fileB to have been called.
    // ProviderA messages should have been overwritten, but ProviderB messages
    // should have remained the same.
    expect(spy_fileB).not.toHaveBeenCalled();

    expect(spy_fileA.calls.length).toBe(1);
    expect(spy_fileA.mostRecentCall.args).toEqual(
      [{filePath: 'fileA', messages:[fileMessageA2]}]
    );
    expect(spy_project.calls.length).toBe(1);
    expect(spy_project.mostRecentCall.args[0].length).toBe(2);
    expect(spy_project.mostRecentCall.args[0]).toContain(projectMessageA2);
    expect(spy_project.mostRecentCall.args[0]).toContain(projectMessageB);
    expect(spy_allMessages.calls.length).toBe(1);
    expect(spy_allMessages.mostRecentCall.args[0].length).toBe(4);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(fileMessageA2);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(projectMessageA2);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(fileMessageB);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(projectMessageB);

    // Expect the getter methods on DiagnosticStore to return the correct info.
    expect(diagnosticStore.getFileMessages('fileA')).toEqual([fileMessageA2]);
    expect(diagnosticStore.getFileMessages('fileB')).toEqual([fileMessageB]);
    var projectMessages = diagnosticStore.getProjectMessages();
    expect(projectMessages.length).toBe(2);
    expect(projectMessages).toContain(projectMessageA2);
    expect(projectMessages).toContain(projectMessageB);
    var allMessages = diagnosticStore.getAllMessages();
    expect(allMessages.length).toBe(4);
    expect(allMessages).toContain(fileMessageA2);
    expect(allMessages).toContain(projectMessageA2);
    expect(allMessages).toContain(fileMessageB);
    expect(allMessages).toContain(projectMessageB);

    // 3 - End. Reset spies.
    resetSpies();


    // 4A. Invalidate file messages from ProviderA.
    var fileInvalidationMessage = {scope: 'file', filePaths: ['fileA']};
    diagnosticStore.invalidateMessages(dummyProviderA, fileInvalidationMessage);

    // Expect only spy_fileA and spy_allMessages to have been called.
    // File messages from ProviderA should be gone, but no other changes.
    // At this point, there should be ProviderA project messages, and ProviderB
    // file and project messages.
    expect(spy_fileB).not.toHaveBeenCalled();
    expect(spy_project).not.toHaveBeenCalled();

    expect(spy_fileA.calls.length).toBe(1);
    expect(spy_fileA.mostRecentCall.args).toEqual(
      [{filePath: 'fileA', messages:[]}]
    );
    expect(spy_allMessages.calls.length).toBe(1);
    expect(spy_allMessages.mostRecentCall.args[0].length).toBe(3);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(projectMessageA2);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(fileMessageB);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(projectMessageB);

    // Expect the getter methods on DiagnosticStore to return the correct info.
    expect(diagnosticStore.getFileMessages('fileA')).toEqual([]);
    expect(diagnosticStore.getFileMessages('fileB')).toEqual([fileMessageB]);
    var projectMessages = diagnosticStore.getProjectMessages();
    expect(projectMessages.length).toBe(2);
    expect(projectMessages).toContain(projectMessageA2);
    expect(projectMessages).toContain(projectMessageB);
    var allMessages = diagnosticStore.getAllMessages();
    expect(allMessages.length).toBe(3);
    expect(allMessages).toContain(projectMessageA2);
    expect(allMessages).toContain(fileMessageB);
    expect(allMessages).toContain(projectMessageB);

    // 4A - End. Reset spies.
    resetSpies();


    // 4B. Invalidate project messages from ProviderA.
    var projectInvalidationMessage = {scope: 'project'};
    diagnosticStore.invalidateMessages(dummyProviderA, projectInvalidationMessage);

    // Expect only spy_project and spy_allMessages to have been called.
    // At this point, there should be no ProviderA messages, and ProviderB file
    // and project messages.
    expect(spy_fileA).not.toHaveBeenCalled();
    expect(spy_fileB).not.toHaveBeenCalled();

    expect(spy_project.calls.length).toBe(1);
    expect(spy_project.mostRecentCall.args[0].length).toBe(1);
    expect(spy_project.mostRecentCall.args[0]).toContain(projectMessageB);
    expect(spy_allMessages.calls.length).toBe(1);
    expect(spy_allMessages.mostRecentCall.args[0].length).toBe(2);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(fileMessageB);
    expect(spy_allMessages.mostRecentCall.args[0]).toContain(projectMessageB);

    // Expect the getter methods on DiagnosticStore to return the correct info.
    expect(diagnosticStore.getFileMessages('fileA')).toEqual([]);
    expect(diagnosticStore.getFileMessages('fileB')).toEqual([fileMessageB]);
    var projectMessages = diagnosticStore.getProjectMessages();
    expect(projectMessages.length).toBe(1);
    expect(projectMessages).toContain(projectMessageB);
    var allMessages = diagnosticStore.getAllMessages();
    expect(allMessages.length).toBe(2);
    expect(allMessages).toContain(fileMessageB);
    expect(allMessages).toContain(projectMessageB);

    // 4B - End. Reset spies.
    resetSpies();


    // 5. Remove listeners, then invalidate all messages from ProviderB.
    // We don't need to remove spy_fileA_subscription -- it shouldn't be called anyway.
    spy_fileB_subscription.dispose();
    spy_project_subscription.dispose();
    spy_allMessages_subscription.dispose();

    var providerInvalidationMessage = {scope: 'all'};
    diagnosticStore.invalidateMessages(dummyProviderB, providerInvalidationMessage);

    // Expect none of the spies to have been called.
    // All messages from ProviderB should be gone. At this point, there should
    // be no remaining messages in the Store.
    expect(spy_fileA).not.toHaveBeenCalled();
    expect(spy_fileB).not.toHaveBeenCalled();
    expect(spy_project).not.toHaveBeenCalled();
    expect(spy_allMessages).not.toHaveBeenCalled();

    // Expect the getter methods on DiagnosticStore to return the correct info.
    expect(diagnosticStore.getFileMessages('fileA')).toEqual([]);
    expect(diagnosticStore.getFileMessages('fileB')).toEqual([]);
    expect(diagnosticStore.getProjectMessages().length).toBe(0);
    expect(diagnosticStore.getAllMessages().length).toBe(0);

    // 5 - End. Reset spies.
    resetSpies();
  });
});
