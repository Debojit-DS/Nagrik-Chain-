import hashlib
import os
import base64
from config import settings

# Create mock IPFS cache directory if it doesn't exist
os.makedirs(settings.IPFS_MOCK_CACHE_DIR, exist_ok=True)

def calculate_sha3_256(data_bytes: bytes) -> str:
    return hashlib.sha3_256(data_bytes).hexdigest()

def generate_mock_cid(content_hash: str) -> str:
    # A simple mock CID v0 format (starting with Qm)
    return f"Qm{content_hash[:44]}"

def upload_to_ipfs(file_base64: str) -> tuple[str, str]:
    """
    Decodes base64 file string, hashes it, saves it to mock cache directory,
    and returns (content_hash, ipfs_cid).
    """
    try:
        # Normalize/clean string if there are headers
        if "," in file_base64:
            file_base64 = file_base64.split(",")[1]
        
        file_bytes = base64.b64decode(file_base64)
    except Exception:
        # Fallback to direct bytes if not valid base64
        file_bytes = file_base64.encode('utf-8')
        file_base64 = base64.b64encode(file_bytes).decode('utf-8')
        
    content_hash = calculate_sha3_256(file_bytes)
    cid = generate_mock_cid(content_hash)
    
    file_path = os.path.join(settings.IPFS_MOCK_CACHE_DIR, cid)
    with open(file_path, "w") as f:
        f.write(file_base64)
        
    return content_hash, cid

def retrieve_from_ipfs(cid: str) -> str:
    """
    Retrieves base64 file content from the local cache using its CID.
    """
    file_path = os.path.join(settings.IPFS_MOCK_CACHE_DIR, cid)
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Content for CID {cid} not found in IPFS mock cache.")
    
    with open(file_path, "r") as f:
        return f.read()
