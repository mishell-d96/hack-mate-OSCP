document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('terminal-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const input = document.getElementById('terminal-input').value.trim();
            const output = document.getElementById('terminal-output');
            let response = '';

            switch (input) {
                case 'help':
                    response = `Supported commands:
--
1. help - Display this message
2. clear - Clear the terminal
3. harlem - Harlem shake the current website
4. rewrite - Rewrite the current website`;
                    break;
                case 'clear':
                    output.innerHTML = '';
                    document.getElementById('terminal-input').value = '';
                    return;
                case 'harlem':
                    response = 'Starting harlem shake on current website... &#128378;';
                    document.getElementById('terminal-input').value = '';
                    sendRuntimeMessage(input)
                    break
                case 'rewrite':
                    response = 'Rewriting current website... &#128221;';
                    document.getElementById('terminal-input').value = '';
                    sendRuntimeMessage(input)
                    break
                default:
                    response = "Command not found: <span style='color:darkred'>" + input + "</span>";
            }

            function sendRuntimeMessage(input) {
                browser.runtime.sendMessage({
                    command: input,
                    id: "terminal-input",
                });
            }

            // Append the input and response to terminal output
            output.innerHTML += `<span style="color: #005f99;">hm@terminal</span><span style="color: #FFFFFF;">:~$</span> ` + input + "\n" + response + "\n";
            document.getElementById('terminal-input').value = '';

            // Scroll to the bottom
            document.getElementById('terminal-output').scrollTop = document.getElementById('terminal-output').scrollHeight;
        }
    });

    document.getElementById('terminal-input').dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        keyCode: 13,
        code: 'Enter',
        bubbles: true,
        cancelable: true
    }));
});
