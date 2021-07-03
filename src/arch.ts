// List of Node.js-formatted 64 bit arches
const SIXTY_FOUR_BIT_ARCHES = ["arm64", "x64"];

/**
 * Determines whether the given architecture is a 64-bit arch.
 *
 * @param arch - a Node.js-style architecture name
 */
export function is64BitArch(arch: string): boolean {
  return SIXTY_FOUR_BIT_ARCHES.includes(arch);
}
