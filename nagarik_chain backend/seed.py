import os
import sys
from datetime import date, datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_db, SessionLocal
from modules.identity.models import Citizen, Biometric
from modules.identity.service import IdentityService
from modules.institutions.models import Institution, Professional
from modules.documents.models import Document
from modules.anti_corruption.models import IntegrityScore
from modules.audit.models import AuditLog

def seed():
    print("Initializing database tables...")
    init_db()
    db = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(Citizen).first():
            print("Database already has records. Skipping seeding.")
            return

        print("Seeding citizens...")
        # 1. Registar Officer
        officer = Citizen(
            chin="CHIN-OFF-0000001",
            full_name="Officer Sayantan Dutta",
            dob=date(1985, 5, 12),
            gender="M",
            birth_district="Kolkata",
            birth_state="West Bengal",
            aadhaar_hash=IdentityService.calculate_sha3_256("aadhaar-officer"),
            status="active",
            blockchain_tx="fabric-tx-officer-seed"
        )
        db.add(officer)
        
        # 2. Court Officer
        court_official = Citizen(
            chin="CHIN-CRT-0000001",
            full_name="Judge Souriddha Sarkar",
            dob=date(1978, 11, 23),
            gender="M",
            birth_district="Darjeeling",
            birth_state="West Bengal",
            aadhaar_hash=IdentityService.calculate_sha3_256("aadhaar-court"),
            status="active",
            blockchain_tx="fabric-tx-court-seed"
        )
        db.add(court_official)

        # 3. Standard Citizen: Ramesh Kumar
        ramesh = Citizen(
            chin="CHIN-3a8f5bb2e97a387532d92caad5f09623e1986423a8f5bb2e97a387532d92caad",
            full_name="Ramesh Kumar",
            dob=date(2001, 8, 15),
            gender="M",
            birth_district="Jamshedpur",
            birth_state="Jharkhand",
            aadhaar_hash=IdentityService.calculate_sha3_256("aadhaar-ramesh"),
            status="active",
            blockchain_tx="fabric-tx-ramesh-seed"
        )
        db.add(ramesh)
        
        db.commit()

        print("Seeding officer integrity scores...")
        officer_score = IntegrityScore(
            officer_chin="CHIN-OFF-0000001",
            score=95.0,
            total_cases=10,
            auto_approved=8,
            escalated=2,
            bribe_reports=0,
            decoy_catches=0
        )
        db.add(officer_score)

        print("Seeding institutions...")
        university = Institution(
            inst_id="univ-nit-jsr-2026",
            name="NIT Jamshedpur",
            type="university",
            registration_no="REG-NITJ-1960",
            state="Jharkhand",
            district="East Singhbhum",
            node_public_key="-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAseed...\n-----END PUBLIC KEY-----",
            status="active"
        )
        db.add(university)
        db.commit()

        print("Seeding professionals...")
        prof = Professional(
            pdid="did:nagarik:pdid:engineer:nit_jsr_admin",
            chin="CHIN-OFF-0000001",
            profession="engineer",
            license_number="LIC-ENG-2021-0098",
            issuing_body="National Board of Registration",
            valid_from=date(2021, 6, 15),
            valid_until=date(2031, 6, 15),
            specializations=["software_systems", "infrastructure"],
            status="active",
            blockchain_tx="fabric-tx-prof-seed"
        )
        db.add(prof)
        db.commit()

        print("Seeding documents...")
        doc = Document(
            doc_id="degree-ramesh-2024",
            chin=ramesh.chin,
            doc_type="degree",
            title="B.Tech Computer Science",
            issued_by=prof.pdid,
            valid_until=None,
            content_hash=IdentityService.calculate_sha3_256("B.Tech Computer Science Ramesh Kumar NIT Jamshedpur"),
            ipfs_cid="QmdegreeRameshNITJSR2024CS",
            status="valid",
            language="en",
            blockchain_tx="fabric-tx-doc-seed",
            metadata_json={
                "university": "NIT Jamshedpur",
                "roll_number": "2021BTECH001",
                "cgpa": 8.7
            }
        )
        db.add(doc)
        db.commit()

        print("Seeding audit logs...")
        logs = [
            AuditLog(
                actor_chin="SYSTEM",
                action="SEED_REGISTRATION",
                resource_type="citizen",
                resource_id=officer.chin,
                ip_address="127.0.0.1",
                blockchain_tx="fabric-tx-seed-log-1"
            ),
            AuditLog(
                actor_chin="SYSTEM",
                action="SEED_REGISTRATION",
                resource_type="citizen",
                resource_id=ramesh.chin,
                ip_address="127.0.0.1",
                blockchain_tx="fabric-tx-seed-log-2"
            ),
            AuditLog(
                actor_chin=prof.pdid,
                action="ISSUE_DOCUMENT",
                resource_type="document",
                resource_id=doc.doc_id,
                ip_address="127.0.0.1",
                blockchain_tx="fabric-tx-seed-log-3"
            )
        ]
        db.bulk_save_objects(logs)
        db.commit()
        
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
