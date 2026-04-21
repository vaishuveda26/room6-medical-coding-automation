# 15. Unit Test Cases

## 1. Authentication Test Cases

| ID | Test Case | Precondition | Expected Result |
|---|---|---|---|
| AUTH-001 | Login with valid admin credentials | Admin user exists | Token returned with admin role |
| AUTH-002 | Login with invalid password | User exists | 401 error |
| AUTH-003 | Register admin | Valid payload | New admin user created |
| AUTH-004 | Register doctor without specialization | Role doctor selected | 400 validation/business error |

## 2. Patient Module Test Cases

| ID | Test Case | Precondition | Expected Result |
|---|---|---|---|
| PAT-001 | Create patient with valid fields | Admin authenticated | Patient created |
| PAT-002 | Create patient with invalid gender | Admin authenticated | 422 validation error |
| PAT-003 | Search patient by partial name | Patients exist | Matching records returned |
| PAT-004 | Update patient details | Patient exists | Updated record returned |
| PAT-005 | Delete patient | Patient exists | 204 response and patient removed |

## 3. Doctor Module Test Cases

| ID | Test Case | Precondition | Expected Result |
|---|---|---|---|
| DOC-001 | Create doctor with valid payload | Admin authenticated | Doctor and linked user created |
| DOC-002 | Create doctor with duplicate email | Existing email present | 400 error |
| DOC-003 | Update doctor profile | Doctor exists | Updated doctor response |
| DOC-004 | Update doctor email to duplicate email | Another user with same email exists | 400 error |
| DOC-005 | List doctors | Authorized user | Doctor list returned |

## 4. Medicine Module Test Cases

| ID | Test Case | Precondition | Expected Result |
|---|---|---|---|
| MED-001 | Create medicine with unique code | Admin authenticated | Medicine created |
| MED-002 | Create medicine with duplicate code | Existing code present | 400 error |
| MED-003 | Search medicine by symptoms keyword | Records exist | Matching medicines returned |
| MED-004 | Update medicine details | Medicine exists | Updated medicine returned |
| MED-005 | Delete medicine | Medicine exists | 204 response |

## 5. Appointment Module Test Cases

| ID | Test Case | Precondition | Expected Result |
|---|---|---|---|
| APT-001 | Create appointment with valid future date | Patient and doctor exist | Appointment created |
| APT-002 | Create appointment in past | Valid patient and doctor | 400 error |
| APT-003 | Create overlapping appointment for same doctor | Existing slot present | 400 error |
| APT-004 | Update appointment status | Appointment exists | Status updated |
| APT-005 | Reschedule appointment to valid slot | Admin authenticated | Appointment updated |
| APT-006 | Doctor attempts forbidden reschedule | Doctor user authenticated | 403 error |

## 6. Dashboard Test Cases

| ID | Test Case | Precondition | Expected Result |
|---|---|---|---|
| DSH-001 | Load dashboard stats | Authorized user | Stats payload returned |
| DSH-002 | Filter dashboard by appointment status | Matching data exists | Filtered queue returned |
| DSH-003 | Today appointment count accuracy | Today appointments exist | Count matches DB |
| DSH-004 | Tomorrow appointment list accuracy | Tomorrow appointments exist | Correct list returned |

## 7. Suggested Automation Coverage
- API unit tests for routes and validation
- service-level tests for appointment conflict handling
- UI integration tests for add/update/search flows
- dashboard smoke tests for navigation cards and schedule views
