import ashokaChakra from '@/assets/ashoka-chakra.svg';
import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const NagarikIDCard = ({ citizen }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  const initials = useMemo(() => {
    return citizen.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [citizen.name]);

  const qrGrid = useMemo(() => {
    const grid = [];
    for (let y = 0; y < 10; y++) {
      const row = [];
      for (let x = 0; x < 10; x++) {
        row.push(Math.random() > 0.4);
      }
      grid.push(row);
    }
    return grid;
  }, []);

  const handleCopyId = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(citizen.nagarikId);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  }, [citizen.nagarikId]);

  const toggleFlip = useCallback((e) => {
    e.stopPropagation();
    setIsFlipped((prev) => !prev);
  }, []);

  const frontGradient = `
    radial-gradient(circle at 25% 25%, rgba(255,153,51,0.15) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(0,122,255,0.1) 0%, transparent 50%),
    linear-gradient(135deg, #1a1d24 0%, #23272f 100%)
  `;

  const backGradient = `
    linear-gradient(160deg, #111D35 0%, #0B1426 100%)
  `;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="card-container w-full">
          <div
            className={`card-inner relative w-full ${isFlipped ? 'flipped' : ''}`}
            style={{ aspectRatio: '500 / 312' }}
          >
            <div
              className="card-front nagarik-id-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden"
              style={{ background: frontGradient }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <img
                    src={ashokaChakra}
                    alt=""
                    className="w-5 h-5"
                    style={{ filter: 'invert(45%) sepia(100%) saturate(1000%) hue-rotate(360deg)' }}
                  />
                  <span className="font-display font-semibold text-[10px] tracking-[0.1em] uppercase whitespace-nowrap text-white">
                    NAGARIK CHAIN
                  </span>
                </div>
                <span className="font-mono text-[10px] text-brand-muted">🇮🇳 INDIA</span>
              </div>

              <div className="flex justify-between flex-1 py-2">
                <div className="flex flex-col gap-2">
                  <h2 className="font-display font-bold text-xl text-white leading-tight">
                    {citizen.name}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-brand-crypto-blue">
                      {citizen.nagarikId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                      aria-label={idCopied ? 'Copied' : 'Copy ID'}
                    >
                      {idCopied ? (
                        <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-brand-crypto-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase text-gray-400 font-body">Issued On</span>
                    <span className="font-mono text-[12px] text-white">{citizen.issuedAt}</span>
                  </div>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium w-fit"
                    style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c' }}
                  >
                    {citizen.status}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-brand-saffron text-white font-bold text-2xl font-display flex items-center justify-center">
                    {initials}
                  </div>
                </div>
              </div>

              <div className="border-t border-brand-navy-light pt-2 flex justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-gray-500 font-body">Block#</span>
                  <span className="font-mono text-[10px] text-brand-crypto-blue whitespace-nowrap">
                    #{citizen.blockNumber}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase text-gray-500 font-body">Hash</span>
                  <span className="font-mono text-[10px] text-brand-crypto-blue whitespace-nowrap">
                    {citizen.blockHash}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="card-back nagarik-id-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden"
              style={{ background: backGradient }}
            >
              <div className="flex justify-between items-center">
                <span className="font-display font-semibold text-[10px] tracking-[0.15em] uppercase text-white">
                  VERIFICATION DATA
                </span>
                <span className="font-mono text-[10px] text-brand-muted">🇮🇳 INDIA</span>
              </div>

              <div className="flex justify-between flex-1 py-3">
                <div className="w-24 h-24 bg-white/10 rounded-lg p-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {Array.from({ length: 10 }).map((_, y) =>
                      Array.from({ length: 10 }).map((_, x) => {
                        if (!qrGrid[y] || !qrGrid[y][x]) return null;
                        return (
                          <rect
                            key={`${x}-${y}`}
                            x={x * 10}
                            y={y * 10}
                            width={10}
                            height={10}
                            fill="white"
                          />
                        );
                      }),
                    )}
                  </svg>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-white font-body">Fingerprint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-white font-body">Face</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-white font-body">Iris</span>
                  </div>
                  <span className="text-[10px] text-brand-muted mt-1">Scan to Verify</span>
                </div>
              </div>

              <div className="border-t border-brand-navy-light pt-2 flex justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-gray-500 font-body">Block#</span>
                  <span className="font-mono text-[10px] text-brand-crypto-blue whitespace-nowrap">
                    #{citizen.blockNumber}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase text-gray-500 font-body">Hash</span>
                  <span className="font-mono text-[10px] text-brand-crypto-blue whitespace-nowrap">
                    {citizen.blockHash}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleFlip}
        className="text-brand-muted hover:text-white text-sm font-body transition-colors"
      >
        {isFlipped ? '← View Front' : 'View Back →'}
      </button>
    </div>
  );
};

NagarikIDCard.propTypes = {
  citizen: PropTypes.shape({
    nagarikId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    issuedAt: PropTypes.string.isRequired,
    blockNumber: PropTypes.string.isRequired,
    blockHash: PropTypes.string.isRequired,
  }).isRequired,
};

export default NagarikIDCard;
