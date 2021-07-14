import { CrossSpawnArgs } from "@malept/cross-spawn-promise";
import { CrossSpawnExeOptions, spawnWrapperFromFunction } from "./wrapper";
import { is64BitArch } from "./arch";

export function exeDependencyInstallInstructions(): string {
  switch (process.platform) {
    /* istanbul ignore next */
    case "win32":
      return "No wrapper necessary";
    case "darwin":
      return "Run `brew install --cask wine-stable` to install 64-bit wine on macOS via Homebrew.";
    case "linux":
      return "Consult your Linux distribution's package manager to determine how to install Wine.";
    /* istanbul ignore next */
    default:
      return "Consult your operating system's package manager to determine how to install Wine.";
  }
}

/**
 * Heuristically determine the path to `wine` to use.
 *
 * Method used to determine the path:
 *
 * 1. `customWinePath`, if provided to the function
 * 2. The `WINE_BINARY` environment variable, if set and non-empty
 * 3. If the host architecture is x86-64, `wine64` found by searching the directories in the `PATH`
 *    environment variable
 * 4. `wine` found by searching the directories in the `PATH` environment variable
 */
export function determineWineWrapper(customWinePath?: string): string {
  if (customWinePath) {
    return customWinePath;
  }

  if (process.env.WINE_BINARY) {
    return process.env.WINE_BINARY;
  }

  if (is64BitArch(process.arch)) {
    return "wine64";
  }

  return "wine";
}

/**
 * Spawn a Windows executable. On non-Windows platforms, use [Wine](https://www.winehq.org/)
 * to run it.
 */
export async function spawnExe(
  cmd: string,
  args?: CrossSpawnArgs,
  options?: CrossSpawnExeOptions
): Promise<string> {
  options ??= {};
  options.wrapperInstructions ??= exeDependencyInstallInstructions();
  return spawnWrapperFromFunction(determineWineWrapper, cmd, args, options);
}
