---
title: "Stop checking the environment in your frontend"
description: "Why environment branching in the browser eventually chooses wrong, and the build-time contract that replaces it."
pubDate: 2026-08-10
tags: ["technical"]
---

What's wrong with this code?

```js
const isProd = /^(www\.)?myapp\.com$/.test(window.location.hostname);
const apiKey = isProd ? PRODUCTION_KEY : TEST_KEY;
```

It works until you add a subdomain, migrate the domain, or spin up a preview
environment. In each of these cases, the hostname check will silently return
the test key.

Your instinct may be to make the detection smarter: add hostnames to the regex,
pass an env prop, or read it from context. But the problem isn't how the
frontend detects the environment. It's the branch itself. Any code that chooses
between values by environment will eventually choose wrong, because it can only
handle the environments you've considered.

## Let the build process decide

The better option is not write runtime code to detect the environment. We can
instead read one value before the code runs:

```js
// before
const isProd = /^(www\.)?myapp\.com$/.test(window.location.hostname);
const apiKey = isProd ? PRODUCTION_KEY : TEST_KEY;

// after
const apiKey = process.env.PUBLISHABLE_API_KEY;
```

Whether your build process injects the variable at build time (`VITE_` prefixed
variables in Vite, `NEXT_PUBLIC_` in Next.js, `REACT_APP_` in Create React App)
or at runtime (Docker, a deploy script), each environment determines the value.

The hostname regex, the `isProduction` helper, and the alternate keys all
disappear from the codebase. What remains is a single stable contract instead
of the maintenance burden of checking logically at runtime.

One note on scope: anything bundled into the frontend is client-visible on the
browser. A value that must stay secret should never be used in client-side
code.

This is also how many hosting platforms expect you to work. <a href="https://developers.cloudflare.com/pages/configuration/build-configuration/" target="_blank" rel="nofollow noopener">Cloudflare Pages</a>
supports separate variables for production and preview deployments. <a href="https://docs.netlify.com/build/environment-variables/overview/" target="_blank" rel="nofollow noopener">Netlify</a>
supports deploy-context-specific values. <a href="https://docs.aws.amazon.com/amplify/latest/userguide/setting-env-vars.html" target="_blank" rel="nofollow noopener">AWS Amplify</a>
can scope variables to branches. In each case, deployment configuration answers
the environment question outside the application code.

## The cleaner branch is still a branch

The tempting middle ground is to keep the branch but clean it up:

```js
const apiKey = process.env.NODE_ENV === 'production'
  ? PRODUCTION_KEY
  : TEST_KEY;
```

This looks like an improvement. No regex, no `window.location`, the environment
comes from `process.env`. But the code assumes there are exactly two
environments. Now imagine you launch a white-label version of your app at
`whitelabel.com`. It runs in production, so `NODE_ENV` is `'production'`, and
this function hands it `myapp.com`'s production key. The white-label site needs
its own key, but the branch has no way to express that.

The question this function is answering, *which environment is this?*, is
already answered correctly before your code runs.

Your frontend shouldn't know where it is.

## What about build-tool flags?

One clarification, because build tools also expose flags like this:

```js
if (import.meta.env.DEV) {
  showDebugToolbar();
}
```

Branching on a build-tool flag is fine, and it isn't an exception. `DEV` is a
flag set by the build tool, not determined by application logic. It gates dev
tooling rather than choosing between production values.

Reading a build-tool flag for dev tooling is fine. Application code choosing
between runtime values by environment should move upstream.

Resolve the value upstream, hand the application one stable value, and an entire
class of silent misconfiguration disappears. Tests get simpler for the same
reason: instead of mocking hostnames throughout the codebase, you set one value
in one place.

The frontend's job is to use the key, not to pick one.

## Resources

- [The Twelve-Factor App: Config](https://12factor.net/config)
- [Do Not Rely on NODE_ENV](https://michalzalecki.com/do-not-relay-on-node-env/) by Michal Zalecki
- [Environment variables and configuration anti-patterns in Node.js](https://lirantal.com/blog/environment-variables-configuration-anti-patterns-node-js-applications) by Liran Tal
- [Stop Using NODE_ENV as a Feature Flag](https://medium.com/@aloisbarreras_18569/stop-using-node-env-as-a-feature-flag-c535b48b1b15) by Alois Barreras
