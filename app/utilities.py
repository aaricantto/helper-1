# This script contains utility functions for the Flask backend.

import os

# Get the appropriate icon for a file based on its extension or directory status.
def get_icon_for_file(file_path):
    # If the path is a directory, use the folder icon.
    if os.path.isdir(file_path):
        return "folder.svg"
    
    # Get the file extension and construct the icon filename.
    extension = os.path.splitext(file_path)[1]
    # If the file is an SVG, use it directly. Otherwise, find the corresponding icon.
    icon_filename = os.path.basename(file_path) if extension == ".svg" else f"{extension[1:]}.svg" if extension else "unknown.svg"
    
    # Check if the icon file exists in the static images directory.
    icon_path = os.path.join('app', 'static', 'images', icon_filename)
    # Return the found icon filename or the default unknown icon.
    return icon_filename if os.path.isfile(icon_path) else "unknown.svg"
