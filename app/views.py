# views.py

import os
from flask import Blueprint, render_template, jsonify, current_app, url_for, request
from .utilities import get_icon_for_file

views_bp = Blueprint('views', __name__)

def get_files_and_dirs(path):
    base_dir = os.path.abspath(os.path.join(current_app.root_path, '..', '..'))
    target_dir = os.path.join(base_dir, path.strip('/')) if path else base_dir
    target_dir = os.path.normpath(target_dir)

    files_and_dirs = []
    for name in os.listdir(target_dir):
        item_path = os.path.join(target_dir, name)
        is_dir = os.path.isdir(item_path)
        icon_filename = "folder.svg" if is_dir else get_icon_for_file(item_path)
        
        # Construct the full URL path for the icon
        icon_url = url_for('static', filename=f'images/{icon_filename}')

        files_and_dirs.append({
            'name': name,
            'path': os.path.join(path, name).strip('/').replace('\\', '/'),
            'icon_url': icon_url,  # Send the full URL to the frontend
            'is_dir': is_dir
        })

    return files_and_dirs

@views_bp.route('/fetch/', defaults={'path': ''})
@views_bp.route('/fetch/<path:path>')
def fetch_contents(path=''):
    try:
        files_and_dirs = get_files_and_dirs(path)
        return jsonify({'files': files_and_dirs})
    except OSError as e:
        return jsonify({'error': 'Unable to fetch contents', 'message': str(e)}), 500

@views_bp.route('/')
def index():
    return render_template('index.html')


@views_bp.route('/get-file-contents', methods=['POST'])
def get_file_contents():
    data = request.json
    selected_paths = data['paths']
    combined_content = ""
    
    # Assume the Flask app is at the project's root. Adjust if your app is in a subdirectory.
    base_dir = os.path.abspath(os.path.join(current_app.root_path, '..', '..'))
    
    for i, relative_path in enumerate(selected_paths, start=1):
        # Join the base_dir with the relative path to get the full path
        full_path = os.path.join(base_dir, relative_path.strip('/'))
        if os.path.isfile(full_path):
            with open(full_path, 'r') as file:
                contents = file.read()
                combined_content += f"\nSCRIPT {i}: {relative_path}\n\n{contents}\n\n"
        else:
            combined_content += f"File not found: {relative_path}\n"
    
    return jsonify({'combinedContent': combined_content})
