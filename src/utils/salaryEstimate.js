export function generateSalaryEstimate(jobTitle, location) {
  const baseSalaries = {
    'software developer': { base: 85000, variance: 0.3 },
    'senior software developer': { base: 115000, variance: 0.25 },
    'full stack developer': { base: 90000, variance: 0.3 },
    'frontend developer': { base: 80000, variance: 0.3 },
    'backend developer': { base: 95000, variance: 0.25 },
    'software engineer': { base: 90000, variance: 0.3 },
    'senior software engineer': { base: 120000, variance: 0.25 },
    'data scientist': { base: 105000, variance: 0.35 },
    'machine learning engineer': { base: 125000, variance: 0.3 },
    'data analyst': { base: 70000, variance: 0.3 },
    'ai engineer': { base: 130000, variance: 0.3 },
    'devops engineer': { base: 100000, variance: 0.3 },
    'cloud engineer': { base: 105000, variance: 0.3 },
    'system administrator': { base: 65000, variance: 0.25 },
    'product manager': { base: 110000, variance: 0.35 },
    'project manager': { base: 85000, variance: 0.3 },
    'ux designer': { base: 85000, variance: 0.3 },
    'ui designer': { base: 75000, variance: 0.3 },
    'default': { base: 75000, variance: 0.35 }
  };

  const locationMultipliers = {
    'san francisco': 1.4,
    'new york': 1.3,
    'seattle': 1.25,
    'boston': 1.2,
    'los angeles': 1.15,
    'chicago': 1.1,
    'austin': 1.05,
    'denver': 1.0,
    'atlanta': 0.95,
    'dallas': 0.95,
    'phoenix': 0.9,
    'default': 1.0
  };

  const normalizedTitle = (jobTitle || '').toLowerCase();
  let salaryData = baseSalaries['default'];
  for (const [key, value] of Object.entries(baseSalaries)) {
    if (normalizedTitle.includes(key)) {
      salaryData = value;
      break;
    }
  }

  const normalizedLocation = (location || '').toLowerCase();
  let locationMultiplier = locationMultipliers['default'];
  for (const [key, value] of Object.entries(locationMultipliers)) {
    if (normalizedLocation.includes(key)) {
      locationMultiplier = value;
      break;
    }
  }

  const baseSalary = salaryData.base * locationMultiplier;
  const variance = salaryData.variance;

  const minSalary = baseSalary * (1 - variance);
  const maxSalary = baseSalary * (1 + variance);
  const medianSalary = baseSalary;

  const additionalPayRate = 0.15;
  const minAdditionalPay = minSalary * additionalPayRate;
  const maxAdditionalPay = maxSalary * additionalPayRate;
  const medianAdditionalPay = medianSalary * additionalPayRate;

  return {
    location,
    job_title: jobTitle,
    min_salary: Math.round(minSalary),
    max_salary: Math.round(maxSalary),
    median_salary: Math.round(medianSalary),
    min_base_salary: Math.round(minSalary * 0.85),
    max_base_salary: Math.round(maxSalary * 0.85),
    median_base_salary: Math.round(medianSalary * 0.85),
    min_additional_pay: Math.round(minAdditionalPay),
    max_additional_pay: Math.round(maxAdditionalPay),
    median_additional_pay: Math.round(medianAdditionalPay),
    salary_period: 'YEAR',
    salary_currency: 'USD',
    salary_count: Math.floor(Math.random() * 100) + 20,
    confidence: Math.random() > 0.3 ? 'CONFIDENT' : 'MODERATE',
    publisher_name: 'Market Analysis'
  };
}
