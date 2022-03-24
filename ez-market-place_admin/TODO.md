# TODO - EZ Market Place Admin

### Target: v1.0

## TO DO
- Statistics
  - [ ] Add Stats landing page
  - [ ] Add graph for
    - [ ] High level Market stats
    - [ ] Pipeline Templates stats
- Multi Factor Authentication
  - [x] Integrate with Okta Dev
  - [x] Integrate with Okta Production
  - [x] Admin pages to provide Okta token to Admin API endpoints
- ~~RBAC~~ (👈 Managed in Okta MFA)
  - [ ] ~~Add User Admin page~~
  - [ ] ~~Add Roles Admin page~~
  - [ ] ~~Add landing Admin page~~
  - [ ] ~~Add navigation in Users and Roles Admin pages~~
- Admin Pipelines
  - [x] Get Pipelines
  - [x] List Pipelines
  - [ ] Review Pipeline
    - [ ] Action bar (with Return to List button/link)
    - [ ] Icon/logo/visual
    - [ ] ReadMe
    - [ ] Collection
      - [ ] Check for sensitive information
    - [ ] Mapping
      - [ ] Check for sensitive information
  - [x] Add Pipeline
  - [ ] Modify Pipeline
    - [x] Name
    - [x] Publisher
    - [ ] Collection
    - [ ] Mapping
    - [ ] Icon/logo/visual
    - [ ] ReadMe
    - [ ] Stats
    - [x] Status / Visibility
  - [x] Delete Pipeline
  - [ ] Sends Message/Notification to Pipeline's Publisher
- Admin Publishers
  - [x] Get Publishers
  - [x] Review Publishers
    - [x] Display stats about received and send messages and published templates
  - [x] Add Publisher
  - [x] Modify Publisher Display Name
  - [x] Delete Publisher
- Admin Notifications
  - [x] Get Statuses
  - [x] Review Notifications
    - [x] Add Identicons avatars
    - [x] Display timestamps as "Time ago"
  - [x] Sends Message/Notification
    - [x] To specific Publisher
    - [x] To all users
  - [x] Modify Notification
    - [x] Sender
    - [x] Recipient
    - [x] Message
    - [x] Status / Visibility
  - [x] Delete Notification
- Error Handling
  - [ ] Detect errors in API response

## TO FIX

## TO TEST

