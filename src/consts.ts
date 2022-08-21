export const INITIAL_PROJECT_NAME = 'vitepress-project'

export const RENAME_FILES = {
  // rename _gitignore after the fact to prevent npm from renaming it to .npmignore
  // see https://github.com/npm/npm/issues/1862
  _gitignore: '.gitignore'
}

export const enum TEMPLATES {
  BASIC = 'basic'
}
