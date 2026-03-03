usefullCommandList["linux_vs_windows"] = [

    // chapter 1
    // ifconfig, ping, netstat, ssh, scp, curl, tcpdump, rdp
    {
        chapter: "1. Networking",
        chapter_commands: [
            {
                title: "Viewing Network Configuration",
                explanation: "Commands to display and manage network interface configurations and IP addresses.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `ifconfig`,
                windows_basic_command: `Get-NetIPAddress`,
                linux_variations_command: `# 1. Display detailed information for all interfaces
ifconfig

# 2. Display information for a specific interface
ifconfig <interface_name>

# 3. Enable a network interface
ifconfig <interface_name> up

# 4. Disable a network interface
ifconfig <interface_name> down

# 5. Assign a static IP address to an interface
ifconfig <interface_name> <IP_address> netmask <subnet_mask>
`,
                windows_variations_command: `# 1. Display all network interfaces and their IP addresses
Get-NetIPAddress

## get all network adapter names
Get-NetAdapter | Select-Object Name

# 2. Show detailed information for a specific interface
Get-NetAdapter -Name "<interface_name>" | Get-NetIPAddress

# 3. Enable a network adapter
Enable-NetAdapter -Name "<interface_name>"

# 4. Disable a network adapter
Disable-NetAdapter -Name "<interface_name>"

# 5. Assign a static IP address to an interface
New-NetIPAddress -InterfaceAlias "<interface_name>" -IPAddress <IP_address> -PrefixLength <subnet_mask> -DefaultGateway <gateway>
`
            },
            {
                title: "Network Connection Monitoring",
                explanation: "Commands to display network connections, routing tables, and listening ports.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `netstat || ss`,
                windows_basic_command: `Get-NetTCPConnection`,
                linux_variations_command: `# 1. Display all active connections with process information
netstat -lntp

# 2. Display all active connections
netstat -an

# 3. Show processes associated with active connections
netstat -tulnp

# 4. Display only listening ports
netstat -l

# 5. Display all active connections with process information
ss -lntp

# 6. Use 'ss' for faster and more detailed information
ss -tuln

# 7. Show connections filtered by state (e.g., ESTABLISHED)
ss -state established
`,
                windows_variations_command: `# 1. List all active TCP connections
Get-NetTCPConnection

# 2. Filter by a specific port (e.g., 80)
Get-NetTCPConnection | Where-Object { $_.LocalPort -eq 80 }

# 3. Display only listening ports
Get-NetTCPConnection | Where-Object { $_.State -eq "Listen" }

# 4. Show connections filtered by state (e.g., Established)
Get-NetTCPConnection | Where-Object { $_.State -eq "Established" }

# 5. Combine with associated processes for detailed info
Get-NetTCPConnection | Select-Object LocalAddress, LocalPort, RemoteAddress, State, OwningProcess | Format-Table
`
            },
            {
                title: "Testing Network Connectivity",
                explanation: "Commands to test connectivity to a remote host and measure round-trip time for packets.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `ping`,
                windows_basic_command: `ping || Test-Connection`,
                linux_variations_command: `# WINDOWS OS TTL = 128 (minus 1 for each hop)
# LINUX OS TTL = 64

# 1. Ping a host until manually stopped
ping {{RHOST}}

# 2. Limit the number of ping attempts
ping -c 4 {{RHOST}}

# 3. Set a specific interval between pings
ping -i 2 {{RHOST}}

# 4. Use a specific interface for the ping
ping -I <interface_name> {{RHOST}}

# 5. Send packets with a custom size
ping -s 1000 {{RHOST}}
`,
                windows_variations_command: `# 1. Ping a host and display results
Test-Connection -ComputerName {{RHOST}}

# 2. Ping with a specific number of attempts
Test-Connection -ComputerName {{RHOST}} -Count 4

# 3. Perform a continuous ping (similar to Linux's default 'ping')
ping {{RHOST}} -t

# 4. Test connectivity with detailed information
Test-Connection -ComputerName {{RHOST}} -Detailed

# 5. Ping with a specific packet size
ping {{RHOST}} -l 1000
`
            },
            {
                title: "Secure Shell (SSH)",
                explanation: "Commands to securely connect to remote systems, transfer files, and set up port forwarding.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `ssh`,
                windows_basic_command: `ssh.exe`,
                linux_variations_command: `# 1. Connect to a remote server
ssh {{USERNAME}}@{{RHOST}}

# 2. Connect with a specific port
ssh -p 2222 {{USERNAME}}@{{RHOST}}

# 3. Connect using a private key
ssh -i /path/to/private_key {{USERNAME}}@{{RHOST}}

# 4. Remote port forwarding: Forward a local port to a remote address Forward a remote port to a local address
ssh -R 8080:localhost:80 {{USERNAME}}@{{RHOST}}

# 5. Local port forwarding: Forward a remote port to a local address - following forwards remote port 3000 to local port 3000:
# ssh -L 3000:127.0.0.1:3000 axel@cat.htb
ssh -L 8080:127.0.0.1:80 {{USERNAME}}@{{RHOST}}

# 6. Proxy a connection through an intermediate host (jump host)
ssh -J user@jumphost user@destination
ssh -J user1@jumphost1,user2@jumphost2 user3@destination

# 7. Set up port forwarding during an active SSH session
# Enter escape mode by pressing 'Enter', then '~C', and configure:
# For local port forwarding: ([LOCAL_IP:]LOCAL_PORT:DEST_IP:DEST_PORT)
-L 8080:remote_host:80

# For remote port forwarding:
-R 9090:localhost:9090

# Return to your session by pressing 'Enter' again.
`,
                windows_variations_command: `# 1. Connect to a remote server
ssh {{USERNAME}}@{{RHOST}}

# 2. Connect with a specific port
ssh -p 2222 {{USERNAME}}@{{RHOST}}

# 3. Connect using a private key
ssh -i C:\\path\\to\\private_key {{USERNAME}}@{{RHOST}}

# 4. Remote port forwarding: Forward a remote port to a local address (remote:host:localport)
ssh -R 8080:localhost:80 {{USERNAME}}@{{RHOST}}

# 5. Local port forwarding: Forward a local port to a remote address (local:host:remoteport)
ssh -L 8080:example.com:80 {{USERNAME}}@{{RHOST}}

# 6. Proxy a connection through an intermediate host (jump host)
ssh -J user@jumphost user@destination
ssh -J user1@jumphost1,user2@jumphost2 user3@destination

# 7. Set up port forwarding during an active SSH session
# Enter escape mode by pressing 'Enter', then '~C', and configure:
# For local port forwarding:
-L 8080:remote_host:80

# For remote port forwarding:
-R 9090:localhost:9090

# Return to your session by pressing 'Enter' again.
`
            },
            {
                title: "Secure Copy Protocol (SCP)",
                explanation: "Commands to securely transfer files between local and remote systems using SSH.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `scp`,
                windows_basic_command: `scp.exe`,
                linux_variations_command: `# 1. Copy a file from local to remote
scp /path/to/local_file user@remote_host:/path/to/remote_directory

# 2. Copy a file from remote to local
scp user@remote_host:/path/to/remote_file /path/to/local_directory

# 3. Copy a directory recursively from local to remote
scp -r /path/to/local_directory user@remote_host:/path/to/remote_directory

# 4. Copy a directory recursively from remote to local
scp -r user@remote_host:/path/to/remote_directory /path/to/local_directory

# 5. Use a specific port for SCP
scp -P 2222 /path/to/local_file user@remote_host:/path/to/remote_directory
`,
                windows_variations_command: `# 1. Copy a file from local to remote
scp.exe C:\\path\\to\\local_file user@remote_host:/path/to/remote_directory

# 2. Copy a file from remote to local
scp.exe user@remote_host:/path/to/remote_file C:\\path\\to\\local_directory

# 3. Copy a directory recursively from local to remote
scp.exe -r C:\\path\\to\\local_directory user@remote_host:/path/to/remote_directory

# 4. Copy a directory recursively from remote to local
scp.exe -r user@remote_host:/path/to/remote_directory C:\\path\\to\\local_directory

# 5. Use a specific port for SCP
scp.exe -P 2222 C:\\path\\to\\local_file user@remote_host:/path/to/remote_directory
`
            },
            {
                title: "Curl Command (cURL)",
                explanation: "Commands to transfer data from or to a server using supported protocols such as HTTP, HTTPS, FTP, and more.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `curl`,
                windows_basic_command: `curl.exe`, // cURL is included in Windows 10+ by default
                linux_variations_command: `# 1. Retrieve the content of a URL
curl http://example.com

# 2. Download a file from a URL
curl -O http://example.com/file.txt

# 3. Send data with a POST request
curl -X POST -d "key1=value1&key2=value2" http://example.com

# 4. Include headers in the request
curl -H "Authorization: Bearer <token>" http://example.com

# 5. Save the output to a file
curl http://example.com -o output.txt

# 6. Example of a JSON POST request
curl -d '{"password":"fake","username":"admin"}' -H 'Content-Type: application/json'  http://192.168.50.16:5002/users/v1/login
`,
                windows_variations_command: `# 1. Retrieve the content of a URL
curl.exe http://example.com

# 2. Download a file from a URL
curl.exe -O http://example.com/file.txt

# 3. Send data with a POST request
curl.exe -X POST -d "key1=value1&key2=value2" http://example.com

# 4. Include headers in the request
curl.exe -H "Authorization: Bearer <token>" http://example.com

# 5. Save the output to a file
curl.exe http://example.com -o output.txt

# 6. Example of a JSON POST request
curl.exe -d '{"password":"fake","username":"admin"}' -H 'Content-Type: application/json'  http://192.168.50.16:5002/users/v1/login
`
            },
            {
                title: "Remote Desktop Protocol (RDP)",
                explanation: "Commands to connect to remote systems using the Remote Desktop Protocol (RDP).",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `rdesktop || xfreerdp3`,
                windows_basic_command: `mstsc.exe`,
                linux_variations_command: `# 1. rdesktop - Connect to a remote system (only domain-joined hosts)
rdesktop '{{RHOST}}'
rdesktop -u '{{USERNAME}}' -p '{{PASSWORD}}' -d '{{DOMAIN}}'.'{{ROOTDNS}}' '{{RHOST}}'

# 2. xfreerdp3 - Connect to a remote system using RDP (computer does not need to be domain-joined)
xfreerdp3 /v:'{{RHOST}}' /dynamic-resolution
xfreerdp3 /v:'{{RHOST}}' /u:'{{USERNAME}}' /p:'{{PASSWORD}}' /dynamic-resolution
xfreerdp3 /v:'{{RHOST}}' /u:'{{USERNAME}}' /p:'{{PASSWORD}}' /drive:rdp,/mnt/tmpdrive +clipboard /dynamic-resolution
xfreerdp3 /v:'{{RHOST}}' /u:'{{USERNAME}}' /pth:'{{HASH}}' /drive:rdp,/mnt/tmpdrive +clipboard /dynamic-resolution,

# domain-joined hosts
xfreerdp3 /v:'{{RHOST}}' /dynamic-resolution
xfreerdp3 /v:'{{RHOST}}' /u:'{{USERNAME}}' /p:'{{PASSWORD}}' /d:'{{DOMAIN}}.{{ROOTDNS}}' /dynamic-resolution
xfreerdp3 /v:'{{RHOST}}' /u:'{{USERNAME}}' /p:'{{PASSWORD}}' /d:'{{DOMAIN}}.{{ROOTDNS}}' /drive:rdp,/mnt/tmpdrive +clipboard /dynamic-resolution
xfreerdp3 /v:'{{RHOST}}' /u:'{{USERNAME}}' /pth:'{{HASH}}' /d:'{{DOMAIN}}.{{ROOTDNS}}' /drive:rdp,/mnt/tmpdrive +clipboard /dynamic-resolution`,
                windows_variations_command: `# 1. Open the Remote Desktop Connection tool
mstsc.exe

# 2. Connect to a specific remote system
mstsc.exe /v:{{RHOST}}`
            },
            {
                title: "Mount a remote SMB share",
                explanation: "Commands to mount a remote SMB share to a local directory on Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `mount -t cifs`,
                windows_basic_command: `net use`,
                linux_variations_command: `# install cifs-utils so it can be used in the 'mount' command
apt install cifs-utils

# 1. Mount the share as read-only
mount -t cifs //{{RHOST}}/<share_name> /mnt/<local_mount_point> -o username={{USERNAME}},password='{{PASSWORD}}',ro,vers=2.0

# 2. Mount an SMB share specifying a domain
mount -t cifs //{{RHOST}}/<share_name> /mnt/<local_mount_point> -o username={{USERNAME}},password='{{PASSWORD}}',domain=<domain>,vers=2.0

# 3. Use a credentials file for mounting (recommended for security)
mount -t cifs //{{RHOST}}/<share_name> /mnt/<local_mount_point> -o credentials=smbcredentials.txt,vers=2.0

## Store credentials in 'smbcredentials.txt' file  as follows
# username=root
# password=123456

# 4. Mount an SMB share with username and password
mount -t cifs //{{RHOST}}/<share_name> /mnt/<local_mount_point> -o username={{USERNAME}},password='{{PASSWORD}}',vers=2.0

# 5. Unmount the SMB share
umount /mnt/<local_mount_point>

# 6. Show all mounted drives
mount
`,
                windows_variations_command: `# 1. Map an SMB share to a drive letter
net use X: \\\\{{RHOST}}\\<share_name> /user:{{USERNAME}} '{{PASSWORD}}'

# 2. Map a share with persistent connection
net use X: \\\\{{RHOST}}\\<share_name> /user:{{USERNAME}} '{{PASSWORD}}' /persistent:yes

# 3. Disconnect a mapped drive
net use X: /delete

# 4. Map a share with a specific port
net use X: \\\\{{RHOST}}:<port>\\<share_name> /user:{{USERNAME}} '{{PASSWORD}}'

# 5. Check all mapped drives
net use`
            }

        ]
    },

    // chapter 2
    {
        // ls, cp, mv, rm, mkdir, rmdir
        // cat, grep, awk, sed, cut, sort, uniq
        chapter: "2. File & directory Management",
        chapter_commands: [
            {
                title: "Listing Files and Directories",
                explanation: "List files and directories in the current directory.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `ls`,
                windows_basic_command: `dir`,
                linux_variations_command: `# 1. List all files including hidden files
ls -a

# 2. List files with detailed information (permissions, owner, size, etc.)
ls -l

# 3. List files and directories recursively, including subdirectories
ls -R`,
                windows_variations_command: `# 1. List all files in the current directory, including hidden files
dir /a

# 2. List files and directories recursively, including subdirectories
dir /s

# 3. show alternate datastreams
dir /R

# read alternate datastreams
more < file.txt:file2.txt

# 4. Show owner of the file/ directory
dir /q

# List file/ directory permissions is done as follows:
icacls DIRECTORY_OR_FILENAME`
            },
            {
                title: "Creating Symbolic and Hard Links",
                explanation: "Create symbolic (soft) links and hard links to files and directories. Symbolic links are pointers to the original path, while hard links point directly to the file's data on disk. Hard links cannot be created for directories on most systems.",
                linux_command_language: "bash",
                windows_command_language: "powershell",
                linux_basic_command: `ln`,
                windows_basic_command: `mklink`,
                linux_variations_command: `# 1. Create a hard link to a file (both names point to the same data)
ln original.txt hardlink.txt

# 2. Create a symbolic (soft) link to a file
ln -s original.txt symlink.txt

# 3. Create a symbolic link to a directory
ln -s /path/to/directory symlink_dir

# 4. Create a symbolic link with a full (absolute) target path
ln -s /home/user/documents/report.txt /tmp/report_link

# 5. Force overwrite an existing link
ln -sf new_target.txt existing_link.txt

# 6. Verify link type and target
ls -l symlink.txt
# output: lrwxrwxrwx 1 user user 12 Jan 1 12:00 symlink.txt -> original.txt

# 7. Find all symbolic links in a directory
find /path/to/search -type l

# 8. Find all hard links to a specific file (by inode)
find / -samefile original.txt

# 9. Remove a symbolic link (does not affect the target)
unlink symlink.txt
# or
rm symlink.txt`,
                windows_variations_command: `# 1. Create a symbolic link to a file
mklink symlink.txt original.txt

# 2. Create a symbolic link to a directory
mklink /D symlink_dir C:\\path\\to\\directory

# 3. Create a hard link to a file
mklink /H hardlink.txt original.txt

# 4. Create a directory junction (similar to a directory symlink)
mklink /J junction_dir C:\\path\\to\\directory

# 5. Verify a symbolic link
dir symlink.txt
# shows: <SYMLINK> symlink.txt [original.txt]

# 6. Verify a directory symlink or junction
dir
# shows: <SYMLINKD> or <JUNCTION> next to the name

# 7. Remove a symbolic link to a file
del symlink.txt

# 8. Remove a symbolic link to a directory or junction
rmdir symlink_dir

# 9. List all symbolic links in a directory (PowerShell)
Get-ChildItem -Path C:\\path -Recurse | Where-Object { $_.Attributes -match 'ReparsePoint' }`
            },
            {
                title: "Copying Files and Directories",
                explanation: "Copy files or directories to another location.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `cp`,
                windows_basic_command: `copy`,
                linux_variations_command: `# 1. Copy a file to a new location
cp file.txt /path/to/destination/

# 2. Copy a directory and its contents to a new location
cp -r directory /path/to/destination/

# 3. Copy a file and rename it at the destination
cp file.txt /path/to/destination/newfile.txt

# 4. Copy multiple files to a destination directory
cp file1.txt file2.txt /path/to/destination/

# 5. Preserve file attributes while copying (ownership, timestamp, etc.)
cp -p file.txt /path/to/destination/`,

                windows_variations_command: `# 1. Copy a file to a new location
copy file.txt C:\\path\\to\\destination\\

# 2. Copy a directory and its contents to a new location (using xcopy)
xcopy directory C:\\path\\to\\destination\\ /e /i

# 3. Copy a file and rename it at the destination
copy file.txt C:\\path\\to\\destination\\newfile.txt

# 4. Copy multiple files to a destination directory
copy file1.txt+file2.txt C:\\path\\to\\destination\\

# 5. Preserve file attributes while copying (using xcopy)
xcopy file.txt C:\\path\\to\\destination\\ /k`

            },

            {
                title: "Moving Files and Directories",
                explanation: "Move files or directories to another location.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `mv`,
                windows_basic_command: `move`,
                linux_variations_command: `# 1. Move a file to a new location
mv file.txt /path/to/destination/

# 2. Rename a file while moving it
mv file.txt /path/to/destination/newfile.txt

# 3. Move multiple files to a directory
mv file1.txt file2.txt /path/to/destination/

# 4. Move a directory and its contents to another location
mv directory /path/to/destination/

# 5. Overwrite existing files without prompting
mv -f file.txt /path/to/destination/`,

                windows_variations_command: `# 1. Move a file to a new location
move file.txt C:\\path\\to\\destination\\

# 2. Rename a file while moving it
move file.txt C:\\path\\to\\destination\\newfile.txt

# 3. Move multiple files to a directory
move file1.txt file2.txt C:\\path\\to\\destination\\

# 4. Move a directory and its contents to another location
move directory C:\\path\\to\\destination\\

# 5. Overwrite existing files without prompting (default behavior in Windows)
move /y file.txt C:\\path\\to\\destination\\`
            },

            {
                title: "Removing Files and Directories",
                explanation: "Remove files or directories.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `rm`,
                windows_basic_command: `del`,
                linux_variations_command: `# 1. Remove a file
rm file.txt

# 2. Remove multiple files
rm file1.txt file2.txt

# 3. Remove a directory and its contents recursively
rm -r directory/

# 4. Force remove a file without prompting
rm -f file.txt

# 5. Force remove a directory and its contents
rm -rf directory/`,

                windows_variations_command: `# 1. Delete a file
del file.txt

# 2. Delete multiple files
del file1.txt file2.txt

# 3. Delete all files in a directory (without deleting the directory itself)
del C:\\path\\to\\directory\\*.*

# 4. Delete a directory and all its contents
rmdir /s C:\\path\\to\\directory\\

# 5. Force delete a directory and all its contents without prompting
rmdir /s /q C:\\path\\to\\directory\\`
            },
            {
                title: "Creating Directories",
                explanation: "Create new directories.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `mkdir`,
                windows_basic_command: `mkdir`,
                linux_variations_command: `# 1. Create a new directory
mkdir new_directory

# 2. Create nested directories (create parent and subdirectories at once)
mkdir -p parent_directory/sub_directory

# 3. Set specific permissions while creating a directory
mkdir -m 755 new_directory`,

                windows_variations_command: `# 1. Create a new directory
mkdir new_directory

# 2. Create nested directories
mkdir parent_directory\\sub_directory

# 3. Create multiple directories at the same level
mkdir dir1 dir2 dir3`
            },
            {
                title: "Pattern Scanning and Processing",
                explanation: "Use awk for text processing and reporting.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `awk`,
                windows_basic_command: `Select-String`,
                linux_variations_command: `# 1. Print all lines from a file
awk '{print}' file.txt

# 2. Print the second column of a space-separated file
awk '{print $2}' file.txt

# 3. Print lines that match a pattern (e.g., lines containing "error")
awk '/error/ {print}' file.txt
`,

                windows_variations_command: `# 1. Print all lines from a file
Get-Content -Path "file.txt"

# 2. Print the second column of a space-separated file
Get-Content -Path "file.txt" | ForEach-Object { ($_ -split " ")[1] }

# 3. Print lines that match a pattern (e.g., lines containing "error")
Select-String -Pattern "error" -Path "file.txt"`
            },
            {
                title: "Directory Tree Display",
                explanation: "Display directory structure in a tree format.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `tree`,
                windows_basic_command: `tree`,
                linux_variations_command: `# 1. Display tree with files included
tree -a

# 2. Display tree of current directory
tree

# 3. Limit depth of tree display
tree -L 2

# 4. Display only directories (no files)
tree -d

# 5. Save output to a file
tree > output.txt`,

                windows_variations_command: `# 1. Display tree with files included
tree /F

# 2. Display tree of current directory
tree

# 3. Display tree with ASCII characters
tree /A

# 4. Display tree of a specific directory
tree C:\\path\\to\\folder

# 5. Save output to a file
tree /F > output.txt`
            },

            {
                title: "Stream Editing",
                explanation: "Use sed to edit streams of text.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `sed`,
                windows_basic_command: `-replace`,

                linux_variations_command: `# 1. Replace the first occurrence of 'old' with 'new' in each line of a file
sed 's/old/new/' filename

# 2. Replace all occurrences of 'old' with 'new' in each line of a file
sed 's/old/new/g' filename

# 3. Replace text only if a line contains a specific pattern
sed '/pattern/s/old/new/' filename

# 4. Delete lines that contain a specific pattern
sed '/pattern/d' filename

# 5. Write the output to a new file
sed 's/old/new/g' filename > newfile.txt`,

                windows_variations_command: `# 1. Replace the first occurrence of 'old' with 'new' in each line of a file
Get-Content -Path "filename" | ForEach-Object { $_ -replace 'old', 'new', 1 } | Set-Content -Path "filename"

# 2. Replace all occurrences of 'old' with 'new' in a file
(Get-Content -Path "filename") -replace 'old', 'new' | Set-Content -Path "filename"

# 3. Replace text only if a line contains a specific pattern
Get-Content -Path "filename" | ForEach-Object { if ($_ -match 'pattern') { $_ -replace 'old', 'new' } else { $_ } } | Set-Content -Path "filename"

# 4. Delete lines that contain a specific pattern
Get-Content -Path "filename" | Where-Object { $_ -notmatch 'pattern' } | Set-Content -Path "filename"

# 5. Write the output to a new file
(Get-Content -Path "filename") -replace 'old', 'new' | Set-Content -Path "newfile.txt"`
            },

            {
                title: "Cutting Text",
                explanation: "Cut out sections of each line in a file.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `cut`,
                windows_basic_command: `-split`,
                linux_variations_command: `# 1. Cut the first field of a space-separated file
# Input example: field1 field2 field3  
# Output example: field1  
cut -d' ' -f1 filename

# 2. Cut the first five characters of each line
# Input example: abcdefghij  
# Output example: abcde  
cut -c1-5 filename

# 3. Cut a specific range of fields using a colon delimiter
# Input example: field1:field2:field3:field4  
# Output example: field2:field3  
cut -d':' -f2-3 filename

# 4. Cut multiple non-contiguous fields from a comma-separated file
# Input example: field1,field2,field3,field4,field5  
# Output example: field1,field3,field5  
cut -d',' -f1,3,5 filename

# 5. Cut fields using tab as a delimiter
# Input example: field1<TAB>field2<TAB>field3  
# Output example: field2  
cut -d$'\\t' -f2 filename`,

                windows_variations_command: `# 1. Cut the first field of a space-separated file
# Input example: field1 field2 field3  
# Output example: field1  
Get-Content -Path "filename" | ForEach-Object { ($_ -split ' ')[0] }

# 2. Cut the first five characters of each line
# Input example: abcdefghij  
# Output example: abcde  
Get-Content -Path "filename" | ForEach-Object { $_.Substring(0, 5) }

# 3. Cut a specific range of fields using a colon delimiter  
# Input example: field1:field2:field3:field4  
# Output example: field2:field3  
Get-Content -Path "filename" | ForEach-Object { ($_ -split ':')[1..2] -join ':' }

# 4. Cut multiple non-contiguous fields from a comma-separated file  
# Input example: field1,field2,field3,field4,field5  
# Output example: field1,field3,field5  
Get-Content -Path "filename" | ForEach-Object { ($_ -split ',')[0,2,4] -join ',' }

# 5. Cut fields using tab as a delimiter  
# Input example: field1<TAB>field2<TAB>field3  
# Output example: field2  
Get-Content -Path "filename" | ForEach-Object { ($_ -split "\`t")[1] }`

            },

            {
                title: "Sorting Lines of Text Files",
                explanation: "Sort the lines of a text file.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `sort`,
                windows_basic_command: `Sort-Object`,
                linux_variations_command: `# 1. Sort the lines of a text file in ascending order
sort filename

# 2. Sort the lines of a text file in descending (reverse) order
sort -r filename

# 3. Sort numerically (considering numeric values instead of lexicographic order)
sort -n filename

# 4. Sort using a specific field as the key (e.g., second field)
sort -k 2 filename

# 5. Sort and remove duplicate lines
sort -u filename`,

                windows_variations_command: `# 1. Sort the lines of a text file in ascending order
Get-Content -Path "filename" | Sort-Object

# 2. Sort the lines of a text file in descending (reverse) order
Get-Content -Path "filename" | Sort-Object -Descending

# 3. Sort numerically (considering numeric values instead of lexicographic order)
Get-Content -Path "filename" | Sort-Object {[int]$_}

# 4. Sort using a specific field as the key (e.g., second field after splitting by space)
Get-Content -Path "filename" | Sort-Object { ($_ -split ' ')[1] }

# 5. Sort and remove duplicate lines
Get-Content -Path "filename" | Sort-Object -Unique`

            },
            {
                title: "Removing Duplicate Lines",
                explanation: "Remove duplicate lines from a sorted file.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `uniq`,
                windows_basic_command: `Sort-Object -Unique`,
                linux_variations_command: `# 1. Remove duplicate lines from a sorted file
uniq filename

# 2. Count occurrences of each unique line in a sorted file
uniq -c filename

# 3. Remove duplicate lines without sorting first (using awk)
awk '!seen[$0]++' filename

# 4. Print only duplicate lines (lines that occur more than once)
uniq -d filename

# 5. Remove duplicate lines while ignoring case
uniq -i filename`,

                windows_variations_command: `# 1. Remove duplicate lines from a file
Get-Content -Path "filename" | Sort-Object | Get-Unique

# 2. Count occurrences of each unique line in a file
Get-Content -Path "filename" | Group-Object | ForEach-Object { "$($_.Name) - Count: $($_.Count)" }

# 3. Remove duplicate lines without sorting first
Get-Content -Path "filename" | Select-Object -Unique

# 4. Print only duplicate lines (lines that occur more than once)
Get-Content -Path "filename" | Group-Object | Where-Object { $_.Count -gt 1 } | ForEach-Object { $_.Name }

# 5. Remove duplicate lines while ignoring case
Get-Content -Path "filename" | Sort-Object -Unique -CaseSensitive:$false`
            },

            {
                title: "Viewing file content",
                explanation: "Commands to view the contents of a file in Linux and Windows",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `cat`,
                windows_basic_command: `type`,
                linux_variations_command: `# 1. Display the content of a file
cat file.txt

# 2. Concatenate multiple files and display their content
cat file1.txt file2.txt

# 3. Redirect the content of a file to another file (copy file.txt to newfile.txt)
cat file.txt > newfile.txt

# 4. Append the content of a file to another file
cat file.txt >> newfile.txt

# 5. Display line numbers with the content of a file
cat -n file.txt`,
                windows_variations_command: `# 1. Display the content of a file
type file.txt

# 2. Concatenate multiple files and display their content
type file1.txt file2.txt

# 3. Redirect the content of a file to another file (copy file.txt to newfile.txt)
type file.txt > newfile.txt

# 4. Append the content of a file to another file
type file.txt >> newfile.txt`
            },
            {
                title: "Editing files",
                explanation: "Commands to edit files in Linux and Windows",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `grep`,
                windows_basic_command: `findstr`,
                linux_variations_command: `# 1. Display file content and search for a string
cat file.txt | grep "search_string"

# 2. Display file content and perform a case-insensitive search
cat file.txt | grep -i "search_string"

# 3. Display file content and search recursively in multiple files
cat file1.txt file2.txt | grep "search_string"

# 4. Display file content and exclude lines matching a string
cat file.txt | grep -v "search_string"
cat file.txt | grep -v "^root\\|^kali" # exclude lines starting with root or kali

# 5. Display file content and show line numbers for matching lines
cat file.txt | grep -n "search_string"

# 6. Search recursive in files from the current directory in files
grep -rni ./ -e 'password

# 7. Search in a file, but retain a fixed amount of characters before and after the searchterm
grep -i -E -o ".{0,1}/SEARCHTERM.{0,50}." filet.txt'
`,
                windows_variations_command: `# 1. Display file content and search for a string
type file.txt | findstr "search_string"

# 2. Display file content and perform a case-insensitive search
type file.txt | findstr /i "search_string"

# 3. Display content of multiple files and search for a string
type file1.txt file2.txt | findstr "search_string"

# 4. Display file content and exclude lines matching a string
type file.txt | findstr /v "search_string"

# 5. Display file content and show line numbers for matching lines
type file.txt | findstr /n "search_string"

# 6. Search in all .ps1 files on the system for the phrase "password"
findstr /spin "password" *.ps1
`
            },
            {
                title: "Searching for files",
                explanation: "Commands to search for files or directories in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `find`,
                windows_basic_command: `dir`,
                linux_variations_command: `# Use find for SUID/SGID binaries
# SUID binaries - mind the millieseconds
find / -perm -4000 -type f -printf '%T+ %p\\n' 2>/dev/null | sort -r

# SUID binaries - mind the millieseconds
find / -perm -2000 -type f -printf '%T+ %p\\n' 2>/dev/null | sort -r
                
# Basic Linux 'find' command concepts:
# The 'find' command searches for files and directories based on criteria.

# 1. Search for a file by name
find /path/to/search -name "filename"

# 2. Search for files with a specific extension
find /path/to/search -name "*.txt"

# 3. Search for files modified in the last 7 days
find /path/to/search -mtime -7

# 4. Search for files by size (e.g., larger than 10MB)
find /path/to/search -size +10M

# 5. Search and execute a command on results (e.g., delete files)
find /path/to/search -name "*.tmp" -exec rm {} \\;

# 6. Perform a case-insensitive search
find /path/to/search -iname "filename"

# 7. Limit depth of search
find /path/to/search -maxdepth 2 -name "*.log"`,
                windows_variations_command: `# 1. Search for a .kdbx file
Get-ChildItem -Path C:\\ -Include *.kdbx -File -Recurse -ErrorAction SilentlyContinue

# 2. Search for files larger than 10MB
Get-ChildItem -Path C:\\ -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 10MB }

# 3. Search for files modified in the last 7 days
Get-ChildItem -Path C:\\ -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-7) }

# 4. Search for files by name
Get-ChildItem -Path C:\\ -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*filename*" }
`
            }

        ]
    },

    // chapter 3
    // shutdown, systemctl
    // df, du, free, uname, systeminfo
    {
        chapter: "3. System management, Boot & Shutdown",
        chapter_commands: [
            {
                title: "Displaying system information",
                explanation: "Commands to retrieve detailed system information in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `uname`,
                windows_basic_command: `systeminfo`,
                linux_variations_command: `# Basic Linux system information commands:
# 1. Display all system information
uname -a

# 2. Display detailed CPU information
lscpu

# 3. Display detailed memory information
free -h`,
                windows_variations_command: `# Basic Windows system information commands:
# 1. Display detailed system information
systeminfo

# 2. Display detailed CPU information (lscpu equivalent)
Get-CimInstance -ClassName Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors, MaxClockSpeed

# 3. Display detailed memory information (free -h equivalent)
(Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory) | ForEach-Object { "{0:N2} GB Total, {1:N2} GB Free" -f ($_.TotalVisibleMemorySize / 1MB), ($_.FreePhysicalMemory / 1MB) }
`
            },
            {
                title: "Shutting down or restarting the system",
                explanation: "Commands to shut down or restart the system in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `shutdown # or reboot`,
                windows_basic_command: `shutdown # or reboot`,
                linux_variations_command: `# Basic Linux shutdown and restart commands:

# 1. Shut down the system immediately
shutdown now

# 2. Shut down the system after a delay (e.g., 60 seconds)
shutdown +1

# 3. Restart the system immediately
shutdown -r now

# 4. Schedule a shutdown with a custom message
shutdown +2 "System will shut down in 2 minutes."

# 5. Cancel a scheduled shutdown
shutdown -c`,
                windows_variations_command: `# Basic Windows shutdown and restart commands:

# 1. Shut down the system immediately
shutdown /s /t 0

# 2. Shut down the system after a delay (e.g., 60 seconds)
shutdown /s /t 60

# 3. Restart the system immediately
shutdown /r /t 0

# 4. Schedule a shutdown with a custom message
shutdown /s /t 120 /c "System will shut down in 2 minutes."

# 5. Cancel a scheduled shutdown
shutdown /a`
            },

            {
                title: "Managing services and system states",
                explanation: "Commands to manage system services and states in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `systemctl`,
                windows_basic_command: `sc | Get-Service`,
                linux_variations_command: `# Basic Linux 'systemctl' commands:

# 1. Start a service
systemctl start service_name

# 2. Stop a service
systemctl stop service_name

# 3. Restart a service
systemctl restart service_name

# 4. Check the status of a service
systemctl status service_name

# 5. Enable a service to start at boot
systemctl enable service_name

# 6. List all services
systemctl list-units --type=service

# 7. List only running services
systemctl list-units --type=service --state=running`,
                windows_variations_command: `# Basic Windows service management commands:
##### UTILIZING sc #####
# 1. Start a service
sc start service_name

# 2. Stop a service
sc stop service_name

# 3. check the status of a service
sc query service_name

# 4. Enable a service to start at boot
sc config service_name start= auto

# 5. list all services
sc query state= all

# 6. get the service executable path
sc qc service_name

##### UTILIZING powershell #####                
# 1. Start a service
Start-Service -Name service_name

# 2. Stop a service
Stop-Service -Name service_name

# 3. Restart a service
Restart-Service -Name service_name

# 4. Check the status of a service
Get-Service -Name service_name

# 5. Enable a service to start at boot
Set-Service -Name service_name -StartupType Automatic

# 6. List all services (showing full service names)
# Basic list (might truncate long names)
Get-Service

# Display full service names without truncation
Get-Service | Format-Table -Property Name, DisplayName, Status -AutoSize

# 7. List only running services
Get-Service | Where-Object { $_.Status -eq "Running" }`
            },

            {
                title: "Displaying disk space usage",
                explanation: "Commands to display disk space usage in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `df`,
                windows_basic_command: `Get-PSDrive`,
                linux_variations_command: `# Basic Linux 'df' commands:

# 1. Display disk space usage for all mounted filesystems
df -h

# 2. Display disk space usage for a specific filesystem
df -h /path/to/filesystem

# 3. Display disk space usage without including inodes
df -h --no-sync

# 4. Display the type of each filesystem
df -T

# 5. Display disk space usage in a machine-readable format
df -BM`,
                windows_variations_command: `# Basic Windows 'Get-PSDrive' commands:

# 1. Display disk space usage for all drives
Get-PSDrive -PSProvider FileSystem

# 2. Display disk space usage for a specific drive
Get-PSDrive -Name C

# 3. Display disk space usage with size and free space
Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{Name='Used'; Expression={[math]::Round($_.Used/1GB,2)}}, @{Name='Free'; Expression={[math]::Round($_.Free/1GB,2)}}

# 4. Display only drives with low free space (e.g., less than 10GB)
Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Free -lt 10GB }

# 5. Export drive space details to a file
Get-PSDrive -PSProvider FileSystem | Export-Csv -Path "drive_usage.csv" -NoTypeInformation`
            },

            {
                title: "Displaying directory and file sizes",
                explanation: "Commands to display the size of directories and files in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `du`,
                windows_basic_command: `Get-ChildItem`,
                linux_variations_command: `# Basic Linux 'du' commands:


# 1. Display the total size of a directory
du -sh /path/to/directory

# 2. Display the size of a specific file
du -h /path/to/file

# 3. Display the sizes of all directories at the first level
du -h --max-depth=1 /path/to/directory

# 4. Display a sorted list of file sizes in a directory
du -h /path/to/directory | sort -h

# 5. Display the size of a directory and its contents
du -h /path/to/directory`,
                windows_variations_command: `# Basic Windows 'Get-ChildItem' commands:

# 1. Display the total size of a directory
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum | ForEach-Object { "Total Size: " + [math]::Round($_.Sum / 1KB, 2) + " KB" }

# 2. Display the size of a specific file
Get-Item -Path "C:\\path\\to\\file" | Select-Object Name, @{Name="Size (KB)"; Expression={[math]::Round($_.Length / 1KB, 2)}}

# 3. Display the sizes of all directories at the first level
Get-ChildItem -Directory | ForEach-Object { $_.Name + ": " + ([math]::Round((Get-ChildItem -Recurse -Path $_.FullName | Measure-Object -Property Length -Sum).Sum / 1KB, 2)) + " KB" }

# 4. Display a sorted list of file sizes in a directory
Get-ChildItem -Recurse | Sort-Object Length -Descending | Select-Object Name, @{Name="Size (KB)"; Expression={[math]::Round($_.Length / 1KB, 2)}}

# 5. Display the size of a directory and its contents
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum | ForEach-Object { [math]::Round($_.Sum / 1KB, 2) + " KB" }`
            }
            ,    // df, du, free, uname, systeminfo
            {
                title: "Check Memory Usage",
                explanation: "Retrieve system memory usage details.",
                linux_command_language: "bash",
                windows_command_language: "powershell",
                linux_basic_command: `free -h`,
                windows_basic_command: `Get-CimInstance`,
                linux_variations_command: `# 1. Display detailed memory information
free -h

# 2. Show memory usage every 2 seconds
watch -n 2 free -h`,
                windows_variations_command: `# 1. Display detailed memory information
(Get-CimInstance Win32_OperatingSystem | Select-Object @{Name="TotalMemory";Expression={($_.TotalVisibleMemorySize / 1MB)}}, @{Name="FreeMemory";Expression={($_.FreePhysicalMemory / 1MB)}}) | Format-Table -AutoSize

# 2. Show memory usage every 2 seconds
while ($true) { cls; Get-CimInstance Win32_OperatingSystem | Select-Object @{Name="TotalMemory";Expression={($_.TotalVisibleMemorySize / 1MB)}}, @{Name="FreeMemory";Expression={($_.FreePhysicalMemory / 1MB)}} | Format-Table -AutoSize; Start-Sleep -Seconds 2 }`
            }
            ,
        ]
    },

    // chapter 4
    // chmod, chown, chgrp, sudo
    {
        chapter: "4. Permissions & ownership",
        chapter_commands: [
            {
                title: "Using elevated privileges",
                explanation: "Commands to execute tasks with elevated privileges in Linux and Windows. In Linux, 'sudo' is commonly used, while Windows has several options such as 'Run as Administrator' and the 'runas' command.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `sudo`,
                windows_basic_command: `runasCS.exe || runas.exe`,
                linux_variations_command: `# 1. Execute a command with elevated privileges
sudo command

# 2. Switch to another user (default is root)
sudo -i

# 3. Run a script with elevated privileges
sudo bash script.sh

# 4. Edit a file with elevated privileges
sudo nano /path/to/file

# 5. Check if a user has sudo access
sudo -l

# 6. Run a command without password prompt (requires prior configuration)
sudo -S <<< "password" command`,
                windows_variations_command: `## option 1: RunasCS binary (PREFERED)
# 1. download the latest release of the RunasCS repository as a .zip file (RunasCs.zip) and unpack it
https://github.com/antonioCoco/RunasCs/releases/

# 2. copy the RunasCs.exe binary to the target host
...

# 3. Run a command as another user (more versatile then the preinstalled runas.exe)
RunasCs.exe {{USERNAME}} "{{PASSWORD}}" "cmd /c whoami /all"

## option 2: with saved creds          
# 1. Run a program as a different user
runas /user:Administrator "program.exe"

# 2. Run a script with saved credentials (cmdkey /list) using savecred. No password is prompted
# list available creds
cmdkey /list

# execute 'whoami' command as administrator
runas /savecred /user:ACCESS\\Administrator "C:\\Windows\\System32\\cmd.exe /c whoami"`
            },
            {
                title: "Modifying and displaying file permissions",
                explanation: "Commands to manage and view file permissions in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `chmod`,
                windows_basic_command: `icacls # permissions`,
                linux_variations_command: `# Basic Linux permissions use a 4-2-1 structure:
# 4 = Read (r), 2 = Write (w), 1 = Execute (x)
# Combine values to set permissions (e.g., 7 = Read + Write + Execute).

# 1. Grant read, write, and execute permissions to the owner
chmod u+rwx file.txt

# 2. Grant read and write permissions to a specific user
setfacl -m u:username:rw file.txt

# 3. Remove write permissions for the group
chmod g-w file.txt

# 4. Set read and execute permissions for everyone
chmod a+rx file.txt

# 5. Apply permissions recursively to a directory
chmod -R 755 /path/to/directory

# Display file or directory permissions
ls -l file.txt
ls -ld /path/to/directory`,
                windows_variations_command: `# Basic Windows permissions are similar but use:
# F = Full control, M = Modify (read + write/delete), RX = Read & Execute, R = Read, W = Write.

# 1. Grant full control to the owner
icacls file.txt /grant %username%:F

# 2. Grant read and write permissions to a specific user
icacls file.txt /grant username:RW

# 3. Remove write permissions for a group
icacls file.txt /remove:g groupname

# 4. Set read and execute permissions for everyone
icacls file.txt /grant Everyone:RX

# 5. Apply permissions recursively to a directory
icacls "C:\\path\\to\\directory" /grant %username%:F /T

# 6. Display file or directory permissions
icacls file.txt
icacls "C:\\path\\to\\directory"

# 7. View detailed permissions using PowerShell
Get-Acl file.txt | fl *
Get-Acl "C:\\path\\to\\directory" | fl *`
            },

            {
                title: "Changing file ownership",
                explanation: "Commands to change file ownership in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `chown`,
                windows_basic_command: `icacls # file ownership`,
                linux_variations_command: `# Basic Linux ownership concepts:
# The 'chown' command changes the owner and/or group of a file.

# 1. Change the owner of a file
chown username file.txt

# 2. Change the owner and group of a file
chown username:groupname file.txt

# 3. Change the owner of a directory recursively
chown -R username /path/to/directory

# 4. Change only the group of a file
chown :groupname file.txt

# 5. Check the current ownership of a file
ls -l file.txt`,
                windows_variations_command: `# Basic Windows ownership concepts:
# The 'icacls' command can be used to manage ownership in Windows.

# 1. Change the owner of a file
icacls file.txt /setowner username

# 2. Change the owner of a directory recursively
icacls "C:\\path\\to\\directory" /setowner username /T

# 3. Check the current ownership of a file
Get-Acl file.txt | Select-Object Owner

# 4. Check the current ownership of a directory
Get-Acl "C:\\path\\to\\directory" | Select-Object Owner`
            },

            {
                title: "Changing file group ownership",
                explanation: "Commands to change group ownership in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `chgrp`,
                windows_basic_command: `icacls # group ownership`,
                linux_variations_command: `# Basic Linux group ownership concepts:
# The 'chgrp' command changes the group ownership of a file or directory.

# 1. Change the group of a file
chgrp groupname file.txt

# 2. Change the group of a directory
chgrp groupname /path/to/directory

# 3. Change the group recursively for a directory
chgrp -R groupname /path/to/directory

# 4. Check the current group ownership of a file
ls -l file.txt`,
                windows_variations_command: `# Basic Windows group ownership concepts:
# Windows does not use groups in the same way as Linux. However, similar functionality can be achieved using 'icacls'.

# 1. Grant a group permissions (alternative to setting group ownership)
icacls file.txt /grant groupname:R

# 2. Change permissions for a group recursively
icacls "C:\\path\\to\\directory" /grant groupname:F /T

# 3. Check current permissions and effective group access
icacls file.txt

# 4. View group-related permissions using PowerShell
Get-Acl file.txt | Format-List Access`
            }
        ]
    },

    // chapter 5
    // useradd, userdel, usermod, groupadd, groupmod, passwd
    {
        chapter: "5. User & Group Management",
        chapter_commands: [
            {
                title: "Manage User Accounts",
                explanation: "Commands to gather information, add, delete, and modify user accounts on Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `user[del][add][mod]`,
                windows_basic_command: `net user # user management`,
                linux_variations_command: `# 1. Gather information about a user
# Display user account details
id {{USERNAME}}
# Check last login time
who -u | grep {{USERNAME}}
# View user's home directory and default shell
getent passwd {{USERNAME}}

# 2. Add a new user
sudo useradd {{USERNAME}}
# Add a user with a home directory
sudo useradd -m {{USERNAME}}
# Add a user with a preset password
sudo useradd {{USERNAME}} && echo '{{PASSWORD}}' | sudo passwd {{USERNAME}} --stdin

# 3. Modify a user
sudo usermod -aG <groupname> {{USERNAME}}
# Change a user's shell
sudo usermod -s /bin/bash {{USERNAME}}

# 4. Delete a user
sudo userdel {{USERNAME}}
# Delete a user and their home directory
sudo userdel -r {{USERNAME}}
`,
                windows_variations_command: `# 1. Gather information about a user
# display user account details
net user {{USERNAME}}

# view all users on the system
net user

# 2. add and delete a new user with a password 
net user "tempUserG" "DiffPword951" /add
net user "tempUserG" /delete

# 3A. add a new user with a password, add the user the the administrators group + disable remote UAC restrictions
net user "tempUserG" "DiffPword951" /add ; net localgroup Administrators "tempUserG" /add ; reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f

# 3B. remove a user from the administrators group + enable remote UAC restrictions
net localgroup Administrators "tempUserG" /delete ; reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 0 /f
`
            },
            {
                title: "Manage Groups",
                explanation: "Commands to add, delete, and modify groups on Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `group[del][add][mod]`,
                windows_basic_command: `net localgroup`,
                linux_variations_command: `# 1. Add a new group
sudo groupadd <groupname>

# 2. Delete a group
sudo groupdel <groupname>

# 3. Add a user to a group
sudo usermod -aG <groupname> {{USERNAME}}

# 4. Remove a user from a group
sudo gpasswd -d {{USERNAME}} <groupname>

# 5. List members of a group
getent group <groupname>
`,
                windows_variations_command: `# 1. Show members of a group
net localgroup <groupname>

# 2. Add a new group
net localgroup <groupname> /add

# 3. Delete a group
net localgroup <groupname> /delete

# 4. Add a user to a group
net localgroup <groupname> {{USERNAME}} /add

# 5. Remove a user from a group
net localgroup <groupname> {{USERNAME}} /delete

# 6. List all groups on the system
net localgroup`
            },
            {
                title: "Change User Passwords",
                explanation: "Commands to change user passwords on Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `passwd`,
                windows_basic_command: `net user # password change`,
                linux_variations_command: `# 1. Change your own password
passwd
# Change password without prompt (fill in the new password beforehand)
echo -e "<new_password>\\n<new_password>" | passwd

# 2. Change another user's password
sudo passwd {{USERNAME}}

# 3. Force a user to change their password at next login
sudo passwd -e {{USERNAME}}
`,
                windows_variations_command: `# 1. Change your own password (run in an elevated shell)
net user %USERNAME% <new_password>

# 2. Change another user's password
net user {{USERNAME}} <new_password>

# 3. Force a user to change their password at next login
net user {{USERNAME}} /logonpasswordchg:yes
`
            }
        ]
    },

    // chapter 6
    // ps, kill, pkill, bg, fg, jobs, top, htop, cron
    {
        chapter: "6. Process Management",
        chapter_commands: [
            {
                title: "Monitoring System Activity",
                explanation: "Commands to monitor system performance, resource usage, and processes in real-time.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `top`,
                windows_basic_command: `Get-Process`,
                linux_variations_command: `# 1. Start top in real-time mode
top

# 2. Sort processes by memory usage
top -o %MEM

# 3. Display only processes for a specific user
top -u {{USERNAME}}

# 4. Set refresh interval to 5 seconds
top -d 5

# 5. Use htop for a more user-friendly interface (if installed)
htop
`,
                windows_variations_command: `# 1. List all processes with real-time CPU usage
Get-Process | Sort-Object -Property CPU -Descending | Select-Object -First 10

# 2. Monitor memory usage of all processes
Get-Process | Sort-Object -Property WS -Descending | Select-Object -First 10

# 3. Filter and monitor specific processes by name
Get-Process -Name <processname>

# 4. Real-time process monitoring (use Out-GridView for interactive display)
Get-Process | Out-GridView

# 5. Export current process data for analysis
Get-Process | Export-Csv -Path processes.csv -NoTypeInformation
`
            },
            {
                title: "Listing Running Processes",
                explanation: "Retrieve a list of currently running processes on Linux or Windows systems.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `ps`,
                windows_basic_command: `Get-Process`,
                linux_variations_command: `# 1. List all processes running as root 
ps -U root -u root u

# 2. Show processes grouped by user
ps -eo user,pid,cmd | sort | uniq -c

# 3. Filter processes by keyword (e.g., 'sshd', 'nginx', or 'cron' for persistence)
ps aux | grep 'keyword'

# 4. List all zombie processes
ps aux | awk '$8 ~ /Z/'

# 5. Display memory and CPU usage for each process
ps -eo pid,user,%mem,%cpu,cmd --sort=-%mem | head
`,
                windows_variations_command: `# 1. List all running processes
Get-Process

# 2. Filter processes by name (e.g., 'notepad')
Get-Process -Name notepad

# 3. Display processes with detailed memory and CPU usage
Get-Process | Sort-Object -Property CPU -Descending | Select-Object -First 10

# 4. Show parent-child relationships for processes
Get-WmiObject Win32_Process | Select-Object Name, ProcessId, ParentProcessId

# 5. Display processes consuming more than a specific memory threshold
Get-Process | Where-Object { $_.WorkingSet -gt 100MB }`
            },
            {
                title: "Terminating Processes",
                explanation: "Commands to terminate running processes by PID or name on Linux and Windows systems.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `kill || pkill`,
                windows_basic_command: `Stop-Process`,
                linux_variations_command: `# 1. Terminate a process by PID
kill <PID>

# 2. Forcefully terminate a process by PID
kill -9 <PID>

# 3. Terminate processes by name
pkill <processname>

# 4. Forcefully terminate processes by name
pkill -9 <processname>

# 5. Kill all processes owned by a specific user
pkill -u {{USERNAME}}
`,
                windows_variations_command: `# 1. Terminate a process by name
Stop-Process -Name <processname>

# 2. Terminate a process by PID
Stop-Process -Id <PID>

# 3. Forcefully terminate a process (default behavior)
Stop-Process -Name <processname> -Force

# 4. Terminate multiple processes by name
Stop-Process -Name notepad,calc

# 5. Terminate processes with specific conditions (e.g., high CPU usage)
Get-Process | Where-Object { $_.CPU -gt 50 } | Stop-Process
`
            },
            {
                title: "managing scheduled tasks/ cronjobs",
                explanation: "Commands to manage scheduled tasks and cron jobs in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `crontab`,
                windows_basic_command: `schtasks`,
                linux_variations_command: `# 1A. create a new cron job to execute a bash command every minute
crontab -e
# Add the following line to the crontab file:
* * * * * <linux_command>

# 1B. add the cronjob immediately
echo "* * * * * <linux_command>" | crontab -

# 2. List all cron jobs for the current user
crontab -l

# 3. Remove all cron jobs for the current user
crontab -r`,
                windows_variations_command: `# 1A. Create a new scheduled task to run a PowerShell script every minute (on background)
cmd.exe /C schtasks /create /tn "MyTask" /tr "powershell.exe -NoProfile -ExecutionPolicy Bypass -Command 'whoami > C:\\Users\\svc_apache\\whoami.txt'" /sc minute /mo 1 /ru %username%

# 2. Get details of the scheduled task
schtasks /query /tn "MyTask" /fo LIST

# 3. Remove the scheduled task
schtasks /delete /tn "MyTask" /f

# 2. List all scheduled tasks with detailed information
schtasks /query /fo LIST

# 3. Retrieve detailed information about a specific scheduled task
schtasks /query /tn "MyTask" /fo LIST 
`
            },
        ]
    },

    // chapter 7
    // fdisk, mkfs, mount && umount, fsck
    {
        chapter: "7. Disk usage & management",
        chapter_commands: [
            {
                title: "Managing Disk Partitions",
                explanation: "Commands to manage disk partitions in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `fdisk`,
                windows_basic_command: `diskpart`,
                linux_variations_command: `# 1. List all partitions
fdisk -l

# 2. Start fdisk to modify a disk
fdisk /dev/sdX

# 3. Create a new partition
fdisk /dev/sdX
# Follow the prompts to create a new partition

# 4. Delete a partition
fdisk /dev/sdX
# Follow the prompts to delete a partition

# 5. Change a partition type
fdisk /dev/sdX
# Follow the prompts to change the partition type`,
                windows_variations_command: `# 1. List all disks
diskpart
list disk

# 2. Select a disk to modify
select disk <disk_number>

# 3. Create a new partition
create partition primary size=<size_in_MB>

# 4. Delete a partition
select partition <partition_number>
delete partition

# 5. Format a partition
select partition <partition_number>
format fs=ntfs quick`
            },
            {
                title: "Formatting Filesystems",
                explanation: "Commands to format filesystems in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `mkfs`,
                windows_basic_command: `Format-Volume`,
                linux_variations_command: `# 1. Format a partition with ext4 filesystem
mkfs.ext4 /dev/sdX1

# 2. Format a partition with xfs filesystem
mkfs.xfs /dev/sdX1

# 3. Format a partition with vfat filesystem
mkfs.vfat /dev/sdX1`,
                windows_variations_command: `# 1. Format a volume with NTFS filesystem
Format-Volume -DriveLetter X -FileSystem NTFS

# 2. Format a volume with exFAT filesystem
Format-Volume -DriveLetter X -FileSystem exFAT

# 3. Format a volume with FAT32 filesystem
Format-Volume -DriveLetter X -FileSystem FAT32`
            },
            {
                title: "Mounting Drives",
                explanation: "Commands to mount drives in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `mount || umount`,
                windows_basic_command: `New-PSDrive || Remove-PSDrive`,
                linux_variations_command: `# 1. Mount a drive
mount /dev/sdX1 /mnt

# 2. Unmount a drive
umount /mnt`,
                windows_variations_command: `# 1. Mount a drive
New-PSDrive -Name Z -PSProvider FileSystem -Root C:\\Path -Persist

# 2. Unmount a drive
Remove-PSDrive -Name Z`
            },
        ]
    },

    // chapter 8
    // echo, read, export, alias
    {
        chapter: "8. Shell Built-ins & Scripting",
        chapter_commands: [
            {
                title: "Echoing Text",
                explanation: "Commands to display text or variables in the terminal.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `echo`,
                windows_basic_command: `Write-Output`,
                linux_variations_command: `# 1. Display a simple message
echo "Hello, World!"

# 2. Display the value of a variable
my_var="Hello"
echo $my_var

# 3. Display multiple lines of text
echo -e "Line 1\nLine 2\nLine 3"`,
                windows_variations_command: `# 1. Display a simple message
Write-Output "Hello, World!"

# 2. Display the value of a variable
$my_var = "Hello"
Write-Output $my_var

# 3. Display multiple lines of text
Write-Output "Line 1\`nLine 2\`nLine 3"`
            },
            {
                title: "Reading User Input",
                explanation: "Commands to read user input from the terminal.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `read`,
                windows_basic_command: `Read-Host`,
                linux_variations_command: `# 1. Read a single line of input
read user_input
echo $user_input

# 2. Prompt the user for input
read -p "Enter your name: " name
echo "Hello, $name"

# 3. Read input with a timeout
read -t 5 -p "Enter your name (within 5 seconds): " name
echo "Hello, $name"`,
                windows_variations_command: `# 1. Read a single line of input
$user_input = Read-Host
Write-Output $user_input

# 2. Prompt the user for input
$name = Read-Host -Prompt "Enter your name"
Write-Output "Hello, $name"

# 3. Read input with a secure string (e.g., for passwords)
$password = Read-Host -Prompt "Enter your password" -AsSecureString
Write-Output "Password entered"`
            },
            {
                title: "Setting Environment Variables",
                explanation: "Commands to set environment variables in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `export`,
                windows_basic_command: `\$env`,
                linux_variations_command: `# 1. Set an environment variable (temporary)
export VAR_NAME=value

# 2. Set an environment variable for the current session
export PATH=\$PATH:/new/path

# 3. Set an environment variable and make it available to child processes
export VAR_NAME=value; export -p`,
                windows_variations_command: `# 1. Set an environment variable (temporary)
\$env:VAR_NAME = "value"

# 2. Set an environment variable for the current session
\$env:PATH += ";C:\\new\\path"

# 3. Set an environment variable and make it available to child processes
[System.Environment]::SetEnvironmentVariable("VAR_NAME", "value", "Process")`
            },
            {
                title: "Creating Aliases",
                explanation: "Commands to create and manage aliases in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `alias`,
                windows_basic_command: `Set-Alias`,
                linux_variations_command: `# 1. Create a simple alias
alias ll='ls -la'

# 2. Create an alias with arguments
alias grep='grep --color=auto'

# 3. Remove an alias
unalias ll

# 4. List all aliases
alias

# 5. Save aliases permanently
echo "alias ll='ls -la'" >> ~/.bashrc
source ~/.bashrc`,
                windows_variations_command: `# 1. Create a simple alias
Set-Alias ll Get-ChildItem

# 2. Create an alias with arguments
function grep { Select-String -Pattern $args[0] -Path $args[1] }

# 3. Remove an alias
Remove-Item Alias:ll

# 4. List all aliases
Get-Alias

# 5. Save aliases permanently
"Set-Alias ll Get-ChildItem" | Out-File -Append -FilePath $PROFILE
. $PROFILE`
            },
            {
                title: "Setting variables",
                explanation: "Commands to set user-defined variables in windows (powershell, cmd) and Linux (bash).",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `message="test message"`,
                windows_basic_command: `$message ="test message"`,
                linux_variations_command: `# 1. Set a simple variable in bash
message="test message"

# echo the message
echo $message
`,
                windows_variations_command: `# 1. Set a simple variable in PowerShell
$message = "test message"

# echo the message
Write-Output $message

# 2. Set a simple variable in cmd
set message=test message
# echo the message
echo %message%
`
            },
        ]
    },

    // chapter 9
    // tar, gzip, gunzip, zip, unzip
    {
        chapter: "9. Archiving & compression",
        chapter_commands: [
            {
                title: "Archiving and Compressing Files",
                explanation: "Commands to archive and compress files in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `tar`,
                windows_basic_command: `Compress-Archive`,
                linux_variations_command: `# 1. Create a compressed tar archive
tar -czvf archive.tar /path/to/directory

# 2. Extract a tar archive
tar -xzvf archive.tar

# 3. List contents of a tar archive
tar -tvf archive.tar`,
                windows_variations_command: `# 1. Create a zip archive
Compress-Archive -Path C:\\path\\to\\directory -DestinationPath C:\\path\\to\\archive.zip

# 2. Extract a zip archive
Expand-Archive -Path C:\\path\\to\\archive.zip -DestinationPath C:\\path\\to\\extract

# 3. Create a compressed zip archive
Compress-Archive -Path C:\\path\\to\\directory -DestinationPath C:\\path\\to\\archive.zip

# 4. Extract a compressed zip archive
Expand-Archive -Path C:\\path\\to\\archive.zip -DestinationPath C:\\path\\to\\extract

# 5. List contents of a zip archive
Get-ChildItem -Path C:\\path\\to\\archive.zip`
            },
            {
                title: "Compressing and Decompressing Files",
                explanation: "Commands to compress and decompress files in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `zip || unzip || 7zip`,
                windows_basic_command: `Compress-Archive || Expand-Archive`,
                linux_variations_command: `# 1. Compress files into a zip archive
zip archive.zip file1 file2

# 2. Decompress a zip archive
unzip archive.zip

# 3. Compress a directory into a zip archive
zip -r archive.zip /path/to/directory

# 4. Decompress a zip archive to a specific directory
unzip archive.zip -d /path/to/destination

# 5. create a zip with 7z
7z a archive.7z file1 file2

# 6. extract a zip with 7z
7z x archive.7z`,
                windows_variations_command: `# 1. Compress files into a zip archive
Compress-Archive -Path file1, file2 -DestinationPath archive.zip

# 2. Decompress a zip archive
Expand-Archive -Path archive.zip -DestinationPath .

# 3. Compress a directory into a zip archive
Compress-Archive -Path C:\\path\\to\\directory -DestinationPath archive.zip

# 4. Decompress a zip archive to a specific directory
Expand-Archive -Path archive.zip -DestinationPath C:\\path\\to\\destination`
            },
            {
                title: "Compressing and Decompressing Gzip Files",
                explanation: "Commands to compress and decompress files using gzip and gunzip in Linux and Windows.",
                linux_command_language: bash,
                windows_command_language: powershell,
                linux_basic_command: `gzip`,
                windows_basic_command: `Compress-Archive`,
                linux_variations_command: `# 1. Compress a file using gzip
gzip file.txt

# 2. Decompress a gzip file
gunzip file.txt.gz

# 3. Compress multiple files into a single gzip archive
tar -czvf archive.tar.gz file1.txt file2.txt

# 4. Decompress a tar.gz archive
tar -xzvf archive.tar.gz`,
                windows_variations_command: `# 1. Compress a file using gzip
Compress-Archive -Path file.txt -DestinationPath file.txt.gz

# 2. Decompress a gzip file
Expand-Archive -Path file.txt.gz -DestinationPath file.txt

# 3. Compress multiple files into a single gzip archive
Compress-Archive -Path file1.txt, file2.txt -DestinationPath archive.tar.gz

# 4. Decompress a tar.gz archive
Expand-Archive -Path archive.tar.gz -DestinationPath.`
            }
        ]
    },

    // chapter 10
    {
        chapter: "10. Miscellaneous",
        chapter_commands: []
    },
];

// verwerken in tool: uitlezen van creds via sam file (samdump2)
// rlwrap (Zodat upkeys in een revers shell gebruikt kunnen worden)
// net use X: \10.21.91.7\test /user:root 123456
// schtasks /create /tn "TempTask" /tr 'C:\Users\mssql-svc\Downloads\shell.exe' /sc once /st $(Get-Date).AddMinutes(1).ToString("HH:mm") /ru Administrator /rp "MyUnclesAreMarioAndLuigi!!1!" ; schtasks /run /tn "TempTask"

