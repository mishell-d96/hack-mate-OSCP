/**
 * initChecklistAssistantContent()
 */
function initChecklistAssistantContent() {
    // questions to ask yourself checklist

    // general checklists
    new CheckList(checklist.osint_general, "checklist-assistant-osint-container", "OSINT").buildChecklist("language-bash")
    new CheckList(checklist.osint_dark_web, "checklist-assistant-osint-dark-web-container", "Dark web OSINT").buildChecklist("language-bash")
    new CheckList(checklist.protocol_general, "checklist-assistant-protocol-general-container", "General protocols").buildChecklist("language-bash")
    new CheckList(checklist.web_pentest_general, "checklist-assistant-web-pentest-general-container", "WEB").buildChecklist("language-bash")
    new CheckList(checklist.web_api_check, "checklist-assistant-web-api-container", "WEB-API").buildChecklist("language-bash")
    new CheckList(checklist.windows_privesc, "checklist-assistant-windows-privesc-container", "Windows Privilege Escalation").buildChecklist("language-powershell")
    new CheckList(checklist.windows_ad, "checklist-assistant-windows-ad-container", "Windows Active Directory").buildChecklist("language-powershell")
    new CheckList(checklist.windows_post_exploitation, "checklist-assistant-windows-post-exploitation-container", "Windows post-exploitation").buildChecklist("language-powershell")
    new CheckList(checklist.linux_privesc, "checklist-assistant-linux-privesc-container", "Linux Privilege escalation").buildChecklist("language-bash")
    new CheckList(checklist.stuck_general, "checklist-assistant-stuck-container", "I'm stuck what the f*ck").buildChecklist("language-bash")
}

const checklist = {}