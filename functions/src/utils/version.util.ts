export type ApiVersion = 'v1' | 'v2';

export interface VersionConfig {
  version: ApiVersion;
  isActive: boolean;
  deprecatedAt?: string;
  sunsetAt?: string;
}

export const SUPPORTED_VERSIONS: VersionConfig[] = [
  {
    version: 'v1',
    isActive: true
  },
  {
    version: 'v2',
    isActive: true
  }
];

export function isVersionSupported(version: string): boolean {
  return SUPPORTED_VERSIONS.some(v => v.version === version && v.isActive);
}

export function getLatestVersion(): ApiVersion {
  const activeVersions = SUPPORTED_VERSIONS.filter(v => v.isActive);
  return activeVersions[activeVersions.length - 1].version;
} 