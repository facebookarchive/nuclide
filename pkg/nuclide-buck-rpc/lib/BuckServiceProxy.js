"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getRootForPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "file",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 153
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getRootForPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 153
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 153
          },
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.getBuildFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 160
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "targetName",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 160
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getBuildFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 160
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 160
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getOwner = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 222
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 222
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getOwner", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 222
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 222
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.getBuckConfig = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 241
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "section",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 242
        },
        kind: "string"
      }
    }, {
      name: "property",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 243
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getBuckConfig", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 244
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 244
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.build = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 278
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 279
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 279
          },
          kind: "string"
        }
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 280
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 280
          },
          kind: "named",
          name: "BaseBuckBuildOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/build", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 281
        },
        kind: "any"
      });
    });
  };

  remoteModule.install = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 297
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 298
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 298
          },
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 299
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 299
          },
          kind: "string"
        }
      }
    }, {
      name: "runOptions",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 300
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 300
          },
          kind: "named",
          name: "BuckRunOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/install", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 301
        },
        kind: "any"
      });
    });
  };

  remoteModule.buildWithOutput = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 359
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 360
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
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
          fileName: "BuckService.js",
          line: 361
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 361
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/buildWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 362
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.testWithOutput = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 378
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 379
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 379
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 380
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 380
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/testWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 381
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.installWithOutput = function (arg0, arg1, arg2, arg3, arg4) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 397
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "buildTargets",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 398
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 398
          },
          kind: "string"
        }
      }
    }, {
      name: "extraArguments",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 399
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 399
          },
          kind: "string"
        }
      }
    }, {
      name: "simulator",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 400
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 400
          },
          kind: "string"
        }
      }
    }, {
      name: "runOptions",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 401
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 401
          },
          kind: "named",
          name: "BuckRunOptions"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/installWithOutput", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 402
        },
        kind: "named",
        name: "ProcessMessage"
      });
    }).publish();
  };

  remoteModule.listAliases = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 477
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/listAliases", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 477
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 477
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.resolveAlias = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 487
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 487
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/resolveAlias", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 487
        },
        kind: "string"
      });
    });
  };

  remoteModule.showOutput = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 501
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 502
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/showOutput", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 503
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 503
          },
          kind: "named",
          name: "Object"
        }
      });
    });
  };

  remoteModule.buildRuleTypeFor = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 510
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "aliasOrTarget",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 511
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/buildRuleTypeFor", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 512
        },
        kind: "string"
      });
    });
  };

  remoteModule.getHTTPServerPort = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 538
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getHTTPServerPort", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 539
        },
        kind: "number"
      });
    });
  };

  remoteModule.query = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 548
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 549
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/query", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 550
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 550
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.queryWithArgs = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 567
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 568
        },
        kind: "string"
      }
    }, {
      name: "args",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 569
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 569
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/queryWithArgs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 570
        },
        kind: "object",
        fields: []
      });
    });
  };

  remoteModule.getWebSocketStream = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "rootPath",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 588
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "httpPort",
      type: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 589
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("BuckService/getWebSocketStream", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 590
        },
        kind: "named",
        name: "Object"
      });
    }).publish();
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
  }], ["dontRunOptions", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 37
    },
    name: "dontRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 37
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 38
        },
        name: "run",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 38
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
      fileName: "BuckService.js",
      line: 41
    },
    name: "doRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 41
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 42
        },
        name: "run",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 42
          },
          kind: "boolean-literal",
          value: true
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 43
        },
        name: "debug",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 43
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
      fileName: "BuckService.js",
      line: 46
    },
    name: "BuckRunOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 46
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 37
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 38
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 38
            },
            kind: "boolean-literal",
            value: false
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 41
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 42
          },
          name: "run",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 42
            },
            kind: "boolean-literal",
            value: true
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 43
          },
          name: "debug",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 43
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
      fileName: "BuckService.js",
      line: 48
    },
    name: "BuckWebSocketMessage",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 48
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 48
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 50
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 50
            },
            kind: "string-literal",
            value: "SocketConnected"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 51
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 52
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 52
            },
            kind: "string-literal",
            value: "BuildProgressUpdated"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 53
          },
          name: "progressValue",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 53
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 54
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 55
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 55
            },
            kind: "string-literal",
            value: "BuildFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 56
          },
          name: "exitCode",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 56
            },
            kind: "number"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 57
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 58
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 58
            },
            kind: "string-literal",
            value: "BuildStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 59
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 60
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 60
            },
            kind: "string-literal",
            value: "ConsoleEvent"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 61
          },
          name: "message",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 61
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 62
          },
          name: "level",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 62
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 63
              },
              name: "name",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 63
                },
                kind: "union",
                types: [{
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 63
                  },
                  kind: "string-literal",
                  value: "OFF"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 63
                  },
                  kind: "string-literal",
                  value: "SEVERE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 63
                  },
                  kind: "string-literal",
                  value: "WARNING"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 63
                  },
                  kind: "string-literal",
                  value: "INFO"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 63
                  },
                  kind: "string-literal",
                  value: "CONFIG"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 63
                  },
                  kind: "string-literal",
                  value: "FINE"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 63
                  },
                  kind: "string-literal",
                  value: "FINER"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 63
                  },
                  kind: "string-literal",
                  value: "FINEST"
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 63
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
          fileName: "BuckService.js",
          line: 65
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 66
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 66
            },
            kind: "string-literal",
            value: "ParseStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 67
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 68
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 68
            },
            kind: "string-literal",
            value: "ParseFinished"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 69
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 70
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 70
            },
            kind: "string-literal",
            value: "InstallFinished"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 71
          },
          name: "success",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 71
            },
            kind: "boolean"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 72
          },
          name: "pid",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 72
            },
            kind: "number"
          },
          optional: true
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 73
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 74
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 74
            },
            kind: "string-literal",
            value: "RunStarted"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 75
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 76
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 76
            },
            kind: "string-literal",
            value: "RunComplete"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 77
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 78
          },
          name: "type",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 78
            },
            kind: "string-literal",
            value: "ResultsAvailable"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 79
          },
          name: "results",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 79
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 80
              },
              name: "buildTarget",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 80
                },
                kind: "object",
                fields: [{
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 81
                  },
                  name: "shortName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 81
                    },
                    kind: "string"
                  },
                  optional: false
                }, {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 82
                  },
                  name: "baseName",
                  type: {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 82
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
                fileName: "BuckService.js",
                line: 84
              },
              name: "success",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 84
                },
                kind: "boolean"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 85
              },
              name: "failureCount",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 85
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 86
              },
              name: "totalNumberOfTests",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 86
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "BuckService.js",
                line: 87
              },
              name: "testCases",
              type: {
                location: {
                  type: "source",
                  fileName: "BuckService.js",
                  line: 87
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "BuckService.js",
                    line: 87
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 88
                    },
                    name: "success",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 88
                      },
                      kind: "boolean"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 89
                    },
                    name: "failureCount",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 89
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 90
                    },
                    name: "skippedCount",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 90
                      },
                      kind: "number"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 91
                    },
                    name: "testCaseName",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 91
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "BuckService.js",
                      line: 92
                    },
                    name: "testResults",
                    type: {
                      location: {
                        type: "source",
                        fileName: "BuckService.js",
                        line: 92
                      },
                      kind: "array",
                      type: {
                        location: {
                          type: "source",
                          fileName: "BuckService.js",
                          line: 92
                        },
                        kind: "object",
                        fields: [{
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 93
                          },
                          name: "testCaseName",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 93
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 94
                          },
                          name: "testName",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 94
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 95
                          },
                          name: "type",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 95
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 96
                          },
                          name: "time",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 96
                            },
                            kind: "number"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 97
                          },
                          name: "message",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 97
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 98
                          },
                          name: "stacktrace",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 98
                            },
                            kind: "nullable",
                            type: {
                              location: {
                                type: "source",
                                fileName: "BuckService.js",
                                line: 98
                              },
                              kind: "string"
                            }
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 99
                          },
                          name: "stdOut",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 99
                            },
                            kind: "string"
                          },
                          optional: false
                        }, {
                          location: {
                            type: "source",
                            fileName: "BuckService.js",
                            line: 100
                          },
                          name: "stdErr",
                          type: {
                            location: {
                              type: "source",
                              fileName: "BuckService.js",
                              line: 100
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
      fileName: "BuckService.js",
      line: 107
    },
    name: "BaseBuckBuildOptions",
    definition: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 107
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 108
        },
        name: "install",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 108
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 109
        },
        name: "test",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 109
          },
          kind: "boolean"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 110
        },
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 110
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 110
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 111
        },
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 111
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 111
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 113
        },
        name: "commandOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 113
          },
          kind: "named",
          name: "Object"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 114
        },
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 114
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 114
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["getRootForPath", {
    kind: "function",
    name: "getRootForPath",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 153
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 153
      },
      kind: "function",
      argumentTypes: [{
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 153
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 153
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 153
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 153
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    }
  }], ["getBuildFile", {
    kind: "function",
    name: "getBuildFile",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 160
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 160
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 160
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "targetName",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 160
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 160
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 160
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 160
            },
            kind: "string"
          }
        }
      }
    }
  }], ["getOwner", {
    kind: "function",
    name: "getOwner",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 222
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 222
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 222
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 222
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 222
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 222
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 222
            },
            kind: "string"
          }
        }
      }
    }
  }], ["getBuckConfig", {
    kind: "function",
    name: "getBuckConfig",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 240
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 240
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 241
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "section",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 242
          },
          kind: "string"
        }
      }, {
        name: "property",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 243
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 244
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 244
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 244
            },
            kind: "string"
          }
        }
      }
    }
  }], ["build", {
    kind: "function",
    name: "build",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 277
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 277
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 278
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 279
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 279
            },
            kind: "string"
          }
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 280
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 280
            },
            kind: "named",
            name: "BaseBuckBuildOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 281
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 281
          },
          kind: "any"
        }
      }
    }
  }], ["install", {
    kind: "function",
    name: "install",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 296
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 296
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 297
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 298
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 298
            },
            kind: "string"
          }
        }
      }, {
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 299
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 299
            },
            kind: "string"
          }
        }
      }, {
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 300
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 300
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 301
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 301
          },
          kind: "any"
        }
      }
    }
  }], ["buildWithOutput", {
    kind: "function",
    name: "buildWithOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 358
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 358
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 359
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 360
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
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
            fileName: "BuckService.js",
            line: 361
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 361
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 362
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 362
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["testWithOutput", {
    kind: "function",
    name: "testWithOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 377
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 377
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 378
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 379
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 379
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 380
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 380
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 381
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 381
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["installWithOutput", {
    kind: "function",
    name: "installWithOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 396
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 396
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 397
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "buildTargets",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 398
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 398
            },
            kind: "string"
          }
        }
      }, {
        name: "extraArguments",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 399
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 399
            },
            kind: "string"
          }
        }
      }, {
        name: "simulator",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 400
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 400
            },
            kind: "string"
          }
        }
      }, {
        name: "runOptions",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 401
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 401
            },
            kind: "named",
            name: "BuckRunOptions"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 402
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 402
          },
          kind: "named",
          name: "ProcessMessage"
        }
      }
    }
  }], ["listAliases", {
    kind: "function",
    name: "listAliases",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 477
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 477
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 477
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 477
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 477
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 477
            },
            kind: "string"
          }
        }
      }
    }
  }], ["resolveAlias", {
    kind: "function",
    name: "resolveAlias",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 487
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 487
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 487
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 487
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 487
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 487
          },
          kind: "string"
        }
      }
    }
  }], ["showOutput", {
    kind: "function",
    name: "showOutput",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 500
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 500
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 501
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 502
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 503
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 503
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 503
            },
            kind: "named",
            name: "Object"
          }
        }
      }
    }
  }], ["buildRuleTypeFor", {
    kind: "function",
    name: "buildRuleTypeFor",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 509
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 509
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 510
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "aliasOrTarget",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 511
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 512
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 512
          },
          kind: "string"
        }
      }
    }
  }], ["getHTTPServerPort", {
    kind: "function",
    name: "getHTTPServerPort",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 537
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 537
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 538
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 539
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 539
          },
          kind: "number"
        }
      }
    }
  }], ["query", {
    kind: "function",
    name: "query",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 547
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 547
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 548
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "queryString",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 549
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 550
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 550
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 550
            },
            kind: "string"
          }
        }
      }
    }
  }], ["queryWithArgs", {
    kind: "function",
    name: "queryWithArgs",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 566
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 566
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 567
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "queryString",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 568
          },
          kind: "string"
        }
      }, {
        name: "args",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 569
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "BuckService.js",
              line: 569
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 570
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 570
          },
          kind: "object",
          fields: []
        }
      }
    }
  }], ["getWebSocketStream", {
    kind: "function",
    name: "getWebSocketStream",
    location: {
      type: "source",
      fileName: "BuckService.js",
      line: 587
    },
    type: {
      location: {
        type: "source",
        fileName: "BuckService.js",
        line: 587
      },
      kind: "function",
      argumentTypes: [{
        name: "rootPath",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 588
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "httpPort",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 589
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "BuckService.js",
          line: 590
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "BuckService.js",
            line: 590
          },
          kind: "named",
          name: "Object"
        }
      }
    }
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