checklist["osint_general"] = [
    {
        chapter: "1. General OSINT",
        checks: [
            {
                title: "OSINT - shodan / censys",
                description: "Shodan is a search engine for internet-connected devices such as servers, routers, webcams and IoT devices",
                code: `# 1. shodan
https://www.shodan.io/search?query={{RHOST}}

# 2. censys
https://search.censys.io/search?resource=hosts&q={{RHOST}}
`,
                code_language: bash,
            },
            {
                title: "OSINT - Google Dork",
                description: "Try to find information about the target domain.",
                code: `# use the built-in tool/ query the following commands
# use the following resource: https://dorksearch.com/

# find exposed directories
site:{{RHOST}} intitle:"index of"

# search for specific file types
site:{{RHOST}} (filetype:pdf OR filetype:doc OR filetype:xls)

# locate configuration files
site:{{RHOST}} (ext:conf OR ext:cnf OR ext:config OR ext:ini OR ext:env)

# find pages containing sensitive keywords
site:{{RHOST}} (intext:"password" OR intext:"username" OR intext:"login")

# discover publicly accessible backup and old files
site:{{RHOST}} (ext:bak OR ext:old OR ext:backup OR ext:sql)`,
                code_language: bash,
            },
            {
                title: "OSINT - Metadata extraction",
                description: "Retrieve PDFs, images, or documents from the target's website / online.",
                code: `# Use tools like ExifTool to extract metadata from images or files found on the website, which may reveal usernames, software versions, or internal paths.
exiftool <file>`,
                code_language: bash,
            },
            {
                title: "OSINT - Public Code Repositories",
                description: "Search public code repositories like GitHub or GitLab for information related to the target organization.",
                code: `# Search GitHub for repositories belonging to the target organization
# Replace 'exampleorg' with the organization's GitHub username
https://github.com/exampleorg

# Use GitHub's advanced search to find mentions of the target domain
https://github.com/search?q={{RHOST}}&type=Code

# Clone a repository of interest
git clone https://github.com/exampleorg/repository-name.git

# Use tools like 'gitdumper' to dump exposed '.git' directories from websites
# Install GitTools: https://github.com/internetwache/GitTools
gitdumper http://{{RHOST}}/.git/ /path/to/dump/`,
                code_language: bash,
            },
            {
                title: "OSINT - Public Code Repositories (Github copilot)",
                description: "Search public code repositories like GitHub or GitLab for information related to the target organization.",
                code: `# 1. navigate to https://cs.github.com

# 2. search for a specific term, e.g.: for OPEN_AI api keys:
"OPENAI_API_KEY" "sk-" "T3BlbkFJ"`,
                code_language:
                bash,
            },
            {
                title: "OSINT - tool/ resource collection",
                description: "Use the OSINTFRAMEWORK to check for information about the target domain.",
                code: `# 1. osint framework
https://osintframework.com/

# 2. osint sh
https://osint.sh

# 3. start.me OSINT resources
https://start.me/p/gy1BgY/osint-tools-and-resources

# 4. OSINT resources for each country
http://cybdetective.com/osintmap/`,
                code_language: bash,
            },
            {
                title: "OSINT - spiderfoot",
                description: "Utilize the tool 'Spiderfoot' to help with automatic OSINT of the target.",
                code: `# 1. Spiderfoot is by default installed on kali. Start spiderfoot with the following command:
spiderfoot -l 127.0.0.1:4000

# 2. Navigate with your browser to the target webapp
# 3. create a new scan. e.g. on the domain {{RHOST}}`,
                code_language: bash,
            }
        ]
    },
    {
        chapter: "2. DNS OSINT",
        checks: [
            {
                title: "OSINT - whois",
                description: "gather information about the target domain.",
                code: `# whois query
whois {{RHOST}}

##### look at fields that can tell you more about the target, e.g.:
# - Registrar
# - Registrant Organization
# - Registrant Name
# - DNS Name Server
# - e-mail addresses

# online webapp whois
https://whois.domaintools.com/example.com
`,
                code_language: bash,
            },
            {
                title: "OSINT - Gather subdomains",
                description: "Gather subdomains of the target domain.",
                code: `# More tools can be found at the following link:
# Navigate to https://crt.sh to find subdomains.
# Navigate to https://osint.sh/subdomain/ to find subdomains.

# Subfinder
subfinder -d {{RHOST}}

# Sublist3r
sublist3r -d {{RHOST}}

# BBOT (https://github.com/blacklanternsecurity/bbot)
# Active Enumeration
bbot -t {{RHOST}} -f subdomain-enum

# Passive Enumeration Only
bbot -t {{RHOST}} -f subdomain-enum -rf passive

# theHarvester
theHarvester -d {{RHOST}} -b all -l 200`,
                code_language: bash,
            },
            {
                title: "OSINT - Gather SPF/DKIM/DMARC records of the target domain(s)",
                description: "Gather SPF/DKIM/DMARC records of the target domain(s)",
                code: `# Using dig to check DNS records
domain="{{RHOST}}"

# Check SPF record
dig +short TXT \${{{RHOST}}} | grep 'v=spf1'

# Check DMARC record
dig +short TXT _dmarc.\${{{RHOST}}} | grep 'v=DMARC1'

# Check DKIM record
dig +short TXT default._domainkey.\${{{RHOST}}} | grep 'v=DKIM1'

# Using MXToolbox
# Visit the following link for DNS lookups:
# https://mxtoolbox.com/
`,
                code_language: bash,
            },
            {
                title: "OSINT - Gather email addresses/ passwords",
                description: "Use tools like email-finder to find email addresses/passwords related to the target domain.",
                code: `# anymailfinder
https://newapp.anymailfinder.com/search/single

# using theHarvester
theHarvester -d {{RHOST}} -b all -l 200

# gather e-mail addresses based on a domain
https://prospeo.io/domain-search

# tool that has a DB leak of username/password combinations
https://www.proxynova.com/tools/comb/

# using intelbase.is for looking up specific e-mail addresses
https://intelbase.is/

`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "3. Website OSINT",
        checks: [
            {
                title: "OSINT - Waybackurls & GAU",
                description: "Retrieve URLS that are saved in the waybackmachine and (optional) validate if they exist by curling them",
                code: `# 1. use GAU (Get All URLs) to retrieve all URLS available and verify if they exist
gau {{RHOST}} | httpx
                
# 2. use waybackurls for urls and verify with httpx if they exist
waybackurls {{RHOST}} | httpx

# 3. Alternatively, use the following bash one-liner if you don't have httpx installed
# Retrieve all URLS using waybackurls and (optional) 
# validate if they exist
for url in $(echo "http://{{RHOST}}" | waybackurls); do status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 0.5 "$url"); [[ "$status_code" != "404" && "$status_code" != "000" ]] && echo "$url"; done`,
                code_language: bash,
            },
            {
                title: "OSINT - urlquery.net",
                description: "Use urlquery.net to gather information about URLs related to the target domain.",
                code: `# 1. navigate to https://urlquery.net/ and insert the target URL`,
                code_language: bash,
            },
            {
                title: "OSINT - Check technologies used",
                description: "Use either a online tool to check which technologies are used.",
                code: `# builtwith
https://builtwith.com/`,
                code_language: bash,
            },
            {
                title: "OSINT - Security headers",
                description: "Retrieve the security headers of a website through https://securityheaders.com",
                code: `# 1. navigate to https://securityheaders.com

# 2. fill in the relevant domain
http://{{RHOST}}`,
                code_language: bash,
            },
            {
                title: "OSINT - SSL labs",
                description: "Retrieve the status of the SSL certificates through https://www.ssllabs.com/ssltest/",
                code: `# 1. navigate to https://www.ssllabs.com/ssltest/

# 2. fill in the relevant domain
https://{{RHOST}}`,
                code_language: bash,
            }
            ,
        ],
    },
]


checklist["osint_dark_web"] = [
    {
        chapter: "1. Dark web OSINT",
        checks: [
            {
                title: "test",
                description: "test",
                code: `test`,
                code_language: bash,
            }
        ]
    }
]
