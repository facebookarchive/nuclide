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
            line: 285
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
            line: 269
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
            line: 300
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
            line: 345
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 345
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
            line: 269
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
            line: 346
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 346
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 346
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
            line: 269
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
            line: 375
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 375
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 375
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
            line: 269
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
            line: 394
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 394
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 394
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
            line: 269
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
            line: 592
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 592
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
            line: 269
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
            line: 600
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
            line: 269
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
            line: 614
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
            line: 269
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
            line: 621
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
            line: 635
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 635
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
            line: 269
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
            line: 636
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 636
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 636
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 636
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
            line: 671
          },
          kind: "string"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 671
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 671
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
            line: 269
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
            line: 671
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
            line: 681
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 681
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
            line: 685
          },
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 685
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 685
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
            line: 269
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
            line: 696
          },
          kind: "string"
        });
      });
    }

    fetchBookmarks() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchBookmarks", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 703
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 703
            },
            kind: "named",
            name: "BookmarkInfo"
          }
        });
      }).publish();
    }

    observeActiveBookmarkDidChange() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 717
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
            line: 269
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
            line: 724
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
            line: 738
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
            line: 739
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 740
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
            line: 749
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 750
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
            line: 269
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
            line: 760
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 760
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
            line: 269
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
            line: 770
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 770
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
            line: 269
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
            line: 777
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
            line: 791
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
            line: 269
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
            line: 791
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 791
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 791
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
            line: 841
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 841
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 841
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
            line: 863
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 864
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 864
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
            line: 898
          },
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 899
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 900
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
            line: 950
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 950
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
            line: 964
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 964
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
            line: 965
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
            line: 269
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
            line: 966
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
            line: 269
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
            line: 984
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
            name: "NuclideUri"
          }
        }
      }, {
        name: "toRevision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1006
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1006
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
            line: 269
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
            line: 1006
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
            line: 1042
          },
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1043
          },
          kind: "boolean"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1044
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1044
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
            line: 269
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
            line: 1045
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
            line: 1060
          },
          kind: "number"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 1060
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
            line: 269
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
            line: 1075
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
            line: 269
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
            line: 1082
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
            line: 1089
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 1089
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
            line: 269
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
            line: 1097
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
            line: 1119
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1119
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
            line: 1120
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
            line: 1121
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1121
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
            line: 269
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
            line: 1122
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
            line: 1145
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1145
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
            line: 1145
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1145
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
            line: 269
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
            line: 1145
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
            line: 1167
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1167
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
            line: 269
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
            line: 1167
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
            line: 1180
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1180
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
            line: 269
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
            line: 1180
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
            line: 269
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
            line: 1184
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1184
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
            line: 269
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
            line: 1199
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1199
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
            line: 1224
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1224
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
            line: 1225
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1225
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
            line: 269
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
            line: 1226
          },
          kind: "named",
          name: "VcsLogResponse"
        });
      });
    }

    fetchMergeConflictsWithDetails() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "fetchMergeConflictsWithDetails", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1244
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1244
            },
            kind: "named",
            name: "MergeConflictsEnriched"
          }
        });
      }).publish();
    }

    fetchMergeConflicts(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "fetchResolved",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1289
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1289
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
            line: 269
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
            line: 1290
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1290
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
            line: 1360
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
            line: 1361
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
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
            line: 1362
          },
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    continueOperation(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "command",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1376
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "continueOperation", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1377
          },
          kind: "named",
          name: "LegacyProcessMessage"
        });
      }).publish();
    }

    abortOperation(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "command",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1391
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 269
          },
          name: "HgService"
        }).then(id => {
          return _client.callRemoteMethod(id, "abortOperation", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1391
          },
          kind: "string"
        });
      }).publish();
    }

    rebase(arg0, arg1) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "destination",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1400
          },
          kind: "string"
        }
      }, {
        name: "source",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1401
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1401
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
            line: 269
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
            line: 1402
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
            line: 1419
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1419
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
            line: 269
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
            line: 1419
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
            line: 1435
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1435
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
            line: 1436
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
            line: 1437
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1437
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
            line: 269
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
            line: 1438
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
        line: 92
      },
      name: "StatusCodeIdValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 92
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
          },
          kind: "string-literal",
          value: "A"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
          },
          kind: "string-literal",
          value: "C"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
          },
          kind: "string-literal",
          value: "I"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
          },
          kind: "string-literal",
          value: "M"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
          },
          kind: "string-literal",
          value: "!"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
          },
          kind: "string-literal",
          value: "R"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
          },
          kind: "string-literal",
          value: "?"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 92
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
        line: 94
      },
      name: "MergeConflictStatusValue",
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
          value: "both changed"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 96
          },
          kind: "string-literal",
          value: "deleted in theirs"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 97
          },
          kind: "string-literal",
          value: "deleted in ours"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 98
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
        line: 100
      },
      name: "MergeConflictStatusCodeId",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 100
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 100
          },
          kind: "string-literal",
          value: "R"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 100
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
        line: 110
      },
      name: "StatusCodeNumberValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 110
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
          },
          kind: "number-literal",
          value: 1
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
          },
          kind: "number-literal",
          value: 2
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
          },
          kind: "number-literal",
          value: 3
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
          },
          kind: "number-literal",
          value: 4
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
          },
          kind: "number-literal",
          value: 5
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
          },
          kind: "number-literal",
          value: 6
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
          },
          kind: "number-literal",
          value: 7
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 110
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
        line: 112
      },
      name: "LineDiff",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 112
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 113
          },
          name: "oldStart",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 113
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 114
          },
          name: "oldLines",
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
          name: "newStart",
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
          name: "newLines",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 116
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
        line: 119
      },
      name: "BookmarkInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 119
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 120
          },
          name: "active",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 120
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 121
          },
          name: "bookmark",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 121
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 122
          },
          name: "node",
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
          name: "rev",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 123
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
        line: 126
      },
      name: "DiffInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 126
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 127
          },
          name: "added",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 127
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 128
          },
          name: "deleted",
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
          name: "lineDiffs",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 129
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 129
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
        line: 132
      },
      name: "CommitPhaseType",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 132
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 132
          },
          kind: "string-literal",
          value: "public"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 132
          },
          kind: "string-literal",
          value: "draft"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 132
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
        line: 134
      },
      name: "SuccessorTypeValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 135
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 135
          },
          kind: "string-literal",
          value: "public"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 136
          },
          kind: "string-literal",
          value: "amend"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 137
          },
          kind: "string-literal",
          value: "rebase"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 138
          },
          kind: "string-literal",
          value: "split"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 139
          },
          kind: "string-literal",
          value: "fold"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 140
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
        line: 142
      },
      name: "RevisionSuccessorInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 142
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 143
          },
          name: "hash",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 143
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 144
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 144
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
        line: 147
      },
      name: "RevisionInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 147
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 148
          },
          name: "author",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 148
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 149
          },
          name: "bookmarks",
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
          name: "branch",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 150
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 151
          },
          name: "date",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 151
            },
            kind: "named",
            name: "Date"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 152
          },
          name: "description",
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
          name: "hash",
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
          name: "id",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 154
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 155
          },
          name: "isHead",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 155
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 156
          },
          name: "remoteBookmarks",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 156
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 156
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 157
          },
          name: "parents",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 157
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 157
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 158
          },
          name: "phase",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 158
            },
            kind: "named",
            name: "CommitPhaseType"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 159
          },
          name: "successorInfo",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 159
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 159
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
            line: 160
          },
          name: "tags",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 160
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 160
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 161
          },
          name: "title",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 161
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
        line: 164
      },
      name: "RevisionShowInfo",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 164
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 165
          },
          name: "diff",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 165
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
        line: 168
      },
      name: "AsyncExecuteRet",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 168
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 169
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 169
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 170
          },
          name: "errorMessage",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 170
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 171
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 171
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 172
          },
          name: "stderr",
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
          name: "stdout",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 173
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
        line: 176
      },
      name: "RevisionFileCopy",
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
          name: "from",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 177
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 178
          },
          name: "to",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 178
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
        line: 181
      },
      name: "RevisionFileChanges",
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
          name: "all",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 182
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 182
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
            line: 183
          },
          name: "added",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 183
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 183
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
            line: 184
          },
          name: "deleted",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 184
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 184
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
            line: 185
          },
          name: "copied",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 185
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 185
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
            line: 186
          },
          name: "modified",
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
        line: 189
      },
      name: "VcsLogEntry",
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
          name: "node",
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
          name: "user",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 191
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 192
          },
          name: "desc",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 192
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 193
          },
          name: "date",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 193
            },
            kind: "tuple",
            types: [{
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 193
              },
              kind: "number"
            }, {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 193
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
        line: 196
      },
      name: "VcsLogResponse",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 196
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 197
          },
          name: "entries",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 197
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
        line: 200
      },
      name: "MergeConflict",
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
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 201
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 202
          },
          name: "status",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 202
            },
            kind: "named",
            name: "MergeConflictStatusValue"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 203
          },
          name: "mergeConflictsCount",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 203
            },
            kind: "number"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 204
          },
          name: "resolvedConflictsCount",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 204
            },
            kind: "number"
          },
          optional: true
        }]
      }
    },
    MergeConflictSideFileData: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 208
      },
      name: "MergeConflictSideFileData",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 208
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 209
          },
          name: "contents",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 209
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 210
          },
          name: "exists",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 210
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 211
          },
          name: "isexec",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 211
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 212
          },
          name: "issymlink",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 212
            },
            kind: "boolean"
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
        line: 216
      },
      name: "MergeConflictOutputFileData",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 216
        },
        kind: "intersection",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 216
          },
          kind: "named",
          name: "MergeConflictSideFileData"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 216
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 217
            },
            name: "path",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 217
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }]
        }],
        flattened: {
          kind: "object",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 216
          },
          fields: [{
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 209
            },
            name: "contents",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 209
              },
              kind: "string"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 210
            },
            name: "exists",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 210
              },
              kind: "boolean"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 211
            },
            name: "isexec",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 211
              },
              kind: "boolean"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 212
            },
            name: "issymlink",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 212
              },
              kind: "boolean"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 217
            },
            name: "path",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 217
              },
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
        line: 220
      },
      name: "MergeConflictFileData",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 220
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 221
          },
          name: "base",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 221
            },
            kind: "named",
            name: "MergeConflictSideFileData"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 222
          },
          name: "local",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 222
            },
            kind: "named",
            name: "MergeConflictSideFileData"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 223
          },
          name: "other",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 223
            },
            kind: "named",
            name: "MergeConflictSideFileData"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 224
          },
          name: "output",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 224
            },
            kind: "named",
            name: "MergeConflictOutputFileData"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 225
          },
          name: "status",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 225
            },
            kind: "named",
            name: "MergeConflictStatusValue"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 226
          },
          name: "conflictCount",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 226
            },
            kind: "number"
          },
          optional: true
        }]
      }
    },
    MergeConflictsEnriched: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 229
      },
      name: "MergeConflictsEnriched",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 229
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 230
          },
          name: "conflicts",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 230
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 230
              },
              kind: "named",
              name: "MergeConflictFileData"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 231
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 231
            },
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
        line: 234
      },
      name: "CheckoutSideName",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 234
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 234
          },
          kind: "string-literal",
          value: "ours"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 234
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
        line: 236
      },
      name: "AmendModeValue",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 236
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 236
          },
          kind: "string-literal",
          value: "Clean"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 236
          },
          kind: "string-literal",
          value: "Rebase"
        }, {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 236
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
        line: 238
      },
      name: "CheckoutOptions",
      definition: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 238
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 239
          },
          name: "clean",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 239
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
        line: 269
      },
      constructorArgs: [{
        name: "workingDirectory",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 285
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
            line: 300
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 300
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 300
              },
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 304
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 304
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 304
              },
              kind: "void"
            }
          }
        },
        fetchStatuses: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 344
          },
          kind: "function",
          argumentTypes: [{
            name: "toRevision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 345
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 345
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 346
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 346
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 346
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 346
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
            line: 374
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 374
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 375
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 375
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 375
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
            line: 393
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 393
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 394
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 394
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 394
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
            line: 592
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 592
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 592
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 592
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
            kind: "observable",
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
        observeHgRepoStateDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 614
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 614
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 614
              },
              kind: "void"
            }
          }
        },
        observeHgConflictStateDidChange: {
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
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 621
              },
              kind: "boolean"
            }
          }
        },
        fetchDiffInfo: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 634
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 635
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 635
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
              line: 636
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 636
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 636
                },
                kind: "map",
                keyType: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 636
                  },
                  kind: "named",
                  name: "NuclideUri"
                },
                valueType: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 636
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
            line: 671
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 671
              },
              kind: "string"
            }
          }, {
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 671
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 671
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 671
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 671
              },
              kind: "void"
            }
          }
        },
        deleteBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 681
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 681
              },
              kind: "string"
            }
          }],
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
              kind: "void"
            }
          }
        },
        renameBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 685
          },
          kind: "function",
          argumentTypes: [{
            name: "name",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 685
              },
              kind: "string"
            }
          }, {
            name: "nextName",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 685
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 685
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 685
              },
              kind: "void"
            }
          }
        },
        fetchActiveBookmark: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 696
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 696
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 696
              },
              kind: "string"
            }
          }
        },
        fetchBookmarks: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 703
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 703
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 703
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 703
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
            line: 717
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 717
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 717
              },
              kind: "void"
            }
          }
        },
        observeBookmarksDidChange: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 724
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 724
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 724
              },
              kind: "void"
            }
          }
        },
        fetchFileContentAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 737
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 738
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
                line: 739
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 740
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 740
              },
              kind: "string"
            }
          }
        },
        fetchFilesChangedAtRevision: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 748
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 749
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 750
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 750
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
            line: 760
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 760
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 760
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 760
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
            line: 770
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 770
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 770
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 770
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
            line: 777
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 777
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 777
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
            line: 791
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 791
              },
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 791
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 791
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 791
                },
                kind: "nullable",
                type: {
                  location: {
                    type: "source",
                    fileName: "HgService.js",
                    line: 791
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
            line: 841
          },
          kind: "function",
          argumentTypes: [{
            name: "key",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 841
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 841
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 841
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 841
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
            line: 862
          },
          kind: "function",
          argumentTypes: [{
            name: "changeSetId",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 863
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 864
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 864
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 864
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
            line: 897
          },
          kind: "function",
          argumentTypes: [{
            name: "ttyOutput",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 898
              },
              kind: "boolean"
            }
          }, {
            name: "concise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 899
              },
              kind: "boolean"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 900
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 900
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
            line: 950
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 950
              },
              kind: "string"
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
              name: "LegacyProcessMessage"
            }
          }
        },
        amend: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 963
          },
          kind: "function",
          argumentTypes: [{
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 964
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 964
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
                line: 965
              },
              kind: "named",
              name: "AmendModeValue"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 966
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 966
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
            line: 984
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 984
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 984
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
            line: 1006
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
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
                name: "NuclideUri"
              }
            }
          }, {
            name: "toRevision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1006
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1006
                },
                kind: "string"
              }
            }
          }],
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
              kind: "void"
            }
          }
        },
        checkout: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1041
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1042
              },
              kind: "string"
            }
          }, {
            name: "create",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1043
              },
              kind: "boolean"
            }
          }, {
            name: "options",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1044
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1044
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
              line: 1045
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1045
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
            line: 1060
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1060
              },
              kind: "number"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1060
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1060
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
            line: 1075
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1075
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1075
              },
              kind: "void"
            }
          }
        },
        uncommit: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1082
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1082
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1082
              },
              kind: "void"
            }
          }
        },
        strip: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1089
          },
          kind: "function",
          argumentTypes: [{
            name: "revision",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1089
              },
              kind: "string"
            }
          }],
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
              kind: "void"
            }
          }
        },
        checkoutForkBase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1097
          },
          kind: "function",
          argumentTypes: [],
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
              kind: "void"
            }
          }
        },
        rename: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1118
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1119
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1119
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
                line: 1120
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
                line: 1121
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1121
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1122
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1122
              },
              kind: "void"
            }
          }
        },
        remove: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1145
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1145
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1145
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
                line: 1145
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1145
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1145
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1145
              },
              kind: "void"
            }
          }
        },
        forget: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1167
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1167
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1167
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
              line: 1167
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1167
              },
              kind: "void"
            }
          }
        },
        add: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1180
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1180
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1180
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
              line: 1180
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1180
              },
              kind: "void"
            }
          }
        },
        getTemplateCommitMessage: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1184
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1184
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1184
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1184
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
            line: 1199
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1199
            },
            kind: "promise",
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
                kind: "string"
              }
            }
          }
        },
        log: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1223
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1224
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1224
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
                line: 1225
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1225
                },
                kind: "number"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1226
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1226
              },
              kind: "named",
              name: "VcsLogResponse"
            }
          }
        },
        fetchMergeConflictsWithDetails: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1243
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1243
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1244
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1244
                },
                kind: "named",
                name: "MergeConflictsEnriched"
              }
            }
          }
        },
        fetchMergeConflicts: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1288
          },
          kind: "function",
          argumentTypes: [{
            name: "fetchResolved",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1289
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1289
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1290
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1290
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1290
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
            line: 1359
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1360
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
                line: 1361
              },
              kind: "boolean"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1362
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1362
              },
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        continueOperation: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1375
          },
          kind: "function",
          argumentTypes: [{
            name: "command",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1376
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1377
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1377
              },
              kind: "named",
              name: "LegacyProcessMessage"
            }
          }
        },
        abortOperation: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1391
          },
          kind: "function",
          argumentTypes: [{
            name: "command",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1391
              },
              kind: "string"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1391
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1391
              },
              kind: "string"
            }
          }
        },
        rebase: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1399
          },
          kind: "function",
          argumentTypes: [{
            name: "destination",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1400
              },
              kind: "string"
            }
          }, {
            name: "source",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1401
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1401
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1402
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1402
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
            line: 1419
          },
          kind: "function",
          argumentTypes: [{
            name: "options",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1419
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1419
                },
                kind: "string"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1419
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1419
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
            line: 1434
          },
          kind: "function",
          argumentTypes: [{
            name: "filePaths",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1435
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1435
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
                line: 1436
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
                line: 1437
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 1437
                },
                kind: "boolean"
              }
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1438
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1438
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
        line: 14
      },
      name: "ProcessExitMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 14
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 15
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "exitCode",
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
              kind: "number"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 17
          },
          name: "signal",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
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
        line: 21
      },
      name: "ProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 22
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string"
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
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "exitCode",
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
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 17
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
        line: 34
      },
      name: "LegacyProcessMessage",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 35
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 22
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 23
              },
              kind: "string-literal",
              value: "stdout"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 24
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 24
              },
              kind: "string"
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
              value: "stderr"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 28
            },
            name: "data",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 28
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 15
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 15
              },
              kind: "string-literal",
              value: "exit"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            name: "exitCode",
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
                kind: "number"
              }
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 17
            },
            name: "signal",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 17
              },
              kind: "nullable",
              type: {
                location: {
                  type: "source",
                  fileName: "process-rpc-types.js",
                  line: 17
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
            line: 36
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            name: "kind",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 36
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 36
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "process-rpc-types.js",
                line: 36
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
        line: 38
      },
      name: "ProcessInfo",
      definition: {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 38
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 39
          },
          name: "parentPid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 39
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 40
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 40
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 41
          },
          name: "command",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 41
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});