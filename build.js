const esbuild = require('esbuild');
const isWatch = process.argv.includes('--watch');

// Enable source maps only for watch/dev (not production build)
const sharedConfig = {
  bundle: true,
  minify: !isWatch,
  sourcemap: isWatch,
  logLevel: 'info'
};

async function run() {
  try {
    const tasks = [
      {
        name: 'main-js',
        options: {
          ...sharedConfig,
          entryPoints: ['src/assets/js/index.js'],
          outfile: 'src/public/build/bundle.js'
        }
      },
      {
        name: 'dashboard-js',
        options: {
          ...sharedConfig,
          entryPoints: ['src/public/js/dashboard.js'],
          outfile: 'src/public/build/dashboard.bundle.js'
        }
      },
      {
        name: 'css',
        options: {
          ...sharedConfig,
          entryPoints: ['src/assets/css/index.css'],
          outfile: 'src/public/build/bundle.css',
          loader: {
            '.woff': 'file',
            '.woff2': 'file',
            '.ttf': 'file',
            '.eot': 'file',
            '.svg': 'file'
          }
        }
      }
    ];

    if (isWatch) {
      const contexts = await Promise.all(
        tasks.map(async (t) => {
          const ctx = await esbuild.context(t.options);
          await ctx.watch();
          console.log(`[watch] ${t.name} -> ${t.options.outfile}`);
          return ctx;
        })
      );
      // Keep process alive while watching
      process.stdin.resume();
      return contexts;
    }

  await Promise.all(tasks.map((t) => esbuild.build(t.options)));
    // Emit manifest.json (only runtime asset filenames)
    const manifest = {
      generatedAt: new Date().toISOString(),
      watch: isWatch,
      assets: tasks.map((t) => ({ type: t.name, file: t.options.outfile.replace('src/public/', '') }))
    };
    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, 'src', 'public', 'build', 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log('Build completed');
  } catch (err) {
    console.error('Build failed', err);
    process.exit(1);
  }
}

run();
