# Security Specification for Indian Delivery Ltd

## 1. Data Invariants
- A shipment must have a unique tracking number.
- A shipment must have a status.
- Only authorized users (admins) can create or update shipments.
- Public users can only read individual shipment status via tracking number.

## 2. The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create a shipment without being logged in. (Expected: DENIED)
2. **Bulk Leak**: Attempt to list all shipments without being logged in. (Expected: DENIED)
3. **Status Poisoning**: Attempt to update shipment status to "Delivered" without being an admin. (Expected: DENIED)
4. **Shadow Field injection**: Attempt to update a shipment with `isAdmin: true`. (Expected: DENIED)
5. **ID Poisoning**: Attempt to create a shipment with a 2MB string as ID. (Expected: DENIED)
6. **Timeline Forgery**: Attempt to add a tracking event to someone else's shipment. (Expected: DENIED)
7. **Negative Weight**: Attempt to create a shipment with negative weight (if we had weight).
8. **Invalid Status**: Attempt to set status to "Flying". (Expected: DENIED)
9. **Timestamp Spoofing**: Attempt to set `createdAt` to a date in the future. (Expected: DENIED)
10. **Immutable Field Change**: Attempt to change the `trackingNumber` of an existing shipment. (Expected: DENIED)
11. **Deletion Attack**: Attempt to delete a shipment as a public user. (Expected: DENIED)
12. **PII Scraping**: Attempt to query shipments by email without being an admin. (Expected: DENIED)

## 3. Test Runner (Conceptual)
`firestore.rules.test.ts` will verify these cases.
