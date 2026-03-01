import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';
import { ProjectType, SecurityPolicy, ProjectTypeSchema } from '../types/policy.js';
import { PolicyEngine } from '../core/PolicyEngine.js';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

interface Props {
  projectPath: string;
}

const steps = ['PROJECT_TYPE', 'FILESYSTEM', 'NETWORK', 'DOCKER', 'REVIEW', 'COMPLETE'];

export const App: React.FC<Props> = ({ projectPath }) => {
  const { exit } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [policy, setPolicy] = useState<Partial<SecurityPolicy>>({
    filesystem: { allowedPaths: [], restrictedPaths: [] },
    network: false,
    docker: false,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
  });
  const [fsInput, setFsInput] = useState('');
  const [fsType, setFsType] = useState<'ALLOWED' | 'RESTRICTED'>('ALLOWED');

  const currentStep = steps[stepIndex];

  const handleProjectType = (item: { value: ProjectType }) => {
    setPolicy((prev) => ({ ...prev, projectType: item.value }));
    setStepIndex((prev) => prev + 1);
  };

  const handleFsSubmit = (value: string) => {
    const paths = value.split(',').map((p) => p.trim()).filter(Boolean);
    if (fsType === 'ALLOWED') {
      setPolicy((prev) => ({
        ...prev,
        filesystem: { ...prev.filesystem!, allowedPaths: paths },
      }));
      setFsType('RESTRICTED');
      setFsInput('');
    } else {
      setPolicy((prev) => ({
        ...prev,
        filesystem: { ...prev.filesystem!, restrictedPaths: paths },
      }));
      setStepIndex((prev) => prev + 1);
    }
  };

  const handleNetwork = (item: { value: boolean }) => {
    setPolicy((prev) => ({ ...prev, network: item.value }));
    setStepIndex((prev) => prev + 1);
  };

  const handleDocker = (item: { value: boolean }) => {
    setPolicy((prev) => ({ ...prev, docker: item.value }));
    setStepIndex((prev) => prev + 1);
  };

  const savePolicy = async () => {
    const finalPolicy = policy as SecurityPolicy;
    const dotGemini = path.join(projectPath, '.gemini');
    const policyFile = path.join(dotGemini, 'policy.json');
    
    await fs.ensureDir(dotGemini);
    await fs.writeJSON(policyFile, finalPolicy, { spaces: 2 });
    setStepIndex(steps.length - 1);
    setTimeout(() => exit(), 2000);
  };

  const riskReport = stepIndex >= 4 ? PolicyEngine.analyzeRisk(policy as SecurityPolicy) : null;

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="cyan">
      <Text bold color="blue">Gemini Sandbox Wizard v1.0.0</Text>
      <Text italic>Configuring policy for: {projectPath}</Text>
      <Box marginTop={1} />

      {currentStep === 'PROJECT_TYPE' && (
        <Box flexDirection="column">
          <Text>Select Project Type:</Text>
          <SelectInput
            items={[
              { label: 'Web Application', value: 'Web' },
              { label: 'CLI Tool', value: 'CLI tool' },
              { label: 'API Service', value: 'API service' },
              { label: 'Docker-heavy Backend', value: 'Docker-heavy backend' },
            ]}
            onSelect={handleProjectType}
          />
        </Box>
      )}

      {currentStep === 'FILESYSTEM' && (
        <Box flexDirection="column">
          <Text>{fsType === 'ALLOWED' ? 'Enter Allowed Paths (comma separated):' : 'Enter Restricted Paths (comma separated):'}</Text>
          <Box borderStyle="single" paddingX={1}>
            <TextInput value={fsInput} onChange={setFsInput} onSubmit={handleFsSubmit} />
          </Box>
          <Text dimColor>Example: /src, /public (or C:\src, C:\public)</Text>
        </Box>
      )}

      {currentStep === 'NETWORK' && (
        <Box flexDirection="column">
          <Text>Enable Network Access?</Text>
          <SelectInput
            items={[
              { label: 'No (Sandbox)', value: false },
              { label: 'Yes (Standard)', value: true },
            ]}
            onSelect={handleNetwork}
          />
        </Box>
      )}

      {currentStep === 'DOCKER' && (
        <Box flexDirection="column">
          <Text>Enable Docker Usage?</Text>
          <SelectInput
            items={[
              { label: 'No', value: false },
              { label: 'Yes', value: true },
            ]}
            onSelect={handleDocker}
          />
        </Box>
      )}

      {currentStep === 'REVIEW' && riskReport && (
        <Box flexDirection="column">
          <Text bold underline>Security Review</Text>
          <Text>Risk Score: {riskReport.score > 50 ? chalk.red(riskReport.score) : chalk.green(riskReport.score)} / 100</Text>
          {riskReport.warnings.map((w, i) => (
            <Text key={i} color="yellow">⚠ {w}</Text>
          ))}
          <Box marginTop={1} />
          <Text>Recommendation: {PolicyEngine.getRecommendation(riskReport.score)}</Text>
          <Box marginTop={1} />
          <Text>Confirm and Save?</Text>
          <SelectInput
            items={[
              { label: 'Confirm & Save', value: true },
              { label: 'Cancel', value: false },
            ]}
            onSelect={(item: { value: boolean }) => (item.value ? savePolicy() : exit())}
          />
        </Box>
      )}

      {currentStep === 'COMPLETE' && (
        <Box>
          <Text color="green">✔ Security policy saved to .gemini/policy.json</Text>
        </Box>
      )}
    </Box>
  );
};
