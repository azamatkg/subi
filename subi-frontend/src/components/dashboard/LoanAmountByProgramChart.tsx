import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface ProgramData {
  program: string;
  amount: number;
  count: number;
}

const loanProgramData: ProgramData[] = [
  { program: 'Бизнес-кредит', amount: 4850000, count: 127 },
  { program: 'Микрокредит', amount: 2340000, count: 345 },
  { program: 'Агрокредит', amount: 3720000, count: 89 },
  { program: 'Потребительский', amount: 1980000, count: 234 },
  { program: 'Ипотека', amount: 8450000, count: 67 },
  { program: 'Автокредит', amount: 2100000, count: 156 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ProgramData;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className='bg-card border border-border rounded-lg p-3 shadow-lg'>
        <p className='font-medium'>{label}</p>
        <p className='text-sm text-muted-foreground'>
          Сумма:{' '}
          <span className='font-medium text-foreground'>
            {(data.amount / 1000000).toFixed(1)}М ₽
          </span>
        </p>
        <p className='text-sm text-muted-foreground'>
          Заявок:{' '}
          <span className='font-medium text-foreground'>{data.count}</span>
        </p>
        <p className='text-sm text-muted-foreground'>
          Средняя сумма:{' '}
          <span className='font-medium text-foreground'>
            {(data.amount / data.count / 1000).toFixed(0)}К ₽
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const formatYAxis = (value: number) => {
  return `${(value / 1000000).toFixed(1)}М`;
};

export const LoanAmountByProgramChart: React.FC = () => {
  const totalAmount = loanProgramData.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalCount = loanProgramData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BarChart3 className='h-5 w-5' />
          Сумма кредитов по программам
        </CardTitle>
        <div className='flex gap-4 text-sm text-muted-foreground'>
          <span>Общая сумма: {(totalAmount / 1000000).toFixed(1)}М ₽</span>
          <span>Всего заявок: {totalCount}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={loanProgramData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='program'
                angle={-45}
                textAnchor='end'
                height={80}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='amount'
                fill='hsl(var(--primary))'
                radius={[4, 4, 0, 0]}
                name='Сумма кредитов'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className='grid grid-cols-2 gap-4 mt-4 text-sm'>
          <div className='p-3 bg-muted/50 rounded-lg'>
            <div className='font-medium'>Самая популярная программа</div>
            <div className='text-muted-foreground'>
              {
                loanProgramData.reduce((max, item) =>
                  item.count > max.count ? item : max
                ).program
              }
            </div>
          </div>
          <div className='p-3 bg-muted/50 rounded-lg'>
            <div className='font-medium'>Наибольший объем</div>
            <div className='text-muted-foreground'>
              {
                loanProgramData.reduce((max, item) =>
                  item.amount > max.amount ? item : max
                ).program
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
