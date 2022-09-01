import { join, basename } from 'node:path'
import { rmSync, readdirSync } from 'node:fs'
import { it, expect, afterEach } from 'vitest'
import { execaCommandSync, type SyncOptions } from 'execa'

import { RENAME_FILES } from '../src/consts'
import { resolveTemplateDir } from '../src/utils'

const BASE_COMMAND =
  join(__dirname, '../node_modules/.bin/tsx') + ' ' + join(__dirname, '../src')

const TEST_PROJECT_NAME = 'test_path'
const TEST_PROJECT_PATH = join(__dirname, TEST_PROJECT_NAME)

const run = (args: string[], options: SyncOptions = {}) => {
  return execaCommandSync(`${BASE_COMMAND} ${args.join(' ')}`, {
    cwd: __dirname,
    ...options
  })
}

afterEach(() =>
  rmSync(TEST_PROJECT_PATH, {
    force: true,
    recursive: true
  })
)

it('should ask for the project name if none supplied', () => {
  const { stdout } = run([])
  expect(stdout).toContain('Project name:')
})

it('should log error when specified path is a file', () => {
  const { stdout } = run([basename(__filename)])
  expect(stdout).toContain(`Path "${__filename}" is already exists a file`)
})

it('should ask to overwrite non-empty directory', () => {
  const { stdout } = run(['.'])
  expect(stdout).toContain(
    `Current directory is not empty. Remove existing files and continue?`
  )
})

it('should scaffold a project successfully', () => {
  const { stdout } = run([TEST_PROJECT_NAME])
  const templateFiles = readdirSync(resolveTemplateDir())
    .map((file) => RENAME_FILES[file] ?? file)
    .sort()
  const generatedFiles = readdirSync(TEST_PROJECT_PATH).sort()
  expect(stdout).toContain(`Scaffolding project in ${TEST_PROJECT_PATH}...`)
  expect(generatedFiles).toEqual(templateFiles)
})
