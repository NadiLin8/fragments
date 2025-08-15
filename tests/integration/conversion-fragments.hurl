# tests/integration/conversion-fragments.hurl
# Test format conversion functionality

# 1. Create a markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
```
# Hello World
**markdown**

```

HTTP/1.1 201
[Captures]
url: header "Location"
id: jsonpath "$.fragment.id"

# 2. Get original markdown
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/markdown
[Asserts]
body contains "# Hello World"
body contains "**markdown**"

# 3. Convert markdown to HTML
GET http://localhost:8080/v1/fragments/{{id}}.html
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/html; charset=utf-8
[Asserts]
body contains "<h1>Hello World</h1>"
body contains "<strong>markdown</strong>"
