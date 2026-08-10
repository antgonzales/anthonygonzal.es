---
title: "Stop checking NODE_ENV in your frontend"
description: "Why checking process.env.NODE_ENV or hostname in your frontend is an antipattern, and how to let your build process resolve the right value instead."
pubDate: 2026-08-08
tags: []
---

What's wrong with this code?

```js
const isProd = /^(www\.)?myapp\.com$/.test(window.location.hostname);
const apiKey = isProd ? PRODUCTION_KEY : TEST_KEY;
```

It works until someone adds a subdomain, migrates the domain, or spins up a
preview environment nobody anticipated. Then the hostname check silently returns
the wrong key, and the bug surfaces in production.

The instinct is to make the detection smarter: add hostnames to the regex, pass
an env prop, read it from context. But the problem isn't how the frontend
detects its environment. It's the branch itself. Any code that chooses between
values by environment will eventually choose wrong, because it can only handle
the environments someone remembered to write down.

## Let the build process decide

So don't detect, and don't choose. Read one value that resolves before the code
runs:

```js
// before
const isProd = /^(www\.)?myapp\.com$/.test(window.location.hostname);
const apiKey = isProd ? PRODUCTION_KEY : TEST_KEY;

// after
const apiKey = process.env.PUBLISHABLE_API_KEY;
```

Whether your build process injects the variable at build time (`VITE_` prefixed
variables in Vite, `NEXT_PUBLIC_` in Next.js, `REACT_APP_` in Create React
App) or at runtime (Docker, a deploy script), each environment receives its
own value.

The hostname regex, the `isProduction` helper, and the alternate keys all
disappear from the codebase. What remains is a single stable contract: one
name, one value. The preview environment that broke the regex just works,
because its build receives its own key like every other.

One note on scope: anything bundled into the frontend is client-visible by
definition, so this is for publishable configuration. A value that must stay
secret never belongs in the browser at all.

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
flag set by the build tool, not calculated by application logic. It gates dev
tooling rather than choosing between production values.

The line to draw: reading a build-tool flag for dev tooling is fine. Application
code choosing between runtime values by environment should move upstream.

Environment detection in the frontend is the client reaching into knowledge it
doesn't own, re-making a decision the build process already made correctly.

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
