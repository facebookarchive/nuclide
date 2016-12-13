"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.HgService = class {
    constructor(arg0) {
      _client.createRemoteObject("HgService", this, [arg0], [{
        name: "workingDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 223
          },
          kind: "string"
        }
      }]);
    }

    waitForWatchmanSubscriptions() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "waitForWatchmanSubscriptions", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 241
          },
          kind: "void"
        });
      });
    }

    fetchStatuses(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "toRevision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 274
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 274
            },
            kind: "string"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchStatuses", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 274
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 274
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 274
            },
            kind: "named",
            name: "StatusCodeIdValue"
          }
        });
      }).publish();
    }

    observeFilesDidChange() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "observeFilesDidChange", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 468
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 468
            },
            kind: "named",
            name: "NuclideUri"
          }
        });
      }).publish();
    }

    observeHgCommitsDidChange() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "observeHgCommitsDidChange", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 476
          },
          kind: "void"
        });
      }).publish();
    }

    observeHgRepoStateDidChange() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "observeHgRepoStateDidChange", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 484
          },
          kind: "void"
        });
      }).publish();
    }

    observeHgConflictStateDidChange() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "observeHgConflictStateDidChange", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 491
          },
          kind: "boolean"
        });
      }).publish();
    }

    fetchDiffInfo(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 504
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 504
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchDiffInfo", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 504
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 504
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 504
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 504
              },
              kind: "named",
              name: "DiffInfo"
            }
          }
        });
      });
    }

    createBookmark(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 536
          },
          kind: "string"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 536
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 536
            },
            kind: "string"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "createBookmark", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 536
          },
          kind: "void"
        });
      });
    }

    deleteBookmark(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 546
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "deleteBookmark", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 546
          },
          kind: "void"
        });
      });
    }

    renameBookmark(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 550
          },
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 550
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "renameBookmark", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 550
          },
          kind: "void"
        });
      });
    }

    fetchActiveBookmark() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchActiveBookmark", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 557
          },
          kind: "string"
        });
      });
    }

    fetchBookmarks() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchBookmarks", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 564
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 564
            },
            kind: "named",
            name: "BookmarkInfo"
          }
        });
      });
    }

    observeActiveBookmarkDidChange() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "observeActiveBookmarkDidChange", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 584
          },
          kind: "void"
        });
      }).publish();
    }

    observeBookmarksDidChange() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "observeBookmarksDidChange", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 591
          },
          kind: "void"
        });
      }).publish();
    }

    fetchFileContentAtRevision(arg0, arg1) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 605
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 606
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchFileContentAtRevision", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 607
          },
          kind: "string"
        });
      }).publish();
    }

    fetchFilesChangedAtRevision(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 611
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchFilesChangedAtRevision", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 611
          },
          kind: "named",
          name: "RevisionFileChanges"
        });
      }).publish();
    }

    fetchRevisionInfoBetweenHeadAndBase() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchRevisionInfoBetweenHeadAndBase", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 621
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 621
            },
            kind: "named",
            name: "RevisionInfo"
          }
        });
      });
    }

    fetchSmartlogRevisions() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchSmartlogRevisions", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 631
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 631
            },
            kind: "named",
            name: "RevisionInfo"
          }
        });
      }).publish();
    }

    getBaseRevision() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getBaseRevision", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 638
          },
          kind: "named",
          name: "RevisionInfo"
        });
      });
    }

    getBlameAtHead(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 652
          },
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getBlameAtHead", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 652
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 652
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 652
              },
              kind: "named",
              name: "RevisionInfo"
            }
          }
        });
      });
    }

    getConfigValueAsync(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "key",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 698
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getConfigValueAsync", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 698
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 698
            },
            kind: "string"
          }
        });
      });
    }

    getDifferentialRevisionForChangeSetId(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "changeSetId",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 719
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getDifferentialRevisionForChangeSetId", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 719
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 719
            },
            kind: "string"
          }
        });
      });
    }

    getSmartlog(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "ttyOutput",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 742
          },
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 742
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getSmartlog", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 742
          },
          kind: "named",
          name: "AsyncExecuteRet"
        });
      });
    }

    commit(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 793
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "commit", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 793
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    amend(arg0, arg1) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 805
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 805
            },
            kind: "string"
          }
        }
      }, {
        name: "amendMode",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 805
          },
          kind: "named",
          name: "AmendModeValue"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "amend", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 805
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    revert(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 822
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 822
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "toRevision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 822
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 822
            },
            kind: "string"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "revert", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 822
          },
          kind: "void"
        });
      });
    }

    checkout(arg0, arg1, arg2) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 858
          },
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 859
          },
          kind: "boolean"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 860
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 860
            },
            kind: "named",
            name: "CheckoutOptions"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "checkout", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 861
          },
          kind: "void"
        });
      });
    }

    strip(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 872
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "strip", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 872
          },
          kind: "void"
        });
      });
    }

    checkoutForkBase() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "checkoutForkBase", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 880
          },
          kind: "void"
        });
      });
    }

    rename(arg0, arg1, arg2) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 902
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 902
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "destPath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 903
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "after",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 904
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 904
            },
            kind: "boolean"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "rename", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 905
          },
          kind: "void"
        });
      });
    }

    remove(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 928
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 928
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "after",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 928
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 928
            },
            kind: "boolean"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "remove", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 928
          },
          kind: "void"
        });
      });
    }

    add(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 949
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 949
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "add", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 949
          },
          kind: "void"
        });
      });
    }

    getTemplateCommitMessage() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getTemplateCommitMessage", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 953
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 953
            },
            kind: "string"
          }
        });
      });
    }

    getHeadCommitMessage() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "getHeadCommitMessage", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 969
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 969
            },
            kind: "string"
          }
        });
      });
    }

    log(arg0, arg1) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 989
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 989
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "limit",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 989
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 989
            },
            kind: "number"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "log", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 989
          },
          kind: "named",
          name: "VcsLogResponse"
        });
      });
    }

    fetchMergeConflicts() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchMergeConflicts", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1006
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1006
            },
            kind: "named",
            name: "MergeConflict"
          }
        });
      });
    }

    resolveConflictedFile(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1051
          },
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "resolveConflictedFile", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1051
          },
          kind: "void"
        });
      });
    }

    continueRebase() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "continueRebase", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1055
          },
          kind: "void"
        });
      });
    }

    abortRebase() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "abortRebase", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1059
          },
          kind: "void"
        });
      });
    }

    rebase(arg0, arg1) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "destination",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1064
          },
          kind: "string"
        }
      }, {
        name: "source",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1065
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1065
            },
            kind: "string"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "rebase", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1066
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    pull(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1086
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1086
            },
            kind: "string"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "pull", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1086
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    copy(arg0, arg1, arg2) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1104
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1104
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "destPath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1105
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "after",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1106
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1106
            },
            kind: "boolean"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 207
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "copy", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1107
          },
          kind: "void"
        });
      });
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
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["StatusCodeIdValue", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 85
    },
    name: "StatusCodeIdValue",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 85
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
        },
        kind: "string-literal",
        value: "A"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
        },
        kind: "string-literal",
        value: "C"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
        },
        kind: "string-literal",
        value: "I"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
        },
        kind: "string-literal",
        value: "M"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
        },
        kind: "string-literal",
        value: "!"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
        },
        kind: "string-literal",
        value: "R"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
        },
        kind: "string-literal",
        value: "?"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
        },
        kind: "string-literal",
        value: "U"
      }]
    }
  }], ["MergeConflictStatusValue", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 87
    },
    name: "MergeConflictStatusValue",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 87
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 87
        },
        kind: "string-literal",
        value: "both changed"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 87
        },
        kind: "string-literal",
        value: "deleted in theirs"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 87
        },
        kind: "string-literal",
        value: "deleted in ours"
      }]
    }
  }], ["StatusCodeNumberValue", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 97
    },
    name: "StatusCodeNumberValue",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 97
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 97
        },
        kind: "number-literal",
        value: 1
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 97
        },
        kind: "number-literal",
        value: 2
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 97
        },
        kind: "number-literal",
        value: 3
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 97
        },
        kind: "number-literal",
        value: 4
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 97
        },
        kind: "number-literal",
        value: 5
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 97
        },
        kind: "number-literal",
        value: 6
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 97
        },
        kind: "number-literal",
        value: 7
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 97
        },
        kind: "number-literal",
        value: 8
      }]
    }
  }], ["LineDiff", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 99
    },
    name: "LineDiff",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 99
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 100
        },
        name: "oldStart",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 100
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 101
        },
        name: "oldLines",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 101
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 102
        },
        name: "newStart",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 102
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 103
        },
        name: "newLines",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 103
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["BookmarkInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 106
    },
    name: "BookmarkInfo",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 106
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 107
        },
        name: "active",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 107
          },
          kind: "boolean"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 108
        },
        name: "bookmark",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 108
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 109
        },
        name: "node",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 109
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 110
        },
        name: "rev",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["DiffInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 113
    },
    name: "DiffInfo",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 113
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 114
        },
        name: "added",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 114
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 115
        },
        name: "deleted",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 115
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 116
        },
        name: "lineDiffs",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 116
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 116
            },
            kind: "named",
            name: "LineDiff"
          }
        },
        optional: false
      }]
    }
  }], ["CommitPhaseType", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 119
    },
    name: "CommitPhaseType",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 119
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 119
        },
        kind: "string-literal",
        value: "public"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 119
        },
        kind: "string-literal",
        value: "draft"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 119
        },
        kind: "string-literal",
        value: "secret"
      }]
    }
  }], ["RevisionInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 121
    },
    name: "RevisionInfo",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 121
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 122
        },
        name: "author",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 122
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 123
        },
        name: "bookmarks",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 123
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 123
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 124
        },
        name: "branch",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 124
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 125
        },
        name: "date",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 125
          },
          kind: "named",
          name: "Date"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 126
        },
        name: "description",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 126
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 127
        },
        name: "hash",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 127
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 128
        },
        name: "id",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 128
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 129
        },
        name: "isHead",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 129
          },
          kind: "boolean"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 130
        },
        name: "remoteBookmarks",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 130
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 130
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 131
        },
        name: "parents",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 131
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 131
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 132
        },
        name: "phase",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 132
          },
          kind: "named",
          name: "CommitPhaseType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 133
        },
        name: "tags",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 133
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 133
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 134
        },
        name: "title",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 134
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["AsyncExecuteRet", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 137
    },
    name: "AsyncExecuteRet",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 137
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 138
        },
        name: "command",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 138
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 139
        },
        name: "errorMessage",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 139
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 140
        },
        name: "exitCode",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 140
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 141
        },
        name: "stderr",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 141
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 142
        },
        name: "stdout",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 142
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }], ["RevisionFileCopy", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 145
    },
    name: "RevisionFileCopy",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 145
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 146
        },
        name: "from",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 146
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 147
        },
        name: "to",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 147
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }]
    }
  }], ["RevisionFileChanges", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 150
    },
    name: "RevisionFileChanges",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 150
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 151
        },
        name: "all",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 151
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 151
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 152
        },
        name: "added",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 152
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 152
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 153
        },
        name: "deleted",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 153
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 153
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 154
        },
        name: "copied",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 154
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 154
            },
            kind: "named",
            name: "RevisionFileCopy"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 155
        },
        name: "modified",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 155
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 155
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }]
    }
  }], ["VcsLogEntry", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 158
    },
    name: "VcsLogEntry",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 158
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 159
        },
        name: "node",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 159
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 160
        },
        name: "user",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 160
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 161
        },
        name: "desc",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 161
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 162
        },
        name: "date",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 162
          },
          kind: "tuple",
          types: [{
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 162
            },
            kind: "number"
          }, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 162
            },
            kind: "number"
          }]
        },
        optional: false
      }]
    }
  }], ["VcsLogResponse", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 165
    },
    name: "VcsLogResponse",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 165
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 166
        },
        name: "entries",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 166
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 166
            },
            kind: "named",
            name: "VcsLogEntry"
          }
        },
        optional: false
      }]
    }
  }], ["MergeConflict", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 169
    },
    name: "MergeConflict",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 169
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 170
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 170
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 171
        },
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 171
          },
          kind: "named",
          name: "MergeConflictStatusValue"
        },
        optional: false
      }]
    }
  }], ["CheckoutSideName", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 174
    },
    name: "CheckoutSideName",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 174
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 174
        },
        kind: "string-literal",
        value: "ours"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 174
        },
        kind: "string-literal",
        value: "theirs"
      }]
    }
  }], ["AmendModeValue", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 176
    },
    name: "AmendModeValue",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 176
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 176
        },
        kind: "string-literal",
        value: "Clean"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 176
        },
        kind: "string-literal",
        value: "Rebase"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 176
        },
        kind: "string-literal",
        value: "Fixup"
      }]
    }
  }], ["CheckoutOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 178
    },
    name: "CheckoutOptions",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 178
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 179
        },
        name: "clean",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 179
          },
          kind: "boolean-literal",
          value: true
        },
        optional: true
      }]
    }
  }], ["HgService", {
    kind: "interface",
    name: "HgService",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 207
    },
    constructorArgs: [{
      name: "workingDirectory",
      type: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 223
        },
        kind: "string"
      }
    }],
    staticMethods: new Map(),
    instanceMethods: new Map([["waitForWatchmanSubscriptions", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 241
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 241
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 241
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 245
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 245
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 245
          },
          kind: "void"
        }
      }
    }], ["fetchStatuses", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 274
      },
      kind: "function",
      argumentTypes: [{
        name: "toRevision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 274
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 274
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 274
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 274
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 274
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 274
            },
            kind: "named",
            name: "StatusCodeIdValue"
          }
        }
      }
    }], ["observeFilesDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 468
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 468
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 468
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 468
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }], ["observeHgCommitsDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 476
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 476
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 476
          },
          kind: "void"
        }
      }
    }], ["observeHgRepoStateDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 484
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 484
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 484
          },
          kind: "void"
        }
      }
    }], ["observeHgConflictStateDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 491
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 491
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 491
          },
          kind: "boolean"
        }
      }
    }], ["fetchDiffInfo", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 504
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 504
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 504
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 504
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 504
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 504
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 504
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 504
              },
              kind: "named",
              name: "DiffInfo"
            }
          }
        }
      }
    }], ["createBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 536
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 536
          },
          kind: "string"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 536
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 536
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 536
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 536
          },
          kind: "void"
        }
      }
    }], ["deleteBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 546
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 546
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 546
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 546
          },
          kind: "void"
        }
      }
    }], ["renameBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 550
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 550
          },
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 550
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 550
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 550
          },
          kind: "void"
        }
      }
    }], ["fetchActiveBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 557
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 557
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 557
          },
          kind: "string"
        }
      }
    }], ["fetchBookmarks", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 564
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 564
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 564
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 564
            },
            kind: "named",
            name: "BookmarkInfo"
          }
        }
      }
    }], ["observeActiveBookmarkDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 584
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 584
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 584
          },
          kind: "void"
        }
      }
    }], ["observeBookmarksDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 591
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 591
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 591
          },
          kind: "void"
        }
      }
    }], ["fetchFileContentAtRevision", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 604
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 605
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 606
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 607
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 607
          },
          kind: "string"
        }
      }
    }], ["fetchFilesChangedAtRevision", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 611
      },
      kind: "function",
      argumentTypes: [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 611
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 611
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 611
          },
          kind: "named",
          name: "RevisionFileChanges"
        }
      }
    }], ["fetchRevisionInfoBetweenHeadAndBase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 621
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 621
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 621
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 621
            },
            kind: "named",
            name: "RevisionInfo"
          }
        }
      }
    }], ["fetchSmartlogRevisions", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 631
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 631
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 631
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 631
            },
            kind: "named",
            name: "RevisionInfo"
          }
        }
      }
    }], ["getBaseRevision", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 638
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 638
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 638
          },
          kind: "named",
          name: "RevisionInfo"
        }
      }
    }], ["getBlameAtHead", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 652
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 652
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 652
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 652
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 652
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 652
              },
              kind: "named",
              name: "RevisionInfo"
            }
          }
        }
      }
    }], ["getConfigValueAsync", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 698
      },
      kind: "function",
      argumentTypes: [{
        name: "key",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 698
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 698
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 698
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 698
            },
            kind: "string"
          }
        }
      }
    }], ["getDifferentialRevisionForChangeSetId", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 719
      },
      kind: "function",
      argumentTypes: [{
        name: "changeSetId",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 719
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 719
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 719
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 719
            },
            kind: "string"
          }
        }
      }
    }], ["getSmartlog", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 742
      },
      kind: "function",
      argumentTypes: [{
        name: "ttyOutput",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 742
          },
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 742
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 742
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 742
          },
          kind: "named",
          name: "AsyncExecuteRet"
        }
      }
    }], ["commit", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 793
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 793
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 793
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 793
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["amend", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 805
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 805
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 805
            },
            kind: "string"
          }
        }
      }, {
        name: "amendMode",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 805
          },
          kind: "named",
          name: "AmendModeValue"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 805
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 805
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["revert", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 822
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 822
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 822
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "toRevision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 822
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 822
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 822
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 822
          },
          kind: "void"
        }
      }
    }], ["checkout", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 857
      },
      kind: "function",
      argumentTypes: [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 858
          },
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 859
          },
          kind: "boolean"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 860
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 860
            },
            kind: "named",
            name: "CheckoutOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 861
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 861
          },
          kind: "void"
        }
      }
    }], ["strip", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 872
      },
      kind: "function",
      argumentTypes: [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 872
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 872
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 872
          },
          kind: "void"
        }
      }
    }], ["checkoutForkBase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 880
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 880
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 880
          },
          kind: "void"
        }
      }
    }], ["rename", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 901
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 902
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 902
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "destPath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 903
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "after",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 904
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 904
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 905
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 905
          },
          kind: "void"
        }
      }
    }], ["remove", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 928
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 928
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 928
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "after",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 928
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 928
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 928
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 928
          },
          kind: "void"
        }
      }
    }], ["add", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 949
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 949
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 949
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 949
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 949
          },
          kind: "void"
        }
      }
    }], ["getTemplateCommitMessage", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 953
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 953
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 953
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 953
            },
            kind: "string"
          }
        }
      }
    }], ["getHeadCommitMessage", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 969
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 969
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 969
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 969
            },
            kind: "string"
          }
        }
      }
    }], ["log", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 989
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 989
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 989
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "limit",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 989
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 989
            },
            kind: "number"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 989
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 989
          },
          kind: "named",
          name: "VcsLogResponse"
        }
      }
    }], ["fetchMergeConflicts", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1006
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1006
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1006
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1006
            },
            kind: "named",
            name: "MergeConflict"
          }
        }
      }
    }], ["resolveConflictedFile", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1051
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1051
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1051
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1051
          },
          kind: "void"
        }
      }
    }], ["continueRebase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1055
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1055
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1055
          },
          kind: "void"
        }
      }
    }], ["abortRebase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1059
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1059
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1059
          },
          kind: "void"
        }
      }
    }], ["rebase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1063
      },
      kind: "function",
      argumentTypes: [{
        name: "destination",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1064
          },
          kind: "string"
        }
      }, {
        name: "source",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1065
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1065
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1066
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1066
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["pull", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1086
      },
      kind: "function",
      argumentTypes: [{
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1086
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1086
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1086
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1086
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["copy", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1103
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1104
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1104
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "destPath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1105
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "after",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1106
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1106
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1107
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1107
          },
          kind: "void"
        }
      }
    }]])
  }], ["ProcessExitMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 13
    },
    name: "ProcessExitMessage",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 13
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 14
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "string-literal",
          value: "exit"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 15
        },
        name: "exitCode",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "number"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 16
        },
        name: "signal",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "string"
          }
        },
        optional: false
      }]
    }
  }], ["ProcessMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 20
    },
    name: "ProcessMessage",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 20
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 21
            },
            kind: "string-literal",
            value: "stdout"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 23
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 24
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            kind: "string-literal",
            value: "stderr"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 25
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 25
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 13
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 16
              },
              kind: "string"
            }
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 26
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 27
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            kind: "string-literal",
            value: "error"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 28
          },
          name: "error",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            kind: "named",
            name: "Object"
          },
          optional: false
        }]
      }],
      discriminantField: "kind"
    }
  }], ["ProcessInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 31
    },
    name: "ProcessInfo",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 31
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 32
        },
        name: "parentPid",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 32
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 33
        },
        name: "pid",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 34
        },
        name: "command",
        type: {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 34
          },
          kind: "string"
        },
        optional: false
      }]
    }
  }]])
});