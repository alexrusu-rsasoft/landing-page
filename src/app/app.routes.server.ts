import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Job listings and details are fetched from a live API at request time;
  // there's no fixed set of slugs to prerender, so these stay client-rendered.
  {
    path: 'careers',
    renderMode: RenderMode.Client,
  },
  {
    path: 'careers/:slug',
    renderMode: RenderMode.Client,
  },
  // Vanity attribution links (/via/:channel) just set localStorage and
  // redirect — there's nothing meaningful to prerender, and the channel
  // slugs aren't known at build time.
  {
    path: 'via/:source/:campaign',
    renderMode: RenderMode.Client,
  },
  // Unmatched paths (404s) can't be enumerated at build time.
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
