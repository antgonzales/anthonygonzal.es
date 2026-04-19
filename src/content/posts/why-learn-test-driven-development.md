---
title: "Why learn Test-Driven Development?"
description: "Create a safe environment to take risks, build confidence, and write legible code. Learn how to start with Javascript, React"
pubDate: 2020-04-21
heroImage: ../../assets/img/glass-house-at-night-compressed.jpg
tags: []
---

Across all of my professional software projects, I insist on Test-Driven Development (TDD). Not all developers share my enthusiasm and some see testing as onerous and costly. TDD is another skill to learn and a powerful tool for the long term health of a software project. Test-Driven Development creates a safe environment for developers to take risks, builds trust between team members and management, and provides legibility for other developers to make changes.

## Safe danger

Last fall, my wife took me to visit Philip Johnson's Glass House in New Caanan, CT. Beautiful and simple, the Glass House is an icon of modern architecture. It rests on a property filled with Johnson's experimental creations. One of Mr. Johnson's guiding principles in architecture is the concept of "safe danger" — the idea that we are most engaged when we can take risks in a safe environment.

Testing provides an environment for developers to take risks safely to produce their best work. Each commit comes with a set of assertions that proves that the newly added code has been thoughtfully examined. It gives team members the ability to completely gut the contents of the production code and not lose any sleep over it. Anybody can rearrange files, rename functions and variables, and break large pieces down into new abstractions.

## Confidence and trust

At the heart of any team is the ability for members to trust one another to make choices. Teams with low levels of trust inevitably create systems to prevent people from making choices. Bureaucracy takes hold and the innovative spark is lost as team members begin to feel like cogs in a machine.

You build trust between team members and stakeholders by developing a culture that prioritizes testing. Bugs and unintended side effects are minimized. Silly mistakes are removed and handled before they reach a staging environment. Customers experience less downtime, management doesn't feel the need to create bureaucratic systems, and developers get to try new things.

## Documentation for free

Legibility is a side-effect of encapsulating code into testable pieces with clear assertions. Legibility gives not only your team members a chance to read and understand your intent, but gives you a better understanding when you return to code at a later date. Well-written test assertions are a bit like having well-written annotations to a technical blueprint.

## Red, green, refactor

Test Driven Development is a recursive set of steps a software developer follows to create new features. You write tests first, then write enough code to satisfy the failing test, and lastly, refactor the code you just wrote.

I adhere to Uncle Bob's [Three Laws of TDD](http://www.butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd):

1. You are not allowed to write any production code unless it is to make a failing unit test pass.
2. You are not allowed to write any more of a unit test than is sufficient to fail; and compilation failures are failures.
3. You are not allowed to write any more production code than is sufficient to pass the one failing unit test.

### A word on "refactoring"

According to [Martin Fowler](https://refactoring.com/), "Refactoring is a disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior." How can you be confident that your changes didn't change external behavior? The only way to have certainty is through some form of checking, either manually or through automated tests. Changing code without meaningful feedback is rewriting, not refactoring.

## Todo list example

For the remainder of this post, I will create a series of features for a Todo List Application in React following Uncle Bob's rules. The full code base can be seen on [CodeSandbox](http://bit.ly/2IW51qj).

### Create the folder and test file

```
/src
  /App
    index.js
    App.css
    App.jsx
    App.test.jsx
```

Following this pattern, let's create a `TodoList` component folder with a test file first.

```jsx
import React from "react";
import { render } from "@testing-library/react";
import { TodoList } from ".";

describe("TodoList", () => {
  it("works", () => {
    render(<TodoList />);
  });
});
```

That's it. That's how you start. Notice that I did not create the `index.js` or the production code in `TodoList.jsx` yet? Run the test suite. This initial test should fail (Red).

Now let's make the component and the index file.

```jsx
import React from "react";

export function TodoList() {
  return <div />;
}
```

We've now fixed the broken test (Green).

### Giving the user an input

```jsx
describe("TodoList", () => {
  it("receives user input", () => {
    const { getByTestId } = render(<TodoList />);
    const input = getByTestId("todo-input");
    fireEvent.change(input, { target: { value: "Take the dinglebop" } });
    expect(input.value).toBe("Take the dinglebop");
  });
});
```

After it fails (Red), create a simple input that takes user values:

```jsx
import React, { useState } from "react";

export function TodoList() {
  const [userInput, updateUserInput] = useState("");
  return (
    <input
      data-testid="todo-input"
      type="text"
      value={userInput}
      onChange={e => updateUserInput(e.target.value)}
    />
  );
}
```

### Saving a todo

```jsx
it("adds a todo", () => {
  const { getByTestId } = render(<TodoList />);
  const input = getByTestId("todo-input");
  const add = getByTestId("todo-add");
  fireEvent.change(input, { target: { value: "Smooth it out with a bunch of shleem" } });
  fireEvent.click(add);
  const todo = getByTestId("todo");
  expect(todo.textContent).toBe("Smooth it out with a bunch of shleem");
});
```

You'll notice that there is some repetition. That's okay — we want to completely isolate our tests to avoid weird side effects. Do not be tempted to add a huge `beforeEach` setup just to be DRY.

### Ensuring the todo field isn't empty

```jsx
it('disables the "Add Todo" button when the user input is empty', () => {
  const { getByTestId } = render(<TodoList />);
  const add = getByTestId("todo-add");
  expect(add.disabled).toBe(true);
});
```

### Delete todos

```jsx
it("deletes todos", () => {
  const { getByTestId, queryAllByTestId } = render(<TodoList />);
  const input = getByTestId("todo-input");
  const add = getByTestId("todo-add");
  fireEvent.change(input, { target: { value: "Take the dinglebop and push it through the grumbo" } });
  fireEvent.click(add);
  const remove = getByTestId("todo-remove");
  fireEvent.click(remove);
  expect(queryAllByTestId("todo")).toHaveLength(0);
});
```

### Editing a todo

```jsx
it("opens an editor to receive user input", () => {
  const { getByTestId } = render(<TodoList />);
  const input = getByTestId("todo-input");
  const add = getByTestId("todo-add");
  fireEvent.change(input, { target: { value: "Take the dinglebop and push it through the grumbo" } });
  fireEvent.click(add);
  const edit = getByTestId("todo-edit");
  fireEvent.click(edit);
  const editorInput = getByTestId("todo-editor");
  expect(editorInput.value).toBe("Take the dinglebop and push it through the grumbo");
});
```

## Take home assignment

If you visit the CodeSandbox link, you can download the repo and begin testing using the Create React App scripts. You'll be able to pick up right where I left off and begin adding some new features:

* Hiding the 'Edit' and 'Remove' controls when the user opens the inline editing experience
* Turning off the editing experience when the user saves a new input
* Adding a 'Cancel' button to turn off the editing experience

TDD is a skill that you will continually need to practice, learn, and improve. I hope this post serves as a reference for how to start your journey on testing.
