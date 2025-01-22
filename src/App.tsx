import React, { useState } from 'react';
import { Calculator, DollarSign, Percent, ToggleLeft, Calendar } from 'lucide-react';
import { ThemeToggle } from './ThemeContext';

interface TCOCalculation {
  expenseRatioCost: number;
  tradingCosts: number;
  dividendTaxes: number;
  totalCosts: number;
  annualizedTCO: number;
  totalReturns: number;
  netReturns: number;
  finalInvestmentValue: number;
}

function App() {
  const [inputs, setInputs] = useState({
    startCapital: 10000,
    recurringAmount: 500,
    isMonthly: true,
    holdingPeriod: 5,
    expenseRatio: 0.20,
    expenseRatioFixed: 20,
    bidAskSpread: 0.05,
    brokerageFee: 10,
    brokerageFeePercent: 0.1,
    numberOfShares: 200,
    dividendYield: 2,
    dividendTaxRate: 15,
    expectedReturn: 7,
  });

  const [isPercentageMode, setIsPercentageMode] = useState(true);
  const [isBrokeragePercentage, setIsBrokeragePercentage] = useState(false);

  const calculateTCO = (): TCOCalculation => {
    const monthlyRate = inputs.expectedReturn / 100 / 12;
    const totalMonths = inputs.holdingPeriod * 12;
    const monthlyInvestment = inputs.isMonthly ? inputs.recurringAmount : inputs.recurringAmount / 12;
    
    // Calculate future value of start capital
    const startCapitalFV = inputs.startCapital * Math.pow(1 + inputs.expectedReturn / 100, inputs.holdingPeriod);
    
    // Calculate future value of recurring investments
    let recurringFV = 0;
    for (let i = 0; i < totalMonths; i++) {
      recurringFV += monthlyInvestment * Math.pow(1 + monthlyRate, totalMonths - i);
    }
    
    const finalInvestmentValue = startCapitalFV + recurringFV;
    const totalInvested = inputs.startCapital + (monthlyInvestment * totalMonths);

    // Calculate total returns
    const totalReturns = finalInvestmentValue - totalInvested;

    // Calculate costs
    const expenseRatioCost = isPercentageMode
      ? (inputs.expenseRatio / 100) * finalInvestmentValue * inputs.holdingPeriod / 2 // Average value over period
      : inputs.expenseRatioFixed * inputs.holdingPeriod;
    
    // Estimate trading costs based on investment frequency
    const numberOfTrades = inputs.isMonthly ? totalMonths : inputs.holdingPeriod;
    const averageTradeSize = totalInvested / numberOfTrades;
    const spreadCost = inputs.bidAskSpread * inputs.numberOfShares * numberOfTrades;
    const brokerageFeePerTrade = isBrokeragePercentage
      ? (inputs.brokerageFeePercent / 100) * averageTradeSize
      : inputs.brokerageFee;
    const totalBrokerageFees = brokerageFeePerTrade * numberOfTrades;
    
    const tradingCosts = spreadCost + totalBrokerageFees;
    
    // Calculate dividend taxes on average investment value
    const averageInvestmentValue = (totalInvested + finalInvestmentValue) / 2;
    const dividendTaxes = ((inputs.dividendYield / 100) * averageInvestmentValue) * 
                         (inputs.dividendTaxRate / 100) * inputs.holdingPeriod;
    
    const totalCosts = expenseRatioCost + tradingCosts + dividendTaxes;
    const annualizedTCO = totalCosts / inputs.holdingPeriod;
    const netReturns = totalReturns - totalCosts;

    return {
      expenseRatioCost,
      tradingCosts,
      dividendTaxes,
      totalCosts,
      annualizedTCO,
      totalReturns,
      netReturns,
      finalInvestmentValue,
    };
  };

  const results = calculateTCO();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const totalInvested = inputs.startCapital + 
    (inputs.recurringAmount * (inputs.isMonthly ? 12 : 1) * inputs.holdingPeriod);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 p-6 transition-colors">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ETF TCO Calculator</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Investment Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                    Start Capital ($)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="number"
                      name="startCapital"
                      value={inputs.startCapital}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Recurring Investment ({inputs.isMonthly ? 'Monthly' : 'Yearly'}) ($)
                    </label>
                    <button
                      onClick={() => setInputs(prev => ({ ...prev, isMonthly: !prev.isMonthly }))}
                      className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                      <Calendar className="h-4 w-4" />
                      Switch to {inputs.isMonthly ? 'Yearly' : 'Monthly'}
                    </button>
                  </div>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="number"
                      name="recurringAmount"
                      value={inputs.recurringAmount}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                    Expected Annual Return (%)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      name="expectedReturn"
                      value={inputs.expectedReturn}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                    Holding Period (years)
                  </label>
                  <input
                    type="number"
                    name="holdingPeriod"
                    value={inputs.holdingPeriod}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Expense Ratio {isPercentageMode ? '(%)' : '($ per year)'}
                    </label>
                    <button
                      onClick={() => setIsPercentageMode(!isPercentageMode)}
                      className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                      <ToggleLeft className="h-4 w-4" />
                      Switch to {isPercentageMode ? 'Fixed Amount' : 'Percentage'}
                    </button>
                  </div>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isPercentageMode ? (
                        <Percent className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      name={isPercentageMode ? "expenseRatio" : "expenseRatioFixed"}
                      value={isPercentageMode ? inputs.expenseRatio : inputs.expenseRatioFixed}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                    Bid-Ask Spread ($ per share)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="bidAskSpread"
                    value={inputs.bidAskSpread}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                      Brokerage Fee {isBrokeragePercentage ? '(% of investment)' : '($ per trade)'}
                    </label>
                    <button
                      onClick={() => setIsBrokeragePercentage(!isBrokeragePercentage)}
                      className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                      <ToggleLeft className="h-4 w-4" />
                      Switch to {isBrokeragePercentage ? 'Fixed Amount' : 'Percentage'}
                    </button>
                  </div>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {isBrokeragePercentage ? (
                        <Percent className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      name={isBrokeragePercentage ? "brokerageFeePercent" : "brokerageFee"}
                      value={isBrokeragePercentage ? inputs.brokerageFeePercent : inputs.brokerageFee}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                    Number of Shares (per trade)
                  </label>
                  <input
                    type="number"
                    name="numberOfShares"
                    value={inputs.numberOfShares}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                    Dividend Yield (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="dividendYield"
                    value={inputs.dividendYield}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                    Dividend Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="dividendTaxRate"
                    value={inputs.dividendTaxRate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Results</h2>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-indigo-800 dark:text-indigo-200 mb-2">Investment Summary</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-indigo-600 dark:text-indigo-300">
                      Start Capital: <span className="font-semibold">${inputs.startCapital.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300">
                      {inputs.isMonthly ? 'Monthly' : 'Yearly'} Investment: <span className="font-semibold">${inputs.recurringAmount.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300">
                      Total Invested: <span className="font-semibold">${totalInvested.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-300">
                      Final Value: <span className="font-semibold">${results.finalInvestmentValue.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Expense Ratio Cost</h3>
                  <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    ${results.expenseRatioCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {isPercentageMode 
                      ? `${inputs.expenseRatio}% of average portfolio value for ${inputs.holdingPeriod} years`
                      : `$${inputs.expenseRatioFixed} per year for ${inputs.holdingPeriod} years`}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Trading Costs</h3>
                  <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    ${results.tradingCosts.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Based on {inputs.isMonthly ? 'monthly' : 'yearly'} investments
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dividend Taxes</h3>
                  <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    ${results.dividendTaxes.toFixed(2)}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Costs</h3>
                  <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${results.totalCosts.toFixed(2)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Annualized TCO</h3>
                  <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${results.annualizedTCO.toFixed(2)}/year
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Returns (Before Costs)</h3>
                  <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                    ${results.totalReturns.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Based on {inputs.expectedReturn}% annual return + {inputs.dividendYield}% dividend yield
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Returns (After Costs)</h3>
                  <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                    ${results.netReturns.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Total Returns - Total Costs
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">About TCO Calculation</h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  This calculator now includes both start capital and {inputs.isMonthly ? 'monthly' : 'yearly'} recurring investments. 
                  The Total Cost of Ownership (TCO) factors in expense ratios, trading costs for periodic investments, 
                  and dividend tax implications. Returns are calculated using compound interest, considering both capital 
                  gains and dividend income.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;