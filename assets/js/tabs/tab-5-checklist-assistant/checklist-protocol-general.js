checklist["protocol_general"] = [
    {
        chapter: "Unknown port (x)",
        checks: [
            {
                title: "general checks unknown ports",
                description: "Unknown ports",
                code: `# 1. 'nmap' and 'nc'
nmap -sC -sV -p x {{RHOST}}
nc -vn {{RHOST}} x

# 2. after connecting with netcat, try common commands like:
help
?
ls
info`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "FTP (21)",
        checks: [
            {
                title: "general checks FTP",
                description: "Pentesting FTP",
                code: `##### REFERENCE:
https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-ftp/index.html?highlight=PENTESTING%20FTP#21---pentesting-ftp                
                
# 1. 'nmap' and 'nc'
nmap -sC -sV -p 21 {{RHOST}} --script=ftp*
nc -vn {{RHOST}} 21

# 2. Check for anonymous login
# anonymous : anonymous
# _anonymous :
# _ftp : ftp

ftp {{RHOST}}
> anonymous
> anonymous
> ls -a # list all files (even hidden)
> binary # set transmission to binary instead of ascii
> ascii # set transmission to ascii instead of binary

# 3. if you can login:
# - Any for sensitive files?
# - Possible webroot directory?
# - Useful paths within files you can access with an other vuln, e.g.: LFI?

# 4. if it is a lot, download all files:
wget -m ftp://anonymous:anonymous@{{RHOST}}
wget -m --no-passive ftp://anonymous:anonymous@{{RHOST}}
`,
                code_language: bash,
            },
            {
                title: "Bruteforce FTP",
                description: "Bruteforce an FTP server utilizing hydra.",
                code: `### ---
# NOTE: if there is a website, extract (if applicable) users and passwords. Use that as a base for the wordlists
### ---

# 1. FTP (plaintext)
# 1A. username + password combination
# 1B. lowercase usernames + password combination
# 1C. -e snr = try 'blank' passwords, 'n' for username = password, 'r' for reversed username
hydra -L users.txt -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} ftp
hydra -L <(tr A-Z a-z < users.txt) -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} ftp`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "SSH (22)",
        checks: [
            {
                title: "general checks SSH",
                description: "Pentesting SSH",
                code: `##### REFERENCE: https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-ssh.html?highlight=pentesting%20ssh#automated-ssh-audit
# 1. utilize ssh-audit for configuration auditing (https://github.com/jtesta/ssh-audit)
ssh-audit {{RHOST}}

# 2. nmap scan & banner grabbin
nmap -sC -sV -p 22 {{RHOST}} --script=ssh*
nc -vn {{RHOST}} 22

# 3. username enumeration
msf> use scanner/ssh/ssh_enumusers`
            },
            {
                title: "Bruteforce SSH",
                description: "Bruteforce an SSH server utilizing hydra.",
                code: `### ---
# NOTE: if there is a website, extract (if applicable) users and passwords. Use that as a base for the wordlists
### ---

# 1. SSH
# 1A. username + password combination
# 1B. lowercase usernames + password combination
# 1C. -e snr = try 'blank' passwords, 'n' for username = password, 'r' for reversed username
hydra -L users.txt -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} ssh
hydra -L <(tr A-Z a-z < users.txt) -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} ssh`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "SMTP (25, 465, 587)",
        checks: [
            {
                title: "general checks SMTP",
                description: "Pentesting SMTP",
                code: `##### REFERENCE: https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-smtp/index.html?highlight=pentesting%20smtp#hacktricks-automatic-commands
# 1. nmap scan & banner grabbing
nmap -sC -sV -p 25 {{RHOST}} --script=smtp*
nc -vn {{RHOST}} 25

# 2. enumerate users using 'smtp-user-enum' 
# --- USE NAMES FROM WEBSITE IF POSSIBLE --- #
smtp-user-enum -M VRFY -U /usr/share/wordlists/seclists/Usernames/Names/names.txt -t {{RHOST}}
smtp-user-enum -M RCPT -U /usr/share/wordlists/seclists/Usernames/Names/names.txt -t {{RHOST}}`
            },
            {
                title: "interacting with SMTP",
                description: "Know how to interact with SMTP - utilizing SWAKS.",
                code: `# 1. Use swaks to deliver an email with an attachment
swaks --to RECIEVER@example.com --from SENDER@example.com --attach @config.Library-ms --server {{RHOST}} --body "Please checkout this document" --header "Subject: Urgent Configuration Setup"

# 2. Use swaks to deliver an email with an attachment and authentication
swaks --to RECIEVER@example.com --from SENDER@example.com -ap --attach @config.Library-ms --server {{RHOST}} --body "Please checkout this document" --header "Subject: Urgent Configuration Setup"
`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "POP3 (110, 995)",
        checks: [
            {
                title: "general checks POP3",
                description: "Pentesting POP3",
                code: `##### REFERENCE: https://hackviser.com/tactics/pentesting/services/pop3
# 1. nmap scan & banner grabbing
nmap -sC -sV -p 110 {{RHOST}} --script=pop3*
nc -vn {{RHOST}} 110

# 2. show the capabilities of the POP3 server
telnet {{RHOST}} 110 # plain
CAPA`
            },
            {
                title: "bruteforce POP3",
                description: "bruteforce a pop3 server utilizing hydra.",
                code: `### ---
# NOTE: if there is a website, extract (if applicable) users and passwords. Use that as a base for the wordlists
### ---

# 1. POP3 (plaintext)
# 1A. username + password combination
# 1B. lowercase usernames + password combination
# 1C. -e snr = try 'blank' passwords, 'n' for username = password, 'r' for reversed username
hydra -L users.txt -P /usr/share/wordlists/fasttrack.txt -e snr {{RHOST}} pop3
hydra -L <(tr A-Z a-z < users.txt) -P /usr/share/wordlists/fasttrack.txt -e snr {{RHOST}} pop3

# 2. POP3S (SSL/TLS)
hydra -L users.txt -P /usr/share/wordlists/fasttrack.txt -e snr {{RHOST}} pop3s
hydra -L <(tr A-Z a-z < users.txt) -P /usr/share/wordlists/fasttrack.txt -e snr {{RHOST}} pop3s`,
                code_language: bash,
            },
            {
                title: "interacting with POP3",
                description: "interact (authenticated) with a pop3 server.",
                code: `# 1. utilizing telnet (plaintext)
telnet {{RHOST}} 110
USER <username>
PASS <password>

# 2. utilizing openssl (SSL/TLS)
openssl s_client -connect {{RHOST}}:995 -crlf -quiet

# 3. Once authenticated, use the following commands:
# List messages
LIST

# Message count and size
STAT

# Get message UIDs
UIDL

# Retrieve specific messages
RETR 1  # Retrieve first email
RETR 2  # Second email

QUIT`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "IDENT (113)",
        checks: [
            {
                title: "general checks ident",
                description: "Pentesting ident",
                code: `##### REFERENCE: https://blog.1nf1n1ty.team/hacktricks/network-services-pentesting/113-pentesting-ident
# ---
# DESCRIPTION:
# ---
# What's Happening when the IDENT service is running

# 1. Port 113 (ident service) is open and responding
# 2. When nmap's -sC flag runs its default NSE scripts, it includes the auth-owners script
# 3. This script queries the ident service on port 113, asking: "Which user owns the process listening on port X?"
# 4. The ident service responds with the username for each port

# 1. use nmap to check for ident service
nmap -sC {{RHOST}}

# example output
Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-28 11:55 +0100
Nmap scan report for 192.168.204.60
Host is up (0.021s latency).
Not shown: 994 filtered tcp ports (no-response)
PORT      STATE  SERVICE
22/tcp    open   ssh
|_auth-owners: root # USER root on system
| ssh-hostkey: 
|   2048 75:...
113/tcp   open   ident
|_auth-owners: nobody # USER nobody on system
8080/tcp  open   http-proxy
|_http-title: Redmine
| http-robots.txt: 10 disallowed entries 
| /projects/test/....
10000/tcp open   snet-sensor-mgmt
|_auth-owners: eleanor # USER eleanor on system

# 2. if there is a SSH server, try connecting with the identified users
# bruteforce with hydra 'SSH'
`
            }
        ]
    },
    {
        chapter: "IMAP (143, 993)",
        checks: [
            {
                title: "general checks IMAP",
                description: "Pentesting IMAP",
                code: `##### REFERENCE: https://hackviser.com/tactics/pentesting/services/imap
# 1. nmap scan & banner grabbing
nmap -sC -sV -p 143 {{RHOST}} --script=imap*
nc -vn {{RHOST}} 143

# 2. get capabilities of the IMAP server
telnet {{RHOST}} 143 # plain
a1 CAPABILITY`
            },
            {
                title: "bruteforce IMAP",
                description: "bruteforce a imap server utilizing hydra.",
                code: `# 1. IMAP (plaintext)
# 1A. username + password combination
# 1B. lowercase usernames + password combination
# 1C. -e snr = try 'blank' passwords, 'n' for username = password, 'r' for reversed username
hydra -L users.txt -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} imap
hydra -L <(tr A-Z a-z < users.txt) -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} imap

# 2. IMAPS (SSL/TLS)
hydra -L users.txt -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} imaps
hydra -L <(tr A-Z a-z < users.txt) -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} imaps`,
                code_language: bash,
            },
            {
                title: "interacting with IMAP",
                description: "interact (authenticated) with a pop3 server.",
                code: `##### OPTION 1: USING curl
# 1. list mailboxes
curl -u {{USERNAME}}:{{PASSWORD}} imap://{{RHOST}}/

# 2. Read the first email in the INBOX
curl -u {{USERNAME}}:{{PASSWORD}} imap://{{RHOST}}/INBOX -X "FETCH 1 BODY[]"

# IMAPS
curl -u username:password imaps://target.com/ --insecure

##### OPTION 2: USING telnet
# 1. Connect to IMAP server
telnet {{RHOST}} 143

# 2. Basic IMAP conversation
a1 LOGIN username password
a2 LIST "" "*"
a3 SELECT INBOX
a4 FETCH 1 BODY[]
a5 LOGOUT`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "SNMP (161)",
        checks: [
            {
                title: "general checks SNMP",
                description: "Pentesting SNMP",
                code: `##### REFERENCE: https://hackviser.com/tactics/pentesting/services/snmp
# 1. read the 'public' community string from a target host               
snmpwalk -v1 -c public {{RHOST}}

# 2. read the 'public' community string from a target host where hex output is converted to ASCII (suggested)
snmpwalk -v2c -c public {{RHOST}} -Oa

##### most common 'community strings' that can be utilized by snmpwalk
public
private
manager
security

##### versions utilized by snmp
v1
v2
v2c
v3

# 3. check the nsExtendObjects
snmpwalk -v 2c -c public {{RHOST}} nsExtendObjects

### ---
# snmp-check
### ---

# 1. basic usage snmp-check
snmp-check -t {{RHOST}} -c public

# 2. if community string is unknown, it might try default ones like 'public'
snmp-check -t {{RHOST}}

# search for:
# - user accounts/ passwords
# - software (versions)
# - network configuration`
            },
        ]
    },
    {
        chapter: "VNC (5900)",
        checks: [
            {
                title: "general checks VNC",
                description: "Pentesting VNC",
                code: `##### REFERENCE: https://www.emmanuelsolis.com/oscp.html
# 1. nmap scan & banner grabbing
nmap -p 5900 --script vnc-info,vnc-auth-bypass {{RHOST}}

# 2. use vncviewer or tigervnc to connect to a VNC server
vncviewer {{RHOST}}:5900

# 3. more detailed connection with authentication
vncviewer -passwd /path/to/passwordfile {{RHOST}}:5900

# common default credentials:
No Password
vnc
1234
`
            },
            {
                title: "bruteforce VNC",
                description: "Pentesting VNC",
                code: `##### REFERENCE: https://www.emmanuelsolis.com/oscp.html
# 1A. username + password combination
# 1B. lowercase usernames + password combination
# 1C. -e snr = try 'blank' passwords, 'n' for username = password, 'r' for reversed username
hydra -L users.txt -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} vnc
hydra -L <(tr A-Z a-z < users.txt) -P /usr/share/wordlists/fasttrack.txt -e nsr {{RHOST}} vnc`
            },
        ]
    },
    {
        chapter: "REDIS (6379)",
        checks: [
            {
                title: "general checks REDIS",
                description: "Pentesting REDIS",
                code: `##### REFERENCE: https://www.emmanuelsolis.com/oscp.html
# 1. nmap scan & banner grabbing
nmap -p 6379 --script "redis-info,redis-rce" {{RHOST}}

# 2. connect to redis server
redis-cli -h {{RHOST}} -p 6379

### ---
# EXPLOIT REDIS
### ---

# 1. search for known Redis vulnerabilities and exploitation techniques
searchsploit redis

# 2. run a Redis rogue server to capture data or execute commands
python3 redis-rogue-server.py -p 6379

# 3. run Redis RCE exploit using a custom script (replace 'payload' with the desired payload)
python3 redis-rce-exploit.py -h {{RHOST}} -p 6379 -c "whoami"
`
            },
            {
                title: "bruteforce REDIS",
                description: "Pentesting REDIS",
                code: `##### REFERENCE: https://www.emmanuelsolis.com/oscp.html
# 1. Bruteforce Redis server password
redis-cli -h {{RHOST}} -p 6379 -a <password_to_try>`
            },
            {
                title: "Interacting with REDIS",
                description: "Pentesting REDIS",
                code: `##### REFERENCE: https://www.emmanuelsolis.com/oscp.html
# 1. connect to Redis server
redis-cli -h {{RHOST}} -p 6379

# 1A After connecting, list databases and their keys
info
keys *
select <db_number> # select database number (0 by default)

# 2 Example of running commands
set mykey myvalue
get mykey

config get *  # View all configuration options
shutdown      # Shutdown the Redis server`
            },
        ]
    },
]