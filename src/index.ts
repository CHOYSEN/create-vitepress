#!/usr/bin/env node
import mri from 'mri'
import prompts from 'prompts'
import picocolors from 'picocolors'
import { join, relative } from 'node:path'
import { readdirSync, existsSync } from 'node:fs'
import {
  cwd,
  copy,
  logError,
  isDirectory,
  isDirAvailable,
  getPackageManager,
  formatProjectName,
  resolveProjectPath,
  ensureDirAvailable,
  resolveTemplateDir
} from './utils'
import { RENAME_FILES, INITIAL_PROJECT_NAME } from './consts'

// avoids autoconversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string
// see https://github.com/vitejs/vite/pull/4606
const argv = mri(process.argv.slice(2), { string: ['_'] })

!(async () => {
  let projectName = formatProjectName(argv._[0])

  if (!projectName) {
    const { projectNameInput } = await prompts({
      type: 'text',
      name: 'projectNameInput',
      message: 'Project name:',
      initial: INITIAL_PROJECT_NAME,
      format: (value) => formatProjectName(value) || INITIAL_PROJECT_NAME
    })
    if (!projectNameInput) {
      logError('Operation cancelled')
      return
    }
    projectName = projectNameInput
  }

  const projectPath = resolveProjectPath(projectName)

  if (existsSync(projectPath) && !isDirectory(projectPath)) {
    logError(`Path "${projectPath}" is already exists a file`)
    return
  }

  if (!isDirAvailable(projectPath)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message:
        (projectName === '.'
          ? 'Current directory'
          : `Target directory "${projectPath}"`) +
        ` is not empty. Remove existing files and continue?`
    })
    if (!overwrite) {
      logError('Operation cancelled')
      return
    }
  }

  ensureDirAvailable(projectPath)

  console.log(`\nScaffolding project in ${projectPath}...\n`)

  const templateDir = resolveTemplateDir()
  for (const file of readdirSync(templateDir)) {
    const srcPath = join(templateDir, file)
    const destPath = join(projectPath, RENAME_FILES[file] ?? file)
    copy(srcPath, destPath)
  }

  console.log(picocolors.green('Done. Now run:\n'))
  if (projectPath !== cwd) {
    console.log(picocolors.bold(`  cd ${relative(cwd, projectPath)}`))
  }

  const packageManager = getPackageManager()
  console.log(picocolors.bold(`  ${packageManager} install`))
  console.log(picocolors.bold(`  ${packageManager} run dev\n`))
})()
