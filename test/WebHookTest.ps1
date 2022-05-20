$JSON = '{
    "_embedded": {},
    "action": {
      "type": "FLOW.DELETED"
    },
    "actors": {
      "client": {
        "environment": {
          "id": "f924-4d29-9655-3f180b8e-2844efc90f3b"
        },
        "href": "https://api.contoso.com/v1/environments/f924-4d29-9655-3f180b8e-2844efc90f3b/users/cca0eee8-b14a-47c4-b5af-a659a9000f8d",
        "id": "cca0eee8-b14a-47c4-b5af-a659a9000f8d",
        "name": "Contoso Admin Console",
        "type": "CLIENT"
      },
      "user": {
        "environment": {
          "id": "f924-4d29-9655-3f180b8e-2844efc90f3b"
        },
        "href": "https://api.contoso.com/v1/environments/f924-4d29-9655-3f180b8e-2844efc90f3b/users/532b8ef6-549d-4915-9e94-778a24adeac2",
        "id": "532b8ef6-549d-4915-9e94-778a24adeac2",
        "name": "joe.dirt@contoso.com",
        "population": {
          "id": "be049ad9-79dd-4b0c-83e4-6382c6f52acc"
        },
        "type": "USER"
      }
    },
    "id": "9f47a694-18c7-4524-8491-b6b4aab4485d",
    "recordedAt": "2022-03-14T21:15:22.359Z",
    "resources": [
      {
        "environment": {
          "id": "f924-4d29-9655-3f180b8e-2844efc90f3b"
        },
        "href": "https://api.contoso.com/v1/environments/f924-4d29-9655-3f180b8e-2844efc90f3b/flows/03636f74-a2b0-44e0-9954-9c27eaee0d16",
        "id": "03636f74-a2b0-44e0-9954-9c27eaee0d16",
        "name": "03636f74-a2b0-44e0-9954-9c27eaee0d16",
        "type": "FLOW"
      }
    ],
    "result": {
      "description": "Flow completed with policy Admin",
      "status": "SUCCESS"
    }
  }
  '

# $JSON = '{"action":{"type":"FLOW.DELETED"}}'
# $JSON = '{"SAMPLE":{"LOG":"BLA BLA"}}'
Invoke-RestMethod -Uri 'http://192.168.0.123:8080/webhook' -Method 'post' -Body $JSON | Out-Null
