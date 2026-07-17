'use client';

import { useState, useMemo } from 'react';
import { useGastosStore, formatCurrency, getMonthName } from '@/lib/store';
import MonthSelector from './MonthSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  ShoppingCart,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const CHART_GREEN = '#00ff88';
const CHART_CYAN = '#00d4ff';
const CHART_PINK = '#ff3b6e';
const CHART_YELLOW = '#ffb800';

export default function Dashboard() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const monthlySalaries = useGastosStore((s) => s.monthlySalaries);
  const debts = useGastosStore((s) => s.debts);
  const groceryLists = useGastosStore((s) => s.groceryLists);

  const data = useMemo(() => {
    const salaryRecord = monthlySalaries.find(
      (s) => s.month === month && s.year === year
    );
    const salary = salaryRecord?.salary || 0;
    const extras = (salaryRecord?.extras || []).reduce((sum, e) => sum + e.value, 0);
    const totalIncome = salary + extras;

    const debtPaymentsThisMonth = debts.reduce((sum, debt) => {
      const paymentsInMonth = debt.payments.filter((p) => {
        const d = new Date(p.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });
      return sum + paymentsInMonth.reduce((s, p) => s + p.amount, 0);
    }, 0);

    const groceriesThisMonth = groceryLists
      .filter((l) => {
        const d = new Date(l.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      })
      .reduce((sum, l) => sum + l.total, 0);

    const totalExpenses = debtPaymentsThisMonth + groceriesThisMonth;
    const balance = totalIncome - totalExpenses;

    const totalPendingDebts = debts
      .filter((d) => d.paidInstallments < d.installments)
      .reduce(
        (sum, d) => sum + d.installmentValue * (d.installments - d.paidInstallments),
        0
      );

    const pieData = [];
    if (groceriesThisMonth > 0) {
      pieData.push({ name: 'Supermercado', value: groceriesThisMonth, color: CHART_CYAN });
    }
    if (debtPaymentsThisMonth > 0) {
      pieData.push({ name: 'Dívidas', value: debtPaymentsThisMonth, color: CHART_PINK });
    }
    const otherExpenses = totalExpenses - groceriesThisMonth - debtPaymentsThisMonth;
    if (otherExpenses > 0) {
      pieData.push({ name: 'Outros', value: otherExpenses, color: CHART_YELLOW });
    }

    const barData = [
      { name: 'Receita', value: totalIncome, fill: CHART_GREEN },
      { name: 'Gastos', value: totalExpenses, fill: CHART_PINK },
    ];

    const showWarning = totalIncome > 0 && totalExpenses > totalIncome * 0.8;

    return {
      salary, extras, totalIncome,
      debtPaymentsThisMonth, groceriesThisMonth,
      totalExpenses, balance, totalPendingDebts,
      pieData, barData, showWarning,
    };
  }, [month, year, monthlySalaries, debts, groceryLists]);

  const customTooltipStyle = {
    backgroundColor: '#16162a',
    border: '1px solid rgba(0, 255, 136, 0.15)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  };

  const tooltipItemStyle = { color: '#ffffff' };
  const tooltipLabelStyle = { color: '#ffffff', fontWeight: 600 };

  return (
    <div className="p-4 pb-24 space-y-4 hide-scrollbar overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-lg font-bold text-foreground tracking-tight">Dashboard</h2>
        <MonthSelector
          month={month}
          year={year}
          onChange={(m, y) => { setMonth(m); setYear(y); }}
        />
      </div>

      {/* Month Label */}
      <p className="text-sm text-muted-foreground">
        {getMonthName(month)} {year}
      </p>

      {/* Warning Banner */}
      {data.showWarning && (
        <div className="warning-banner p-3.5 flex items-start gap-2.5 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive font-medium">
            Atenção: Seus gastos ultrapassaram 80% da renda disponível!
          </p>
        </div>
      )}

      {/* Indicator Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Balance */}
        <Card className={data.balance >= 0 ? 'premium-card-accent' : 'premium-card-danger'}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1.5">
              {data.balance >= 0 ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Saldo</span>
            </div>
            <p className={`text-base sm:text-lg font-bold tracking-tight ${data.balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(data.balance)}
            </p>
          </CardContent>
        </Card>

        {/* Pending Debts */}
        <Card className="premium-card-danger">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <CreditCard className="h-4 w-4 text-destructive" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Dívidas</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-destructive tracking-tight">
              {formatCurrency(data.totalPendingDebts)}
            </p>
          </CardContent>
        </Card>

        {/* Income */}
        <Card className="premium-card-accent">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Receita</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-primary tracking-tight">
              {formatCurrency(data.totalIncome)}
            </p>
          </CardContent>
        </Card>

        {/* Grocery Total */}
        <Card className="premium-card-cyan">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <ShoppingCart className="h-4 w-4 text-[#00d4ff]" />
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Mercado</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-[#00d4ff] tracking-tight">
              {formatCurrency(data.groceriesThisMonth)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="premium-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Receita vs Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.totalIncome > 0 || data.totalExpenses > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.barData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6e6e88', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6e6e88', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}k`}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value: number) => [formatCurrency(value), '']}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {data.barData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Sem dados no período</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="premium-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Distribuição dos Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {data.pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={customTooltipStyle}
                  itemStyle={tooltipItemStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => (
                    <span style={{ color: '#6e6e88' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Sem gastos no período</p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* APEX HUB Footer */}
      <div className="flex items-center justify-center gap-1.5 pt-2 pb-2">
        <img
          src="/apex-hub-icon.png"
          alt="APEX HUB"
          className="h-4 w-4 rounded opacity-60"
        />
        <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wide">
          Desenvolvido por APEX HUB
        </span>
      </div>
    </div>
  );
}
