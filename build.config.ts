import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  failOnWarn: false,
  rollup: {
    inlineDependencies: true,
    esbuild: {
      minify: true
    }
  }
})
