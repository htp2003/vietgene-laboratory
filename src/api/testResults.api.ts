// Mock data for Test Results
export interface TestResult {
  id: string;
  sample_id: string;
  result_type: string;
  result_percentage: number;
  conclusion: string;
  result_details: string;
  result_file: string;
  tested_date: string;
  verified_by_staff_id: string;
  created_at: string;
}

export const mockTestResults: TestResult[] = [
  {
    id: 'tr1',
    sample_id: 'samp1',
    result_type: 'DNA',
    result_percentage: 99.99,
    conclusion: 'Biological relationship confirmed',
    result_details: 'All tested loci match.',
    result_file: '',
    tested_date: '2025-06-05T10:00:00+07:00',
    verified_by_staff_id: '2',
    created_at: '2025-06-05T10:00:00+07:00',
  },
  {
    id: 'tr2',
    sample_id: 'samp2',
    result_type: 'DNA',
    result_percentage: 99.99,
    conclusion: 'Biological relationship confirmed',
    result_details: 'All tested loci match.',
    result_file: '',
    tested_date: '2025-06-03T10:00:00+07:00',
    verified_by_staff_id: '2',
    created_at: '2025-06-03T12:00:00+07:00',
  }
];

export const testResultsApi = {
  getAll: async (): Promise<TestResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockTestResults];
  },
  getBySampleId: async (sampleId: string): Promise<TestResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTestResults.filter(result => result.sample_id === sampleId);
  },
  create: async (data: Omit<TestResult, 'id'>): Promise<TestResult> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newResult = {
      ...data,
      id: Math.random().toString(36).substr(2, 9)
    };
    mockTestResults.push(newResult);
    return newResult;
  },
  update: async (id: string, data: Partial<TestResult>): Promise<TestResult> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTestResults.findIndex(r => r.id === id);
    if (index === -1) throw new Error('TestResult not found');
    const updatedResult = {
      ...mockTestResults[index],
      ...data
    };
    mockTestResults[index] = updatedResult;
    return updatedResult;
  },
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTestResults.findIndex(r => r.id === id);
    if (index === -1) throw new Error('TestResult not found');
    mockTestResults.splice(index, 1);
  }
};
