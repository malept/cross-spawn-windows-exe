import { CrossSpawnArgs } from "@malept/cross-spawn-promise";
import { CrossSpawnExeOptions, spawnWrapperFromFunction } from "./wrapper";

/**
 * Heuristically determine the path to `mono` to use.
 *
 * Method used to determine the path:
 *
 * 1. `customDotNetPath`, if provided to the function
 * 2. The `MONO_BINARY` environment variable, if set and non-empty
 * 3. `mono` found by searching the directories in the `PATH` environment variable
 */
export function determineDotNetWrapper(customDotNetPath?: string): string {
  if (customDotNetPath) {
    return customDotNetPath;
  }

  if (process.env.MONO_BINARY) {
    return process.env.MONO_BINARY;
  }

  return "mono";
}

/**
 * Spawn a .NET executable. On non-Windows platforms, use [Nono](https://www.mono-project.com/)
 * to run it.
 */
export async function spawnDotNet(
  cmd: string,
  args?: CrossSpawnArgs,
  options?: CrossSpawnExeOptions
): Promise<string> {
  return spawnWrapperFromFunction(determineDotNetWrapper, cmd, args, options);
}
