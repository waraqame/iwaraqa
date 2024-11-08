import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface UsageChartProps {
  data: {
    date: string;
    credits: number;
  }[];
}

export function UsageChart({ data }: UsageChartProps) {
  const chartData: ChartData<'line'> = {
    labels: data.map(d => new Date(d.date).toLocaleDateString('ar-SA')),
    datasets: [
      {
        label: 'استخدام النقاط',
        data: data.map(d => d.credits),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
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
        bodyAlign: 'right' as const
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
          }
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}