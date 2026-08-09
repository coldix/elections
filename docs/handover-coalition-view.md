# Coalition matrix view handover

Implemented a reversible Liberal–Nationals combined display for the Victorian 2026 policy matrix.

- `data/vic2026/coalitions.yaml` classifies each issue as `coalition_shared`, `mixed`, or `party_specific`.
- Liberal and Nationals remain separate registered parties and separate policy records.
- `/parties/matrix` defaults to four display columns and offers a one-click five-party view.
- Shared cells show one representative record plus a separate-record drill-down.
- Mixed and party-specific cells show both party records inside the combined Coalition column.
- `scripts/validate-coalitions.mjs` enforces complete issue coverage and underlying member records.
- `coalitions.json` is exported alongside the existing party-level policy data.

The policy CSV remains party-level to avoid duplicate virtual-Coalition claims.
