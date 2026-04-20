import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TableWalkerSimple from "./TableWalkerSimple";

describe("TableWalkerSimple()", () => {
  describe("initial render", () => {
    it("displays step 1 of 7", () => {
      render(<TableWalkerSimple />);
      expect(screen.getByText("Step 1 of 7")).toBeInTheDocument();
    });

    it("renders the DOM tree diagram", () => {
      render(<TableWalkerSimple />);
      expect(
        screen.getByRole("img", { name: "DOM tree diagram" }),
      ).toBeInTheDocument();
    });

    it("renders the color legend", () => {
      render(<TableWalkerSimple />);
      expect(screen.getByLabelText("Color legend")).toBeInTheDocument();
    });

    it("renders the td candidate nodes", () => {
      render(<TableWalkerSimple />);
      expect(
        screen.getByText('<td aria-labelledby="row-q1 col-rev">$1.2M</td>'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('<td aria-labelledby="row-q1 col-exp">$900K</td>'),
      ).toBeInTheDocument();
    });

    it("renders the th header nodes", () => {
      render(<TableWalkerSimple />);
      expect(
        screen.getByText('<th id="row-q1" scope="row">Q1</th>'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('<th id="col-rev">Revenue</th>'),
      ).toBeInTheDocument();
    });

    it("renders structural nodes", () => {
      render(<TableWalkerSimple />);
      expect(screen.getByText("<table>")).toBeInTheDocument();
      expect(screen.getByText("<thead>")).toBeInTheDocument();
      expect(screen.getByText("<tbody>")).toBeInTheDocument();
    });

    it("shows the query as the first caption", () => {
      render(<TableWalkerSimple />);
      expect(
        screen.getByText("getByRole('cell', { name: 'Q1 Revenue' })"),
      ).toBeInTheDocument();
    });

    it("does not show the IDREF queue on step 1", () => {
      render(<TableWalkerSimple />);
      expect(
        screen.queryByText("aria-labelledby IDREFs"),
      ).not.toBeInTheDocument();
    });

    it("disables Prev on first step", () => {
      render(<TableWalkerSimple />);
      expect(
        screen.getByRole("button", { name: "Previous step" }),
      ).toBeDisabled();
    });

    it("enables Next on first step", () => {
      render(<TableWalkerSimple />);
      expect(screen.getByRole("button", { name: "Next step" })).toBeEnabled();
    });
  });

  describe("IDREF queue", () => {
    it("appears on step 2", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      await user.click(screen.getByRole("button", { name: "Next step" }));
      expect(screen.getByText("aria-labelledby IDREFs")).toBeInTheDocument();
    });

    it("shows both IDREF tokens on step 2", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      await user.click(screen.getByRole("button", { name: "Next step" }));
      expect(screen.getByText("#row-q1")).toBeInTheDocument();
      expect(screen.getByText("#col-rev")).toBeInTheDocument();
    });

    it("shows #row-q1 as checking on step 3", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      const next = screen.getByRole("button", { name: "Next step" });
      await user.click(next);
      await user.click(next);
      expect(screen.getByText("#row-q1")).toBeInTheDocument();
    });

    it("shows Q1 badge on #row-q1 token on step 4", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 3; i++) await user.click(next);
      expect(screen.getAllByText('"Q1"').length).toBeGreaterThan(0);
    });

    it("shows Revenue badge on #col-rev token on step 6", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 5; i++) await user.click(next);
      expect(screen.getAllByText('"Revenue"').length).toBeGreaterThan(0);
    });

    it("shows resolved name on step 6", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 5; i++) await user.click(next);
      expect(screen.getByText('"Q1 Revenue"')).toBeInTheDocument();
    });

    it("queue is not shown on the final step", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 6; i++) await user.click(next);
      expect(
        screen.queryByText("aria-labelledby IDREFs"),
      ).not.toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("advances to step 2", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      await user.click(screen.getByRole("button", { name: "Next step" }));
      expect(screen.getByText("Step 2 of 7")).toBeInTheDocument();
    });

    it("goes back to step 1", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      await user.click(screen.getByRole("button", { name: "Next step" }));
      await user.click(screen.getByRole("button", { name: "Previous step" }));
      expect(screen.getByText("Step 1 of 7")).toBeInTheDocument();
    });
  });

  describe("last step", () => {
    it("shows step 7 of 7", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 6; i++) await user.click(next);
      expect(screen.getByText("Step 7 of 7")).toBeInTheDocument();
    });

    it("shows the match badge for td-revenue", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 6; i++) await user.click(next);
      expect(screen.getByText(/→ "Q1 Revenue" ✓/)).toBeInTheDocument();
    });

    it("shows match caption on last step", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 6; i++) await user.click(next);
      expect(screen.getByText("match ✓")).toBeInTheDocument();
    });

    it("disables Next on last step", async () => {
      const user = userEvent.setup();
      render(<TableWalkerSimple />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 6; i++) await user.click(next);
      expect(next).toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("has a region landmark", () => {
      render(<TableWalkerSimple />);
      expect(
        screen.getByRole("region", {
          name: "Simple table traversal walkthrough",
        }),
      ).toBeInTheDocument();
    });

    it("has an aria-live caption region", () => {
      render(<TableWalkerSimple />);
      expect(
        document.querySelector("[aria-live='polite']"),
      ).toBeInTheDocument();
    });
  });
});
