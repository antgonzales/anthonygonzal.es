import { WalkerShell } from "./walker/WalkerShell";
import { NodeBox, StaticNode } from "./walker/NodeBox";
import { useWalker } from "./walker/useWalker";
import { VARIANT_STYLES } from "./walker/types";
import type { Step, Variant } from "./walker/types";

// DOM tree:
//
// <table>
//   <thead>
//     <tr>
//       <th id="col-q">Quarter</th>
//       <th id="col-rev">Revenue</th>
//       <th id="col-exp">Expenses</th>
//     </tr>
//   </thead>
//   <tbody>
//     <tr>
//       <th id="row-q1" scope="row">Q1</th>
//       <td aria-labelledby="row-q1 col-rev">$1.2M</td>
//       <td aria-labelledby="row-q1 col-exp">$900K</td>
//     </tr>
//   </tbody>
// </table>
//
// Query: getByRole('cell', { name: 'Q1 Revenue' })
// Steps: scan → aria-labelledby found → visit row-q1 → "Q1" → visit col-rev
//        → "Revenue" → name: "Q1 Revenue" → match ✓

interface IdrefToken {
  id: string;
  variant: Variant;
  badge?: string;
}

interface TableStep extends Step {
  idrefs?: IdrefToken[];
  resolvedName?: string;
}

const steps: TableStep[] = [
  {
    nodes: {
      "td-revenue": "scanning",
      "td-expenses": "scanning",
    },
    caption: "getByRole('cell', { name: 'Q1 Revenue' })",
  },
  {
    nodes: { "td-revenue": "checking" },
    caption: "",
    idrefs: [
      { id: "row-q1", variant: "scanning" },
      { id: "col-rev", variant: "scanning" },
    ],
  },
  {
    nodes: { "td-revenue": "checking", "row-q1": "checking" },
    caption: "",
    idrefs: [
      { id: "row-q1", variant: "checking" },
      { id: "col-rev", variant: "scanning" },
    ],
  },
  {
    nodes: { "td-revenue": "checking", "row-q1": "contributing" },
    badge: { "row-q1": '"Q1"' },
    caption: "",
    idrefs: [
      { id: "row-q1", variant: "contributing", badge: '"Q1"' },
      { id: "col-rev", variant: "scanning" },
    ],
  },
  {
    nodes: {
      "td-revenue": "checking",
      "row-q1": "contributing",
      "col-rev": "checking",
    },
    badge: { "row-q1": '"Q1"' },
    caption: "",
    idrefs: [
      { id: "row-q1", variant: "contributing", badge: '"Q1"' },
      { id: "col-rev", variant: "checking" },
    ],
  },
  {
    nodes: {
      "td-revenue": "checking",
      "row-q1": "contributing",
      "col-rev": "contributing",
    },
    badge: { "row-q1": '"Q1"', "col-rev": '"Revenue"' },
    caption: "",
    idrefs: [
      { id: "row-q1", variant: "contributing", badge: '"Q1"' },
      { id: "col-rev", variant: "contributing", badge: '"Revenue"' },
    ],
    resolvedName: '"Q1 Revenue"',
  },
  {
    nodes: {
      "td-revenue": "contributing",
      "row-q1": "contributing",
      "col-rev": "contributing",
      "td-expenses": "rejected",
    },
    badge: {
      "row-q1": '"Q1"',
      "col-rev": '"Revenue"',
      "td-revenue": '"Q1 Revenue" ✓',
    },
    caption: "match ✓",
  },
];

function IdrefQueue({
  idrefs,
  resolvedName,
}: {
  idrefs: IdrefToken[];
  resolvedName?: string;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
      <div className="font-mono text-[0.7rem] text-neutral-500 dark:text-neutral-400 mb-2">
        aria-labelledby IDREFs
      </div>
      <div className="flex items-start gap-3 flex-wrap">
        {idrefs.map((token) => {
          const styles = VARIANT_STYLES[token.variant];
          return (
            <div key={token.id} className="inline-flex flex-col items-start">
              <div
                className={[
                  "font-mono text-[0.8125rem] px-2 py-0.5 rounded transition-all duration-200",
                  `${styles.ring} ${styles.bg} ${styles.text}`,
                ].join(" ")}
              >
                #{token.id}
              </div>
              {token.badge && (
                <div className="font-mono text-[0.75rem] mt-0.5 ml-1 text-green-700">
                  {token.badge}
                </div>
              )}
            </div>
          );
        })}
        {resolvedName && (
          <div className="font-mono text-[0.8125rem] text-neutral-500 dark:text-neutral-400 self-center">
            → <span className="text-green-700 font-medium">{resolvedName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TableWalkerSimple() {
  const { stepIndex, currentStep, isFirst, isLast, total, next, prev } =
    useWalker(steps);
  const nodeVariants = currentStep.nodes;
  const badges = currentStep.badge ?? {};
  const idrefs = currentStep.idrefs;
  const resolvedName = currentStep.resolvedName;

  return (
    <WalkerShell
      label="Simple table traversal walkthrough"
      caption={currentStep.caption}
      stepIndex={stepIndex}
      total={total}
      isFirst={isFirst}
      isLast={isLast}
      onNext={next}
      onPrev={prev}
    >
      {/* table */}
      <div className="mb-1">
        <StaticNode label="<table>" />
      </div>

      {/* thead */}
      <div className="pl-5 mb-1">
        <StaticNode label="<thead>" />
        <div className="pl-5 mt-1 mb-1">
          <StaticNode label="<tr>" />
          <div className="pl-5 mt-1 flex flex-wrap gap-2 items-start">
            <StaticNode label='<th id="col-q">Quarter</th>' />
            <NodeBox
              id="col-rev"
              label='<th id="col-rev">Revenue</th>'
              nodeVariants={nodeVariants}
              badges={badges}
            />
            <StaticNode label='<th id="col-exp">Expenses</th>' />
          </div>
        </div>
      </div>

      {/* tbody */}
      <div className="pl-5">
        <StaticNode label="<tbody>" />
        <div className="pl-5 mt-1">
          <StaticNode label="<tr>" />
          <div className="pl-5 mt-1 flex flex-wrap gap-2 items-start">
            <NodeBox
              id="row-q1"
              label='<th id="row-q1" scope="row">Q1</th>'
              nodeVariants={nodeVariants}
              badges={badges}
            />
            <NodeBox
              id="td-revenue"
              label='<td aria-labelledby="row-q1 col-rev">$1.2M</td>'
              nodeVariants={nodeVariants}
              badges={badges}
            />
            <NodeBox
              id="td-expenses"
              label='<td aria-labelledby="row-q1 col-exp">$900K</td>'
              nodeVariants={nodeVariants}
              badges={badges}
            />
          </div>
        </div>
      </div>

      {/* IDREF queue */}
      {idrefs && <IdrefQueue idrefs={idrefs} resolvedName={resolvedName} />}
    </WalkerShell>
  );
}
