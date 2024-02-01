// This script controls the file explorer functionality on the frontend.

class Explorer {
    constructor() {
        this.fileListElement = document.getElementById('file-list');
        this.currentPathDisplay = document.getElementById('current-path-display');
        this.backButton = document.getElementById('back-button'); // Ensure you have a back button with this ID in your HTML

        this.backButton.style.display = 'none';  // Initially hidden
    
        // Bind the backButton click to its handler
        this.backButton.onclick = () => this.goBack();
        // Initialize the root directory
        this.rootPath = '/';
        this.currentPath = this.rootPath;
        this.pathStack = [];



        this.selectedFiles = new Set(); // Holds the paths of selected files
        this.selectedFilesElement = document.getElementById('selected-scripts-list'); // Ensure you have this element in your HTML
        this.handleFileClick = this.handleFileClick.bind(this);
        this.toggleFileSelection = this.toggleFileSelection.bind(this);
        this.updateSelectedFilesUI = this.updateSelectedFilesUI.bind(this);
    }
    // Method to update UI based on current path
    updateUIForPath() {
        this.currentPathDisplay.textContent = this.currentPath === this.rootPath ? 'Root' : this.currentPath;
        this.backButton.style.display = this.currentPath === this.rootPath ? 'none' : 'block'; // Ensuring the back button is shown/hidden correctly
    }



    goBack() {
        if (this.pathStack.length > 0) {
            const lastPath = this.pathStack.pop();
            this.fetchAndDisplay(lastPath, true); // Pass true to indicate we are going back
        }
    }

      // Method to deselect all files
    deselectAllFiles() {
        this.selectedFiles.clear();
        this.updateSelectedFilesUI();
        this.toggleDeselectAllButton(); // Call to toggle the deselect all button visibility
    }

    // Method to toggle the visibility of the Deselect All button
    toggleDeselectAllButton() {
        const deselectAllButton = document.getElementById('deselect-all-button');
        if (this.selectedFiles.size > 0) {
        deselectAllButton.style.display = 'block';
        } else {
        deselectAllButton.style.display = 'none';
        }
    }    

    // Fetch the file and directory data from the server and display it.
    async fetchAndDisplay(path, goingBack = false) {
        // Determine the correct endpoint to fetch data from.
        const fetchPath = path === '/' ? '/fetch/' : `/fetch/${encodeURIComponent(path)}`;
        try {
            // Attempt to fetch data from the server.
            const response = await fetch(`${window.location.origin}${fetchPath}`);
            // If the fetch is successful, display the files.
            if (response.ok) {
                const data = await response.json();
                this.renderFiles(data.files);
                document.getElementById('current-path-display').textContent = path;
            } else {
                // If there's an error, log it and alert the user.
                console.error('Error fetching files:', response.statusText);
                alert('Error fetching files: ' + response.statusText);
            }
        } catch (error) {
            // Catch any errors that occur during the fetch process.
            console.error('Error fetching files:', error);
            alert('Error fetching files: ' + error);
        }
    
        // When going back, check if we've reached the root path
        if (goingBack && this.pathStack.length === 0) {
            this.currentPath = this.rootPath;
        }
        
        // Always update the path stack before changing the current path
        if (!goingBack && this.currentPath !== path) {
            this.pathStack.push(this.currentPath);
        }
        
        this.currentPath = path; // Set the new current path
        this.updateUIForPath(); // Update the UI to reflect changes
    }
        

    // Render the files and directories onto the page.
    renderFiles(files) {
        this.fileListElement.innerHTML = '';
        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = file.is_dir ? 'folder' : 'file';
            
            // Use the full URL provided by the backend
            const iconUrl = file.icon_url;
            
            fileElement.innerHTML = `<img src="${iconUrl}" alt="" class="file-icon">${file.name}`;
            fileElement.dataset.path = file.path;
            fileElement.dataset.isDir = file.is_dir;
            fileElement.addEventListener('click', () => this.handleFileClick(file));
            this.fileListElement.appendChild(fileElement);
        });
    }

    // Handle clicking on a file or directory.
    handleFileClick(file) {
        console.log(`File clicked: ${file.name}, isDir: ${file.is_dir}`);
        if (file.is_dir) {
            this.fetchAndDisplay(file.path);
        } else {
            // Pass the full path to the toggle selection function
            this.toggleFileSelection(file.path, file.icon_url);
        }
    }

    // Toggle the selection of a file.
    toggleFileSelection(filePath, iconUrl) {
        if (this.selectedFiles.has(filePath)) {
            this.selectedFiles.delete(filePath);
            // Remove the file element from the selected list
            const selectedFileElement = this.selectedFilesElement.querySelector(`[data-path="${filePath}"]`);
            if (selectedFileElement) {
                this.selectedFilesElement.removeChild(selectedFileElement);
            }
        } else {
            this.selectedFiles.add(filePath);
            // Create a new element for the selected file with the full path
            const selectedFileElement = document.createElement('div');
            selectedFileElement.className = 'file';
            selectedFileElement.dataset.path = filePath;
            selectedFileElement.innerHTML = `
                <img src="${iconUrl}" alt="" class="file-icon">
                <span>${filePath}</span>
            `;
            this.selectedFilesElement.appendChild(selectedFileElement);  // Call to toggle the deselect all button visibility
            this.toggleDeselectAllButton();
          }
    }



    updateSelectedFilesUI() {
        // Clear the current selected files list display
        this.selectedFilesElement.innerHTML = '';
        
        // Loop over the selected files and add them to the selected files list display
        this.selectedFiles.forEach(fileInfo => {
            const selectedFileElement = document.createElement('div');
            selectedFileElement.className = 'file'; // Reuse the 'file' class for styling
            selectedFileElement.dataset.path = fileInfo.path; // Store the full path for later use
    
            // Construct the inner HTML with the SVG icon and the full relative path
            selectedFileElement.innerHTML = `
                <img src="${fileInfo.iconUrl}" alt="" class="file-icon">
                <span class="file-name">${fileInfo.path}</span>
            `;
    
            // Append the element to the selected files list
            this.selectedFilesElement.appendChild(selectedFileElement);
        });
    }
    
    copyContentToClipboard() {
        const selectedFilePaths = Array.from(this.selectedFiles);
        fetch('/get-file-contents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paths: selectedFilePaths }),
        })
        .then(response => response.json())
        .then(data => {
          navigator.clipboard.writeText(data.combinedContent);
          // Removed the alert here. You can update the UI to show a status message if needed.
        })
        .catch(error => console.error('Error:', error));
      }
    
}