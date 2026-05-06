# Asset Registration API Payload

This document describes the backend asset registration payload and UI/UX guidance for frontend/client portal forms.

## Endpoint

- `POST /api/assets`
- `PUT /api/assets/:id`

## Primary fields

- `name` (string, required)
  - Asset name or description.
- `type` (string, required)
  - Asset type/category label, e.g. `vehicle`, `office equipment`, `license`.
- `branch_id` (integer, required)
  - Branch where the asset is recorded.
- `issue_date` (date, optional)
  - Asset issue or start date.
- `expiry_date` (date, optional)
  - Expiration date if applicable.
- `note` (string, optional)
  - Additional asset notes.
- `record_type` (string, optional)
  - Defaults to `resource` if not supplied.

## Finance and accounting fields

- `purchase_cost` (decimal, optional)
  - Asset acquisition cost. Use this field when recording actual purchase value.
- `acquisition_cost` (decimal, optional)
  - Alias for `purchase_cost`; frontend forms may submit either field.
- `purchase_date` (date, optional)
  - Asset purchase/acquisition date.
- `account_id` (integer, required when `purchase_cost` or `depreciation_rate` is provided)
  - Link to the chart of accounts.
- `depreciation_method` (string, optional)
  - Depreciation method. Allowed values:
    - `straight_line`
    - `declining_balance`
  - Default is `straight_line`.
- `depreciation_rate` (decimal percent, optional)
  - Annual depreciation rate, e.g. `10.00` for 10%.
  - Required for straight line unless `useful_life` is provided.
- `useful_life` (integer, optional)
  - Useful life in years.
  - Required for declining balance and can also be used for straight line calculation.
- `salvage_value` (decimal, optional)
  - Estimated salvage/residual value.
- `current_value` (decimal, optional)
  - Current book value of the asset.

## Asset registration fields

- `category` (string, optional)
  - Asset category label shown in the UI.
- `serial_number` (string, optional)
  - Asset serial or registration number.
- `physical_location` (string, optional)
  - Asset location or physical custody details.
- `custodian_id` (integer, optional)
  - Employee ID assigned as custodian.
- `budget_id` (integer, optional)
  - Account budget record linked to the asset.

## Documents

- `documents` (array of objects, optional)
  - Each object can include:
    - `document_name` (string)
    - `document_url` (string)

## Response enrichment

The backend returns asset records with linked reference info:

- `account_name_ar`, `account_name_en`, `account_code`
- `custodian_name`
- `budget_amount`, `budget_fiscal_year`, `budget_fiscal_month`
- `branch_name`

## Sample payload

```json
{
  "name": "Asset Printer #42",
  "type": "office equipment",
  "branch_id": 2,
  "issue_date": "2026-04-01",
  "expiry_date": "2029-04-01",
  "note": "Assigned to HR office.",
  "category": "Office Equipment",
  "serial_number": "PRN-2026-0042",
  "physical_location": "Main Office - Floor 3",
  "custodian_id": 90,
  "budget_id": 15,
  "acquisition_cost": 1250.00,
  "purchase_date": "2026-04-01",
  "account_id": 12,
  "depreciation_rate": 10.00,
  "salvage_value": 125.00,
  "current_value": 1125.00,
  "documents": [
    {
      "document_name": "Purchase Invoice",
      "document_url": "https://..."
    }
  ]
}
```

## UI/UX guidance

- Group asset registration fields into sections:
  1. Asset details
  2. Location/custodian
  3. Purchase and accounting
  4. Depreciation values
  5. Supporting documents
- Show `account_id` as a chart-of-accounts selector when cost or depreciation fields are entered.
- Use `acquisition_cost` in the UI label as the primary field name, but submit it as either `acquisition_cost` or `purchase_cost`.
- Make `budget_id` a dropdown linked to available budgets for the selected account/branch.
- Keep `serial_number` and `physical_location` as simple text inputs.
- Display selected custodian as an employee search or autocomplete.
- Display depreciation options as a curated dropdown using `/api/assets/depreciation/methods`.
- If the selected method is `declining_balance`, show `useful_life` as a required numeric field.
- For `straight_line`, allow either an annual rate or a useful life value.

## Notes

- The backend enforces the `account_id` link only when financial values are present.
- The frontend may request depreciation methods from `GET /api/assets/depreciation/methods`.
- The frontend can preview depreciation schedules using `POST /api/assets/depreciation/preview`.
- The system also supports automated monthly depreciation posting via `POST /api/accounting/assets/run-depreciation`.
- If the frontend or client portal uses an existing asset form, add the new fields above and ensure they are posted in the request body.
