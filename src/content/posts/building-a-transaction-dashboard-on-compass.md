---
title: "Building a transaction dashboard on Compass"
description: "Case study: Leading engineering teams to build Compass One, a real estate transaction dashboard that boosted client engagement by 43% with 4.5/5 satisfaction."
pubDate: 2025-03-25
tags: []
---

[Compass One](https://one.compass.com/) is the real estate industry's premier client dashboard providing 24/7 transparency into transactions — the #1 requested feature since 2021. Launched in beta in October 2024 and nationally on February 3, 2025, this platform addresses inefficient communication between clients and agents, transforming how clients track their real estate journey.

As Frontend Engineering Lead, I orchestrated collaboration across six engineering teams to develop this comprehensive platform requiring seamless integration with every major system across the company. Over twelve months, I implemented rigorous engineering standards, developed an estimation framework, and built resilient architecture while coordinating approximately 50 frontend engineers who collectively merged 800 pull requests.

## Creating a well-oiled machine

When I onboarded, I faced two significant challenges: managing an abandoned codebase from 2021 that had accumulated technical debt, and creating alignment between product, design, and engineering teams on how to move forward.

Rather than focusing solely on technical implementation details, I drafted a proposal that established a clear vision for team operations:

1. **Cleaned legacy codebase**: Systematically addressed technical debt and deprecated outdated patterns
2. **Established non-negotiable requirements**:
   - Daily code deployments (except Fridays)
   - Comprehensive unit and integration test coverage for all new production code
   - Mandatory passing Cypress end-to-end tests as a deployment prerequisite
   - Feature flag implementation for all new functionality

We maintained over 90% unit test coverage across three frontend applications and a shared component library.

## Know what you don't know

Compass has not historically had a uniform method for estimating projects of this size. We updated our estimation process by implementing Jacob Kaplan-Moss's methodology from [Estimating Software Projects](https://jacobian.org/series/estimation/), which explicitly accounts for both time and uncertainty.

As frontend developers, we evaluated each feature against three critical dependencies:

1. Product requirements
2. Backend API definitions
3. Designs

We then systematically adjusted confidence levels based on the completeness of these dependencies:

- **High Confidence**: All three dependencies clearly defined
- **Medium Confidence**: Missing product requirements
- **Low Confidence**: Missing both product requirements and designs
- **No Confidence**: Missing all three dependencies

## Speaking the same language

Compass One's index page needed to aggregate and transform data from multiple microservices. We implemented a Backend-for-Frontend (BFF) pattern, creating a dedicated orchestration layer specifically designed for our frontend needs.

I collaborated with a Senior Staff Engineer and a Principal Engineer to develop and maintain a Node.js service that acted as a stateless translation layer. This service:

- Coordinated API calls across Java, Python, Go, and TypeScript services
- Transformed complex data structures into frontend-optimized formats
- Provided consistent type information through Thrift definitions
- Handled error states and fallbacks before they reached the client

The BFF pattern delivered improved performance, better monitoring, simplified frontend code, and reduced network traffic.

## Good fences make good neighbors

Compass One's index page functions as a central hub integrating multiple widgets and components from six different engineering teams. A single error in any team's code could potentially crash the entire application.

We implemented a resilient architecture by creating custom Error Boundary components that established protective "fences" around each team's code contributions. Our implementation included:

1. Automatic error reporting routed to the responsible teams
2. Graceful fallback UI components that maintained overall application usability
3. A visual debugging interface that allowed teams to isolate and test their components

This architectural approach proved invaluable during integration phases. When errors occurred, they remained contained to the specific widget rather than crashing the entire application.

## Results

In just the first week, agents sent 14,950 client invitations, driving a 43% increase in client weekly active users. Despite the surge in traffic during the live announcement, the system maintained 100% uptime with no performance degradation. Both agents and clients embraced the platform enthusiastically, awarding it a customer satisfaction score of 4.5 out of 5.

## Press Coverage

- Bloomberg — [Compass Launches New Client-Facing Portal](https://www.bloomberg.com/news/videos/2025-02-05/compass-ceo-on-us-housing-market-video)
- Inman — [Compass One puts clients at true north: Tech Review](https://www.inman.com/2025/02/28/compass-one-puts-clients-at-true-north-tech-review/)
- Inman — [Compass launches 'Compass One' client portal and dashboard](https://www.inman.com/2025/02/03/compass-to-launch-compass-one-client-portal-and-dashboard/)
- The Real Deal — [Compass has the listings, now it has the platform](https://therealdeal.com/national/2025/02/06/how-compass-new-consumer-platform-adds-to-inventory-push/)
- Housing Wire — [Compass launches client-facing portal with listings, docs and more](https://www.housingwire.com/articles/compass-one-portal-clients-listings/)
- Real Estate News — [Compass to launch client portal amid private listings push](https://www.realestatenews.com/2025/02/01/compass-launches-client-portal-amid-private-listings-push)
