checklist["stuck_general"] = [
    {
        chapter: "1. General tips when stuck",
        checks: [
            {
                title: "general tips",
                description: "Use writeups to get inspiration on how to proceed.",
                code: `# 1. check writeups for similar applications/ machines
https://ippsec.rocks
https://0xdf.gitlab.io/search

# 2. if an exploit does not work, look for another, e.g. online (search by CVE if possible)
# A: "CVE-XXXX-XXXX" PoC site:github.com,
# B: "CVE-XXXX-XXXX" Proof of concept site:github.com
# C: "CVE-XXXX-XXXX" exploit site:github.com`,
                code_language: bash,
            },
            {
                title: "",
                description: "",
                code: ``,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "2. st*ck per protocol",
        checks: [
            {
                title: "protocol: http(s)",
                description: "",
                code: `# 1. check if the service is running http and https on the same port
...

# 2. [LFI REQUIRED] - Check default users for the application(s) (no assumptions), then test SSH key paths for each discovered user via LFI
# PG-box = "DRV4" (user 'viewer' seemed like a app-only account, but had a home directory and an SSH key)
/home/<FOUND_USER>/.ssh/id_rsa
/users/<FOUND_USER>/.ssh/id_rsa
`,
                code_language: bash,
            },
        ]
    },
]

