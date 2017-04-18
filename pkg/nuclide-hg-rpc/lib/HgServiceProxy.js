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
            line: 237
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
            line: 221
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
            line: 255
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
            line: 288
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 288
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
            line: 221
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
            line: 288
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 288
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 288
            },
            kind: "named",
            name: "StatusCodeIdValue"
          }
        });
      }).publish();
    }

    fetchStackStatuses() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchStackStatuses", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 316
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 316
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 316
            },
            kind: "named",
            name: "StatusCodeIdValue"
          }
        });
      }).publish();
    }

    fetchHeadStatuses() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchHeadStatuses", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 333
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 333
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 333
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
            line: 221
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
            line: 507
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 507
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
            line: 221
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
            line: 515
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
            line: 221
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
            line: 527
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
            line: 221
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
            line: 534
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
            line: 547
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 547
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
            line: 221
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
            line: 547
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 547
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 547
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 547
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
            line: 579
          },
          kind: "string"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 579
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 579
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
            line: 221
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
            line: 579
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
            line: 589
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
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
            line: 589
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
            line: 593
          },
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 593
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
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
            line: 593
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
            line: 221
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
            line: 600
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
            line: 221
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
            line: 607
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 607
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
            line: 221
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
            line: 627
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
            line: 221
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
            line: 634
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
            line: 648
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
            line: 649
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
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
            line: 650
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
            line: 654
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
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
            line: 654
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
            line: 221
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
            line: 664
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 664
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
            line: 221
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
            line: 674
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 674
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
            line: 221
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
            line: 681
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
            line: 695
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
            line: 221
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
            line: 695
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 695
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 695
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
            line: 741
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
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
            line: 741
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 741
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
            line: 762
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
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
            line: 762
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 762
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
            line: 785
          },
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 785
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
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
            line: 785
          },
          kind: "named",
          name: "AsyncExecuteRet"
        });
      });
    }

    commit(arg0, arg1) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 844
          },
          kind: "string"
        }
      }, {
        name: "isInteractive",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 845
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 845
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
            line: 221
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
            line: 846
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    amend(arg0, arg1, arg2) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 859
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 859
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
            line: 860
          },
          kind: "named",
          name: "AmendModeValue"
        }
      }, {
        name: "isInteractive",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 861
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 861
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
            line: 221
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
            line: 862
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    splitRevision() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "splitRevision", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 879
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
            line: 899
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 899
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
            line: 899
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 899
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
            line: 221
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
            line: 899
          },
          kind: "void"
        });
      });
    }

    checkout(arg0, arg1, arg2) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 935
          },
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 936
          },
          kind: "boolean"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 937
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 937
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
            line: 221
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "checkout", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 938
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    show(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 952
          },
          kind: "number"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "show", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 952
          },
          kind: "named",
          name: "RevisionShowInfo"
        });
      }).publish();
    }

    purge() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "purge", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 967
          },
          kind: "void"
        });
      });
    }

    uncommit() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "uncommit", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 974
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
            line: 981
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
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
            line: 981
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
            line: 221
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
            line: 989
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
            line: 1011
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1011
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
            line: 1012
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
            line: 1013
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1013
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
            line: 221
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
            line: 1014
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
            line: 1037
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1037
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
            line: 1037
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1037
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
            line: 221
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
            line: 1037
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
            line: 1058
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1058
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
            line: 221
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
            line: 1058
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
            line: 221
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
            line: 1062
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1062
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
            line: 221
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
            line: 1077
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1077
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
            line: 1097
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1097
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
            line: 1097
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1097
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
            line: 221
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
            line: 1097
          },
          kind: "named",
          name: "VcsLogResponse"
        });
      });
    }

    fetchMergeConflicts(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fetchResolved",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1118
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1118
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
            line: 221
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
            line: 1118
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1118
            },
            kind: "named",
            name: "MergeConflict"
          }
        });
      });
    }

    markConflictedFile(arg0, arg1) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1172
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "resolved",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1173
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "markConflictedFile", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1174
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    continueRebase() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "continueRebase", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1186
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }

    abortRebase() {
      return _client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
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
            line: 1196
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
            line: 1201
          },
          kind: "string"
        }
      }, {
        name: "source",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1202
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1202
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
            line: 221
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
            line: 1203
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
            line: 1221
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1221
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
            line: 221
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
            line: 1221
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
            line: 1239
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1239
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
            line: 1240
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
            line: 1241
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1241
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
            line: 221
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
            line: 1242
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
        line: 87
      },
      name: "StatusCodeIdValue",
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
          value: "A"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 87
          },
          kind: "string-literal",
          value: "C"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 87
          },
          kind: "string-literal",
          value: "I"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 87
          },
          kind: "string-literal",
          value: "M"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 87
          },
          kind: "string-literal",
          value: "!"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 87
          },
          kind: "string-literal",
          value: "R"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 87
          },
          kind: "string-literal",
          value: "?"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 87
          },
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
        line: 89
      },
      name: "MergeConflictStatusValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 90
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 90
          },
          kind: "string-literal",
          value: "both changed"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 91
          },
          kind: "string-literal",
          value: "deleted in theirs"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
          },
          kind: "string-literal",
          value: "deleted in ours"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 93
          },
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
        line: 95
      },
      name: "MergeConflictStatusCodeId",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 95
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 95
          },
          kind: "string-literal",
          value: "R"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 95
          },
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
        line: 105
      },
      name: "StatusCodeNumberValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 105
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 105
          },
          kind: "number-literal",
          value: 1
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 105
          },
          kind: "number-literal",
          value: 2
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 105
          },
          kind: "number-literal",
          value: 3
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 105
          },
          kind: "number-literal",
          value: 4
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 105
          },
          kind: "number-literal",
          value: 5
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 105
          },
          kind: "number-literal",
          value: 6
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 105
          },
          kind: "number-literal",
          value: 7
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 105
          },
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
        line: 107
      },
      name: "LineDiff",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 107
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 108
          },
          name: "oldStart",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 108
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 109
          },
          name: "oldLines",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 109
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
          },
          name: "newStart",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 110
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 111
          },
          name: "newLines",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 111
            },
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
        line: 114
      },
      name: "BookmarkInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 114
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 115
          },
          name: "active",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 115
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 116
          },
          name: "bookmark",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 116
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 117
          },
          name: "node",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 117
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 118
          },
          name: "rev",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 118
            },
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
        line: 121
      },
      name: "DiffInfo",
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
          name: "added",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 122
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 123
          },
          name: "deleted",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 123
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 124
          },
          name: "lineDiffs",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 124
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 124
              },
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
        line: 127
      },
      name: "CommitPhaseType",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 127
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 127
          },
          kind: "string-literal",
          value: "public"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 127
          },
          kind: "string-literal",
          value: "draft"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 127
          },
          kind: "string-literal",
          value: "secret"
        }]
      }
    },
    RevisionInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 129
      },
      name: "RevisionInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 129
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 130
          },
          name: "author",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 130
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 131
          },
          name: "bookmarks",
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
          name: "branch",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 132
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 133
          },
          name: "date",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 133
            },
            kind: "named",
            name: "Date"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 134
          },
          name: "description",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 134
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 135
          },
          name: "hash",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 135
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 136
          },
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 136
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 137
          },
          name: "isHead",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 137
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 138
          },
          name: "remoteBookmarks",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 138
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 138
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 139
          },
          name: "parents",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 139
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 139
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 140
          },
          name: "phase",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 140
            },
            kind: "named",
            name: "CommitPhaseType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 141
          },
          name: "tags",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 141
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 141
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 142
          },
          name: "title",
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
    },
    RevisionShowInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 145
      },
      name: "RevisionShowInfo",
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
          name: "diff",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 146
            },
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
        line: 149
      },
      name: "AsyncExecuteRet",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 149
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 150
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 150
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 151
          },
          name: "errorMessage",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 151
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 152
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 152
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 153
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 153
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 154
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 154
            },
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
        line: 157
      },
      name: "RevisionFileCopy",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 157
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 158
          },
          name: "from",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 158
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 159
          },
          name: "to",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 159
            },
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
        line: 162
      },
      name: "RevisionFileChanges",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 162
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 163
          },
          name: "all",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 163
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 163
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
            line: 164
          },
          name: "added",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 164
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 164
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
            line: 165
          },
          name: "deleted",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 165
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 165
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
            line: 166
          },
          name: "copied",
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
              name: "RevisionFileCopy"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 167
          },
          name: "modified",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 167
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 167
              },
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
        line: 170
      },
      name: "VcsLogEntry",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 170
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 171
          },
          name: "node",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 171
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 172
          },
          name: "user",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 172
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 173
          },
          name: "desc",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 173
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 174
          },
          name: "date",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 174
            },
            kind: "tuple",
            types: [{
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 174
              },
              kind: "number"
            }, {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 174
              },
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
        line: 177
      },
      name: "VcsLogResponse",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 177
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 178
          },
          name: "entries",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 178
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 178
              },
              kind: "named",
              name: "VcsLogEntry"
            }
          },
          optional: false
        }]
      }
    },
    MergeConflict: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 181
      },
      name: "MergeConflict",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 181
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 182
          },
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 182
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 183
          },
          name: "status",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 183
            },
            kind: "named",
            name: "MergeConflictStatusValue"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 184
          },
          name: "mergeConflictsCount",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 184
            },
            kind: "number"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 185
          },
          name: "resolvedConflictsCount",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 185
            },
            kind: "number"
          },
          optional: true
        }]
      }
    },
    CheckoutSideName: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 188
      },
      name: "CheckoutSideName",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 188
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 188
          },
          kind: "string-literal",
          value: "ours"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 188
          },
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
        line: 190
      },
      name: "AmendModeValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 190
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 190
          },
          kind: "string-literal",
          value: "Clean"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 190
          },
          kind: "string-literal",
          value: "Rebase"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 190
          },
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
        line: 192
      },
      name: "CheckoutOptions",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 192
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 193
          },
          name: "clean",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 193
            },
            kind: "boolean-literal",
            value: true
          },
          optional: true
        }]
      }
    },
    HgService: {
      kind: "interface",
      name: "HgService",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 221
      },
      constructorArgs: [{
        name: "workingDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 237
          },
          kind: "string"
        }
      }],
      staticMethods: {},
      instanceMethods: {
        waitForWatchmanSubscriptions: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 255
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 255
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 255
              },
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 259
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 259
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 259
              },
              kind: "void"
            }
          }
        },
        fetchStatuses: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 288
          },
          kind: "function",
          argumentTypes: [{
            name: "toRevision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 288
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 288
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 288
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 288
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 288
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 288
                },
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
            line: 316
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 316
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 316
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 316
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 316
                },
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
            line: 333
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 333
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 333
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 333
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 333
                },
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
            line: 507
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 507
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 507
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 507
                },
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
            line: 515
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 515
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 515
              },
              kind: "void"
            }
          }
        },
        observeHgRepoStateDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 527
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 527
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 527
              },
              kind: "void"
            }
          }
        },
        observeHgConflictStateDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 534
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 534
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 534
              },
              kind: "boolean"
            }
          }
        },
        fetchDiffInfo: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 547
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 547
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 547
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
              line: 547
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 547
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 547
                },
                kind: "map",
                keyType: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 547
                  },
                  kind: "named",
                  name: "NuclideUri"
                },
                valueType: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 547
                  },
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
            line: 579
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 579
              },
              kind: "string"
            }
          }, {
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 579
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 579
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 579
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 579
              },
              kind: "void"
            }
          }
        },
        deleteBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 589
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 589
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 589
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 589
              },
              kind: "void"
            }
          }
        },
        renameBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 593
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 593
              },
              kind: "string"
            }
          }, {
            name: "nextName",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 593
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 593
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 593
              },
              kind: "void"
            }
          }
        },
        fetchActiveBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 600
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 600
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 600
              },
              kind: "string"
            }
          }
        },
        fetchBookmarks: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 607
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 607
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 607
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 607
                },
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
            line: 627
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 627
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 627
              },
              kind: "void"
            }
          }
        },
        observeBookmarksDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 634
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 634
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 634
              },
              kind: "void"
            }
          }
        },
        fetchFileContentAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 647
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 648
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
                line: 649
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 650
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 650
              },
              kind: "string"
            }
          }
        },
        fetchFilesChangedAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 654
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 654
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 654
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 654
              },
              kind: "named",
              name: "RevisionFileChanges"
            }
          }
        },
        fetchRevisionInfoBetweenHeadAndBase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 664
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 664
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 664
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 664
                },
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
            line: 674
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 674
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 674
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 674
                },
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
            line: 681
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 681
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 681
              },
              kind: "named",
              name: "RevisionInfo"
            }
          }
        },
        getBlameAtHead: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 695
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 695
              },
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 695
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 695
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 695
                },
                kind: "nullable",
                type: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 695
                  },
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
            line: 741
          },
          kind: "function",
          argumentTypes: [{
            name: "key",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 741
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 741
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 741
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 741
                },
                kind: "string"
              }
            }
          }
        },
        getDifferentialRevisionForChangeSetId: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 762
          },
          kind: "function",
          argumentTypes: [{
            name: "changeSetId",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 762
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 762
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 762
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 762
                },
                kind: "string"
              }
            }
          }
        },
        getSmartlog: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 785
          },
          kind: "function",
          argumentTypes: [{
            name: "ttyOutput",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 785
              },
              kind: "boolean"
            }
          }, {
            name: "concise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 785
              },
              kind: "boolean"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 785
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 785
              },
              kind: "named",
              name: "AsyncExecuteRet"
            }
          }
        },
        commit: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 843
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 844
              },
              kind: "string"
            }
          }, {
            name: "isInteractive",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 845
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 845
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 846
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 846
              },
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        amend: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 858
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 859
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 859
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
                line: 860
              },
              kind: "named",
              name: "AmendModeValue"
            }
          }, {
            name: "isInteractive",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 861
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 861
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 862
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 862
              },
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        splitRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 879
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 879
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 879
              },
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        revert: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 899
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 899
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 899
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
                line: 899
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 899
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 899
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 899
              },
              kind: "void"
            }
          }
        },
        checkout: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 934
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 935
              },
              kind: "string"
            }
          }, {
            name: "create",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 936
              },
              kind: "boolean"
            }
          }, {
            name: "options",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 937
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 937
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
              line: 938
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 938
              },
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        show: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 952
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 952
              },
              kind: "number"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 952
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 952
              },
              kind: "named",
              name: "RevisionShowInfo"
            }
          }
        },
        purge: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 967
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 967
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 967
              },
              kind: "void"
            }
          }
        },
        uncommit: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 974
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 974
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 974
              },
              kind: "void"
            }
          }
        },
        strip: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 981
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 981
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 981
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 981
              },
              kind: "void"
            }
          }
        },
        checkoutForkBase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 989
          },
          kind: "function",
          argumentTypes: [],
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
              kind: "void"
            }
          }
        },
        rename: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1010
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1011
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1011
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
                line: 1012
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
                line: 1013
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1013
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1014
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1014
              },
              kind: "void"
            }
          }
        },
        remove: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1037
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1037
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1037
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
                line: 1037
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1037
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1037
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1037
              },
              kind: "void"
            }
          }
        },
        add: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1058
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1058
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1058
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
              line: 1058
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1058
              },
              kind: "void"
            }
          }
        },
        getTemplateCommitMessage: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1062
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1062
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1062
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1062
                },
                kind: "string"
              }
            }
          }
        },
        getHeadCommitMessage: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1077
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1077
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1077
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1077
                },
                kind: "string"
              }
            }
          }
        },
        log: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1097
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1097
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1097
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
                line: 1097
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1097
                },
                kind: "number"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1097
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1097
              },
              kind: "named",
              name: "VcsLogResponse"
            }
          }
        },
        fetchMergeConflicts: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1118
          },
          kind: "function",
          argumentTypes: [{
            name: "fetchResolved",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1118
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1118
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1118
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1118
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1118
                },
                kind: "named",
                name: "MergeConflict"
              }
            }
          }
        },
        markConflictedFile: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1171
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1172
              },
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "resolved",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1173
              },
              kind: "boolean"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1174
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1174
              },
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        continueRebase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1186
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1186
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1186
              },
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        abortRebase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1196
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1196
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1196
              },
              kind: "void"
            }
          }
        },
        rebase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1200
          },
          kind: "function",
          argumentTypes: [{
            name: "destination",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1201
              },
              kind: "string"
            }
          }, {
            name: "source",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1202
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1202
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1203
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1203
              },
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        pull: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1221
          },
          kind: "function",
          argumentTypes: [{
            name: "options",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1221
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1221
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1221
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1221
              },
              kind: "named",
              name: "ProcessMessage"
            }
          }
        },
        copy: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1238
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1239
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1239
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
                line: 1240
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
                line: 1241
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1241
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1242
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1242
              },
              kind: "void"
            }
          }
        }
      }
    },
    ProcessExitMessage: {
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
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 17
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    ProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 21
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 21
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 21
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 22
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 22
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 24
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 25
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 25
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
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
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "stderr",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 27
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 29
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 29
              },
              kind: "named",
              name: "Object"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    ProcessInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 32
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 32
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 33
          },
          name: "parentPid",
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
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 34
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 35
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 35
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});