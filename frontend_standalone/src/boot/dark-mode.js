// src/boot/dark-mode.js

/**
 * Dark mode initialization using the ThemeService
 * This is a thin wrapper that re-exports the theme-service boot file
 * for backward compatibility
 */

import themeServiceBootFile from './theme-service'

// Simply re-export the theme service boot function
export default themeServiceBootFile
