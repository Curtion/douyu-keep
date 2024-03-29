const Path = require('node:path')
const FileSystem = require('node:fs')
const Chalk = require('chalk')
const Vite = require('vite')
const compileTs = require('./private/tsc')

function buildRenderer() {
  return Vite.build({
    configFile: Path.join(__dirname, '..', 'vite.config.js'),
    base: './',
    mode: 'production',
  })
}

function buildMain() {
  const mainPath = Path.join(__dirname, '..', 'src', 'main')
  FileSystem.cpSync(
    Path.join(__dirname, '..', 'src', 'main', 'static'),
    Path.join(__dirname, '..', 'build', 'main', 'static'),
    { recursive: true },
  )
  return compileTs(mainPath)
}

FileSystem.rmSync(Path.join(__dirname, '..', 'build'), {
  recursive: true,
  force: true,
})

console.log(Chalk.blueBright('Transpiling renderer & main...'))

Promise.allSettled([
  buildRenderer(),
  buildMain(),
]).then(() => {
  console.log(Chalk.greenBright('Renderer & main successfully transpiled! (ready to be built with electron-builder)'))
})
