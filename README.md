# LandingPage

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### First-time setup

The Apps Script API URLs are not committed to git. Copy the template and fill in your real `/exec` URLs:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.development.ts
```

Both files are gitignored.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Deployment (Render)

`render.yaml` deploys this as a static site. Before the first deploy, set these env vars in the Render dashboard (Environment tab) to your deployed Apps Script `/exec` URLs — they are marked `sync: false` in `render.yaml` so they are never stored in the repo:

- `EXPERIENCE_API_URL`
- `CAREERS_API_URL`
- `DEVELOPER_PROFILES_API_URL`
- `LEAD_MAGNET_API_URL`

The build's `prebuild` step (`scripts/generate-env.js`) writes `src/environments/environment.ts` from these vars before `ng build` runs. If you rotate an Apps Script deployment (new `/exec` URL), just update the corresponding value in Render and redeploy — no code change needed.

## Hero carousel images

The full-resolution originals of the three hero photographs live in `assets-src/hero-carousel/`
and are **not** deployed — only the responsive WebP variants in `public/hero-carousel/` are.
After adding or replacing an original, regenerate those variants (needs Python with Pillow):

```bash
python3 scripts/optimize-hero-images.py
```

The widths it writes (640/960/1440/1920/2560) are the ones the hero's `srcset` asks for, and
`src/index.html` preloads the first slide because it is the landing page's LCP element.

## Testing

This project does not include unit or end-to-end tests.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
