---
title: "Testing components that make API calls"
description: "Learn how to test API calls in components with examples in React and Jest. Write tests flexible enough for change"
pubDate: 2020-05-25
updatedDate: 2024-03-03
tags: []
---

Most examples that discuss Test-Driven Development don't include information about how to test components that fetch data. With Jest, we get an environment in Node.js that mimics the browser because it provides jsdom. However, Jest does not describe a "batteries included" vision for server responses. Let's discuss the best way to test front-end components that make API calls.

## Mocks are risky assumptions

I often see examples advising that you mock an entire library like axios, request, or fetch to test that a specific function is called. This approach tests implementation details in addition to behavior. It binds our test suite to a library and assumes that the library's API will not change.

If your team wants to switch request libraries from axios to another option such as unfetch, every test that directly mocks axios will need to be rewritten. You lose your testing baseline which means following Red, Green, Refactor across all previously written tests.

## Which API interceptor library should I use?

There are several libraries available to stub server responses: miragejs, msw, cypress, and nock.

I recommend [msw](https://mswjs.io/) for several compelling reasons:

- Seamless integration with both browser and Node.js environments
- Realistic request interception at the network level
- Rich documentation and community support

## Implement a fake server

Let's look at msw using a fetch example, assuming we've already done the recommended setup.

```jsx
import React from 'react'
import { rest } from 'msw';
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import { server } from '@/mocks/server';
import Fetch from '.'

test('override handler in a single test', async () => {
  server.use(
    rest.get('https://yoursite.com/greeting', (req, res, ctx) => {
      return res(ctx.json({ greeting: 'hello there' }));
    })
  );

  const url = '/greeting';
  render(<Fetch url={url} />);
  fireEvent.click(screen.getByText('Load Greeting'));

  await waitFor(() => screen.getByRole('heading'));

  expect(screen.getByRole('heading')).toHaveTextContent('hello there');
  expect(screen.getByRole('button')).toHaveAttribute('disabled');
});
```

In this approach we:

1. Stopped mocking the axios library and method response
2. Specified a response at a URL and route
3. Removed unnecessary assertions about API calls

Our test suite no longer knows how our components fetch data. If you switch from axios, fetch, or unfetch, the test file will not require changes. More importantly, if you upgrade your data fetching library version, your test suite will give you meaningful feedback.

## How to test components using Apollo Client with GraphQL

With the rise of GraphQL, Apollo has made significant strides in writing server and client-side libraries to make managing data easier. Apollo has created a `MockedProvider` test component which allows you to test UI components. However, nothing stops us from hijacking the means of communicating with the backend using msw.

Here's what we know about interfacing with Apollo and GraphQL:

1. All requests use the HTTP POST method
2. Apollo requires an instantiated client which is essentially a config class for setup
3. Apollo ensures type names in the resource response

```jsx
import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { render } from "@testing-library/react";
import { graphql } from "msw";
import { client } from "@/api/client";
import { server } from "@/mocks/server";
import { App } from "./";

describe("App", () => {
  it("displays all Pokemon", async () => {
    server.use(
      graphql.post("https://graphql-pokemon.now.sh", (req, res, ctx) => {
        return res(
          ctx.json({
            data: {
              pokemon: [
                { id: "001", name: "Bulbasaur", __typename: "Pokemon" },
                { id: "002", name: "Ivysaur", __typename: "Pokemon" },
                { id: "003", name: "Venusaur", __typename: "Pokemon" }
              ]
            }
          })
        );
      })
    );

    const { findAllByTestId } = render(
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    );

    const pokemon = await findAllByTestId("pokemon");
    expect(pokemon.length).toBe(3);
  });
});
```

## Deciding tradeoffs

The solutions I've proposed are ultimately about tradeoffs. As your software changes, you have to decide which parts you are comfortable living with, no matter the scale. For some people, the notion of managing a server response library is more painful and tedious than just mocking libraries and responses. For me, the pain of not having confidence in my test suite far outweighs the trivial tedium of using msw.
