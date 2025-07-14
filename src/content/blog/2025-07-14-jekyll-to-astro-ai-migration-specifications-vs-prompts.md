---
title: "Migrating Jekyll to Astro with AI: What I Learned About Specifications vs Prompts"
description: "An experiment in prompt-driven development and generating code from specifications, not just prompts."
date: 2025-07-14
draft: true
---

I just completed migrating my Jekyll blog to Astro using Claude's CLI—an
experiment in "prompt-driven development" that taught me as much about the
future of programming as it did about AI's current limitations.

## The Goal: No Manual Coding

My plan was simple: migrate my entire blog from Jekyll to Astro using only AI
prompts. No touching code myself. I even documented this constraint in my
[initial 127-line prompt
specification](https://github.com/antgonzales/anthonygonzal.es/blob/main/prompts/00-monolithic-attempt.md),
complete with kramdown syntax requirements, RSS feed recreation, and Playwright
testing.

Looking back, that detailed specification might have been the most valuable
artifact from this entire project—I just didn't realize it at the time.

## Treating Prompts as Ephemera

Like most developers experimenting with AI, I fell into the trap of treating my
prompts as throwaway communication. I'd craft a prompt, get generated code
back, keep the code, and discard the prompt. As one researcher recently pointed
out, this is like "shredding the source and carefully version controlling the
binary."

My `.specstory` conversation history captured this ephemeral approach—thousands
of lines of AI dialogue that I initially considered just debugging artifacts.
But those conversations contained the real value: my intent, requirements, edge
cases, and decision-making process.

The generated code was just the projection.

## Following the SpecFlow Methodology

Before starting this project, I watched Sean Grove's AI Engineer talk ["The New
Code"](https://www.youtube.com/watch?v=8rABwKRsec4), which introduced me to
the concept of specifications as the new source code. After his talk, I looked
around the internet for similar ideas and discovered [Spec
Story](https://specstory.com/) for conversation tracking and the [SpecFlow
methodology](https://www.specflow.com/)—an open framework for structured
AI-assisted software development.

SpecFlow's core philosophy is "plan first, act second," emphasizing that
successful software projects start with clear specifications, not ad-hoc
prompting. The methodology breaks development into structured phases:

- **Intent definition**: What exactly are you trying to achieve?
- **Roadmap planning**: Breaking down the problem into manageable phases
- **Task breakdown**: Specific, actionable steps within each phase
- **Execution**: Actually implementing with AI assistance
- **Refinement**: Iterative improvement based on results

My [initial 127-line
specification](https://github.com/antgonzales/anthonygonzal.es/blob/main/prompts/00-monolithic-attempt.md)
was a direct attempt to apply this methodology. I defined clear success
criteria, broke down the migration into phases, and established specific
requirements for each component—exactly what SpecFlow recommends.

Where this structured approach helped was in recognizing that my specification
gaps weren't AI failures—they were planning failures. When Claude couldn't
distinguish between old and new CSS files, it wasn't because the AI was
limited; it was because I hadn't specified the decision criteria for what to
keep versus what to discard.

## Where AI Excelled: Broad Architectural Translation

Claude handled the architectural heavy lifting brilliantly. The [main migration
commit](https://github.com/antgonzales/anthonygonzal.es/commit/434d8b78bef13b02fb955b7ee0bec52f3877be78)
shows the scope: 115 files changed, 28,287 lines added.

What worked well:

- **File structure migration**: All SCSS partials, layouts, and routing
  migrated cleanly
- **Content collections**: Blog posts, frontmatter, and Astro configuration
  handled correctly
- **Testing infrastructure**: Generated comprehensive Playwright tests for
  accessibility, responsive design, and RSS feeds

This aligns with the idea that sufficiently robust specifications can generate
multiple artifacts: TypeScript, documentation, tests, even deployment configs.

## Where AI Hit the Wall: Precision and Visual Details

The problems emerged where my specifications were underspecified or required
human judgment.

**Visual alignment issues**: My table of contents was misaligned because `<ol>`
elements have default CSS that pushed content deeper than my SCSS variables
intended. I spent an hour crafting prompts to help Claude "see" this alignment
problem.

**Context and judgment calls**: Claude migrated old, unused syntax highlighting
CSS files even after configuring Shiki for Astro. It couldn't distinguish
between "this was used in the old setup" and "this is needed in the new setup"
because I hadn't specified that decision criteria.

These weren't AI limitations—they were specification gaps.

## The Breaking Point: When Communication Becomes Inefficient

I broke my "no manual coding" rule when I realized prompting would take longer
than implementing the fix myself. There's a real-time cost-benefit analysis
during AI collaboration: when you're crafting your third prompt to nudge the AI
toward a solution you could implement in 30 seconds, it's time to just do it.

But this reveals something important about the future of programming. As AI gets
better at code generation, the bottleneck shifts entirely to communication. The
person who can write the clearest specifications—whether they're engineers,
product managers, or domain experts—becomes the most effective programmer.

## Specifications as the New Source Code

This experience highlighted how dramatically AI changes what we should version
control and preserve:

- **My detailed initial specification**: 127 lines of requirements, edge cases,
  and success criteria
- **Conversation transcripts**: Decision-making context and requirement
  clarification
- **Iterative refinements**: How specifications evolved through testing

Instead of throwing away prompts, I should have been treating them as the
source code and the generated TypeScript as the compilation target.

## Team Collaboration in a Specification-First World

Working through this migration raised questions about AI artifacts in team
environments. I now have:

- `.specstory` conversation history files
- A `prompts/` directory with specifications
- Extensive AI-assisted commit messages

On teams with hundreds of developers, these specifications could become the
universal artifact that aligns everyone—engineers, designers, product managers,
even legal and compliance teams can all contribute to the same markdown files.

The question becomes: what should be shared versus kept local? These
conversation histories contain valuable context but are also deeply personal to
individual thought processes. And the history files are large—my `.specstory`
directory is 936kb, with 23k lines of conversation mostly generated by Claude.

## Lessons for Specification-Driven Development

**Start with written specifications, not prompts**:

- Document success criteria before generating code
- Make specifications detailed enough to be executable
- Test against the spec, not just the generated code

**Treat specifications as source code**:

- Version control your prompts and requirements
- The specification contains more information than the generated code
- Generated artifacts should be reproducible from specifications

**Recognize the communication bottleneck**:

- 80-90% of developer value is structured communication, not code generation
- AI amplifies this—clear communication becomes the scarce skill
- The best specification writers become the most valuable programmers

## Results and Future Implications

Despite breaking my "no manual coding" rule, I migrated a decade of content with
styling, routing, and testing infrastructure in a fraction of the time manual
migration would have required.

More importantly, I experienced firsthand how AI shifts programming from syntax
to intent. The future isn't about learning new frameworks or languages—it's
about becoming better at capturing and communicating human intentions in
executable specifications.

My most valuable takeaway wasn't about Jekyll vs Astro. It was recognizing that
in an AI-driven world, whoever writes the clearest specifications becomes the
programmer—regardless of their traditional technical background.

---

_The complete migration, including the original specification and conversation
artifacts, is [open source](https://github.com/antgonzales/anthonygonzal.es)
if you want to explore what specification-driven development might look like in
practice._
