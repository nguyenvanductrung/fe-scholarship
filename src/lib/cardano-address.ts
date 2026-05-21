/** Basic Bech32 Cardano address validation for form UX. */
export function isValidCardanoAddress(address: string): boolean {
  const trimmed = address.trim();
  if (!trimmed) return false;
  return /^(addr1|addr_test1)[a-z0-9]{50,}$/i.test(trimmed);
}
