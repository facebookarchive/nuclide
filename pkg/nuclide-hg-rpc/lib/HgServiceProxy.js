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
            line: 212
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
              line: 198
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
              line: 229
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
              line: 259
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 259
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
              line: 260
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 260
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
              line: 198
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
              line: 261
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 261
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 261
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
            line: 198
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
            line: 443
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 443
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
            line: 198
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
            line: 451
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
            line: 198
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
            line: 458
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
              line: 471
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 471
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
              line: 198
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
              line: 471
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 471
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 471
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 471
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
              line: 503
            },
            kind: "string"
          }
        }, {
          name: "revision",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 503
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 503
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
              line: 198
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
              line: 503
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
              line: 513
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 198
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
              line: 513
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
              line: 517
            },
            kind: "string"
          }
        }, {
          name: "nextName",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 517
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 198
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
              line: 517
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
              line: 198
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
              line: 524
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
              line: 198
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
              line: 531
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 531
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
            line: 198
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
            line: 551
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
            line: 198
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
            line: 558
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
              line: 571
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
              line: 571
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 571
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
              line: 198
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
              line: 571
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 571
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
              line: 575
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 198
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
              line: 575
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 575
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
              line: 198
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
              line: 585
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 585
              },
              kind: "array",
              type: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 585
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
              line: 198
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
              line: 598
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
              line: 615
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
              line: 198
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
              line: 615
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 615
              },
              kind: "string"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 615
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
              line: 636
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 198
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
              line: 636
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 636
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
              line: 657
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 198
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
              line: 657
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 657
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
              line: 680
            },
            kind: "boolean"
          }
        }, {
          name: "concise",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 680
            },
            kind: "boolean"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 198
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
              line: 680
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
              line: 720
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 198
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
              line: 720
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
              line: 728
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 728
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
              line: 198
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
              line: 728
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
              line: 736
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 736
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
              line: 198
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
              line: 736
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
              line: 768
            },
            kind: "string"
          }
        }, {
          name: "create",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 768
            },
            kind: "boolean"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 198
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
              line: 768
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
              line: 789
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 789
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
              line: 790
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
              line: 791
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 791
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
              line: 198
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
              line: 792
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
              line: 815
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 815
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
              line: 198
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
              line: 815
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
              line: 836
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 836
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
              line: 198
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
              line: 836
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
              line: 198
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
              line: 844
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 844
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
              line: 198
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
              line: 880
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 880
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
              line: 900
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 900
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
              line: 900
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 900
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
              line: 198
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
              line: 900
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
              line: 198
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
              line: 917
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 917
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
              line: 962
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
              line: 198
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
              line: 962
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
              line: 198
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
              line: 966
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
              line: 198
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
              line: 970
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
              line: 980
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 980
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
              line: 981
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
              line: 982
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 982
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
              line: 198
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
              line: 983
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
      line: 83
    },
    name: "StatusCodeIdValue",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 83
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 83
        },
        kind: "string-literal",
        value: "A"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 83
        },
        kind: "string-literal",
        value: "C"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 83
        },
        kind: "string-literal",
        value: "I"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 83
        },
        kind: "string-literal",
        value: "M"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 83
        },
        kind: "string-literal",
        value: "!"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 83
        },
        kind: "string-literal",
        value: "R"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 83
        },
        kind: "string-literal",
        value: "?"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 83
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
      line: 85
    },
    name: "MergeConflictStatusValue",
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
        value: "both changed"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
        },
        kind: "string-literal",
        value: "deleted in theirs"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 85
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
      line: 95
    },
    name: "StatusCodeNumberValue",
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
        kind: "number-literal",
        value: 1
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 95
        },
        kind: "number-literal",
        value: 2
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 95
        },
        kind: "number-literal",
        value: 3
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 95
        },
        kind: "number-literal",
        value: 4
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 95
        },
        kind: "number-literal",
        value: 5
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 95
        },
        kind: "number-literal",
        value: 6
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 95
        },
        kind: "number-literal",
        value: 7
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 95
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
      line: 97
    },
    name: "HgStatusOptionValue",
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
  }], ["RevisionInfo", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 119
    },
    name: "RevisionInfo",
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
        name: "id",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 120
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 121
        },
        name: "hash",
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
        name: "title",
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
        name: "author",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 123
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 124
        },
        name: "date",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 124
          },
          kind: "named",
          name: "Date"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 125
        },
        name: "description",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 125
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
        name: "bookmarks",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 127
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 127
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
      line: 130
    },
    name: "AsyncExecuteRet",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 130
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 131
        },
        name: "command",
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
        name: "errorMessage",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 132
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 133
        },
        name: "exitCode",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 133
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 134
        },
        name: "stderr",
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
        name: "stdout",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 135
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
      line: 138
    },
    name: "RevisionFileCopy",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 138
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 139
        },
        name: "from",
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
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 140
        },
        name: "to",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 140
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
      line: 143
    },
    name: "RevisionFileChanges",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 143
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 144
        },
        name: "all",
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
        name: "added",
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
        name: "deleted",
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
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 147
        },
        name: "copied",
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
            name: "RevisionFileCopy"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 148
        },
        name: "modified",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 148
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 148
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
      line: 151
    },
    name: "HgStatusCommandOptions",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 151
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 152
        },
        name: "hgStatusOption",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 152
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
      line: 155
    },
    name: "VcsLogEntry",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 155
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 156
        },
        name: "node",
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
        name: "user",
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
        name: "desc",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 158
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 159
        },
        name: "date",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 159
          },
          kind: "tuple",
          types: [{
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 159
            },
            kind: "number"
          }, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 159
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
      line: 162
    },
    name: "VcsLogResponse",
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
        name: "entries",
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
      line: 166
    },
    name: "MergeConflict",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 166
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 167
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 167
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 168
        },
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 168
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
      line: 171
    },
    name: "CheckoutSideName",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 171
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 171
        },
        kind: "string-literal",
        value: "ours"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 171
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
      line: 198
    },
    constructorArgs: [{
      name: "workingDirectory",
      type: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 212
        },
        kind: "string"
      }
    }],
    staticMethods: new Map(),
    instanceMethods: new Map([["waitForWatchmanSubscriptions", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 229
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 229
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 229
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 233
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 233
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 233
          },
          kind: "void"
        }
      }
    }], ["fetchStatuses", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 258
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 259
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 259
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
            line: 260
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 260
            },
            kind: "any"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 261
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 261
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 261
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 261
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
        line: 443
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 443
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 443
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 443
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
        line: 451
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 451
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 451
          },
          kind: "void"
        }
      }
    }], ["observeHgConflictStateDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 458
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 458
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 458
          },
          kind: "boolean"
        }
      }
    }], ["fetchDiffInfo", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 471
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 471
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 471
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
          line: 471
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 471
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 471
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 471
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 471
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
        line: 503
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 503
          },
          kind: "string"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 503
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 503
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 503
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 503
          },
          kind: "void"
        }
      }
    }], ["deleteBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 513
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 513
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 513
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 513
          },
          kind: "void"
        }
      }
    }], ["renameBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 517
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 517
          },
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 517
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 517
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 517
          },
          kind: "void"
        }
      }
    }], ["fetchActiveBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 524
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 524
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 524
          },
          kind: "string"
        }
      }
    }], ["fetchBookmarks", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 531
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 531
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 531
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 531
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
        line: 551
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 551
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 551
          },
          kind: "void"
        }
      }
    }], ["observeBookmarksDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 558
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 558
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 558
          },
          kind: "void"
        }
      }
    }], ["fetchFileContentAtRevision", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 571
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 571
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
            line: 571
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 571
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 571
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 571
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 571
            },
            kind: "string"
          }
        }
      }
    }], ["fetchFilesChangedAtRevision", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 575
      },
      kind: "function",
      argumentTypes: [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 575
          },
          kind: "string"
        }
      }],
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
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 575
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
        line: 585
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 585
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 585
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 585
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 585
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
        line: 598
      },
      kind: "function",
      argumentTypes: [],
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
          kind: "named",
          name: "RevisionInfo"
        }
      }
    }], ["getBlameAtHead", {
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
            line: 615
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 615
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 615
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 615
            },
            kind: "string"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 615
            },
            kind: "string"
          }
        }
      }
    }], ["getConfigValueAsync", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 636
      },
      kind: "function",
      argumentTypes: [{
        name: "key",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 636
          },
          kind: "string"
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
            kind: "string"
          }
        }
      }
    }], ["getDifferentialRevisionForChangeSetId", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 657
      },
      kind: "function",
      argumentTypes: [{
        name: "changeSetId",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 657
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 657
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 657
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 657
            },
            kind: "string"
          }
        }
      }
    }], ["getSmartlog", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 680
      },
      kind: "function",
      argumentTypes: [{
        name: "ttyOutput",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 680
          },
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 680
          },
          kind: "boolean"
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
          kind: "named",
          name: "AsyncExecuteRet"
        }
      }
    }], ["commit", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 720
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 720
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 720
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 720
          },
          kind: "void"
        }
      }
    }], ["amend", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 728
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 728
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 728
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 728
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 728
          },
          kind: "void"
        }
      }
    }], ["revert", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 736
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 736
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 736
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
          line: 736
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 736
          },
          kind: "void"
        }
      }
    }], ["checkout", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 768
      },
      kind: "function",
      argumentTypes: [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 768
          },
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 768
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 768
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 768
          },
          kind: "void"
        }
      }
    }], ["rename", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 788
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 789
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 789
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
            line: 790
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
            line: 791
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 791
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 792
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 792
          },
          kind: "void"
        }
      }
    }], ["remove", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 815
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 815
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 815
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
    }], ["add", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 836
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 836
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 836
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
          line: 836
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 836
          },
          kind: "void"
        }
      }
    }], ["getTemplateCommitMessage", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 844
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 844
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 844
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 844
            },
            kind: "string"
          }
        }
      }
    }], ["getHeadCommitMessage", {
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
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 880
            },
            kind: "string"
          }
        }
      }
    }], ["log", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 900
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 900
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 900
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
            line: 900
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 900
            },
            kind: "number"
          }
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
          name: "VcsLogResponse"
        }
      }
    }], ["fetchMergeConflicts", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 917
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 917
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 917
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 917
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
        line: 962
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 962
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 962
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 962
          },
          kind: "void"
        }
      }
    }], ["continueRebase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 966
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 966
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 966
          },
          kind: "void"
        }
      }
    }], ["abortRebase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 970
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 970
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 970
          },
          kind: "void"
        }
      }
    }], ["copy", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 979
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 980
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 980
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
            line: 981
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
            line: 982
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 982
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 983
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 983
          },
          kind: "void"
        }
      }
    }]])
  }]])
});