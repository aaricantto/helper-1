document.addEventListener('DOMContentLoaded', () => {
    const explorer = new Explorer();
    explorer.fetchAndDisplay('/');

    // Initially call the toggleDeselectAllButton to set the correct display state
    explorer.toggleDeselectAllButton();

    // Bind the Deselect All button to its handler
    const deselectAllButton = document.getElementById('deselect-all-button');
    if (deselectAllButton) {
    deselectAllButton.onclick = () => {
        explorer.deselectAllFiles();
        explorer.toggleDeselectAllButton(); // Ensure to call this to update button visibility
    };
    }
    // Bind the 'Copy to Clipboard' button to its handler
    const copyToClipboardButton = document.getElementById('copy-to-clipboard-button');
    if (copyToClipboardButton) {
        copyToClipboardButton.addEventListener('click', () => explorer.copyContentToClipboard());
    }
});