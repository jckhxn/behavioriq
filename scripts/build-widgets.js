#!/usr/bin/env node

const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isDev = process.argv.includes('--watch');
const widgetsDir = path.join(__dirname, '..', 'lib', 'chatgpt', 'mcp', 'widgets');
const srcDir = path.join(widgetsDir, 'src');
const distDir = path.join(widgetsDir, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Widget entry points
const widgets = [
  'TrialAssessment',
  'FullAssessment',
  'Results',
  'Checkout',
  'AuthPrompt',
];

const entryPoints = {};
widgets.forEach(widget => {
  entryPoints[widget] = path.join(srcDir, `${widget}.tsx`);
});

const buildOptions = {
  entryPoints,
  outdir: distDir,
  bundle: true,
  minify: !isDev,
  sourcemap: isDev ? 'inline' : false,
  target: ['es2020'],
  platform: 'browser',
  format: 'esm',
  external: [],
  // Use require to handle external packages
  packages: 'external',
  // Plugins for handling CSS
  loader: {
    '.css': 'css',
  },
  logLevel: 'info',
};

async function build() {
  // Skip widget build if source directory doesn't exist
  if (!fs.existsSync(srcDir)) {
    console.log('⏭️  Skipping widget build - source directory not found');
    return;
  }

  try {
    if (isDev) {
      console.log('🚀 Starting widget build in watch mode...');
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
    } else {
      console.log('🏗️  Building widgets...');
      const result = await esbuild.build(buildOptions);
      console.log('✅ Widgets built successfully');

      // List built files
      console.log('\nBuilt files:');
      widgets.forEach(widget => {
        const outFile = path.join(distDir, `${widget}.js`);
        if (fs.existsSync(outFile)) {
          const stats = fs.statSync(outFile);
          console.log(`  ${widget}.js (${formatBytes(stats.size)})`);
        }
      });
    }
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

build();
