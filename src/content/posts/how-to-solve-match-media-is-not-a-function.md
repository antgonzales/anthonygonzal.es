---
title: "Fix TypeError: window.matchMedia is not a function in Jest"
description: "Learn how to emulate matchMedia in Jest for responsive design testing. Create a reusable test helper to check code at different breakpoints."
pubDate: 2024-02-23
updatedDate: 2024-07-28
tags: []
---

Testing responsive designs in environments that don't support the matchMedia API, like Jest and jsdom, can be challenging. This necessitates a custom implementation to ensure our React tests can accurately simulate different viewport sizes. Fortunately, the css-mediaquery library provides an API that closely emulates matchMedia, allowing us to create a tailored solution that adheres to Mobile First development principles.

## Creating a custom matchMedia implementation

To address the `TypeError: window.matchMedia is not a function` error, we'll develop a custom matchMedia function using the [css-mediaquery](https://github.com/ericf/css-mediaquery) library in our testing tools.

```javascript
// src/testUtils/matchMedia.js
import mediaQuery from 'css-mediaquery';

beforeAll(() => {
  window.matchMedia = createMatchMedia(576);
});

afterEach(() => {
  window.matchMedia = createMatchMedia(576);
});

export function createMatchMedia(width) {
  window.matchMedia = (query) => ({
    matches: mediaQuery.match(query, {
      width,
    }),
    addListener: () => {},
    removeListener: () => {},
  });
}
```

Jest's [official recommendation](https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom) suggests creating mocks for methods not implemented in jsdom. However, by using css-mediaquery instead, we simulate the matchMedia API more faithfully and write tests that focus on behavior rather than implementation details.

## Utilizing the custom implementation in tests

```javascript
import { render, screen, createMatchMedia } from '@/testUtils';
import React from 'react';

import ResponsiveComponent from '.';

it('displays details in mobile by default', () => {
  render(<ResponsiveComponent />);
  expect(screen.getByText('Mobile')).toBeInTheDocument();
});

it('displays progressively more details for tablet', () => {
  createMatchMedia(768);
  render(<ResponsiveComponent />);
  expect(screen.getByText('Mobile + Tablet')).toBeInTheDocument();
});

it('displays progressively more details for desktop', () => {
  createMatchMedia(992);
  render(<ResponsiveComponent />);
  expect(screen.getByText('Mobile + Tablet + Desktop')).toBeInTheDocument();
});
```

## Conclusion

By leveraging the css-mediaquery library and implementing a custom `matchMedia` function, we've created a flexible testing environment. This setup allows us to simulate various viewport sizes, ensuring our responsive designs behave as expected across different devices.
