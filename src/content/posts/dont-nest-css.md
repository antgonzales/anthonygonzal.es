---
title: "Don't nest CSS"
description: "SASS nesting promised clean, scoped styles. Native CSS nesting delivers the same promise. The problem was never the preprocessor."
pubDate: 2014-09-28
updatedDate: 2026-04-01
tags: ["technical"]
---
What's wrong with this code?

```css
.product-nav {
  li {
    border-top: 1px solid var(--color-border);
    a {
      display: block;
      height: 50px;
      padding: 0 10px;
    }
    ul li a {
      height: 30px;
      padding-left: 30px;
    }
  }
}
```

It works, and every modern browser supports it natively. But look at what the
browser actually resolves: `.product-nav li ul li a`. To apply one style, it
matches five levels of ancestry. To override that style, you need a selector at
least as specific, which in practice means more nesting. And the moment someone
restructures the markup, wraps the list in a div for layout, flattens the
submenu, the styles silently stop matching.

The problem isn't nesting as a syntax. It's what structural nesting encodes:
knowledge of the markup tree. A selector like `li ul li a` is a description of
where an element sits, and any style attached to a location breaks when the
element moves. Every structurally nested selector is a sign that a class is
missing.

## Style the name, not the location

So don't describe the tree. Name the thing:

```css
.product-nav-item {
  border-top: 1px solid var(--color-border);
}

.product-nav-link {
  display: block;
  height: 50px;
  padding: 0 10px;
}

.product-nav-sublink {
  display: block;
  height: 30px;
  padding: 0 10px 0 30px;
}
```

Every rule now stands alone. Specificity is flat, so overriding anything takes
one class. A teammate reading `.product-nav-link` knows exactly what it styles
without tracing ancestors. And the markup can change shape freely, because the
styles are attached to names, not locations.

## Where nesting belongs

Nesting still has a legitimate job, and it isn't an exception to the rule:

```css
.product-nav-link {
  &:hover {
    background: var(--color-hover);
  }

  @media (min-width: 48rem) {
    height: 40px;
  }
}
```

This is fine because nothing here describes structure. `&:hover` is a state of
the same element. The media query is a context the same element renders in. The
line to draw: nesting for the states and contexts of one rule is what the
feature is for. Nesting to scope descendants is a missing class name.

## The contract

A class name is a contract: the stylesheet promises to style anything that
claims the name, and the markup promises nothing about where the name appears.
Structural nesting breaks that contract by making styles depend on knowledge
they shouldn't have, the private shape of the DOM. Keep the tree's shape out of
the stylesheet and an entire class of silent breakage disappears: refactors
that unstyle components, specificity wars, selectors nobody can safely delete.
The stylesheet's job is to style the name, not to know the tree.

## Resources

- [Beware of Selector Nesting in Sass](https://www.sitepoint.com/beware-selector-nesting-sass/) by Kitty Giraudel
- [Medium's CSS is actually pretty f***ing good](https://medium.com/@fat/mediums-css-is-actually-pretty-fucking-good-b8e2a6c78b06) by Jacob Thornton
- [Shoot to kill; CSS selector intent](https://csswizardry.com/2012/07/shoot-to-kill-css-selector-intent/) by Harry Roberts
- [About HTML semantics and front-end architecture](http://nicolasgallagher.com/about-html-semantics-front-end-architecture/) by Nicolas Gallagher
