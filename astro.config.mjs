// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  redirects: {
    "/blog/create-a-responsive-form-for-static-websites": "/",
    "/blog/how-to-create-a-loading-screen-animation-with-spinkit": "/",
    "/blog/create-sticky-navigation-with-jQuery-Waypoints": "/",
    "/blog/sass-inception-rule-is-broken": "/",
    "/blog/simple-or-easy": "/",
    "/blog/dont-mock-in-jest": "/blog/how-to-test-react-router-components",
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },
});
