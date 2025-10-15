// ...existing code...

describe('getUserSummary', () => {
  it('should return correct summary with remainingBudget calculated in SQL', async () => {
    const mockSummaryData = [
      {
        totalBudget: 100000n,    // $1000.00
        totalSpent: 75000n,      // $750.00
        totalIncome: 25000n,     // $250.00
        remainingBudget: 50000n, // $500.00 (calculated in SQL)
      },
    ];

    prismaService.$queryRawTyped.mockResolvedValue(mockSummaryData);

    const result = await service.getUserSummary('user-123');

    expect(result.totalBudget).toBe('1000.00');
    expect(result.totalSpent).toBe('750.00');
    expect(result.remainingBudget).toBe('500.00');
  });

  it('should handle negative remaining budget from SQL', async () => {
    const mockSummaryData = [
      {
        totalBudget: 50000n,     // $500.00
        totalSpent: 75000n,      // $750.00
        totalIncome: 10000n,     // $100.00
        remainingBudget: -15000n, // -$150.00 (calculated in SQL)
      },
    ];

    prismaService.$queryRawTyped.mockResolvedValue(mockSummaryData);

    const result = await service.getUserSummary('user-123');

    expect(result.totalBudget).toBe('500.00');
    expect(result.totalSpent).toBe('750.00');
    expect(result.remainingBudget).toBe('-150.00');
  });

  it('should handle zero values from SQL calculation', async () => {
    const mockSummaryData = [
      {
        totalBudget: 0n,
        totalSpent: 0n,
        totalIncome: 0n,
        remainingBudget: 0n,
      },
    ];

    prismaService.$queryRawTyped.mockResolvedValue(mockSummaryData);

    const result = await service.getUserSummary('user-123');

    expect(result.totalBudget).toBe('0.00');
    expect(result.totalSpent).toBe('0.00');
    expect(result.remainingBudget).toBe('0.00');
  });
});

// ...existing code...