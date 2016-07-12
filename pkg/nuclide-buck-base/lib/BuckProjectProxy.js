"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};
  remoteModule.BuckProject = class {
    static getRootForPath(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 158
          },
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.callRemoteFunction("BuckProject/getRootForPath", "promise", args);
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 158
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 158
            },
            kind: "named",
            name: "NuclideUri"
          }
        });
      });
    }
    constructor(arg0) {
      _client.createRemoteObject("BuckProject", this, [arg0], [{
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 141
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 141
            },
            name: "rootPath",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 141
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }]
        }
      }])
    }
    getPath() {
      return trackOperationTiming("BuckProject.getPath", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "getPath", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 150
            },
            kind: "named",
            name: "NuclideUri"
          });
        });
      });
    }
    getBuildFile(arg0) {
      return trackOperationTiming("BuckProject.getBuildFile", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "targetName",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 165
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "getBuildFile", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 165
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 165
              },
              kind: "string"
            }
          });
        });
      });
    }
    getOwner(arg0) {
      return trackOperationTiming("BuckProject.getOwner", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "filePath",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 217
            },
            kind: "named",
            name: "NuclideUri"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "getOwner", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 217
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 217
              },
              kind: "string"
            }
          });
        });
      });
    }
    getBuckConfig(arg0, arg1) {
      return trackOperationTiming("BuckProject.getBuckConfig", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "section",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 235
            },
            kind: "string"
          }
        }, {
          name: "property",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 235
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "getBuckConfig", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 235
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 235
              },
              kind: "string"
            }
          });
        });
      });
    }
    build(arg0, arg1) {
      return trackOperationTiming("BuckProject.build", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "buildTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 273
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 273
              },
              kind: "string"
            }
          }
        }, {
          name: "options",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 274
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 274
              },
              kind: "named",
              name: "BaseBuckBuildOptions"
            }
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "build", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 275
            },
            kind: "any"
          });
        });
      });
    }
    install(arg0, arg1, arg2) {
      return trackOperationTiming("BuckProject.install", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "buildTargets",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 291
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 291
              },
              kind: "string"
            }
          }
        }, {
          name: "simulator",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 292
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 292
              },
              kind: "string"
            }
          }
        }, {
          name: "runOptions",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 293
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 293
              },
              kind: "named",
              name: "BuckRunOptions"
            }
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "install", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 294
            },
            kind: "any"
          });
        });
      });
    }
    buildWithOutput(arg0, arg1) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 342
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 342
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 343
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 343
            },
            kind: "string"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 131
          },
          name: "BuckProject"
        }).then(id => {
          return _client.callRemoteMethod(id, "buildWithOutput", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 344
          },
          kind: "named",
          name: "ProcessMessage"
        });
      });
    }
    testWithOutput(arg0, arg1) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 360
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 360
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 361
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 361
            },
            kind: "string"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 131
          },
          name: "BuckProject"
        }).then(id => {
          return _client.callRemoteMethod(id, "testWithOutput", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 362
          },
          kind: "named",
          name: "ProcessMessage"
        });
      });
    }
    installWithOutput(arg0, arg1, arg2, arg3) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 378
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 378
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 379
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 379
            },
            kind: "string"
          }
        }
      }, {
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 380
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 380
            },
            kind: "string"
          }
        }
      }, {
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 381
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 381
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 131
          },
          name: "BuckProject"
        }).then(id => {
          return _client.callRemoteMethod(id, "installWithOutput", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 382
          },
          kind: "named",
          name: "ProcessMessage"
        });
      });
    }
    listAliases() {
      return trackOperationTiming("BuckProject.listAliases", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "listAliases", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 456
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 456
              },
              kind: "string"
            }
          });
        });
      });
    }
    resolveAlias(arg0) {
      return trackOperationTiming("BuckProject.resolveAlias", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "aliasOrTarget",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 466
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "resolveAlias", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 466
            },
            kind: "string"
          });
        });
      });
    }
    outputFileFor(arg0) {
      return trackOperationTiming("BuckProject.outputFileFor", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "aliasOrTarget",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 477
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "outputFileFor", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 477
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 477
              },
              kind: "string"
            }
          });
        });
      });
    }
    buildRuleTypeFor(arg0) {
      return trackOperationTiming("BuckProject.buildRuleTypeFor", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "aliasOrTarget",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 489
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "buildRuleTypeFor", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 489
            },
            kind: "string"
          });
        });
      });
    }
    getHTTPServerPort() {
      return trackOperationTiming("BuckProject.getHTTPServerPort", () => {
        return _client.marshalArguments(Array.from(arguments), []).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "getHTTPServerPort", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 514
            },
            kind: "number"
          });
        });
      });
    }
    query(arg0) {
      return trackOperationTiming("BuckProject.query", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "query",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 522
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "query", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 522
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 522
              },
              kind: "string"
            }
          });
        });
      });
    }
    queryWithArgs(arg0, arg1) {
      return trackOperationTiming("BuckProject.queryWithArgs", () => {
        return _client.marshalArguments(Array.from(arguments), [{
          name: "query",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 539
            },
            kind: "string"
          }
        }, {
          name: "args",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 540
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 540
              },
              kind: "string"
            }
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 131
            },
            name: "BuckProject"
          }).then(id => {
            return _client.callRemoteMethod(id, "queryWithArgs", "promise", args);
          });
        }).then(value => {
          return _client.unmarshal(value, {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 541
            },
            kind: "object",
            fields: []
          });
        });
      });
    }
    getWebSocketStream(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "httpPort",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 558
          },
          kind: "number"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 131
          },
          name: "BuckProject"
        }).then(id => {
          return _client.callRemoteMethod(id, "getWebSocketStream", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 558
          },
          kind: "named",
          name: "Object"
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
  }], ["dontRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckProject.js",
      line: 28
    },
    name: "dontRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 28
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 29
        },
        name: "run",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 29
          },
          kind: "boolean-literal",
          value: false
        },
        optional: false
      }]
    }
  }], ["doRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckProject.js",
      line: 32
    },
    name: "doRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 32
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 33
        },
        name: "run",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 33
          },
          kind: "boolean-literal",
          value: true
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 34
        },
        name: "debug",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 34
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["BuckRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckProject.js",
      line: 37
    },
    name: "BuckRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 37
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 28
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 29
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 29
            },
            kind: "boolean-literal",
            value: false
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 32
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 33
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 33
            },
            kind: "boolean-literal",
            value: true
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 34
          },
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 34
            },
            kind: "boolean"
          },
          optional: false
        }]
      }],
      discriminantField: "run"
    }
  }], ["BuckWebSocketMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckProject.js",
      line: 39
    },
    name: "BuckWebSocketMessage",
    definition: {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 39
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 39
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 40
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 40
            },
            kind: "string-literal",
            value: "BuildProgressUpdated"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 41
          },
          name: "progressValue",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 41
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 42
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 43
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 43
            },
            kind: "string-literal",
            value: "BuildFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 44
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 44
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 45
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 46
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 46
            },
            kind: "string-literal",
            value: "BuildStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 47
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 48
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 48
            },
            kind: "string-literal",
            value: "ConsoleEvent"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 49
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 49
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 50
          },
          name: "level",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 50
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 51
              },
              name: "name",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 51
                },
                kind: "union",
                types: [{
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 51
                  },
                  kind: "string-literal",
                  value: "OFF"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 51
                  },
                  kind: "string-literal",
                  value: "SEVERE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 51
                  },
                  kind: "string-literal",
                  value: "WARNING"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 51
                  },
                  kind: "string-literal",
                  value: "INFO"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 51
                  },
                  kind: "string-literal",
                  value: "CONFIG"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 51
                  },
                  kind: "string-literal",
                  value: "FINE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 51
                  },
                  kind: "string-literal",
                  value: "FINER"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 51
                  },
                  kind: "string-literal",
                  value: "FINEST"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 51
                  },
                  kind: "string-literal",
                  value: "ALL"
                }]
              },
              optional: false
            }]
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 53
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 54
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 54
            },
            kind: "string-literal",
            value: "ParseStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 55
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 56
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 56
            },
            kind: "string-literal",
            value: "ParseFinished"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 57
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 58
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 58
            },
            kind: "string-literal",
            value: "InstallFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 59
          },
          name: "success",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 59
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 60
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 60
            },
            kind: "number"
          },
          optional: true
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 61
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 62
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 62
            },
            kind: "string-literal",
            value: "RunStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 63
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 64
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 64
            },
            kind: "string-literal",
            value: "RunComplete"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 65
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 66
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 66
            },
            kind: "string-literal",
            value: "ResultsAvailable"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 67
          },
          name: "results",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 67
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 68
              },
              name: "buildTarget",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 68
                },
                kind: "object",
                fields: [{
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 69
                  },
                  name: "shortName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 69
                    },
                    kind: "string"
                  },
                  optional: false
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 70
                  },
                  name: "baseName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 70
                    },
                    kind: "string"
                  },
                  optional: false
                }]
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 72
              },
              name: "success",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 72
                },
                kind: "boolean"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 73
              },
              name: "failureCount",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 73
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 74
              },
              name: "totalNumberOfTests",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 74
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 75
              },
              name: "testCases",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 75
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 75
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 76
                    },
                    name: "success",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckProject.js",
                        line: 76
                      },
                      kind: "boolean"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 77
                    },
                    name: "failureCount",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckProject.js",
                        line: 77
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 78
                    },
                    name: "skippedCount",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckProject.js",
                        line: 78
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 79
                    },
                    name: "testCaseName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckProject.js",
                        line: 79
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 80
                    },
                    name: "testResults",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckProject.js",
                        line: 80
                      },
                      kind: "array",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckProject.js",
                          line: 80
                        },
                        kind: "object",
                        fields: [{
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 81
                          },
                          name: "testCaseName",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 81
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 82
                          },
                          name: "testName",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 82
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 83
                          },
                          name: "type",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 83
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 84
                          },
                          name: "time",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 84
                            },
                            kind: "number"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 85
                          },
                          name: "message",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 85
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 86
                          },
                          name: "stacktrace",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 86
                            },
                            kind: "nullable",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckProject.js",
                                line: 86
                              },
                              kind: "string"
                            }
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 87
                          },
                          name: "stdOut",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 87
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 88
                          },
                          name: "stdErr",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 88
                            },
                            kind: "string"
                          },
                          optional: false
                        }]
                      }
                    },
                    optional: false
                  }]
                }
              },
              optional: false
            }]
          },
          optional: false
        }]
      }],
      discriminantField: "type"
    }
  }], ["BaseBuckBuildOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckProject.js",
      line: 95
    },
    name: "BaseBuckBuildOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 95
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 96
        },
        name: "install",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 96
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 97
        },
        name: "test",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 97
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 98
        },
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 98
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 98
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 99
        },
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 99
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 99
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 101
        },
        name: "commandOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 101
          },
          kind: "named",
          name: "Object"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 102
        },
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 102
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 102
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["BuckProject", {
    kind: "interface",
    name: "BuckProject",
    location: {
      type: "source",
      fileName: "BuckProject.js",
      line: 131
    },
    constructorArgs: [{
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 141
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 141
          },
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 141
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }]
      }
    }],
    staticMethods: new Map([["getRootForPath", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 158
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 158
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 158
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 158
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 158
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }]]),
    instanceMethods: new Map([["dispose", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 146
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 146
        },
        kind: "void"
      }
    }], ["getPath", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 150
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 150
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 150
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }], ["getBuildFile", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 165
      },
      kind: "function",
      argumentTypes: [{
        name: "targetName",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 165
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 165
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 165
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 165
            },
            kind: "string"
          }
        }
      }
    }], ["getOwner", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 217
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 217
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 217
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 217
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 217
            },
            kind: "string"
          }
        }
      }
    }], ["getBuckConfig", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 235
      },
      kind: "function",
      argumentTypes: [{
        name: "section",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 235
          },
          kind: "string"
        }
      }, {
        name: "property",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 235
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 235
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 235
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 235
            },
            kind: "string"
          }
        }
      }
    }], ["build", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 272
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 273
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 273
            },
            kind: "string"
          }
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 274
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 274
            },
            kind: "named",
            name: "BaseBuckBuildOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 275
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 275
          },
          kind: "any"
        }
      }
    }], ["install", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 290
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 291
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 291
            },
            kind: "string"
          }
        }
      }, {
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 292
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 292
            },
            kind: "string"
          }
        }
      }, {
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 293
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 293
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 294
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 294
          },
          kind: "any"
        }
      }
    }], ["buildWithOutput", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 341
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 342
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 342
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 343
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 343
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 344
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 344
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["testWithOutput", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 359
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 360
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 360
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 361
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 361
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 362
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 362
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["installWithOutput", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 377
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 378
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 378
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 379
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 379
            },
            kind: "string"
          }
        }
      }, {
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 380
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 380
            },
            kind: "string"
          }
        }
      }, {
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 381
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 381
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 382
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 382
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["listAliases", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 456
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 456
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 456
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 456
            },
            kind: "string"
          }
        }
      }
    }], ["resolveAlias", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 466
      },
      kind: "function",
      argumentTypes: [{
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 466
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 466
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 466
          },
          kind: "string"
        }
      }
    }], ["outputFileFor", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 477
      },
      kind: "function",
      argumentTypes: [{
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 477
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 477
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 477
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 477
            },
            kind: "string"
          }
        }
      }
    }], ["buildRuleTypeFor", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 489
      },
      kind: "function",
      argumentTypes: [{
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 489
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 489
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 489
          },
          kind: "string"
        }
      }
    }], ["getHTTPServerPort", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 514
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 514
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 514
          },
          kind: "number"
        }
      }
    }], ["query", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 522
      },
      kind: "function",
      argumentTypes: [{
        name: "query",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 522
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 522
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 522
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 522
            },
            kind: "string"
          }
        }
      }
    }], ["queryWithArgs", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 538
      },
      kind: "function",
      argumentTypes: [{
        name: "query",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 539
          },
          kind: "string"
        }
      }, {
        name: "args",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 540
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 540
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 541
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 541
          },
          kind: "object",
          fields: []
        }
      }
    }], ["getWebSocketStream", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 558
      },
      kind: "function",
      argumentTypes: [{
        name: "httpPort",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 558
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 558
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 558
          },
          kind: "named",
          name: "Object"
        }
      }
    }]])
  }], ["ProcessMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "process-types.js",
      line: 12
    },
    name: "ProcessMessage",
    definition: {
      location: {
        type: "source",
        fileName: "process-types.js",
        line: 12
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "process-types.js",
          line: 12
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-types.js",
            line: 13
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-types.js",
              line: 13
            },
            kind: "string-literal",
            value: "stdout"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-types.js",
            line: 14
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-types.js",
              line: 14
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-types.js",
          line: 15
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-types.js",
            line: 16
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-types.js",
              line: 16
            },
            kind: "string-literal",
            value: "stderr"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-types.js",
            line: 17
          },
          name: "data",
          type: {
            location: {
              type: "source",
              fileName: "process-types.js",
              line: 17
            },
            kind: "string"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-types.js",
          line: 18
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-types.js",
            line: 19
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-types.js",
              line: 19
            },
            kind: "string-literal",
            value: "exit"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-types.js",
            line: 20
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "process-types.js",
              line: 20
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "process-types.js",
          line: 21
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "process-types.js",
            line: 22
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "process-types.js",
              line: 22
            },
            kind: "string-literal",
            value: "error"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "process-types.js",
            line: 23
          },
          name: "error",
          type: {
            location: {
              type: "source",
              fileName: "process-types.js",
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