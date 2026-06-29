import { useState, useCallback, useMemo } from 'react';
import { mockDocuments } from '@data/documents';
import { generateHash } from '@utils/hashGenerator';

/**
 * Hook to manage document CRUD operations.
 */
export function useDocuments() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [activeFilter, setActiveFilter] = useState('All');

  const addDocument = useCallback((doc) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      status: 'Pending',
      uploadDate: new Date().toISOString().split('T')[0],
      hash: generateHash(64),
      blockNumber: Math.floor(28419000 + Math.random() * 1000),
      aiConfidence: 0,
      ...doc,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  }, []);

  const deleteDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const filteredDocuments = useMemo(() => {
    if (activeFilter === 'All') return documents;
    return documents.filter((d) => d.type === activeFilter);
  }, [documents, activeFilter]);

  return {
    documents: filteredDocuments,
    allDocuments: documents,
    addDocument,
    deleteDocument,
    activeFilter,
    setActiveFilter,
  };
}
