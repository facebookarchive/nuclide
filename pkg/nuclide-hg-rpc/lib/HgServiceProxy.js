"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.HgService = class {
    constructor(arg0) {
      _client.createRemoteObject("HgService", this, [arg0], [{
        name: "workingDirectory",
        type: {
          kind: "string"
        }
      }]);
    }

    waitForWatchmanSubscriptions() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "waitForWatchmanSubscriptions", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    fetchStatuses(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "toRevision",
        type: {
          kind: "nullable",
          type: {
            kind: "string"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "fetchStatuses", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "map",
          keyType: {
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            kind: "named",
            name: "StatusCodeIdValue"
          }
        });
      }).publish();
    }

    fetchStackStatuses() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "fetchStackStatuses", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "map",
          keyType: {
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            kind: "named",
            name: "StatusCodeIdValue"
          }
        });
      }).publish();
    }

    fetchHeadStatuses() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "fetchHeadStatuses", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "map",
          keyType: {
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            kind: "named",
            name: "StatusCodeIdValue"
          }
        });
      }).publish();
    }

    observeFilesDidChange() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "observeFilesDidChange", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        });
      }).publish();
    }

    observeHgCommitsDidChange() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "observeHgCommitsDidChange", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    observeHgRepoStateDidChange() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "observeHgRepoStateDidChange", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    observeHgConflictStateDidChange() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "observeHgConflictStateDidChange", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "boolean"
        });
      }).publish();
    }

    fetchDiffInfo(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "fetchDiffInfo", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "map",
            keyType: {
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              kind: "named",
              name: "DiffInfo"
            }
          }
        });
      });
    }

    createBookmark(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "name",
        type: {
          kind: "string"
        }
      }, {
        name: "revision",
        type: {
          kind: "nullable",
          type: {
            kind: "string"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "createBookmark", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    deleteBookmark(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "name",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "deleteBookmark", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    renameBookmark(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "name",
        type: {
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "renameBookmark", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    fetchActiveBookmark() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "fetchActiveBookmark", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      });
    }

    fetchBookmarks() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "fetchBookmarks", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "BookmarkInfo"
          }
        });
      }).publish();
    }

    observeActiveBookmarkDidChange() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "observeActiveBookmarkDidChange", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    observeBookmarksDidChange() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "observeBookmarksDidChange", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      }).publish();
    }

    fetchFileContentAtRevision(arg0, arg1) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "revision",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "fetchFileContentAtRevision", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    fetchFilesChangedAtRevision(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "fetchFilesChangedAtRevision", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "RevisionFileChanges"
        });
      }).publish();
    }

    fetchRevisionInfoBetweenHeadAndBase() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "fetchRevisionInfoBetweenHeadAndBase", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "RevisionInfo"
          }
        });
      });
    }

    fetchSmartlogRevisions() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "fetchSmartlogRevisions", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "RevisionInfo"
          }
        });
      }).publish();
    }

    getBaseRevision() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getBaseRevision", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "RevisionInfo"
        });
      });
    }

    getBlameAtHead(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getBlameAtHead", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "RevisionInfo"
            }
          }
        });
      });
    }

    getConfigValueAsync(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "key",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getConfigValueAsync", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "string"
          }
        });
      });
    }

    getDifferentialRevisionForChangeSetId(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "changeSetId",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getDifferentialRevisionForChangeSetId", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "string"
          }
        });
      });
    }

    getSmartlog(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "ttyOutput",
        type: {
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          kind: "boolean"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getSmartlog", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "AsyncExecuteRet"
        });
      });
    }

    commit(arg0, arg1) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          kind: "string"
        }
      }, {
        name: "filePaths",
        type: {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "commit", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    editCommitMessage(arg0, arg1) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          kind: "string"
        }
      }, {
        name: "message",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "editCommitMessage", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    amend(arg0, arg1, arg2) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          kind: "nullable",
          type: {
            kind: "string"
          }
        }
      }, {
        name: "amendMode",
        type: {
          kind: "named",
          name: "AmendModeValue"
        }
      }, {
        name: "filePaths",
        type: {
          kind: "nullable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "amend", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    restack() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "restack", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    splitRevision() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "splitRevision", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    revert(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "toRevision",
        type: {
          kind: "nullable",
          type: {
            kind: "string"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "revert", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    checkout(arg0, arg1, arg2) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          kind: "boolean"
        }
      }, {
        name: "options",
        type: {
          kind: "nullable",
          type: {
            kind: "named",
            name: "CheckoutOptions"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "checkout", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    show(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          kind: "number"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "show", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "RevisionShowInfo"
        });
      }).publish();
    }

    purge() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "purge", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    uncommit() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "uncommit", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    strip(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "strip", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    checkoutForkBase() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "checkoutForkBase", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    rename(arg0, arg1, arg2) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "destPath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "after",
        type: {
          kind: "nullable",
          type: {
            kind: "boolean"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "rename", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    remove(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "after",
        type: {
          kind: "nullable",
          type: {
            kind: "boolean"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "remove", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    forget(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "forget", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    add(arg0) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "add", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getTemplateCommitMessage() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getTemplateCommitMessage", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "string"
          }
        });
      });
    }

    getHeadCommitMessage() {
      return Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "getHeadCommitMessage", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "string"
          }
        });
      });
    }

    log(arg0, arg1) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "limit",
        type: {
          kind: "nullable",
          type: {
            kind: "number"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "log", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "VcsLogResponse"
        });
      });
    }

    fetchMergeConflicts() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "fetchMergeConflicts", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "nullable",
          type: {
            kind: "named",
            name: "MergeConflicts"
          }
        });
      }).publish();
    }

    markConflictedFile(arg0, arg1) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "resolved",
        type: {
          kind: "boolean"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "markConflictedFile", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    continueOperation(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "command",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "continueOperation", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    abortOperation(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "command",
        type: {
          kind: "string"
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "abortOperation", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    resolveAllFiles() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "resolveAllFiles", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    rebase(arg0, arg1) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "destination",
        type: {
          kind: "string"
        }
      }, {
        name: "source",
        type: {
          kind: "nullable",
          type: {
            kind: "string"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "rebase", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    pull(arg0) {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "options",
        type: {
          kind: "array",
          type: {
            kind: "string"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "pull", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    copy(arg0, arg1, arg2) {
      return Promise.all([_client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "destPath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "after",
        type: {
          kind: "nullable",
          type: {
            kind: "boolean"
          }
        }
      }]), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })]).then(([args, id]) => _client.callRemoteMethod(id, "copy", "promise", args)).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getHeadId() {
      return Observable.fromPromise(Promise.all([_client.marshalArguments(Array.from(arguments), []), _client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 266
        },
        name: "HgService"
      })])).switchMap(([args, id]) => _client.callRemoteMethod(id, "getHeadId", "observable", args)).concatMap(value => {
        return _client.unmarshal(value, {
          kind: "string"
        });
      }).publish();
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    StatusCodeIdValue: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 88
      },
      name: "StatusCodeIdValue",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "A"
        }, {
          kind: "string-literal",
          value: "C"
        }, {
          kind: "string-literal",
          value: "I"
        }, {
          kind: "string-literal",
          value: "M"
        }, {
          kind: "string-literal",
          value: "!"
        }, {
          kind: "string-literal",
          value: "R"
        }, {
          kind: "string-literal",
          value: "?"
        }, {
          kind: "string-literal",
          value: "U"
        }]
      }
    },
    MergeConflictStatusValue: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 90
      },
      name: "MergeConflictStatusValue",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "both changed"
        }, {
          kind: "string-literal",
          value: "deleted in theirs"
        }, {
          kind: "string-literal",
          value: "deleted in ours"
        }, {
          kind: "string-literal",
          value: "resolved"
        }]
      }
    },
    MergeConflictStatusCodeId: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 96
      },
      name: "MergeConflictStatusCodeId",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "R"
        }, {
          kind: "string-literal",
          value: "U"
        }]
      }
    },
    StatusCodeNumberValue: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 106
      },
      name: "StatusCodeNumberValue",
      definition: {
        kind: "union",
        types: [{
          kind: "number-literal",
          value: 1
        }, {
          kind: "number-literal",
          value: 2
        }, {
          kind: "number-literal",
          value: 3
        }, {
          kind: "number-literal",
          value: 4
        }, {
          kind: "number-literal",
          value: 5
        }, {
          kind: "number-literal",
          value: 6
        }, {
          kind: "number-literal",
          value: 7
        }, {
          kind: "number-literal",
          value: 8
        }]
      }
    },
    LineDiff: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 108
      },
      name: "LineDiff",
      definition: {
        kind: "object",
        fields: [{
          name: "oldStart",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "oldLines",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "newStart",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "newLines",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    BookmarkInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 115
      },
      name: "BookmarkInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "active",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "bookmark",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "node",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "rev",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    DiffInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 122
      },
      name: "DiffInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "added",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "deleted",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "lineDiffs",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "LineDiff"
            }
          },
          optional: false
        }]
      }
    },
    CommitPhaseType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 128
      },
      name: "CommitPhaseType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "public"
        }, {
          kind: "string-literal",
          value: "draft"
        }, {
          kind: "string-literal",
          value: "secret"
        }]
      }
    },
    SuccessorTypeValue: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 130
      },
      name: "SuccessorTypeValue",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "public"
        }, {
          kind: "string-literal",
          value: "amend"
        }, {
          kind: "string-literal",
          value: "rebase"
        }, {
          kind: "string-literal",
          value: "split"
        }, {
          kind: "string-literal",
          value: "fold"
        }, {
          kind: "string-literal",
          value: "histedit"
        }]
      }
    },
    RevisionSuccessorInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 138
      },
      name: "RevisionSuccessorInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "hash",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "named",
            name: "SuccessorTypeValue"
          },
          optional: false
        }]
      }
    },
    RevisionInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 143
      },
      name: "RevisionInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "author",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "bookmarks",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "branch",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "date",
          type: {
            kind: "named",
            name: "Date"
          },
          optional: false
        }, {
          name: "description",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "hash",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "id",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "isHead",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "remoteBookmarks",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "parents",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "phase",
          type: {
            kind: "named",
            name: "CommitPhaseType"
          },
          optional: false
        }, {
          name: "successorInfo",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "RevisionSuccessorInfo"
            }
          },
          optional: false
        }, {
          name: "tags",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "title",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    RevisionShowInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 160
      },
      name: "RevisionShowInfo",
      definition: {
        kind: "object",
        fields: [{
          name: "diff",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    AsyncExecuteRet: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 164
      },
      name: "AsyncExecuteRet",
      definition: {
        kind: "object",
        fields: [{
          name: "command",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "errorMessage",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "exitCode",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "stderr",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "stdout",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    RevisionFileCopy: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 172
      },
      name: "RevisionFileCopy",
      definition: {
        kind: "object",
        fields: [{
          name: "from",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "to",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }]
      }
    },
    RevisionFileChanges: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 177
      },
      name: "RevisionFileChanges",
      definition: {
        kind: "object",
        fields: [{
          name: "all",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          name: "added",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          name: "deleted",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }, {
          name: "copied",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "RevisionFileCopy"
            }
          },
          optional: false
        }, {
          name: "modified",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }]
      }
    },
    VcsLogEntry: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 185
      },
      name: "VcsLogEntry",
      definition: {
        kind: "object",
        fields: [{
          name: "node",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "user",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "desc",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "date",
          type: {
            kind: "tuple",
            types: [{
              kind: "number"
            }, {
              kind: "number"
            }]
          },
          optional: false
        }]
      }
    },
    VcsLogResponse: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 192
      },
      name: "VcsLogResponse",
      definition: {
        kind: "object",
        fields: [{
          name: "entries",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "VcsLogEntry"
            }
          },
          optional: false
        }]
      }
    },
    MergeConflictSideFileData: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 197
      },
      name: "MergeConflictSideFileData",
      definition: {
        kind: "object",
        fields: [{
          name: "contents",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "exists",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "isexec",
          type: {
            kind: "nullable",
            type: {
              kind: "boolean"
            }
          },
          optional: false
        }, {
          name: "issymlink",
          type: {
            kind: "nullable",
            type: {
              kind: "boolean"
            }
          },
          optional: false
        }]
      }
    },
    MergeConflictOutputFileData: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 205
      },
      name: "MergeConflictOutputFileData",
      definition: {
        kind: "intersection",
        types: [{
          kind: "named",
          name: "MergeConflictSideFileData"
        }, {
          kind: "object",
          fields: [{
            name: "path",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }]
        }],
        flattened: {
          kind: "object",
          fields: [{
            name: "contents",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            },
            optional: false
          }, {
            name: "exists",
            type: {
              kind: "boolean"
            },
            optional: false
          }, {
            name: "isexec",
            type: {
              kind: "nullable",
              type: {
                kind: "boolean"
              }
            },
            optional: false
          }, {
            name: "issymlink",
            type: {
              kind: "nullable",
              type: {
                kind: "boolean"
              }
            },
            optional: false
          }, {
            name: "path",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }]
        }
      }
    },
    MergeConflictFileData: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 209
      },
      name: "MergeConflictFileData",
      definition: {
        kind: "object",
        fields: [{
          name: "base",
          type: {
            kind: "named",
            name: "MergeConflictSideFileData"
          },
          optional: false
        }, {
          name: "local",
          type: {
            kind: "named",
            name: "MergeConflictSideFileData"
          },
          optional: false
        }, {
          name: "other",
          type: {
            kind: "named",
            name: "MergeConflictSideFileData"
          },
          optional: false
        }, {
          name: "output",
          type: {
            kind: "named",
            name: "MergeConflictOutputFileData"
          },
          optional: false
        }, {
          name: "status",
          type: {
            kind: "named",
            name: "MergeConflictStatusValue"
          },
          optional: false
        }, {
          name: "conflictCount",
          type: {
            kind: "number"
          },
          optional: true
        }]
      }
    },
    MergeConflicts: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 218
      },
      name: "MergeConflicts",
      definition: {
        kind: "object",
        fields: [{
          name: "conflicts",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "MergeConflictFileData"
            }
          },
          optional: false
        }, {
          name: "command",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    CheckoutSideName: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 223
      },
      name: "CheckoutSideName",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "ours"
        }, {
          kind: "string-literal",
          value: "theirs"
        }]
      }
    },
    AmendModeValue: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 225
      },
      name: "AmendModeValue",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "Clean"
        }, {
          kind: "string-literal",
          value: "Rebase"
        }, {
          kind: "string-literal",
          value: "Fixup"
        }]
      }
    },
    CheckoutOptions: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 227
      },
      name: "CheckoutOptions",
      definition: {
        kind: "object",
        fields: [{
          name: "clean",
          type: {
            kind: "boolean-literal",
            value: true
          },
          optional: true
        }]
      }
    },
    ProcessExitMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 590
      },
      name: "ProcessExitMessage",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          name: "exitCode",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          },
          optional: false
        }, {
          name: "signal",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 596
      },
      name: "ProcessMessage",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            name: "exitCode",
            type: {
              kind: "nullable",
              type: {
                kind: "number"
              }
            },
            optional: false
          }, {
            name: "signal",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    LegacyProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process.js",
        line: 609
      },
      name: "LegacyProcessMessage",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            name: "data",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            name: "exitCode",
            type: {
              kind: "nullable",
              type: {
                kind: "number"
              }
            },
            optional: false
          }, {
            name: "signal",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            name: "error",
            type: {
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    HgService: {
      kind: "interface",
      name: "HgService",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 266
      },
      constructorArgs: [{
        name: "workingDirectory",
        type: {
          kind: "string"
        }
      }],
      staticMethods: {},
      instanceMethods: {
        waitForWatchmanSubscriptions: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 297
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 301
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        fetchStatuses: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 341
          },
          kind: "function",
          argumentTypes: [{
            name: "toRevision",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "map",
              keyType: {
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                kind: "named",
                name: "StatusCodeIdValue"
              }
            }
          }
        },
        fetchStackStatuses: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 371
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "map",
              keyType: {
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                kind: "named",
                name: "StatusCodeIdValue"
              }
            }
          }
        },
        fetchHeadStatuses: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 390
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "map",
              keyType: {
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                kind: "named",
                name: "StatusCodeIdValue"
              }
            }
          }
        },
        observeFilesDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 617
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }
        },
        observeHgCommitsDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 625
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        observeHgRepoStateDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 639
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        observeHgConflictStateDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 646
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "boolean"
            }
          }
        },
        fetchDiffInfo: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 659
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "map",
                keyType: {
                  kind: "named",
                  name: "NuclideUri"
                },
                valueType: {
                  kind: "named",
                  name: "DiffInfo"
                }
              }
            }
          }
        },
        createBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 696
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              kind: "string"
            }
          }, {
            name: "revision",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        deleteBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 707
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        renameBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 711
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              kind: "string"
            }
          }, {
            name: "nextName",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        fetchActiveBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 722
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "string"
            }
          }
        },
        fetchBookmarks: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 729
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "BookmarkInfo"
              }
            }
          }
        },
        observeActiveBookmarkDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 743
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        observeBookmarksDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 750
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "void"
            }
          }
        },
        fetchFileContentAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 763
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "revision",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        },
        fetchFilesChangedAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 774
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "RevisionFileChanges"
            }
          }
        },
        fetchRevisionInfoBetweenHeadAndBase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 786
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "RevisionInfo"
              }
            }
          }
        },
        fetchSmartlogRevisions: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 796
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "RevisionInfo"
              }
            }
          }
        },
        getBaseRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 803
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "RevisionInfo"
            }
          }
        },
        getBlameAtHead: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 817
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "array",
              type: {
                kind: "nullable",
                type: {
                  kind: "named",
                  name: "RevisionInfo"
                }
              }
            }
          }
        },
        getConfigValueAsync: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 867
          },
          kind: "function",
          argumentTypes: [{
            name: "key",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            }
          }
        },
        getDifferentialRevisionForChangeSetId: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 888
          },
          kind: "function",
          argumentTypes: [{
            name: "changeSetId",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            }
          }
        },
        getSmartlog: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 923
          },
          kind: "function",
          argumentTypes: [{
            name: "ttyOutput",
            type: {
              kind: "boolean"
            }
          }, {
            name: "concise",
            type: {
              kind: "boolean"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "AsyncExecuteRet"
            }
          }
        },
        commit: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 977
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              kind: "string"
            }
          }, {
            name: "filePaths",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "NuclideUri"
                }
              }
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        editCommitMessage: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 991
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              kind: "string"
            }
          }, {
            name: "message",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        amend: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1011
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            }
          }, {
            name: "amendMode",
            type: {
              kind: "named",
              name: "AmendModeValue"
            }
          }, {
            name: "filePaths",
            type: {
              kind: "nullable",
              type: {
                kind: "array",
                type: {
                  kind: "named",
                  name: "NuclideUri"
                }
              }
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        restack: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1033
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        splitRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1041
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        revert: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1063
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }, {
            name: "toRevision",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        checkout: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1098
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              kind: "string"
            }
          }, {
            name: "create",
            type: {
              kind: "boolean"
            }
          }, {
            name: "options",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "CheckoutOptions"
              }
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        show: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1116
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              kind: "number"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "RevisionShowInfo"
            }
          }
        },
        purge: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1131
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        uncommit: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1138
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        strip: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1145
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        checkoutForkBase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1153
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        rename: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1174
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }, {
            name: "destPath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "after",
            type: {
              kind: "nullable",
              type: {
                kind: "boolean"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        remove: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1201
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }, {
            name: "after",
            type: {
              kind: "nullable",
              type: {
                kind: "boolean"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        forget: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1223
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        add: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1236
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getTemplateCommitMessage: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1240
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            }
          }
        },
        getHeadCommitMessage: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1257
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            }
          }
        },
        log: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1283
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }, {
            name: "limit",
            type: {
              kind: "nullable",
              type: {
                kind: "number"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "VcsLogResponse"
            }
          }
        },
        fetchMergeConflicts: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1303
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "nullable",
              type: {
                kind: "named",
                name: "MergeConflicts"
              }
            }
          }
        },
        markConflictedFile: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1342
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "resolved",
            type: {
              kind: "boolean"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        continueOperation: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1358
          },
          kind: "function",
          argumentTypes: [{
            name: "command",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        abortOperation: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1374
          },
          kind: "function",
          argumentTypes: [{
            name: "command",
            type: {
              kind: "string"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        },
        resolveAllFiles: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1382
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        rebase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1392
          },
          kind: "function",
          argumentTypes: [{
            name: "destination",
            type: {
              kind: "string"
            }
          }, {
            name: "source",
            type: {
              kind: "nullable",
              type: {
                kind: "string"
              }
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        pull: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1412
          },
          kind: "function",
          argumentTypes: [{
            name: "options",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        copy: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1427
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
            }
          }, {
            name: "destPath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "after",
            type: {
              kind: "nullable",
              type: {
                kind: "boolean"
              }
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getHeadId: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1453
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "observable",
            type: {
              kind: "string"
            }
          }
        }
      }
    }
  }
});