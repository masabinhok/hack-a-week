export interface ParsedLocation {
  provinceId: number;
  districtId: number;
  municipalityId: number;
  wardId: number;
}

export class LocationCodeUtil {
  /**
   * Encode location IDs into a location code
   * @example encodeLocation(3, 25, 217, 1) => "3-25-217-0001"
   */
  static encode(
    provinceId: number,
    districtId: number,
    municipalityId: number,
    wardId: number,
  ): string {
    const p = provinceId.toString();
    const d = districtId.toString().padStart(2, '0');
    const m = municipalityId.toString().padStart(3, '0');
    const w = wardId.toString().padStart(4, '0');

    return `${p}-${d}-${m}-${w}`;
  }

  /**
   * Decode location code into IDs
   * @example decode("3-25-217-0001") => { provinceId: 3, districtId: 25, ... }
   */
  static decode(locationCode: string): ParsedLocation | null {
    if (!locationCode) return null;

    const parts = locationCode.split('-');
    if (parts.length !== 4) return null;

    const [p, d, m, w] = parts.map(Number);

    if (isNaN(p) || isNaN(d) || isNaN(m) || isNaN(w)) {
      return null;
    }

    return {
      provinceId: p,
      districtId: d,
      municipalityId: m,
      wardId: w,
    };
  }

  /**
   * Validate location code format
   */
  static isValid(locationCode: string): boolean {
    if (!locationCode) return false;

    const pattern = /^\d{1}-\d{2}-\d{3}-\d{4}$/;
    return pattern.test(locationCode);
  }

  /**
   * Get location code from partial data (for flexible queries)
   */
  static encodePartial(location: {
    provinceId?: number;
    districtId?: number;
    municipalityId?: number;
    wardId?: number;
  }): string | null {
    const { provinceId, districtId, municipalityId, wardId } = location;

    // Need at least province
    if (!provinceId) return null;

    // If only province
    if (!districtId) {
      return `${provinceId}-*-*-*`;
    }

    // If only province and district
    if (!municipalityId) {
      return `${provinceId}-${districtId.toString().padStart(2, '0')}-*-*`;
    }

    // If only province, district, municipality
    if (!wardId) {
      return `${provinceId}-${districtId.toString().padStart(2, '0')}-${municipalityId.toString().padStart(3, '0')}-*`;
    }

    // Full location
    return LocationCodeUtil.encode(
      provinceId,
      districtId,
      municipalityId,
      wardId,
    );
  }

  /**
   * Alias for decode() - parse location code into IDs
   */
  static parse(locationCode: string): ParsedLocation | null {
    return this.decode(locationCode);
  }

  /**
   * Check if two location codes are in same jurisdiction level
   */
  static isSameProvince(code1: string, code2: string): boolean {
    const loc1 = this.decode(code1);
    const loc2 = this.decode(code2);

    return loc1?.provinceId === loc2?.provinceId;
  }

  static isSameDistrict(code1: string, code2: string): boolean {
    const loc1 = this.decode(code1);
    const loc2 = this.decode(code2);

    return loc1?.districtId === loc2?.districtId;
  }

  static isSameMunicipality(code1: string, code2: string): boolean {
    const loc1 = this.decode(code1);
    const loc2 = this.decode(code2);

    return loc1?.municipalityId === loc2?.municipalityId;
  }

  static isSameWard(code1: string, code2: string): boolean {
    return code1 === code2;
  }
}
