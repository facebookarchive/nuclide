/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/**
 * Responsible for locating source file using class/source file paths.
 */
public class SourceLocator {
  // TODO: use ReadWriteLock if perf is an issue.
  private final Object _sourceSearchPathsLock = new Object();
  private final List<String> _sourceSearchPaths = new ArrayList<>();
  private final ContextManager _contextManager;

  public SourceLocator(ContextManager contextManager) {
    _contextManager = contextManager;
  }

  /**
   * @param classPath class paths separated with ":".
   */
  public void setClassPath(String classPath) {
    synchronized (_sourceSearchPathsLock) {
      _sourceSearchPaths.addAll(Arrays.asList(classPath.split(":")));
    }
  }

  /**
   * @param sourcePath source paths separated with ":".
   */
  public void setSourcePath(String sourcePath) {
    synchronized (_sourceSearchPathsLock) {
      _sourceSearchPaths.addAll(Arrays.asList(sourcePath.split(":")));
    }
  }

  /**
   * Add single potential source search path.
   */
  public void addPotentialPath(String filePath) {
    File f = new File(filePath);
    if (!f.exists()) {
      // Only add existed path.
      return;
    }
    synchronized (_sourceSearchPathsLock) {
      if (f.isDirectory()) {
        _sourceSearchPaths.add(filePath);
      } else {
        _sourceSearchPaths.add(f.getParent().toString());
      }
    }
  }

  /**
   * Search source file for input originalSourceFilePath.
   */
  public Optional<File> findSourceFile(String originalSourceFilePath) {
    // TODO: add package name into search heuristic.
    synchronized (_sourceSearchPathsLock) {
      for (String sourceSearchPath : _sourceSearchPaths) {
        File file = new File(sourceSearchPath, originalSourceFilePath);
        if (file.exists()) {
          return Optional.of(file);
        }
      }
    }
    return Optional.empty();
  }
}
