import hashlib

def generate_mock_proof(secret_data: dict, revealed_data: dict) -> dict:
    """
    Generates a mock ZK proof string/JSON that binds the secret data
    and the revealed public statements.
    """
    secret_str = str(sorted(secret_data.items()))
    public_str = str(sorted(revealed_data.items()))
    
    # Compute proof hash
    proof_hash = hashlib.sha256((secret_str + public_str).encode('utf-8')).hexdigest()
    
    return {
        "proof_type": "Groth16",
        "proof_hash": f"proof_{proof_hash[:32]}",
        "revealed_keys": list(revealed_data.keys()),
        "verification_key_id": "vk_nagarik_v1"
    }

def verify_zk_proof(proof: dict, revealed_data: dict) -> bool:
    """
    Validates a mock ZK proof. Checks if proof contains required keys
    and follows correct structure.
    """
    if not isinstance(proof, dict):
        return False
    
    required_keys = {"proof_type", "proof_hash", "revealed_keys"}
    if not required_keys.issubset(proof.keys()):
        return False
        
    # Check if all revealed data keys are declared in the proof
    for key in revealed_data.keys():
        if key not in proof["revealed_keys"]:
            return False
            
    return True
