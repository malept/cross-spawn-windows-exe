import {
  CrossSpawnArgs,
  CrossSpawnOptions,
  spawn,
} from "@malept/cross-spawn-promise";
import * as fs from "fs";
import isWSL from "is-wsl";
import * as path from "path";
import which from "which";

export function canRunWindowsExeNatively(): boolean {
  return process.platform === "win32" || isWSL;
}

/**
 * The exception thrown when the wrapper command could not be found to execute.
 */
export class WrapperError extends Error {
  /**
   * @param wrapperCommand - The wrapper that tried to be executed
   * @param installInstructions - Instructions on how to install the wrapper
   */
  constructor(wrapperCommand: string, installInstructions?: string) {
    const message = `Wrapper command '${wrapperCommand}' not found on the system.${
      installInstructions ? " " + installInstructions : ""
    }`;
    super(message);
  }
}

/**
 * A function which determines the wrapper path or binary to use in [[spawnWrapper]].
 *
 * @param customPath - The path specified by [[CrossSpawnExeOptions|CrossSpawnExeOptions.wrapperCommand]], usually
 * prioritized over other paths/binaries in the function.
 */
export type DetermineWrapperFunction = (customPath?: string) => string;

/**
 * An extension to `CrossSpawnOptions` to optionally specify a custom wrapper command and
 * instructions to install the wrapper.
 */
export type CrossSpawnExeOptions = CrossSpawnOptions & {
  /**
   * The path to a binary that wraps the called executable.
   *
   * Defaults to `wine64` or `wine`, depending on the host machine's architecture.
   */
  wrapperCommand?: string;

  /**
   * Instructions for installing the wrapper binary.
   */
  wrapperInstructions?: string;
};

/**
 * Determines if the specified command exists, either in the `PATH` environment variable or if the
 * absolute path exists.
 */
export async function wrapperCommandExists(
  wrapperCommand: string
): Promise<boolean> {
  if (path.isAbsolute(wrapperCommand)) {
    return fs.existsSync(wrapperCommand);
  } else {
    try {
      await which(wrapperCommand);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * A wrapper for `cross-spawn`'s `spawn` function that wraps the `cmd` with `wrapperCommand` if it
 * is specified.
 */
export async function spawnWrapper(
  cmd: string,
  args?: CrossSpawnArgs,
  options?: CrossSpawnExeOptions
): Promise<string> {
  options ??= {} as CrossSpawnExeOptions;

  const { wrapperCommand, wrapperInstructions, ...crossSpawnOptions } = options;
  if (wrapperCommand) {
    if (!(await wrapperCommandExists(wrapperCommand))) {
      throw new WrapperError(wrapperCommand, wrapperInstructions);
    }

    const augmentedArgs = args ? [cmd, ...args] : [cmd];

    return spawn(wrapperCommand, augmentedArgs, crossSpawnOptions);
  }

  return spawn(cmd, args, crossSpawnOptions);
}

/**
 * A helper variant of [[spawnWrapper]] which uses a [[DetermineWrapperFunction]] to
 * determine `wrapperCommand`.
 */
export async function spawnWrapperFromFunction(
  wrapperFunction: DetermineWrapperFunction,
  cmd: string,
  args?: CrossSpawnArgs,
  options?: CrossSpawnExeOptions
): Promise<string> {
  let exeOptions = options;
  if (!canRunWindowsExeNatively()) {
    const wrapperCommand: string = wrapperFunction(options?.wrapperCommand);
    exeOptions = options ? { ...options, wrapperCommand } : { wrapperCommand };
  }
  return spawnWrapper(cmd, args, exeOptions);
}
