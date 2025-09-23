import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

const statusDistributionData: StatusData[] = [
  { name: 'Одобрено', value: 856, color: '#22c55e' },
  { name: 'На рассмотрении', value: 234, color: '#f59e0b' },
  { name: 'Отклонено', value: 157, color: '#ef4444' },
  { name: 'Ожидает документы', value: 89, color: '#8b5cf6' },
  { name: 'В комиссии', value: 67, color: '#06b6d4' },
  { name: 'Выдано', value: 743, color: '#10b981' },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className='bg-card border border-border rounded-lg p-3 shadow-lg'>
        <p className='font-medium'>{data.name}</p>
        <p className='text-sm text-muted-foreground'>
          Количество:{' '}
          <span className='font-medium text-foreground'>{data.value}</span>
        </p>
        <p className='text-sm text-muted-foreground'>
          Доля:{' '}
          <span className='font-medium text-foreground'>
            {(
              (data.value /
                statusDistributionData.reduce(
                  (sum, item) => sum + item.value,
                  0
                )) *
              100
            ).toFixed(1)}
            %
          </span>
        </p>
      </div>
    );
  }
  return null;
};

interface LegendProps {
  payload?: Array<{
    value: string;
    color: string;
  }>;
}

const CustomLegend = ({ payload }: LegendProps) => {
  return (
    <div className='flex flex-wrap justify-center gap-4 mt-4'>
      {payload?.map((entry, index: number) => (
        <div key={index} className='flex items-center gap-2 text-sm'>
          <div
            className='w-3 h-3 rounded-full'
            style={{ backgroundColor: entry.color }}
          ></div>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const LoanStatusDistributionChart: React.FC = () => {
  const totalApplications = statusDistributionData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <PieChartIcon className='h-5 w-5' />
          Распределение по статусам
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          Всего заявок: {totalApplications.toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={statusDistributionData}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey='value'
              >
                {statusDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
