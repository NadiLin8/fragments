# tests/integration/put-fragments.hurl
# Test PUT /fragments/:id route

# 1. Create a fragment first
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Original content`

HTTP/1.1 201
[Captures]
url: header "Location"

# 2. Update the fragment with PUT
PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Updated content`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 15

# 3. GET the fragment to verify update
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Updated content"

# 4. Test error case - wrong content type
PUT {{url}}
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`{"error": "should fail"}`

HTTP/1.1 400
