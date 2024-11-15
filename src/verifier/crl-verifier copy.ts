import BloomFilter from 'bloom-filters';
import { inflate } from 'pako';
import type { CredentialStatusToken } from '../dto/credential-status-token.js';
import { base64Decode, hash } from '../util.js';
import { Verifier } from './verifier.js';
import { VerifierConfig } from '../dto/verifier-config.js';
import { DynamicCRLVC } from '../dto/dynamic-crl-vc.js';

/**
 * Verifier that can be used to verify the crl
 */
export class CrlVerifier extends Verifier {
  private entries: string[];

  /**
   * Iinit the verifier
   * @param config
   */
  constructor(config: VerifierConfig<DynamicCRLVC>) {
    super(config);
    this.entries = config.vc.entries;
  }

  /**
   * Checks if the valid value is included and the invalid is not included
   * @param vc
   * @returns
   */
  async isValid(vc: CredentialStatusToken) {
    if (this.timeCheck && this.validUntil < Date.now())
      throw new Error('CRL is no longer valid');
    // TODO validate the signature of the vc
    const validHash = await hash([vc.token, vc.sub], this.hashFunction);
    const invalidHash = await hash([validHash], this.hashFunction);
    return (
      this.entries.includes(validHash) && !this.entries.includes(invalidHash)
    );
  }
}
