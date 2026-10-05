import { rm, writeFile } from 'node:fs/promises'
import { build } from 'vite'

await rm('dist', { recursive: true, force: true })
for (const version of ['review', 'public']) {
  await build({ mode: version })
  await writeFile(`dist/${version}/.nojekyll`, '')
}

await writeFile('dist/.nojekyll', '')
await writeFile('dist/index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MIRROR</title>
    <script>
      window.location.replace('/public/' + window.location.search + window.location.hash);
    </script>
    <meta http-equiv="refresh" content="0; url=/public/" />
  </head>
  <body>
    <p>Continue to the <a href="/public/">MIRROR public page</a>.</p>
  </body>
</html>
`)
