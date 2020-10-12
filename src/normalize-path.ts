import isWSL from "is-wsl";
import { spawn } from "@malept/cross-spawn-promise";

/**
 * Provides a human-friendly error message when `@malept/cross-spawn-promise` can't find `wslpath`.
 */
function updateWSLPathError(error: NodeJS.ErrnoException) {
  if (error.code === "ENOENT" && error.syscall === "spawn wslpath") {
    error.message = `Could not find 'wslpath' in any of the directories listed in the PATH environment variable, which is needed to convert WSL paths to Windows-style paths.`;
  }
}

/**
 * Converts a UNIX-style path to a Windows-style path via `wslpath`, which should come with any
 * WSL distribution.
 */
export async function convertUNIXPathToWindows(
  wslPath: string
): Promise<string> {
  const output = await spawn("wslpath", ["-w", wslPath], {
    updateErrorCallback: updateWSLPathError,
  });
  return output.trim();
}

/**
 * Converts a UNIX-style path to a Windows-style path if run in a WSL environment.
 */
export async function normalizePath(pathToNormalize: string): Promise<string> {
  if (isWSL) {
    return convertUNIXPathToWindows(pathToNormalize);
  }

  return pathToNormalize;
}
