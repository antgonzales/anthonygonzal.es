import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TableWalkerLarge from "./TableWalkerLarge";

describe("TableWalkerLarge()", () => {
  describe("initial render", () => {
    it("displays step 1 of 5", () => {
      render(<TableWalkerLarge />);
      expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    });

    it("renders the DOM tree diagram", () => {
      render(<TableWalkerLarge />);
      expect(
        screen.getByRole("img", { name: "DOM tree diagram" }),
      ).toBeInTheDocument();
    });

    it("renders the color legend", () => {
      render(<TableWalkerLarge />);
      expect(screen.getByLabelText("Color legend")).toBeInTheDocument();
    });

    it("shows cells evaluated starting at 0", () => {
      render(<TableWalkerLarge />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("shows total cells as 72", () => {
      render(<TableWalkerLarge />);
      expect(screen.getAllByText(/\/ 72/).length).toBeGreaterThan(0);
    });

    it("shows total subtree walks as 144", () => {
      render(<TableWalkerLarge />);
      expect(screen.getByText(/\/ 144/)).toBeInTheDocument();
    });

    it("shows the query as the first caption", () => {
      render(<TableWalkerLarge />);
      expect(
        screen.getByText("getByRole('cell', { name: 'Contractors Actual' })"),
      ).toBeInTheDocument();
    });

    it("renders all row labels", () => {
      render(<TableWalkerLarge />);
      expect(screen.getByText("Salaries")).toBeInTheDocument();
      expect(screen.getByText("Contractors")).toBeInTheDocument();
      expect(screen.getByText("Reserves")).toBeInTheDocument();
    });

    it("disables Prev on first step", () => {
      render(<TableWalkerLarge />);
      expect(
        screen.getByRole("button", { name: "Previous step" }),
      ).toBeDisabled();
    });

    it("enables Next on first step", () => {
      render(<TableWalkerLarge />);
      expect(screen.getByRole("button", { name: "Next step" })).toBeEnabled();
    });
  });

  describe("navigation", () => {
    it("advances to step 2 and shows 18 cells evaluated", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      await user.click(screen.getByRole("button", { name: "Next step" }));
      expect(screen.getByText("Step 2 of 5")).toBeInTheDocument();
      expect(screen.getByText("18")).toBeInTheDocument();
    });

    it("shows 36 subtree walks on step 2", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      await user.click(screen.getByRole("button", { name: "Next step" }));
      expect(screen.getByText("36")).toBeInTheDocument();
    });

    it("advances to step 3 and shows 36 cells evaluated", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      const next = screen.getByRole("button", { name: "Next step" });
      await user.click(next);
      await user.click(next);
      expect(screen.getByText("36")).toBeInTheDocument();
    });

    it("shows 72 subtree walks on step 3", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      const next = screen.getByRole("button", { name: "Next step" });
      await user.click(next);
      await user.click(next);
      expect(screen.getByText("72")).toBeInTheDocument();
    });

    it("goes back to step 1", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      await user.click(screen.getByRole("button", { name: "Next step" }));
      await user.click(screen.getByRole("button", { name: "Previous step" }));
      expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    });
  });

  describe("last step", () => {
    it("shows step 5 of 5", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 4; i++) await user.click(next);
      expect(screen.getByText("Step 5 of 5")).toBeInTheDocument();
    });

    it("shows 38 cells evaluated on last step", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 4; i++) await user.click(next);
      expect(screen.getByText("38")).toBeInTheDocument();
    });

    it("shows 76 subtree walks on last step", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 4; i++) await user.click(next);
      expect(screen.getByText("76")).toBeInTheDocument();
    });

    it("shows the match callout", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 4; i++) await user.click(next);
      expect(screen.getByText(/→ "Contractors Actual" ✓/)).toBeInTheDocument();
    });

    it("shows match caption on last step", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 4; i++) await user.click(next);
      expect(screen.getByText("match ✓")).toBeInTheDocument();
    });

    it("disables Next on last step", async () => {
      const user = userEvent.setup();
      render(<TableWalkerLarge />);
      const next = screen.getByRole("button", { name: "Next step" });
      for (let i = 0; i < 4; i++) await user.click(next);
      expect(next).toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("has a region landmark", () => {
      render(<TableWalkerLarge />);
      expect(
        screen.getByRole("region", {
          name: "Large table traversal walkthrough",
        }),
      ).toBeInTheDocument();
    });

    it("has an aria-live caption region", () => {
      render(<TableWalkerLarge />);
      expect(
        document.querySelector("[aria-live='polite']"),
      ).toBeInTheDocument();
    });
  });
});
