import { SecurityPolicy, RiskReport, SecurityPolicySchema } from '../types/policy.js';

export class PolicyEngine {
  public static validate(policy: any): boolean {
    const result = SecurityPolicySchema.safeParse(policy);
    return result.success;
  }

  public static analyzeRisk(policy: SecurityPolicy): RiskReport {
    let score = 0;
    const warnings: string[] = [];

    // Rule: Full root filesystem access combined with enabled network
    const isRootAccess = policy.filesystem.allowedPaths.some(p => p === '/' || p === 'C:');
    if (isRootAccess && policy.network) {
      score += 50;
      warnings.push('CRITICAL: Full filesystem access combined with network connectivity detected.');
    }

    // Rule: Docker usage with full filesystem access
    if (isRootAccess && policy.docker) {
      score += 30;
      warnings.push('HIGH: Docker usage with root filesystem access can lead to container escape or system compromise.');
    }

    // Rule: API Service without restricted paths
    if (policy.projectType === 'API service' && policy.filesystem.restrictedPaths.length === 0) {
      score += 20;
      warnings.push('MODERATE: API Services should define explicit restricted paths (e.g., .env, .git).');
    }

    // Rule: Broad filesystem access
    if (policy.filesystem.allowedPaths.length > 5) {
      score += 10;
      warnings.push('LOW: Too many allowed paths might indicate a loosely defined security boundary.');
    }

    return {
      score: Math.min(score, 100),
      warnings,
    };
  }

  public static getRecommendation(score: number): string {
    if (score >= 70) return 'Reject: This configuration presents high system-wide risks.';
    if (score >= 40) return 'Review: Manual audit recommended before application.';
    return 'Safe: This policy adheres to recommended sandbox constraints.';
  }
}
