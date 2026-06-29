import { useMemo } from 'react';
import { generateRibbonBlocks } from '@utils/hashGenerator';

/**
 * The signature visual element — a horizontally scrolling strip
 * showing live simulated block confirmations in JetBrains Mono.
 * Present on all authenticated pages and the home page.
 */
function BlockchainHashRibbon({ className = '' }) {
  const content = useMemo(() => {
    const blocks = generateRibbonBlocks(15);
    return blocks
      .map(
        (b) =>
          `Block #${b.number}  |  Hash: ${b.hash}  |  TX: ${b.tx}  |  ✓ Confirmed`
      )
      .join('  ·  ');
  }, []);

  return (
    <div
      className={`hidden sm:block h-9 bg-brand-navy-deep border-y border-brand-navy-light overflow-hidden ${className}`}
      aria-label="Blockchain activity ticker"
    >
      <div className="hash-ribbon-inner whitespace-nowrap flex items-center h-full">
        <span className="text-mono-sm text-brand-crypto-blue tracking-wide px-4">
          {content}
        </span>
        <span
          className="text-mono-sm text-brand-crypto-blue tracking-wide px-4"
          aria-hidden="true"
        >
          {content}
        </span>
      </div>
    </div>
  );
}

export default BlockchainHashRibbon;
