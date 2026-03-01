import { z } from 'zod';

export const ProjectTypeSchema = z.enum(['Web', 'CLI tool', 'API service', 'Docker-heavy backend']);
export type ProjectType = z.infer<typeof ProjectTypeSchema>;

export const SecurityPolicySchema = z.object({
  projectType: ProjectTypeSchema,
  filesystem: z.object({
    allowedPaths: z.array(z.string()),
    restrictedPaths: z.array(z.string()),
  }),
  network: z.boolean(),
  docker: z.boolean(),
  createdAt: z.string().datetime(),
  version: z.string(),
});

export type SecurityPolicy = z.infer<typeof SecurityPolicySchema>;

export interface RiskReport {
  score: number;
  warnings: string[];
}
