"use strict";

let Observable, trackOperationTiming;

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
            line: 216
          },
          kind: "string"
        }
      }])
    }
    waitForWatchmanSubscriptions() {
      return trackOperationTiming("HgService.waitForWatchmanSubscriptions", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 237
            },
            kind: "void"
          });
        });
      });
    }
    fetchStatuses(arg0, arg1) {
      return trackOperationTiming("HgService.fetchStatuses", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 271
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 271
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 272
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 272
              },
              kind: "any"
            }
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
            },
            name: "HgService"
          }).then(id => {
            return _client.callRemoteMethod(id, "fetchStatuses", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 273
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 273
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 273
              },
              kind: "named",
              name: "StatusCodeIdValue"
            }
          });
        });
      });
    }
    observeFilesDidChange() {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), []).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 197
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
            line: 466
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 466
            },
            kind: "named",
            name: "NuclideUri"
          }
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
            line: 197
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
            line: 474
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
            line: 197
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
            line: 481
          },
          kind: "boolean"
        });
      }).publish();
    }
    fetchDiffInfo(arg0) {
      return trackOperationTiming("HgService.fetchDiffInfo", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 494
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 494
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
              line: 197
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
              line: 494
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 494
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 494
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 494
                },
                kind: "named",
                name: "DiffInfo"
              }
            }
          });
        });
      });
    }
    createBookmark(arg0, arg1) {
      return trackOperationTiming("HgService.createBookmark", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 526
            },
            kind: "string"
          }
        }, {
          name: "revision",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 526
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 526
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
              line: 197
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
              line: 526
            },
            kind: "void"
          });
        });
      });
    }
    deleteBookmark(arg0) {
      return trackOperationTiming("HgService.deleteBookmark", () => {
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
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 536
            },
            kind: "void"
          });
        });
      });
    }
    renameBookmark(arg0, arg1) {
      return trackOperationTiming("HgService.renameBookmark", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 540
            },
            kind: "string"
          }
        }, {
          name: "nextName",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 540
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 540
            },
            kind: "void"
          });
        });
      });
    }
    fetchActiveBookmark() {
      return trackOperationTiming("HgService.fetchActiveBookmark", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 547
            },
            kind: "string"
          });
        });
      });
    }
    fetchBookmarks() {
      return trackOperationTiming("HgService.fetchBookmarks", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 554
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 554
              },
              kind: "named",
              name: "BookmarkInfo"
            }
          });
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
            line: 197
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
            line: 574
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
            line: 197
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
            line: 581
          },
          kind: "void"
        });
      }).publish();
    }
    fetchFileContentAtRevision(arg0, arg1) {
      return trackOperationTiming("HgService.fetchFileContentAtRevision", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 594
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
              line: 594
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 594
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
              line: 197
            },
            name: "HgService"
          }).then(id => {
            return _client.callRemoteMethod(id, "fetchFileContentAtRevision", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 594
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 594
              },
              kind: "string"
            }
          });
        });
      });
    }
    fetchFilesChangedAtRevision(arg0) {
      return trackOperationTiming("HgService.fetchFilesChangedAtRevision", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "revision",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 598
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
            },
            name: "HgService"
          }).then(id => {
            return _client.callRemoteMethod(id, "fetchFilesChangedAtRevision", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 598
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 598
              },
              kind: "named",
              name: "RevisionFileChanges"
            }
          });
        });
      });
    }
    fetchRevisionInfoBetweenHeadAndBase() {
      return trackOperationTiming("HgService.fetchRevisionInfoBetweenHeadAndBase", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 608
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 608
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 608
                },
                kind: "named",
                name: "RevisionInfo"
              }
            }
          });
        });
      });
    }
    getBaseRevision() {
      return trackOperationTiming("HgService.getBaseRevision", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 621
            },
            kind: "named",
            name: "RevisionInfo"
          });
        });
      });
    }
    getBlameAtHead(arg0) {
      return trackOperationTiming("HgService.getBlameAtHead", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 638
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
              line: 197
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
              line: 638
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 638
              },
              kind: "string"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 638
              },
              kind: "string"
            }
          });
        });
      });
    }
    getConfigValueAsync(arg0) {
      return trackOperationTiming("HgService.getConfigValueAsync", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "key",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 659
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 659
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 659
              },
              kind: "string"
            }
          });
        });
      });
    }
    getDifferentialRevisionForChangeSetId(arg0) {
      return trackOperationTiming("HgService.getDifferentialRevisionForChangeSetId", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "changeSetId",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 680
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 680
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 680
              },
              kind: "string"
            }
          });
        });
      });
    }
    getSmartlog(arg0, arg1) {
      return trackOperationTiming("HgService.getSmartlog", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "ttyOutput",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 703
            },
            kind: "boolean"
          }
        }, {
          name: "concise",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 703
            },
            kind: "boolean"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 703
            },
            kind: "named",
            name: "AsyncExecuteRet"
          });
        });
      });
    }
    commit(arg0) {
      return trackOperationTiming("HgService.commit", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 743
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
            },
            name: "HgService"
          }).then(id => {
            return _client.callRemoteMethod(id, "commit", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 743
            },
            kind: "void"
          });
        });
      });
    }
    amend(arg0) {
      return trackOperationTiming("HgService.amend", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 751
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 751
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
              line: 197
            },
            name: "HgService"
          }).then(id => {
            return _client.callRemoteMethod(id, "amend", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 751
            },
            kind: "void"
          });
        });
      });
    }
    revert(arg0) {
      return trackOperationTiming("HgService.revert", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 759
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 759
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
              line: 197
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
              line: 759
            },
            kind: "void"
          });
        });
      });
    }
    checkout(arg0, arg1) {
      return trackOperationTiming("HgService.checkout", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "revision",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 791
            },
            kind: "string"
          }
        }, {
          name: "create",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 791
            },
            kind: "boolean"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 791
            },
            kind: "void"
          });
        });
      });
    }
    rename(arg0, arg1, arg2) {
      return trackOperationTiming("HgService.rename", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 812
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 812
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
              line: 813
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
              line: 814
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 814
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
              line: 197
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
              line: 815
            },
            kind: "void"
          });
        });
      });
    }
    remove(arg0, arg1) {
      return trackOperationTiming("HgService.remove", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 838
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 838
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
              line: 838
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 838
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
              line: 197
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
              line: 838
            },
            kind: "void"
          });
        });
      });
    }
    add(arg0) {
      return trackOperationTiming("HgService.add", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 859
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 859
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
              line: 197
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
              line: 859
            },
            kind: "void"
          });
        });
      });
    }
    getTemplateCommitMessage() {
      return trackOperationTiming("HgService.getTemplateCommitMessage", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 867
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 867
              },
              kind: "string"
            }
          });
        });
      });
    }
    getHeadCommitMessage() {
      return trackOperationTiming("HgService.getHeadCommitMessage", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 903
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 903
              },
              kind: "string"
            }
          });
        });
      });
    }
    log(arg0, arg1) {
      return trackOperationTiming("HgService.log", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 923
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 923
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
              line: 923
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 923
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
              line: 197
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
              line: 923
            },
            kind: "named",
            name: "VcsLogResponse"
          });
        });
      });
    }
    fetchMergeConflicts() {
      return trackOperationTiming("HgService.fetchMergeConflicts", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 940
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 940
              },
              kind: "named",
              name: "MergeConflict"
            }
          });
        });
      });
    }
    resolveConflictedFile(arg0) {
      return trackOperationTiming("HgService.resolveConflictedFile", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 985
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
              line: 197
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
              line: 985
            },
            kind: "void"
          });
        });
      });
    }
    continueRebase() {
      return trackOperationTiming("HgService.continueRebase", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 989
            },
            kind: "void"
          });
        });
      });
    }
    abortRebase() {
      return trackOperationTiming("HgService.abortRebase", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 197
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
              line: 993
            },
            kind: "void"
          });
        });
      });
    }
    copy(arg0, arg1, arg2) {
      return trackOperationTiming("HgService.copy", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1003
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1003
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
              line: 1004
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
              line: 1005
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1005
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
              line: 197
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
              line: 1006
            },
            kind: "void"
          });
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
    trackOperationTiming = arguments[1];
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
  }], ["StatusCodeIdValue", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 82
    },
    name: "StatusCodeIdValue",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 82
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 82
        },
        kind: "string-literal",
        value: "A"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 82
        },
        kind: "string-literal",
        value: "C"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 82
        },
        kind: "string-literal",
        value: "I"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 82
        },
        kind: "string-literal",
        value: "M"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 82
        },
        kind: "string-literal",
        value: "!"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 82
        },
        kind: "string-literal",
        value: "R"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 82
        },
        kind: "string-literal",
        value: "?"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 82
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
      line: 84
    },
    name: "MergeConflictStatusValue",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 84
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 84
        },
        kind: "string-literal",
        value: "both changed"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 84
        },
        kind: "string-literal",
        value: "deleted in theirs"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 84
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
      line: 94
    },
    name: "StatusCodeNumberValue",
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
        kind: "number-literal",
        value: 1
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 94
        },
        kind: "number-literal",
        value: 2
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 94
        },
        kind: "number-literal",
        value: 3
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 94
        },
        kind: "number-literal",
        value: 4
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 94
        },
        kind: "number-literal",
        value: 5
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 94
        },
        kind: "number-literal",
        value: 6
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 94
        },
        kind: "number-literal",
        value: 7
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 94
        },
        kind: "number-literal",
        value: 8
      }]
    }
  }], ["HgStatusOptionValue", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 96
    },
    name: "HgStatusOptionValue",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 96
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 96
        },
        kind: "number-literal",
        value: 1
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 96
        },
        kind: "number-literal",
        value: 2
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 96
        },
        kind: "number-literal",
        value: 3
      }]
    }
  }], ["LineDiff", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 98
    },
    name: "LineDiff",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 98
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 99
        },
        name: "oldStart",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 99
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 100
        },
        name: "oldLines",
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
        name: "newStart",
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
        name: "newLines",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 102
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
      line: 105
    },
    name: "BookmarkInfo",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 105
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 106
        },
        name: "active",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 106
          },
          kind: "boolean"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 107
        },
        name: "bookmark",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 107
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 108
        },
        name: "node",
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
        name: "rev",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 109
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
      line: 112
    },
    name: "DiffInfo",
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
        name: "added",
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
        name: "deleted",
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
        name: "lineDiffs",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 115
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 115
            },
            kind: "named",
            name: "LineDiff"
          }
        },
        optional: false
      }]
    }
  }], ["RevisionInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 118
    },
    name: "RevisionInfo",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 118
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 119
        },
        name: "id",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 119
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 120
        },
        name: "hash",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 120
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 121
        },
        name: "title",
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
        name: "date",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 123
          },
          kind: "named",
          name: "Date"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 124
        },
        name: "description",
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
          line: 126
        },
        name: "bookmarks",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 126
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 126
            },
            kind: "string"
          }
        },
        optional: false
      }]
    }
  }], ["AsyncExecuteRet", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 129
    },
    name: "AsyncExecuteRet",
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
        name: "command",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 130
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 131
        },
        name: "errorMessage",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 131
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 132
        },
        name: "exitCode",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 132
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 133
        },
        name: "stderr",
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
        name: "stdout",
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
  }], ["RevisionFileCopy", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 137
    },
    name: "RevisionFileCopy",
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
        name: "from",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 138
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 139
        },
        name: "to",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 139
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
      line: 142
    },
    name: "RevisionFileChanges",
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
        name: "all",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 143
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 143
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
          line: 144
        },
        name: "added",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 144
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 144
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
          line: 145
        },
        name: "deleted",
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
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 146
        },
        name: "copied",
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
            kind: "named",
            name: "RevisionFileCopy"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 147
        },
        name: "modified",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 147
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 147
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }]
    }
  }], ["HgStatusCommandOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 150
    },
    name: "HgStatusCommandOptions",
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
        name: "hgStatusOption",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 151
          },
          kind: "named",
          name: "HgStatusOptionValue"
        },
        optional: false
      }]
    }
  }], ["VcsLogEntry", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 154
    },
    name: "VcsLogEntry",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 154
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 155
        },
        name: "node",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 155
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 156
        },
        name: "user",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 156
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 157
        },
        name: "desc",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 157
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 158
        },
        name: "date",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 158
          },
          kind: "tuple",
          types: [{
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 158
            },
            kind: "number"
          }, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 158
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
      line: 161
    },
    name: "VcsLogResponse",
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
        name: "entries",
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
      line: 165
    },
    name: "MergeConflict",
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
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 166
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 167
        },
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 167
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
      line: 170
    },
    name: "CheckoutSideName",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 170
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 170
        },
        kind: "string-literal",
        value: "ours"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 170
        },
        kind: "string-literal",
        value: "theirs"
      }]
    }
  }], ["HgService", {
    kind: "interface",
    name: "HgService",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 197
    },
    constructorArgs: [{
      name: "workingDirectory",
      type: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 216
        },
        kind: "string"
      }
    }],
    staticMethods: new Map(),
    instanceMethods: new Map([["waitForWatchmanSubscriptions", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 237
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 237
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 237
          },
          kind: "void"
        }
      }
    }], ["dispose", {
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
    }], ["fetchStatuses", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 270
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 271
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 271
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 272
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 272
            },
            kind: "any"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 273
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 273
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 273
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 273
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
        line: 466
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 466
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 466
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 466
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }], ["observeHgRepoStateDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 474
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 474
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 474
          },
          kind: "void"
        }
      }
    }], ["observeHgConflictStateDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 481
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 481
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 481
          },
          kind: "boolean"
        }
      }
    }], ["fetchDiffInfo", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 494
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 494
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 494
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
          line: 494
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 494
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 494
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 494
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 494
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
        line: 526
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 526
          },
          kind: "string"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 526
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 526
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 526
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 526
          },
          kind: "void"
        }
      }
    }], ["deleteBookmark", {
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
    }], ["renameBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 540
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 540
          },
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 540
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 540
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 540
          },
          kind: "void"
        }
      }
    }], ["fetchActiveBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 547
      },
      kind: "function",
      argumentTypes: [],
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
          kind: "string"
        }
      }
    }], ["fetchBookmarks", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 554
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 554
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 554
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 554
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
        line: 574
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 574
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 574
          },
          kind: "void"
        }
      }
    }], ["observeBookmarksDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 581
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 581
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 581
          },
          kind: "void"
        }
      }
    }], ["fetchFileContentAtRevision", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 594
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 594
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
            line: 594
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 594
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 594
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 594
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 594
            },
            kind: "string"
          }
        }
      }
    }], ["fetchFilesChangedAtRevision", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 598
      },
      kind: "function",
      argumentTypes: [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 598
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 598
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 598
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 598
            },
            kind: "named",
            name: "RevisionFileChanges"
          }
        }
      }
    }], ["fetchRevisionInfoBetweenHeadAndBase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 608
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 608
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 608
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 608
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 608
              },
              kind: "named",
              name: "RevisionInfo"
            }
          }
        }
      }
    }], ["getBaseRevision", {
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
          kind: "named",
          name: "RevisionInfo"
        }
      }
    }], ["getBlameAtHead", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 638
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 638
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
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
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 638
            },
            kind: "string"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 638
            },
            kind: "string"
          }
        }
      }
    }], ["getConfigValueAsync", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 659
      },
      kind: "function",
      argumentTypes: [{
        name: "key",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 659
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 659
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 659
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 659
            },
            kind: "string"
          }
        }
      }
    }], ["getDifferentialRevisionForChangeSetId", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 680
      },
      kind: "function",
      argumentTypes: [{
        name: "changeSetId",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 680
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 680
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 680
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 680
            },
            kind: "string"
          }
        }
      }
    }], ["getSmartlog", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 703
      },
      kind: "function",
      argumentTypes: [{
        name: "ttyOutput",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 703
          },
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 703
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 703
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 703
          },
          kind: "named",
          name: "AsyncExecuteRet"
        }
      }
    }], ["commit", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 743
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 743
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 743
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 743
          },
          kind: "void"
        }
      }
    }], ["amend", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 751
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 751
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 751
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 751
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 751
          },
          kind: "void"
        }
      }
    }], ["revert", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 759
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 759
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 759
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
          line: 759
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 759
          },
          kind: "void"
        }
      }
    }], ["checkout", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 791
      },
      kind: "function",
      argumentTypes: [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 791
          },
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 791
          },
          kind: "boolean"
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
          kind: "void"
        }
      }
    }], ["rename", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 811
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 812
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 812
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
            line: 813
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
            line: 814
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 814
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 815
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 815
          },
          kind: "void"
        }
      }
    }], ["remove", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 838
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 838
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 838
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
            line: 838
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 838
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 838
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 838
          },
          kind: "void"
        }
      }
    }], ["add", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 859
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 859
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 859
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
          line: 859
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 859
          },
          kind: "void"
        }
      }
    }], ["getTemplateCommitMessage", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 867
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 867
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 867
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 867
            },
            kind: "string"
          }
        }
      }
    }], ["getHeadCommitMessage", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 903
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 903
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 903
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 903
            },
            kind: "string"
          }
        }
      }
    }], ["log", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 923
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 923
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 923
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
            line: 923
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 923
            },
            kind: "number"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 923
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 923
          },
          kind: "named",
          name: "VcsLogResponse"
        }
      }
    }], ["fetchMergeConflicts", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 940
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 940
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 940
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 940
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
        line: 985
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 985
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 985
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 985
          },
          kind: "void"
        }
      }
    }], ["continueRebase", {
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
    }], ["abortRebase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 993
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 993
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 993
          },
          kind: "void"
        }
      }
    }], ["copy", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1002
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1003
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1003
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
            line: 1004
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
            line: 1005
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1005
            },
            kind: "boolean"
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
    }]])
  }]])
});