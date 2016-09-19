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
            line: 219
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
              line: 205
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
              line: 236
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
              line: 270
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 270
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
              line: 271
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 271
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
              line: 205
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
              line: 272
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 272
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 272
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
            line: 205
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
            line: 454
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 454
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
            line: 205
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
            line: 462
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
            line: 205
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
            line: 469
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
              line: 482
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 482
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
              line: 205
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
              line: 482
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 482
              },
              kind: "map",
              keyType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 482
                },
                kind: "named",
                name: "NuclideUri"
              },
              valueType: {
                location: {
                  type: "source",
                  fileName: "HgService.js",
                  line: 482
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
              line: 514
            },
            kind: "string"
          }
        }, {
          name: "revision",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 514
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 514
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
              line: 205
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
              line: 514
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
              line: 524
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 205
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
              line: 524
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
              line: 528
            },
            kind: "string"
          }
        }, {
          name: "nextName",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 528
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 205
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
              line: 528
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
              line: 205
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
              line: 535
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
              line: 205
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
              line: 542
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 542
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
            line: 205
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
            line: 562
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
            line: 205
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
            line: 569
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
            line: 583
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
            line: 584
          },
          kind: "string"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 205
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
            line: 585
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
            line: 205
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
            line: 589
          },
          kind: "named",
          name: "RevisionFileChanges"
        });
      }).publish();
    }
    fetchRevisionInfoBetweenHeadAndBase() {
      return trackOperationTiming("HgService.fetchRevisionInfoBetweenHeadAndBase", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 205
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
              line: 599
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 599
              },
              kind: "named",
              name: "RevisionInfo"
            }
          });
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
            line: 205
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
            line: 609
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 609
            },
            kind: "named",
            name: "RevisionInfo"
          }
        });
      }).publish();
    }
    getBaseRevision() {
      return trackOperationTiming("HgService.getBaseRevision", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 205
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
              line: 616
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
              line: 633
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
              line: 205
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
              line: 633
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 633
              },
              kind: "string"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 633
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
              line: 205
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
              line: 654
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 654
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
              line: 675
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 205
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
              line: 675
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 675
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
              line: 698
            },
            kind: "boolean"
          }
        }, {
          name: "concise",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 698
            },
            kind: "boolean"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 205
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
              line: 698
            },
            kind: "named",
            name: "AsyncExecuteRet"
          });
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
            line: 205
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
            line: 739
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
      }, {
        name: "amendMode",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 751
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
            line: 205
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
            line: 751
          },
          kind: "named",
          name: "ProcessMessage"
        });
      }).publish();
    }
    revert(arg0) {
      return trackOperationTiming("HgService.revert", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 768
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 768
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
              line: 205
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
              line: 768
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
              line: 800
            },
            kind: "string"
          }
        }, {
          name: "create",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 800
            },
            kind: "boolean"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 205
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
              line: 800
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
              line: 821
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 821
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
              line: 822
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
              line: 823
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 823
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
              line: 205
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
              line: 824
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
              line: 847
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 847
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
              line: 847
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 847
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
              line: 205
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
              line: 847
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
              line: 868
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 868
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
              line: 205
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
              line: 868
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
              line: 205
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
              line: 876
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 876
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
              line: 205
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
              line: 917
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 917
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
              line: 937
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 937
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
              line: 937
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 937
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
              line: 205
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
              line: 937
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
              line: 205
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
              line: 954
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 954
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
              line: 999
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
              line: 205
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
              line: 999
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
              line: 205
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
              line: 1003
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
              line: 205
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
              line: 1007
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
              line: 1017
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1017
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
              line: 1018
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
              line: 1019
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 1019
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
              line: 205
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
              line: 1020
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
  }], ["CommitPhaseType", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 118
    },
    name: "CommitPhaseType",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 118
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 118
        },
        kind: "string-literal",
        value: "public"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 118
        },
        kind: "string-literal",
        value: "draft"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 118
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
      line: 120
    },
    name: "RevisionInfo",
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
        name: "author",
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
        name: "bookmarks",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 122
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 122
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 123
        },
        name: "branch",
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
          line: 126
        },
        name: "hash",
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
        name: "id",
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
        name: "remoteBookmarks",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 128
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 128
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 129
        },
        name: "parents",
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
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 130
        },
        name: "phase",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 130
          },
          kind: "named",
          name: "CommitPhaseType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 131
        },
        name: "tags",
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
        name: "title",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 132
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
      line: 135
    },
    name: "AsyncExecuteRet",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 135
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 136
        },
        name: "command",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 136
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 137
        },
        name: "errorMessage",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 137
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 138
        },
        name: "exitCode",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 138
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 139
        },
        name: "stderr",
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
        name: "stdout",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 140
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
      line: 143
    },
    name: "RevisionFileCopy",
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
        name: "from",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 144
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 145
        },
        name: "to",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 145
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
      line: 148
    },
    name: "RevisionFileChanges",
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
        name: "all",
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
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 150
        },
        name: "added",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 150
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 150
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
          line: 151
        },
        name: "deleted",
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
        name: "copied",
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
            name: "RevisionFileCopy"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 153
        },
        name: "modified",
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
      }]
    }
  }], ["HgStatusCommandOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 156
    },
    name: "HgStatusCommandOptions",
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
        name: "hgStatusOption",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 157
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
      line: 160
    },
    name: "VcsLogEntry",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 160
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 161
        },
        name: "node",
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
        name: "user",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 162
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 163
        },
        name: "desc",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 163
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 164
        },
        name: "date",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 164
          },
          kind: "tuple",
          types: [{
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 164
            },
            kind: "number"
          }, {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 164
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
      line: 167
    },
    name: "VcsLogResponse",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 167
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 168
        },
        name: "entries",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 168
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 168
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
      line: 171
    },
    name: "MergeConflict",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 171
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 172
        },
        name: "path",
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
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 173
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
      line: 176
    },
    name: "CheckoutSideName",
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
        value: "ours"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 176
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
      line: 178
    },
    name: "AmendModeValue",
    definition: {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 178
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 178
        },
        kind: "string-literal",
        value: "Clean"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 178
        },
        kind: "string-literal",
        value: "Rebase"
      }, {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 178
        },
        kind: "string-literal",
        value: "Fixup"
      }]
    }
  }], ["HgService", {
    kind: "interface",
    name: "HgService",
    location: {
      type: "source",
      fileName: "HgService.js",
      line: 205
    },
    constructorArgs: [{
      name: "workingDirectory",
      type: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 219
        },
        kind: "string"
      }
    }],
    staticMethods: new Map(),
    instanceMethods: new Map([["waitForWatchmanSubscriptions", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 236
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 236
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 236
          },
          kind: "void"
        }
      }
    }], ["dispose", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 240
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 240
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 240
          },
          kind: "void"
        }
      }
    }], ["fetchStatuses", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 269
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 270
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 270
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
            line: 271
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 271
            },
            kind: "any"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 272
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 272
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 272
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 272
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
        line: 454
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 454
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 454
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 454
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
        line: 462
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 462
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 462
          },
          kind: "void"
        }
      }
    }], ["observeHgConflictStateDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 469
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 469
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 469
          },
          kind: "boolean"
        }
      }
    }], ["fetchDiffInfo", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 482
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 482
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 482
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
          line: 482
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 482
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 482
            },
            kind: "map",
            keyType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 482
              },
              kind: "named",
              name: "NuclideUri"
            },
            valueType: {
              location: {
                type: "source",
                fileName: "HgService.js",
                line: 482
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
        line: 514
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 514
          },
          kind: "string"
        }
      }, {
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 514
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 514
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 514
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 514
          },
          kind: "void"
        }
      }
    }], ["deleteBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 524
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 524
          },
          kind: "string"
        }
      }],
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
          kind: "void"
        }
      }
    }], ["renameBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 528
      },
      kind: "function",
      argumentTypes: [{
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 528
          },
          kind: "string"
        }
      }, {
        name: "nextName",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 528
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 528
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 528
          },
          kind: "void"
        }
      }
    }], ["fetchActiveBookmark", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 535
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 535
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 535
          },
          kind: "string"
        }
      }
    }], ["fetchBookmarks", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 542
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 542
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 542
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 542
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
        line: 562
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 562
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 562
          },
          kind: "void"
        }
      }
    }], ["observeBookmarksDidChange", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 569
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 569
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 569
          },
          kind: "void"
        }
      }
    }], ["fetchFileContentAtRevision", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 582
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 583
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
            line: 584
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 585
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 585
          },
          kind: "string"
        }
      }
    }], ["fetchFilesChangedAtRevision", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 589
      },
      kind: "function",
      argumentTypes: [{
        name: "revision",
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
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 589
          },
          kind: "named",
          name: "RevisionFileChanges"
        }
      }
    }], ["fetchRevisionInfoBetweenHeadAndBase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 599
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 599
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 599
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 599
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
        line: 609
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 609
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 609
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 609
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
        line: 616
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 616
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 616
          },
          kind: "named",
          name: "RevisionInfo"
        }
      }
    }], ["getBlameAtHead", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 633
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 633
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 633
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 633
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 633
            },
            kind: "string"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 633
            },
            kind: "string"
          }
        }
      }
    }], ["getConfigValueAsync", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 654
      },
      kind: "function",
      argumentTypes: [{
        name: "key",
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
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 654
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 654
            },
            kind: "string"
          }
        }
      }
    }], ["getDifferentialRevisionForChangeSetId", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 675
      },
      kind: "function",
      argumentTypes: [{
        name: "changeSetId",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 675
          },
          kind: "string"
        }
      }],
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
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 675
            },
            kind: "string"
          }
        }
      }
    }], ["getSmartlog", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 698
      },
      kind: "function",
      argumentTypes: [{
        name: "ttyOutput",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 698
          },
          kind: "boolean"
        }
      }, {
        name: "concise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 698
          },
          kind: "boolean"
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
          kind: "named",
          name: "AsyncExecuteRet"
        }
      }
    }], ["commit", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 739
      },
      kind: "function",
      argumentTypes: [{
        name: "message",
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
          line: 739
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 739
          },
          kind: "named",
          name: "ProcessMessage"
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
      }, {
        name: "amendMode",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 751
          },
          kind: "named",
          name: "AmendModeValue"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 751
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 751
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["revert", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 768
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 768
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 768
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
    }], ["checkout", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 800
      },
      kind: "function",
      argumentTypes: [{
        name: "revision",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 800
          },
          kind: "string"
        }
      }, {
        name: "create",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 800
          },
          kind: "boolean"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 800
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 800
          },
          kind: "void"
        }
      }
    }], ["rename", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 820
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 821
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 821
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
            line: 822
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
            line: 823
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 823
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 824
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 824
          },
          kind: "void"
        }
      }
    }], ["remove", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 847
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 847
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 847
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
            line: 847
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 847
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 847
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 847
          },
          kind: "void"
        }
      }
    }], ["add", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 868
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 868
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 868
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
          line: 868
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 868
          },
          kind: "void"
        }
      }
    }], ["getTemplateCommitMessage", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 876
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 876
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 876
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 876
            },
            kind: "string"
          }
        }
      }
    }], ["getHeadCommitMessage", {
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
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 917
            },
            kind: "string"
          }
        }
      }
    }], ["log", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 937
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 937
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 937
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
            line: 937
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 937
            },
            kind: "number"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 937
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 937
          },
          kind: "named",
          name: "VcsLogResponse"
        }
      }
    }], ["fetchMergeConflicts", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 954
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 954
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 954
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 954
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
        line: 999
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 999
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 999
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 999
          },
          kind: "void"
        }
      }
    }], ["continueRebase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1003
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1003
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1003
          },
          kind: "void"
        }
      }
    }], ["abortRebase", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1007
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1007
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1007
          },
          kind: "void"
        }
      }
    }], ["copy", {
      location: {
        type: "source",
        fileName: "HgService.js",
        line: 1016
      },
      kind: "function",
      argumentTypes: [{
        name: "filePaths",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1017
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1017
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
            line: 1018
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
            line: 1019
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "HgService.js",
              line: 1019
            },
            kind: "boolean"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "HgService.js",
          line: 1020
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "HgService.js",
            line: 1020
          },
          kind: "void"
        }
      }
    }]])
  }], ["ProcessMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-rpc-types.js",
      line: 12
    },
    name: "ProcessMessage",
    definition: {
      location: {
        type: "source",
        fileName: "process-rpc-types.js",
        line: 12
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 12
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 13
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 13
            },
            kind: "string-literal",
            value: "stdout"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 14
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 14
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-rpc-types.js",
          line: 15
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 16
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 16
            },
            kind: "string-literal",
            value: "stderr"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 17
          },
          name: "data",
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
          line: 18
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 19
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 19
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 20
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 20
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
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
            value: "error"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-rpc-types.js",
            line: 23
          },
          name: "error",
          type: {
            location: {
              type: "source",
              fileName: "process-rpc-types.js",
              line: 23
            },
            kind: "named",
            name: "Object"
          },
          optional: false
        }]
      }],
      discriminantField: "kind"
    }
  }]])
});