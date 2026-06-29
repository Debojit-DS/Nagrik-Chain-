import os
import zipfile

def zip_folder(folder_path, output_path):
    # Folders and files to exclude from the zip
    exclude_dirs = {"__pycache__", ".pytest_cache", ".ipfs_cache", ".git", ".github", ".venv"}
    exclude_files = {"nagarik_chain.db", "nagarik_chain.zip"}

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            # Modify dirs in-place to exclude unwanted subdirectories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files or file.endswith('.pyc'):
                    continue
                file_path = os.path.join(root, file)
                # Save relative path inside the zip file
                arcname = os.path.relpath(file_path, folder_path)
                zipf.write(file_path, arcname)
                print(f"Added: {arcname}")

if __name__ == "__main__":
    project_dir = os.path.dirname(os.path.abspath(__file__))
    zip_output = os.path.join(project_dir, "nagarik_chain.zip")
    print(f"Compressing {project_dir} to {zip_output}...")
    zip_folder(project_dir, zip_output)
    print("Done! You can find the zip archive in your workspace folder.")
