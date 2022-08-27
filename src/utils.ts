import picocolors from 'picocolors'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import {
  rmSync,
  statSync,
  mkdirSync,
  existsSync,
  readdirSync,
  copyFileSync
} from 'node:fs'
import { TEMPLATES } from './consts'

export const cwd = process.cwd()

export const resolveTemplateDir = (name = TEMPLATES.BASIC) => {
  return resolve(dirname(fileURLToPath(import.meta.url)), '../templates', name)
}

export const logError = (message: string) => {
  console.log(picocolors.red(`× ${message}`))
}

export const isDirectory = (path: string) => {
  return statSync(path).isDirectory()
}

export const formatProjectName = (name: string | undefined) => {
  return name?.trim().replace(/\/+$/g, '')
}

export const resolveProjectPath = (name: string) => {
  return name === '.' ? cwd : resolve(cwd, name)
}

export const isDirAvailable = (path: string) => {
  if (!existsSync(path)) return true
  const files = readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

export const ensureDirAvailable = (path: string) => {
  if (!existsSync(path)) {
    mkdirSync(path)
    return
  }
  for (const file of readdirSync(path)) {
    if (file === '.git') continue
    rmSync(resolve(path, file), { force: true, recursive: true })
  }
}

export const copy = (src: string, dest: string) => {
  if (!isDirectory(src)) {
    copyFileSync(src, dest)
  } else {
    mkdirSync(dest, { recursive: true })
    for (const file of readdirSync(src)) {
      copy(resolve(src, file), resolve(dest, file))
    }
  }
}

export const getPackageManager = () => {
  const userAgent = process.env.npm_config_user_agent
  return userAgent?.split(' ')[0].split('/')[0] ?? 'npm'
}
