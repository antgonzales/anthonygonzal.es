---
title: "How to keep one broken widget from taking down a dashboard"
description: "Error boundaries become architecture when they define where failures stop, what users see, and which team responds."
pubDate: 2025-11-18
updatedDate: 2026-09-05
tags: ["technical"]
---

A dashboard puts several useful things in one place. That convenience becomes a liability when every widget shares the same fate. If one component throws an error while rendering, React can remove the entire interface.

We faced this problem while building [Compass One](/blog/building-a-transaction-dashboard-on-compass/). Its index page brought together widgets owned by six engineering teams. Listings, transactions, comments, and other parts of the client experience appeared on one screen, but they did not all need to succeed for the screen to remain useful.

We needed failures to stay local. A broken widget should become unavailable without taking its neighbors down with it.

## One boundary around the application is not enough

React error boundaries catch rendering errors in their descendants and replace the failed subtree with fallback UI. At the application root, that prevents an uncaught error from leaving someone with a blank page. It does not preserve much of the product, though. One broken widget still replaces the entire dashboard with one large fallback.

The opposite approach is not much better. Wrapping every small component creates boundaries without meaning. It adds noise, fragments error reporting, and can leave someone looking at an interface full of tiny failure messages.

The useful boundary is a product decision rather than a component decision. Place one around a region that:

- provides value independently of its neighbors
- has a fallback that makes sense on its own
- can fail and recover independently
- has a team that can own the failure

On a dashboard, those regions often correspond to widgets. A comments widget can fail while transaction details remain useful. A listing recommendation can disappear without preventing someone from checking the status of a sale.

## Give every failure domain an identity

A boundary needs more than fallback UI. It also needs enough context to identify what failed and who can respond.

A simplified version of the composition looks like this:

```jsx
<WidgetBoundary
  name="client_dashboard.new_matches"
  owner="search"
  fallback={<UnavailableWidget title="Matches" />}
>
  <NewMatches />
</WidgetBoundary>
```

The identifier gives the failure a stable name outside the React component tree. The owner connects that name to a team. When the boundary catches an error, both can travel with the report instead of asking someone responding to an alert to reconstruct that context from a stack trace.

This also establishes an integration contract. A team contributing a widget must define its boundary, fallback, and ownership before its code becomes part of the dashboard.

## A fallback is still part of the product

An error boundary keeps the rest of the page alive, but a technically contained failure can still produce a confusing experience. The fallback must occupy the failed region without pretending that nothing went wrong.

For each widget, we had to ask:

- Should the fallback preserve the widget's dimensions?
- Does the user need to know which information is unavailable?
- Can they retry the operation?
- Is there another path to the same information?
- Could the fallback itself depend on the system that failed?

The safest fallback is usually smaller and less ambitious than the component it replaces. It should use few dependencies, avoid fetching more data, and preserve access to the rest of the page.

This is graceful degradation at the component level. The dashboard is no longer either working or broken. It can remain useful while one part is unavailable.

## Make the boundaries visible

Once we divided the dashboard into failure domains, we created another problem: the architecture was invisible. A developer looking at the page could not tell where one boundary stopped, which identifier it used, or which team owned it.

I built a visual debugger that outlined each protected region and displayed its identifier directly on the dashboard.

![Compass One with its error-boundary debugger enabled. Green outlines and labels identify independently protected regions of the dashboard.](/assets/img/compass-one/compass-one-debugger.webp)

The debugger turned an abstract component hierarchy into something the team could inspect. During integration, engineers could isolate their widgets, confirm that boundaries matched the intended product regions, and test failure states without learning the structure of the entire application first.

It also made gaps obvious. A widget without an outline was not protected. A boundary drawn around too much of the page exposed an unnecessarily large failure domain. A vague identifier made ownership difficult to determine before an error ever reached production.

The debugger was useful because it displayed architecture in the interface where that architecture mattered.

## Test the failure, not the boundary

The important assertion is not that an error boundary called its lifecycle method. It is that the failed widget becomes unavailable while the rest of the dashboard keeps working.

```jsx
function BrokenMatches() {
  throw new Error('Unable to render matches');
}

it('contains a widget failure', () => {
  render(
    <Dashboard
      matches={<BrokenMatches />}
      comments={<Comments />}
    />
  );

  expect(screen.getByText('Matches are temporarily unavailable')).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Comments' })).toBeVisible();
});
```

That test describes the resilience promised to the user: one region failed, the fallback appeared, and an independent region survived. A separate integration can verify that the error report contains the boundary identifier and owner.

Failure states deserve the same attention as the happy path. If a fallback is only seen after production breaks, it has not really been designed or tested.

## Know where the fence ends

Error boundaries solve errors thrown while React renders their descendants. They do not catch every failure in a browser application. Errors from event handlers, server-side rendering, asynchronous callbacks, or the boundary itself need to be handled at the appropriate boundary for those systems.

Network failures are another case. A request returning an error is an expected application state, not necessarily a rendering exception. The widget should usually represent that state deliberately rather than crash and rely on its error boundary.

The distinction matters because an error boundary is the last line of defense for an unexpected rendering failure. It should not replace ordinary error handling.

## Good fences make independent teams possible

The immediate benefit of our boundaries was technical: a broken widget no longer crashed the entire dashboard. The larger benefit was organizational.

Six teams could contribute to the same page with a shared understanding of where their responsibility began and ended. Fallbacks preserved the client experience. Reports carried ownership information. The debugger let anyone see the system's failure domains.

An error boundary is a React component. A resilient boundary system is architecture. It defines where failure stops, what remains useful, and who knows enough to fix what broke.

## Resources

- [Catching rendering errors with an Error Boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) in the React documentation
- [Building a transaction dashboard on Compass](/blog/building-a-transaction-dashboard-on-compass/), the broader Compass One case study
