import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'stencil-to-do-list',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      baseUrl: 'https://fgotts2s.github.io/stencil-to-do-list/',
      serviceWorker: null
    },
  ],
};
