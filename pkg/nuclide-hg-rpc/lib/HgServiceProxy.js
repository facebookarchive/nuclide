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
            line: 234
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
            line: 218
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
            line: 252
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
            line: 285
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 285
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
            line: 218
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
            line: 285
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 285
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 285
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
            line: 218
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
            line: 479
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 479
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
            line: 218
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
            line: 487
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
            line: 218
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
            line: 495
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
            line: 218
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
            line: 502
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
            line: 515
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 515
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
            line: 218
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
            line: 515
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 515
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 515
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 515
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
            line: 547
          },
          kind: "string"
        }
      }, {
        name: "revision",
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
            kind: "string"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 547
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
            line: 557
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 557
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
            line: 561
          },
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 561
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 561
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
            line: 218
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
            line: 568
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
            line: 218
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
            line: 575
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 575
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
            line: 218
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
            line: 595
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
            line: 218
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
            line: 602
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
            line: 616
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
            line: 617
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 618
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
            line: 622
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 622
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
            line: 218
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
            line: 632
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 632
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
            line: 218
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
            line: 642
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 642
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
            line: 218
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
            line: 649
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
            line: 663
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
            line: 218
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
            line: 663
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 663
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 663
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
            line: 709
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 709
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 709
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
            line: 730
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 730
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 730
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
            line: 753
          },
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 753
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 753
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
            line: 814
          },
          kind: "string"
        }
      }, {
        name: "isInteractive",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 815
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 815
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
            line: 218
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
            line: 816
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
            line: 829
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 829
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
            line: 830
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
            line: 831
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 831
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
            line: 218
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
            line: 832
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
            line: 218
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
            line: 849
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
            line: 869
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 869
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
            line: 869
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 869
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
            line: 218
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
            line: 869
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
            line: 905
          },
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 906
          },
          kind: "boolean"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 907
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 907
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
            line: 218
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
            line: 908
          },
          kind: "void"
        });
      });
    }

    show(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 916
          },
          kind: "number"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 916
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
            line: 218
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
            line: 931
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
            line: 218
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
            line: 938
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
            line: 945
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 218
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
            line: 945
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
            line: 218
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
            line: 953
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
            line: 975
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 975
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
            line: 976
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
            line: 977
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 977
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
            line: 218
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
            line: 978
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
            line: 1001
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1001
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
            line: 1001
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1001
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
            line: 218
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
            line: 1001
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
            line: 1022
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1022
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
            line: 218
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
            line: 1022
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
            line: 218
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
            line: 1026
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1026
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
            line: 218
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
            line: 1042
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1042
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
            line: 1062
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1062
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
            line: 1062
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1062
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
            line: 218
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
            line: 1062
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
            line: 1083
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1083
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
            line: 218
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
            line: 1083
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1083
            },
            kind: "named",
            name: "MergeConflict"
          }
        });
      });
    }

    resolveConflictedFile(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1136
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
            line: 218
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "resolveConflictedFile", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1136
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
            line: 218
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
            line: 1146
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
            line: 218
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
            line: 1156
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
            line: 1161
          },
          kind: "string"
        }
      }, {
        name: "source",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1162
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1162
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
            line: 218
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
            line: 1163
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
            line: 1179
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1179
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
            line: 218
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
            line: 1179
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
            line: 1197
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1197
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
            line: 1198
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
            line: 1199
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1199
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
            line: 218
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
            line: 1200
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
        line: 86
      },
      name: "StatusCodeIdValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 86
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 86
          },
          kind: "string-literal",
          value: "A"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 86
          },
          kind: "string-literal",
          value: "C"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 86
          },
          kind: "string-literal",
          value: "I"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 86
          },
          kind: "string-literal",
          value: "M"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 86
          },
          kind: "string-literal",
          value: "!"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 86
          },
          kind: "string-literal",
          value: "R"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 86
          },
          kind: "string-literal",
          value: "?"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 86
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
        line: 88
      },
      name: "MergeConflictStatusValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 89
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 89
          },
          kind: "string-literal",
          value: "both changed"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 90
          },
          kind: "string-literal",
          value: "deleted in theirs"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 91
          },
          kind: "string-literal",
          value: "deleted in ours"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
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
        line: 94
      },
      name: "MergeConflictStatusCodeId",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 94
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 94
          },
          kind: "string-literal",
          value: "R"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 94
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
        line: 104
      },
      name: "StatusCodeNumberValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 104
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 104
          },
          kind: "number-literal",
          value: 1
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 104
          },
          kind: "number-literal",
          value: 2
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 104
          },
          kind: "number-literal",
          value: 3
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 104
          },
          kind: "number-literal",
          value: 4
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 104
          },
          kind: "number-literal",
          value: 5
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 104
          },
          kind: "number-literal",
          value: 6
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 104
          },
          kind: "number-literal",
          value: 7
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 104
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
        line: 106
      },
      name: "LineDiff",
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
          name: "oldStart",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 107
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 108
          },
          name: "oldLines",
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
          name: "newStart",
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
          name: "newLines",
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
    },
    BookmarkInfo: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 113
      },
      name: "BookmarkInfo",
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
          name: "active",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 114
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 115
          },
          name: "bookmark",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 115
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 116
          },
          name: "node",
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
          name: "rev",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 117
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
        line: 120
      },
      name: "DiffInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 120
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 121
          },
          name: "added",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 121
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 122
          },
          name: "deleted",
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
          name: "lineDiffs",
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
        line: 126
      },
      name: "CommitPhaseType",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 126
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 126
          },
          kind: "string-literal",
          value: "public"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 126
          },
          kind: "string-literal",
          value: "draft"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 126
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
        line: 128
      },
      name: "RevisionInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 128
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 129
          },
          name: "author",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 129
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 130
          },
          name: "bookmarks",
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
          name: "branch",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 131
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 132
          },
          name: "date",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 132
            },
            kind: "named",
            name: "Date"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 133
          },
          name: "description",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 133
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 134
          },
          name: "hash",
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
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 135
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 136
          },
          name: "isHead",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 136
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 137
          },
          name: "remoteBookmarks",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 137
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 137
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 138
          },
          name: "parents",
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
          name: "phase",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 139
            },
            kind: "named",
            name: "CommitPhaseType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 140
          },
          name: "tags",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 140
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 140
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 141
          },
          name: "title",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 141
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
        line: 144
      },
      name: "RevisionShowInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 144
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 145
          },
          name: "diff",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 145
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
        line: 148
      },
      name: "AsyncExecuteRet",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 148
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 149
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 149
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 150
          },
          name: "errorMessage",
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
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 151
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 152
          },
          name: "stderr",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 152
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 153
          },
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 153
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
        line: 156
      },
      name: "RevisionFileCopy",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 156
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 157
          },
          name: "from",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 157
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 158
          },
          name: "to",
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
        }]
      }
    },
    RevisionFileChanges: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 161
      },
      name: "RevisionFileChanges",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 161
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 162
          },
          name: "all",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 162
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 162
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
            line: 163
          },
          name: "added",
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
          name: "deleted",
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
          name: "copied",
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
              name: "RevisionFileCopy"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 166
          },
          name: "modified",
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
        line: 169
      },
      name: "VcsLogEntry",
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
          name: "node",
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
          name: "user",
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
          name: "desc",
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
          name: "date",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 173
            },
            kind: "tuple",
            types: [{
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 173
              },
              kind: "number"
            }, {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 173
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
        line: 176
      },
      name: "VcsLogResponse",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 176
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 177
          },
          name: "entries",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 177
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 177
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
        line: 180
      },
      name: "MergeConflict",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 180
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 181
          },
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 181
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 182
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 182
            },
            kind: "named",
            name: "MergeConflictStatusValue"
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
        line: 185
      },
      name: "CheckoutSideName",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 185
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 185
          },
          kind: "string-literal",
          value: "ours"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 185
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
        line: 187
      },
      name: "AmendModeValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 187
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 187
          },
          kind: "string-literal",
          value: "Clean"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 187
          },
          kind: "string-literal",
          value: "Rebase"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 187
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
        line: 189
      },
      name: "CheckoutOptions",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 189
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 190
          },
          name: "clean",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 190
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
        line: 218
      },
      constructorArgs: [{
        name: "workingDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 234
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
            line: 252
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 252
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 252
              },
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 256
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 256
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 256
              },
              kind: "void"
            }
          }
        },
        fetchStatuses: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 285
          },
          kind: "function",
          argumentTypes: [{
            name: "toRevision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 285
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 285
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 285
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 285
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 285
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 285
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
            line: 479
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 479
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 479
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 479
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
            line: 487
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 487
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 487
              },
              kind: "void"
            }
          }
        },
        observeHgRepoStateDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 495
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 495
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 495
              },
              kind: "void"
            }
          }
        },
        observeHgConflictStateDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 502
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 502
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 502
              },
              kind: "boolean"
            }
          }
        },
        fetchDiffInfo: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 515
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 515
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 515
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
              line: 515
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 515
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 515
                },
                kind: "map",
                keyType: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 515
                  },
                  kind: "named",
                  name: "NuclideUri"
                },
                valueType: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 515
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
            line: 547
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 547
              },
              kind: "string"
            }
          }, {
            name: "revision",
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
                kind: "string"
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
              kind: "void"
            }
          }
        },
        deleteBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 557
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 557
              },
              kind: "string"
            }
          }],
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
              kind: "void"
            }
          }
        },
        renameBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 561
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 561
              },
              kind: "string"
            }
          }, {
            name: "nextName",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 561
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 561
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 561
              },
              kind: "void"
            }
          }
        },
        fetchActiveBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 568
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 568
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 568
              },
              kind: "string"
            }
          }
        },
        fetchBookmarks: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 575
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 575
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 575
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 575
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
            line: 595
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 595
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 595
              },
              kind: "void"
            }
          }
        },
        observeBookmarksDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 602
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 602
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 602
              },
              kind: "void"
            }
          }
        },
        fetchFileContentAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 615
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 616
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
                line: 617
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 618
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 618
              },
              kind: "string"
            }
          }
        },
        fetchFilesChangedAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 622
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 622
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 622
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 622
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
            line: 632
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 632
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 632
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 632
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
            line: 642
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 642
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 642
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 642
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
            line: 649
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 649
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 649
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
            line: 663
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 663
              },
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 663
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 663
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 663
                },
                kind: "nullable",
                type: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 663
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
            line: 709
          },
          kind: "function",
          argumentTypes: [{
            name: "key",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 709
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 709
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 709
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 709
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
            line: 730
          },
          kind: "function",
          argumentTypes: [{
            name: "changeSetId",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 730
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 730
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 730
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 730
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
            line: 753
          },
          kind: "function",
          argumentTypes: [{
            name: "ttyOutput",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 753
              },
              kind: "boolean"
            }
          }, {
            name: "concise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 753
              },
              kind: "boolean"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 753
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 753
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
            line: 813
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 814
              },
              kind: "string"
            }
          }, {
            name: "isInteractive",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 815
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 815
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 816
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 816
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
            line: 828
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 829
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 829
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
                line: 830
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
                line: 831
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 831
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 832
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 832
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
            line: 849
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 849
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 849
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
            line: 869
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 869
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 869
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
                line: 869
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 869
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 869
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 869
              },
              kind: "void"
            }
          }
        },
        checkout: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 904
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 905
              },
              kind: "string"
            }
          }, {
            name: "create",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 906
              },
              kind: "boolean"
            }
          }, {
            name: "options",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 907
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 907
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
              line: 908
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 908
              },
              kind: "void"
            }
          }
        },
        show: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 916
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 916
              },
              kind: "number"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 916
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 916
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
            line: 931
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 931
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 931
              },
              kind: "void"
            }
          }
        },
        uncommit: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 938
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 938
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 938
              },
              kind: "void"
            }
          }
        },
        strip: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 945
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 945
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 945
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 945
              },
              kind: "void"
            }
          }
        },
        checkoutForkBase: {
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
              kind: "void"
            }
          }
        },
        rename: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 974
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 975
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 975
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
                line: 976
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
                line: 977
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 977
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 978
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 978
              },
              kind: "void"
            }
          }
        },
        remove: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1001
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1001
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1001
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
                line: 1001
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1001
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1001
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1001
              },
              kind: "void"
            }
          }
        },
        add: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1022
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1022
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1022
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
              line: 1022
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1022
              },
              kind: "void"
            }
          }
        },
        getTemplateCommitMessage: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1026
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1026
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1026
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1026
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
            line: 1042
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1042
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1042
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1042
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
            line: 1062
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1062
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1062
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
                line: 1062
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1062
                },
                kind: "number"
              }
            }
          }],
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
              kind: "named",
              name: "VcsLogResponse"
            }
          }
        },
        fetchMergeConflicts: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1083
          },
          kind: "function",
          argumentTypes: [{
            name: "fetchResolved",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1083
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1083
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1083
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1083
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1083
                },
                kind: "named",
                name: "MergeConflict"
              }
            }
          }
        },
        resolveConflictedFile: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1136
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1136
              },
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1136
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1136
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
            line: 1146
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1146
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1146
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
            line: 1156
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1156
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1156
              },
              kind: "void"
            }
          }
        },
        rebase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1160
          },
          kind: "function",
          argumentTypes: [{
            name: "destination",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1161
              },
              kind: "string"
            }
          }, {
            name: "source",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1162
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1162
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1163
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1163
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
            line: 1179
          },
          kind: "function",
          argumentTypes: [{
            name: "options",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1179
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1179
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1179
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1179
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
            line: 1196
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1197
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1197
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
                line: 1198
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
                line: 1199
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1199
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1200
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1200
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
        }]
      }
    },
    ProcessMessage: {
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
    },
    ProcessInfo: {
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
    }
  }
});