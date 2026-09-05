---
title: "How to test React Router components with Testing Library"
description: "Rendering routed components under test without mocking the router away."
pubDate: 2024-06-03
updatedDate: 2026-09-05
tags: ["technical"]
---

I often see developers interfacing with React Router mock `useNavigate()` in
tests and assert calls. The tests pass, but it skips the part we actually
depend on; whether or not the user navigated to a specific route.

Let's replace that mock with React Router's `MemoryRouter` and test the result
instead. We'll look at both kinds of navigation a component commonly exposes: a
link with a destination and an programmatic action that changes the current
route. The examples in this post use React Router v6.

## Render components inside a router

Testing Library's [React Router
example](https://testing-library.com/docs/example-react-router/) demonstrates
routing at the application root. The same principle applies to child
components. We still ned to provide the router context they expect without
replacing the router's behavior.

A [custom render
function](https://testing-library.com/docs/react-testing-library/setup/#custom-render)
gives us a reusable setup in one place:

```jsx
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

function renderWithRouter(
  ui,
  { initialEntries = ['/'], ...renderOptions } = {}
) {
  function Wrapper({ children }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from '@testing-library/react';
export { renderWithRouter };
```

The wrapper starts each test at `/` by default. Pass another URL through
`initialEntries` when the component expects a different location, such as
`/settings`. `MemoryRouter` tracks subsequent navigation without relying on a
browser's address bar.

## Test navigation, not `useNavigate`

Consider a component that calls `useNavigate()` when someone activates a
button. A test might mock the hook and assert that its returned function was
called:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

it('navigates to the dashboard', async () => {
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  const user = userEvent.setup();

  render(<ComponentWithNavigation />);
  await user.click(screen.getByRole('button', { name: 'Go to Home' }));

  // ❌ Verifies a call to the mocked hook, not navigation.
  expect(navigate).toHaveBeenCalledWith('/');
});
```

This test knows how the component performs navigation. It will pass even if the
real router is missing or is integrated incorrectly.

Instead, render the component and its destination inside `MemoryRouter`. After
the interaction, assert against the destination:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

it('navigates to the dashboard', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<ComponentWithNavigation />} />
        <Route path="/" element={<h1>Dashboard</h1>} />
      </Routes>
    </MemoryRouter>
  );

  await user.click(screen.getByRole('button', { name: 'Go to Home' }));

  // ✅ Verifies the result a user observes.
  expect(
    screen.getByRole('heading', { name: 'Dashboard' })
  ).toBeInTheDocument();
});
```

This test checkes the integration between the component and React Router. It
also remains valid if the component later switches from `useNavigate()` to a
declarative link while preserving the same behavior.

## Test a link by its destination

If a component renders a React Router `<Link>`, you often do not need to click
it. Verify the accessible link and the `href` that React Router produces:

```jsx
import { renderWithRouter, screen } from '@/testUtils';

it('links to the dashboard', () => {
  renderWithRouter(<ComponentWithNavigation />);

  expect(
    screen.getByRole('link', { name: 'Go to Home' })
  ).toHaveAttribute('href', '/');
});
```

Use `toHaveAttribute('href', '/')` rather than comparing the DOM element's
`href` property. The property is usually resolved to an absolute URL, while the
attribute preserves the value rendered in the HTML.

## Conclusion

Choose the assertion that matches the component's public behavior: check the
`href` when it renders a link, or interact with an imperative navigation
control and verify the resulting route. In both cases, keeping the real router
in the test provides more confidence than mocking the implementation.
