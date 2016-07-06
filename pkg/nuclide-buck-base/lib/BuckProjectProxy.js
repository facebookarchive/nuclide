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
            line: 155
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
            line: 155
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 155
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
            line: 138
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 138
            },
            name: "rootPath",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 138
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
              line: 128
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
              line: 147
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
              line: 162
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 128
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
              line: 162
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 162
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
              line: 214
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
              line: 128
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
              line: 214
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 214
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
              line: 232
            },
            kind: "string"
          }
        }, {
          name: "property",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 232
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 128
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
              line: 232
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 232
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
              line: 270
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 270
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
              line: 271
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 271
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
              line: 128
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
              line: 272
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
              line: 290
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 290
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
              line: 291
            },
            kind: "nullable",
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
          name: "runOptions",
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
              line: 128
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
              line: 293
            },
            kind: "any"
          });
        });
      });
    }
    buildWithOutput(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 341
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 341
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
            line: 128
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
            line: 342
          },
          kind: "named",
          name: "ProcessMessage"
        });
      });
    }
    testWithOutput(arg0) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 358
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 358
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
            line: 128
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
            line: 359
          },
          kind: "named",
          name: "ProcessMessage"
        });
      });
    }
    installWithOutput(arg0, arg1, arg2) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 375
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 375
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
            line: 376
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 376
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
            line: 377
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 377
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
            line: 128
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
            line: 378
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
              line: 128
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
              line: 447
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 447
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
              line: 457
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 128
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
              line: 457
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
              line: 468
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 128
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
              line: 468
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 468
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
              line: 480
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 128
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
              line: 480
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
              line: 128
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
              line: 505
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
              line: 513
            },
            kind: "string"
          }
        }]).then(args => {
          return _client.marshal(this, {
            kind: "named",
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 128
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
              line: 513
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 513
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
              line: 530
            },
            kind: "string"
          }
        }, {
          name: "args",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 531
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 531
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
              line: 128
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
              line: 532
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
            line: 549
          },
          kind: "number"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 128
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
            line: 549
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
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 35
        },
        name: "appArgs",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 35
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 35
            },
            kind: "string"
          }
        },
        optional: false
      }]
    }
  }], ["BuckRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckProject.js",
      line: 38
    },
    name: "BuckRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 38
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
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 35
          },
          name: "appArgs",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 35
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 35
              },
              kind: "string"
            }
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
      line: 40
    },
    name: "BuckWebSocketMessage",
    definition: {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 40
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 40
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 41
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 41
            },
            kind: "string-literal",
            value: "BuildProgressUpdated"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 42
          },
          name: "progressValue",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 42
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 43
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 44
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 44
            },
            kind: "string-literal",
            value: "BuildFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 45
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 45
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 46
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 47
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 47
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
          line: 48
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 49
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 49
            },
            kind: "string-literal",
            value: "ConsoleEvent"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 50
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 50
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 51
          },
          name: "level",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 51
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 52
              },
              name: "name",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 52
                },
                kind: "union",
                types: [{
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 52
                  },
                  kind: "string-literal",
                  value: "OFF"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 52
                  },
                  kind: "string-literal",
                  value: "SEVERE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 52
                  },
                  kind: "string-literal",
                  value: "WARNING"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 52
                  },
                  kind: "string-literal",
                  value: "INFO"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 52
                  },
                  kind: "string-literal",
                  value: "CONFIG"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 52
                  },
                  kind: "string-literal",
                  value: "FINE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 52
                  },
                  kind: "string-literal",
                  value: "FINER"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 52
                  },
                  kind: "string-literal",
                  value: "FINEST"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 52
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
          line: 54
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 55
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 55
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
          line: 56
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 57
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 57
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
          line: 58
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 59
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 59
            },
            kind: "string-literal",
            value: "InstallFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 60
          },
          name: "success",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 60
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 61
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 61
            },
            kind: "number"
          },
          optional: true
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 62
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 63
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 63
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
          line: 64
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 65
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 65
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
          line: 66
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 67
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 67
            },
            kind: "string-literal",
            value: "ResultsAvailable"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 68
          },
          name: "results",
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
              name: "buildTarget",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 69
                },
                kind: "object",
                fields: [{
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 70
                  },
                  name: "shortName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 70
                    },
                    kind: "string"
                  },
                  optional: false
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 71
                  },
                  name: "baseName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 71
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
                line: 73
              },
              name: "success",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 73
                },
                kind: "boolean"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 74
              },
              name: "failureCount",
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
              name: "totalNumberOfTests",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 75
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckProject.js",
                line: 76
              },
              name: "testCases",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckProject.js",
                  line: 76
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckProject.js",
                    line: 76
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 77
                    },
                    name: "success",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckProject.js",
                        line: 77
                      },
                      kind: "boolean"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 78
                    },
                    name: "failureCount",
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
                    name: "skippedCount",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckProject.js",
                        line: 79
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 80
                    },
                    name: "testCaseName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckProject.js",
                        line: 80
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckProject.js",
                      line: 81
                    },
                    name: "testResults",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckProject.js",
                        line: 81
                      },
                      kind: "array",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckProject.js",
                          line: 81
                        },
                        kind: "object",
                        fields: [{
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 82
                          },
                          name: "testCaseName",
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
                          name: "testName",
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
                          name: "type",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 84
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 85
                          },
                          name: "time",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 85
                            },
                            kind: "number"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 86
                          },
                          name: "message",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 86
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 87
                          },
                          name: "stacktrace",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 87
                            },
                            kind: "nullable",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckProject.js",
                                line: 87
                              },
                              kind: "string"
                            }
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 88
                          },
                          name: "stdOut",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 88
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckProject.js",
                            line: 89
                          },
                          name: "stdErr",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckProject.js",
                              line: 89
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
      line: 96
    },
    name: "BaseBuckBuildOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 96
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 97
        },
        name: "install",
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
        name: "test",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 98
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 99
        },
        name: "simulator",
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
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 100
        },
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 100
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 100
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
          line: 102
        },
        name: "commandOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 102
          },
          kind: "named",
          name: "Object"
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
      line: 128
    },
    constructorArgs: [{
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 138
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 138
          },
          name: "rootPath",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 138
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
        line: 155
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 155
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 155
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 155
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 155
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
        line: 143
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 143
        },
        kind: "void"
      }
    }], ["getPath", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 147
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 147
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 147
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }], ["getBuildFile", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 162
      },
      kind: "function",
      argumentTypes: [{
        name: "targetName",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 162
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 162
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 162
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 162
            },
            kind: "string"
          }
        }
      }
    }], ["getOwner", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 214
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 214
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 214
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 214
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 214
            },
            kind: "string"
          }
        }
      }
    }], ["getBuckConfig", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 232
      },
      kind: "function",
      argumentTypes: [{
        name: "section",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 232
          },
          kind: "string"
        }
      }, {
        name: "property",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 232
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 232
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 232
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 232
            },
            kind: "string"
          }
        }
      }
    }], ["build", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 269
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 270
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 270
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
            line: 271
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 271
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
          line: 272
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 272
          },
          kind: "any"
        }
      }
    }], ["install", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 289
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 290
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 290
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
            line: 291
          },
          kind: "nullable",
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
        name: "runOptions",
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
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 293
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 293
          },
          kind: "any"
        }
      }
    }], ["buildWithOutput", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 340
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 341
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 341
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 342
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 342
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["testWithOutput", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 357
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 358
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 358
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 359
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 359
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["installWithOutput", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 374
      },
      kind: "function",
      argumentTypes: [{
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 375
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 375
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
            line: 376
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 376
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
            line: 377
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 377
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
          line: 378
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 378
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }], ["listAliases", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 447
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 447
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 447
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 447
            },
            kind: "string"
          }
        }
      }
    }], ["resolveAlias", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 457
      },
      kind: "function",
      argumentTypes: [{
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 457
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 457
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 457
          },
          kind: "string"
        }
      }
    }], ["outputFileFor", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 468
      },
      kind: "function",
      argumentTypes: [{
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 468
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 468
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 468
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 468
            },
            kind: "string"
          }
        }
      }
    }], ["buildRuleTypeFor", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 480
      },
      kind: "function",
      argumentTypes: [{
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 480
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 480
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 480
          },
          kind: "string"
        }
      }
    }], ["getHTTPServerPort", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 505
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 505
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 505
          },
          kind: "number"
        }
      }
    }], ["query", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 513
      },
      kind: "function",
      argumentTypes: [{
        name: "query",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 513
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 513
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 513
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 513
            },
            kind: "string"
          }
        }
      }
    }], ["queryWithArgs", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 529
      },
      kind: "function",
      argumentTypes: [{
        name: "query",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 530
          },
          kind: "string"
        }
      }, {
        name: "args",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 531
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckProject.js",
              line: 531
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 532
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 532
          },
          kind: "object",
          fields: []
        }
      }
    }], ["getWebSocketStream", {
      location: {
        type: "source",
        fileName: "BuckProject.js",
        line: 549
      },
      kind: "function",
      argumentTypes: [{
        name: "httpPort",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 549
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckProject.js",
          line: 549
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckProject.js",
            line: 549
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