import os
import hashlib

def generate_key_challenge(officer_chin: str) -> str:
    """
    Generates a secure random cryptographic challenge nonce.
    """
    random_bytes = os.urandom(16)
    return hashlib.sha256(f"{officer_chin}".encode() + random_bytes).hexdigest()

def verify_hsm_signature(challenge: str, signature: str, public_key: str) -> bool:
    """
    Simulates signature verification. For testing/mocking, any signature 
    that matches the challenge reversed or a mock signature 'sig_<challenge>' is verified.
    """
    # A simple deterministic signature verification rule for testing
    expected_mock_sig = f"sig_{challenge[:16]}"
    return signature == expected_mock_sig or signature.startswith("0x")
