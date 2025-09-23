import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface TrendData {
  month: string;
  applications: number;
  approved: number;
}

const dummyTrendData: TrendData[] = [
  { month: 'Янв', applications: 145, approved: 89 },
  { month: 'Фев', applications: 168, approved: 112 },
  { month: 'Мар', applications: 152, approved: 98 },
  { month: 'Апр', applications: 198, approved: 134 },
  { month: 'Май', applications: 176, approved: 118 },
  { month: 'Июн', applications: 224, approved: 156 },
  { month: 'Июл', applications: 189, approved: 127 },
  { month: 'Авг', applications: 167, approved: 103 },
  { month: 'Сен', applications: 201, approved: 145 },
  { month: 'Окт', applications: 186, approved: 132 },
  { month: 'Ноя', applications: 172, approved: 119 },
  { month: 'Дек', applications: 159, approved: 98 },
];

export const LoanApplicationTrendChart: React.FC = () => {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          Тренд заявок на кредит
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={dummyTrendData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='month'
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type='monotone'
                dataKey='applications'
                stroke='hsl(var(--primary))'
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                name='Всего заявок'
              />
              <Line
                type='monotone'
                dataKey='approved'
                stroke='hsl(142, 76%, 36%)'
                strokeWidth={2}
                dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
                name='Одобрено'
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className='flex items-center justify-center gap-6 mt-4 text-sm'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-primary'></div>
            <span>Всего заявок</span>
          </div>
          <div className='flex items-center gap-2'>
            <div
              className='w-3 h-3 rounded-full'
              style={{ backgroundColor: 'hsl(142, 76%, 36%)' }}
            ></div>
            <span>Одобрено</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
