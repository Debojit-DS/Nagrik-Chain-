function normalizeKeys(obj, mapping) {
  if (Array.isArray(obj)) {
    return obj.map(item => normalizeKeys(item, mapping));
  }
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = mapping[key] || key;
      result[newKey] = normalizeKeys(value, mapping);
    }
    return result;
  }
  return obj;
}

const CITIZEN_MAP = {
  chin: 'nagarikId',
  full_name: 'name',
  birth_district: 'district',
  birth_state: 'state',
};

const DOCUMENT_MAP = {
  doc_id: 'id',
  doc_type: 'type',
  issued_by: 'issuedBy',
  valid_until: 'validUntil',
  content_hash: 'contentHash',
  ipfs_cid: 'ipfsCid',
  blockchain_tx: 'blockchainTx',
  metadata_json: 'metadata',
};

const CONTRACT_MAP = {
  contract_id: 'contractId',
  contract_type: 'contractType',
  chin_initiator: 'chinInitiator',
  chin_beneficiary: 'chinBeneficiary',
  trigger_condition: 'triggerCondition',
  ethereum_address: 'ethereumAddress',
  deployed_at: 'deployedAt',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

const AI_MAP = {
  application_ref: 'applicationRef',
  description_enc: 'descriptionEnc',
  evidence_ipfs: 'evidenceIpfs',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

const AUDIT_MAP = {
  log_id: 'id',
  verification_id: 'verificationId',
  verification_type: 'type',
  actor_chin: 'actorChin',
  resource_type: 'resourceType',
  resource_id: 'resourceId',
  ip_address: 'ipAddress',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

const BRIBE_MAP = {
  report_id: 'reportId',
  officer_inst_id: 'officerInstId',
  triggered_at: 'triggeredAt',
  executed_at: 'executedAt',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

function normalizeCitizen(data) {
  const mapped = normalizeKeys(data, CITIZEN_MAP);
  return {
    ...mapped,
    status: ((mapped.status || data.status || 'active')).toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    registeredAt: mapped.created_at || data.created_at || new Date().toISOString(),
    mobile: mapped.mobile ?? data.mobile ?? null,
    email: mapped.email ?? data.email ?? null,
    pinCode: mapped.pin_code ?? data.pin_code ?? null,
    address: mapped.address ?? data.address ?? null,
    linkedServices: mapped.linked_services ?? data.linked_services ?? {},
    biometrics: mapped.biometrics ?? data.biometrics ?? null,
    documentsCount: mapped.documents_count ?? data.documents_count ?? 0,
    blockNumber: mapped.blockchain_tx ? parseInt(mapped.blockchain_tx.slice(-8), 16) || 28419030 : null,
    blockHash: mapped.blockchain_tx || '0x' + '0'.repeat(64),
    aiTrustScore: mapped.ai_trust_score ?? data.ai_trust_score ?? 85.0,
  };
}

function normalizeDocument(data) {
  return normalizeKeys(data, DOCUMENT_MAP);
}

function normalizeContract(data) {
  return normalizeKeys(data, CONTRACT_MAP);
}

function normalizeAuditLog(data) {
  return normalizeKeys(data, AUDIT_MAP);
}

function normalizeBribeReport(data) {
  return normalizeKeys(data, BRIBE_MAP);
}

export {
  normalizeKeys,
  CITIZEN_MAP,
  DOCUMENT_MAP,
  CONTRACT_MAP,
  AI_MAP,
  AUDIT_MAP,
  BRIBE_MAP,
  normalizeCitizen,
  normalizeDocument,
  normalizeContract,
  normalizeAuditLog,
  normalizeBribeReport,
};
