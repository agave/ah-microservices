#Events

All events have the following structure:

```
{
  type: 'EventType',
  guid: 'Request guid for distributed tracing',
  body: {
    ...
  },
  key: 'Entity key to ensure sequence'
}
```

| Topic | Type | Body |
| --- | --- | --- |
| invoice | InvoiceCreated | ```{ id: int, provider_id: int, amount: double, status: string, created_at: string, updated_at: string }``` |
| invoice | InvoiceUpdated | ```{ id: int, provider_id: int, investor_id: int, amount: double, status: string, created_at: string, updated_at: string }``` |
| invoice | ReservationNotFound | ```{ invoice_id: int, user_id: int }``` |
| user | BalanceReserved | ```{ invoice_id: int, user_id: int }``` |
| user | InsufficientBalance | ```{ invoice_id: int, user_id: int }``` |
| user | FunderNotFound | ```{ invoice_id: int, user_id: int }``` |
