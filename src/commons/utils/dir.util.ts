import { join } from 'path';

/**
 * Get the root directory of the project.
 * File placed in src/commons/utils/dir.util.ts
 *
 * @returns {string} The root directory of the project.
 */
export function getRootDir(): string {
    return join(__dirname, '..', '..', '..');
}
