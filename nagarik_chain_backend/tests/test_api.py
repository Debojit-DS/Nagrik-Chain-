import pytest
import json
from fastapi.testclient import TestClient
from main import app
from auth import create_access_token
from zk import generate_mock_proof

client = TestClient(app)

# Helper to generate mock auth headers
def get_auth_headers(chin: str, role: str, pdid: str = None) -> dict:
    token_claims = {
        "sub": chin,
        "role": role,
        "biometric_verified": True,
        "pdid": pdid
    }
    token = create_access_token(token_claims)
    return {"Authorization": f"Bearer {token}"}

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_register_citizen():
    import uuid
    payload = {
        "full_name": f"Aarav Sharma {uuid.uuid4().hex[:6]}",
        "dob": "2026-06-01",
        "gender": "M",
        "birth_district": "Ranchi",
        "birth_state": "Jharkhand",
        "hospital_pdid": "did:nagarik:pdid:engineer:nit_jsr_admin",
        "registrar_chin": "CHIN-OFF-0000001"
    }
    response = client.post("/api/v1/identity/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "chin" in data
    assert data["aadhaar_scheduled"] is True
    assert "blockchain_tx" in data

def test_get_citizen_profile_owner():
    chin = "CHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad"
    headers = get_auth_headers(chin, "citizen")
    response = client.get(f"/api/v1/identity/{chin}", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Ramesh Kumar"
    assert data["birth_district"] == "Jamshedpur"

def test_get_citizen_profile_zk_gated():
    chin = "CHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad"
    
    # Simulate a third-party verifier trying to access the profile without ownership or officer claims
    headers = get_auth_headers("CHIN-VERIFIER-001", "citizen")
    
    # Verifier wants to check full_name and birth_state
    secret_data = {
        "full_name": "Ramesh Kumar",
        "birth_state": "Jharkhand",
        "dob": "2001-08-15"
    }
    revealed_data = {
        "full_name": "Ramesh Kumar",
        "birth_state": "Jharkhand"
    }
    
    proof = generate_mock_proof(secret_data, revealed_data)
    proof_str = json.dumps(proof)
    
    # Request selectively disclosed fields
    params = {
        "proof_json": proof_str,
        "disclosed_fields": "full_name, birth_state"
    }
    response = client.get(f"/api/v1/identity/{chin}", headers=headers, params=params)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Ramesh Kumar"
    assert data["birth_state"] == "Jharkhand"
    # Other sensitive fields should be redacted
    assert data["gender"] == "REDACTED"
    assert data["birth_district"] == "REDACTED"

def test_issue_and_verify_document():
    chin = "CHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad"
    pdid = "did:nagarik:pdid:engineer:nit_jsr_admin"
    
    headers = get_auth_headers("CHIN-OFF-0000001", "engineer", pdid=pdid)
    
    # 1. Issue degree
    payload = {
        "chin": chin,
        "doc_type": "degree",
        "title": "M.Tech Cyber Security",
        "issued_by": pdid,
        "language": "en",
        "metadata": {
            "university": "NIT Jamshedpur",
            "roll_number": "2026MTECHCS01",
            "cgpa": 9.2
        },
        "document_file": "JVBERi0xLjQKJVRydXN0ZWQgUERGIGRvY3VtZW50IGJ5IE5hZ2FyaWsgQ2hhaW4K" # mock base64 PDF
    }
    response = client.post("/api/v1/documents/issue", json=payload, headers=headers)
    assert response.status_code == 201
    doc_data = response.json()
    assert doc_data["title"] == "M.Tech Cyber Security"
    assert doc_data["status"] == "valid"
    doc_id = doc_data["doc_id"]
    
    # 2. Verify document open-source
    verify_resp = client.get(f"/api/v1/documents/{doc_id}/verify")
    assert verify_resp.status_code == 200
    verify_data = verify_resp.json()
    assert verify_data["is_valid"] is True
    assert verify_data["chain_status"] == "on_chain"
    assert verify_data["issued_by_verified"] is True

def test_deploy_and_trigger_smart_contract():
    initiator_chin = "CHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad"
    beneficiary_chin = "CHIN-OFF-0000001"
    
    headers = get_auth_headers(initiator_chin, "citizen")
    
    payload = {
        "contract_type": "will",
        "chin_initiator": initiator_chin,
        "chin_beneficiary": beneficiary_chin,
        "trigger_condition": {
            "event": "death_certificate",
            "chin": initiator_chin
        },
        "actions": [
            {"transfer_funds": 1000000, "to": beneficiary_chin},
            {"transfer_title": "degree", "to": beneficiary_chin}
        ]
    }
    
    # 1. Deploy
    response = client.post("/api/v1/contracts/deploy", json=payload, headers=headers)
    assert response.status_code == 201
    contract = response.json()
    assert contract["status"] == "pending"
    assert "ethereum_address" in contract
    contract_id = contract["contract_id"]
    
    # 2. Trigger
    trigger_headers = get_auth_headers(initiator_chin, "citizen")
    trigger_resp = client.post(f"/api/v1/contracts/{contract_id}/trigger", headers=trigger_headers)
    assert trigger_resp.status_code == 200
    triggered_contract = trigger_resp.json()
    assert triggered_contract["status"] == "executed"
    assert triggered_contract["executed_at"] is not None

def test_ai_engine_fraud_and_explainability():
    chin = "CHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad"
    headers = get_auth_headers(chin, "citizen")
    
    # 1. Run fraud detector
    payload = {
        "chin": chin,
        "doc_ids": ["degree-ramesh-2024", "degree-ramesh-2024"],
        "context": "loan_application",
        "institution_id": "bank-sbi-jsr"
    }
    response = client.post("/api/v1/ai/detect/fraud", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] == "assisted_review"
    assert data["fraud_score"] > 0.40
    assert "cross_node_discrepancy" in data["flags"]
    verification_id = data["verification_id"]
    
    # 2. Explain AI verdict
    explain_resp = client.get(f"/api/v1/ai/explain/{verification_id}", headers=headers)
    assert explain_resp.status_code == 200
    explain_data = explain_resp.json()
    assert explain_data["verification_id"] == verification_id
    assert "cross_node_conflicts" in explain_data["features"]

def test_bribe_report_and_integrity_score():
    officer_chin = "CHIN-OFF-0000001"
    
    # Initial score check
    headers = get_auth_headers("CHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad", "citizen")
    score_resp = client.get(f"/api/v1/integrity/score/{officer_chin}", headers=headers)
    assert score_resp.status_code == 200
    initial_score = score_resp.json()["score"]
    
    # Log audit event referencing an application (to bind the officer to the reference)
    app_ref = "APP-PASSPORT-2026-99"
    # We log a mock action showing officer handled this application
    from database import SessionLocal
    from modules.audit.service import AuditService
    db = SessionLocal()
    AuditService.log_action(
        db,
        actor_chin=officer_chin,
        action="PROCESS_APPLICATION",
        resource_type="document",
        resource_id=app_ref
    )
    db.close()
    
    # Submit bribe report targeting that application
    bribe_payload = {
        "reporter_chin": None, # Anonymous
        "officer_inst_id": "univ-nit-jsr-2026",
        "application_ref": app_ref,
        "description": "Asked for extra processing speed money under table.",
        "evidence_file": "U01FTUVSQ0FSRCBTRUVEX0NPQlJBCg=="
    }
    
    bribe_resp = client.post("/api/v1/integrity/report/bribe", json=bribe_payload)
    assert bribe_resp.status_code == 201
    bribe_data = bribe_resp.json()
    report_id = bribe_data["report_id"]
    
    # Check that score was decremented
    score_resp2 = client.get(f"/api/v1/integrity/score/{officer_chin}", headers=headers)
    assert score_resp2.status_code == 200
    updated_score = score_resp2.json()["score"]
    assert updated_score == initial_score - 15.0 # 15 points penalty
    
    # Test Sealed Whistleblower Vault Access
    # Try as normal citizen (should fail)
    citizen_headers = get_auth_headers("CHIN-3a8fbb", "citizen")
    vault_fail = client.get(f"/api/v1/integrity/whistleblower/{report_id}", headers=citizen_headers)
    assert vault_fail.status_code == 403
    
    # Try as Court Official (should succeed and decrypt description)
    court_headers = get_auth_headers("CHIN-CRT-0000001", "court")
    vault_success = client.get(f"/api/v1/integrity/whistleblower/{report_id}", headers=court_headers)
    assert vault_success.status_code == 200
    vault_data = vault_success.json()
    assert vault_data["description_decrypted"] == "Asked for extra processing speed money under table."

def test_decoy_check():
    officer_chin = "CHIN-OFF-0000001"
    headers = get_auth_headers(officer_chin, "officer")
    
    payload = {
        "officer_chin": officer_chin,
        "decoy_type": "passport"
    }
    response = client.post("/api/v1/integrity/decoy", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["officer_chin"] == officer_chin
    assert data["status"] in ("passed", "failed")

def test_audit_logs():
    chin = "CHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad"
    headers = get_auth_headers(chin, "citizen")
    
    response = client.get(f"/api/v1/audit/citizen/{chin}", headers=headers)
    assert response.status_code == 200
    logs = response.json()
    assert len(logs) > 0
    assert logs[-1]["action"] in ("SEED_REGISTRATION", "REGISTER_CITIZEN")
