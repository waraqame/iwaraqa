import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData: ChartData<'bar'> = {
    labels: data.map(d => new Date(d.date).toLocaleDateString('ar-SA')),
    datasets: [
      {
        label: 'الإيرادات',
        data: data.map(d => d.revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        rtl: true,
        labels: {
          font: {
            family: 'system-ui'
          }
        }
      },
      tooltip: {
        rtl: true,
        titleAlign: 'right' as const,
        bodyAlign: 'right' as const,
        callbacks: {
          label: (context: any) => `${context.parsed.y} ريال`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'system-ui'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: 'system-ui'
          },
          callback: (value: number) => `${value} ريال`
        }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}