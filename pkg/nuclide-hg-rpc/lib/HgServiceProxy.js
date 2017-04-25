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
            line: 245
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
            line: 229
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
            line: 263
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
            line: 299
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 299
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
            line: 229
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
            line: 299
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 299
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 299
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
            line: 229
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
            line: 327
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 327
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 327
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
            line: 229
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
            line: 344
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 344
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 344
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
            line: 229
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
            line: 518
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 518
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
            line: 229
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
            line: 526
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
            line: 229
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
            line: 538
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
            line: 229
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
            line: 545
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
            line: 558
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 558
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
            line: 229
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
            line: 558
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 558
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 558
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 558
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
            line: 590
          },
          kind: "string"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 590
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 590
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
            line: 229
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
            line: 590
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
            line: 600
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 600
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
            line: 604
          },
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 604
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 604
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
            line: 229
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
            line: 611
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
            line: 229
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
            line: 618
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 618
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
            line: 229
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
            line: 638
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
            line: 229
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
            line: 645
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
            line: 659
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
            line: 660
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 661
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
            line: 665
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 665
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
            line: 229
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
            line: 675
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 675
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
            line: 229
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
            line: 685
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 685
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
            line: 229
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
            line: 692
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
            line: 706
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
            line: 229
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
            line: 706
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 706
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 706
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
            line: 752
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 752
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 752
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
            line: 773
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 773
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 773
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
            line: 796
          },
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 796
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 796
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
            line: 844
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 845
          },
          kind: "named",
          name: "LegacyProcessMessage"
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
            line: 858
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 858
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
            line: 859
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
            line: 229
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
            line: 860
          },
          kind: "named",
          name: "LegacyProcessMessage"
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
            line: 229
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
            line: 877
          },
          kind: "named",
          name: "LegacyProcessMessage"
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
            line: 897
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 897
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
            line: 897
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 897
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
            line: 229
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
            line: 897
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
            line: 933
          },
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 934
          },
          kind: "boolean"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 935
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 935
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
            line: 229
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
            line: 936
          },
          kind: "named",
          name: "LegacyProcessMessage"
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
            line: 950
          },
          kind: "number"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 950
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
            line: 229
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
            line: 965
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
            line: 229
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
            line: 972
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
            line: 979
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 979
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
            line: 229
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
            line: 987
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
            line: 1009
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1009
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
            line: 1010
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
            line: 1011
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1011
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
            line: 229
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
            line: 1012
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
            line: 1035
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1035
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
            line: 1035
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1035
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
            line: 229
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
            line: 1035
          },
          kind: "void"
        });
      });
    }

    forget(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1057
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1057
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
            line: 229
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "forget", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1057
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
            line: 1070
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1070
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
            line: 229
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
            line: 1070
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
            line: 229
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
            line: 1074
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1074
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
            line: 229
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
            line: 1089
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1089
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
            line: 1109
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1109
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
            line: 1109
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1109
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
            line: 229
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
            line: 1109
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
            line: 1130
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1130
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
            line: 229
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
            line: 1130
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1130
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
            line: 1184
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
            line: 1185
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
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
            line: 1186
          },
          kind: "named",
          name: "LegacyProcessMessage"
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
            line: 229
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
            line: 1198
          },
          kind: "named",
          name: "LegacyProcessMessage"
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
            line: 229
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
            line: 1209
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
            line: 1214
          },
          kind: "string"
        }
      }, {
        name: "source",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1215
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1215
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
            line: 229
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
            line: 1216
          },
          kind: "named",
          name: "LegacyProcessMessage"
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
            line: 1234
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1234
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
            line: 229
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
            line: 1234
          },
          kind: "named",
          name: "LegacyProcessMessage"
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
            line: 1252
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1252
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
            line: 1253
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
            line: 1254
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1254
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
            line: 229
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
            line: 1255
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
    SuccessorTypeValue: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 129
      },
      name: "SuccessorTypeValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 129
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 129
          },
          kind: "string-literal",
          value: "public"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 129
          },
          kind: "string-literal",
          value: "amend"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 129
          },
          kind: "string-literal",
          value: "rebase"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 129
          },
          kind: "string-literal",
          value: "split"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 129
          },
          kind: "string-literal",
          value: "fold"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 129
          },
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
        line: 131
      },
      name: "RevisionSuccessorInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 131
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 132
          },
          name: "hash",
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
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 133
            },
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
        line: 136
      },
      name: "RevisionInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 136
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 137
          },
          name: "author",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 137
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 138
          },
          name: "bookmarks",
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
          name: "branch",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 139
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 140
          },
          name: "date",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 140
            },
            kind: "named",
            name: "Date"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 141
          },
          name: "description",
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
          name: "hash",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 142
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 143
          },
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 143
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 144
          },
          name: "isHead",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 144
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 145
          },
          name: "remoteBookmarks",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 145
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 145
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 146
          },
          name: "parents",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 146
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 146
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 147
          },
          name: "phase",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 147
            },
            kind: "named",
            name: "CommitPhaseType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 148
          },
          name: "successorInfo",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 148
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 148
              },
              kind: "named",
              name: "RevisionSuccessorInfo"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 149
          },
          name: "tags",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 149
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 149
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 150
          },
          name: "title",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 150
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
        line: 153
      },
      name: "RevisionShowInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 153
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 154
          },
          name: "diff",
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
    AsyncExecuteRet: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 157
      },
      name: "AsyncExecuteRet",
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
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 158
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 159
          },
          name: "errorMessage",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 159
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 160
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 160
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 161
          },
          name: "stderr",
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
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 162
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
        line: 165
      },
      name: "RevisionFileCopy",
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
          name: "from",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 166
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 167
          },
          name: "to",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 167
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
        line: 170
      },
      name: "RevisionFileChanges",
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
          name: "all",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 171
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 171
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
            line: 172
          },
          name: "added",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 172
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 172
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
            line: 173
          },
          name: "deleted",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 173
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 173
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
            line: 174
          },
          name: "copied",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 174
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 174
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
            line: 175
          },
          name: "modified",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 175
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 175
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
        line: 178
      },
      name: "VcsLogEntry",
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
          name: "node",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 179
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 180
          },
          name: "user",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 180
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 181
          },
          name: "desc",
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
          name: "date",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 182
            },
            kind: "tuple",
            types: [{
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 182
              },
              kind: "number"
            }, {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 182
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
        line: 185
      },
      name: "VcsLogResponse",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 185
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 186
          },
          name: "entries",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 186
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 186
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
        line: 189
      },
      name: "MergeConflict",
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
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 190
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 191
          },
          name: "status",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 191
            },
            kind: "named",
            name: "MergeConflictStatusValue"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 192
          },
          name: "mergeConflictsCount",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 192
            },
            kind: "number"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 193
          },
          name: "resolvedConflictsCount",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 193
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
        line: 196
      },
      name: "CheckoutSideName",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 196
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 196
          },
          kind: "string-literal",
          value: "ours"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 196
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
        line: 198
      },
      name: "AmendModeValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 198
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 198
          },
          kind: "string-literal",
          value: "Clean"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 198
          },
          kind: "string-literal",
          value: "Rebase"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 198
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
        line: 200
      },
      name: "CheckoutOptions",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 200
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 201
          },
          name: "clean",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 201
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
        line: 229
      },
      constructorArgs: [{
        name: "workingDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 245
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
            line: 263
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 263
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 263
              },
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 267
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 267
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 267
              },
              kind: "void"
            }
          }
        },
        fetchStatuses: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 299
          },
          kind: "function",
          argumentTypes: [{
            name: "toRevision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 299
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 299
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 299
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 299
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 299
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 299
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
            line: 327
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 327
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 327
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 327
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 327
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
            line: 344
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 344
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 344
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 344
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 344
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
            line: 518
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 518
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 518
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 518
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
            line: 526
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 526
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 526
              },
              kind: "void"
            }
          }
        },
        observeHgRepoStateDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 538
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 538
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 538
              },
              kind: "void"
            }
          }
        },
        observeHgConflictStateDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 545
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 545
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 545
              },
              kind: "boolean"
            }
          }
        },
        fetchDiffInfo: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 558
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 558
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 558
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
              line: 558
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 558
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 558
                },
                kind: "map",
                keyType: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 558
                  },
                  kind: "named",
                  name: "NuclideUri"
                },
                valueType: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 558
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
            line: 590
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 590
              },
              kind: "string"
            }
          }, {
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 590
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 590
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 590
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 590
              },
              kind: "void"
            }
          }
        },
        deleteBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 600
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 600
              },
              kind: "string"
            }
          }],
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
              kind: "void"
            }
          }
        },
        renameBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 604
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 604
              },
              kind: "string"
            }
          }, {
            name: "nextName",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 604
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 604
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 604
              },
              kind: "void"
            }
          }
        },
        fetchActiveBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 611
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 611
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 611
              },
              kind: "string"
            }
          }
        },
        fetchBookmarks: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 618
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 618
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 618
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 618
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
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 638
              },
              kind: "void"
            }
          }
        },
        observeBookmarksDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 645
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 645
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 645
              },
              kind: "void"
            }
          }
        },
        fetchFileContentAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 658
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 659
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
                line: 660
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 661
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 661
              },
              kind: "string"
            }
          }
        },
        fetchFilesChangedAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 665
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 665
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 665
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 665
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
            line: 675
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 675
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 675
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 675
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
            line: 685
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 685
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 685
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 685
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
            line: 692
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 692
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 692
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
            line: 706
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 706
              },
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 706
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 706
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 706
                },
                kind: "nullable",
                type: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 706
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
            line: 752
          },
          kind: "function",
          argumentTypes: [{
            name: "key",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 752
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 752
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 752
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 752
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
            line: 773
          },
          kind: "function",
          argumentTypes: [{
            name: "changeSetId",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 773
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 773
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 773
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 773
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
            line: 796
          },
          kind: "function",
          argumentTypes: [{
            name: "ttyOutput",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 796
              },
              kind: "boolean"
            }
          }, {
            name: "concise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 796
              },
              kind: "boolean"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 796
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 796
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
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 845
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 845
              },
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        amend: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 857
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 858
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 858
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
                line: 859
              },
              kind: "named",
              name: "AmendModeValue"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 860
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 860
              },
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        splitRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 877
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 877
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 877
              },
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        revert: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 897
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 897
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 897
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
                line: 897
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 897
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 897
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 897
              },
              kind: "void"
            }
          }
        },
        checkout: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 932
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 933
              },
              kind: "string"
            }
          }, {
            name: "create",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 934
              },
              kind: "boolean"
            }
          }, {
            name: "options",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 935
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 935
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
              line: 936
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 936
              },
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        show: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 950
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 950
              },
              kind: "number"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 950
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 950
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
            line: 965
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 965
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 965
              },
              kind: "void"
            }
          }
        },
        uncommit: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 972
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 972
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 972
              },
              kind: "void"
            }
          }
        },
        strip: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 979
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 979
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 979
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 979
              },
              kind: "void"
            }
          }
        },
        checkoutForkBase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 987
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 987
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 987
              },
              kind: "void"
            }
          }
        },
        rename: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1008
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1009
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1009
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
                line: 1010
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
                line: 1011
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1011
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1012
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1012
              },
              kind: "void"
            }
          }
        },
        remove: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1035
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1035
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1035
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
                line: 1035
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1035
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1035
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1035
              },
              kind: "void"
            }
          }
        },
        forget: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1057
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1057
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1057
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
              line: 1057
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1057
              },
              kind: "void"
            }
          }
        },
        add: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1070
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1070
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1070
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
              line: 1070
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1070
              },
              kind: "void"
            }
          }
        },
        getTemplateCommitMessage: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1074
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1074
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1074
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1074
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
            line: 1089
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1089
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1089
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1089
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
            line: 1109
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1109
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1109
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
                line: 1109
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1109
                },
                kind: "number"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1109
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1109
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
            line: 1130
          },
          kind: "function",
          argumentTypes: [{
            name: "fetchResolved",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1130
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1130
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1130
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1130
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1130
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
            line: 1183
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1184
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
                line: 1185
              },
              kind: "boolean"
            }
          }],
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
              name: "LegacyProcessMessage"
            }
          }
        },
        continueRebase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1198
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1198
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1198
              },
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        abortRebase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1209
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1209
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1209
              },
              kind: "void"
            }
          }
        },
        rebase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1213
          },
          kind: "function",
          argumentTypes: [{
            name: "destination",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1214
              },
              kind: "string"
            }
          }, {
            name: "source",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1215
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1215
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1216
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1216
              },
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        pull: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1234
          },
          kind: "function",
          argumentTypes: [{
            name: "options",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1234
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1234
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1234
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1234
              },
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        copy: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1251
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1252
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1252
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
                line: 1253
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
                line: 1254
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1254
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1255
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1255
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
            line: 25
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
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
        }],
        discriminantField: "kind"
      }
    },
    LegacyProcessMessage: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 33
      },
      name: "LegacyProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 33
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
            line: 25
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 26
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 26
              },
              kind: "string-literal",
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 27
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 27
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
            line: 33
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 33
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 33
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 33
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
        line: 35
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 35
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 36
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 37
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 37
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 38
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 38
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});