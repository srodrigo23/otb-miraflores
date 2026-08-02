import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
  type Plugin,
} from 'chart.js';

import { ConsumptionPoint } from '../../../interfaces/neighborDebtsInterfaces';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

/**
 * Single series, so the palette is one hue. #0891b2 was validated against the
 * white card surface: it clears the lightness band, the chroma floor and 3:1
 * contrast. The nearer cyan-700 reads gray and fails the chroma floor.
 */
const SERIES = '#0891b2';
const SERIES_WASH = 'rgba(8, 145, 178, 0.10)';
const SURFACE = '#ffffff';
const GRID = '#eceff1';
const INK_MUTED = '#78909c';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Vertical hairline under the hovered point, so the period is unambiguous */
const crosshair: Plugin<'line'> = {
  id: 'crosshair',
  afterDatasetsDraw(chart) {
    const active = chart.getActiveElements();
    if (active.length === 0) return;

    const { ctx, chartArea } = chart;
    const { x } = active[0].element;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = GRID;
    ctx.stroke();
    ctx.restore();
  },
};

/** The endpoint is the only directly labelled value: the latest reading */
const endpointLabel: Plugin<'line'> = {
  id: 'endpointLabel',
  afterDatasetsDraw(chart) {
    const meta = chart.getDatasetMeta(0);
    const last = meta.data[meta.data.length - 1];
    if (!last) return;

    const value = chart.data.datasets[0].data[meta.data.length - 1];
    const { ctx, chartArea } = chart;
    const text = `${value} m³`;

    ctx.save();
    ctx.font = '600 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = INK_MUTED;
    ctx.textBaseline = 'middle';

    const width = ctx.measureText(text).width;
    // Keep the label inside the plot: flip it left when it would overflow
    const fitsRight = last.x + 10 + width <= chartArea.right;
    ctx.textAlign = fitsRight ? 'left' : 'right';
    ctx.fillText(text, fitsRight ? last.x + 10 : last.x - 10, last.y);
    ctx.restore();
  },
};

export const MeterConsumptionChart: React.FC<{
  data: ConsumptionPoint[];
}> = ({ data }) => {
  const chartData = useMemo(
    () => ({
      labels: data.map((point) => point.period),
      datasets: [
        {
          label: 'Consumo',
          data: data.map((point) => point.consumption),
          borderColor: SERIES,
          backgroundColor: SERIES_WASH,
          borderWidth: 2,
          borderJoinStyle: 'round' as const,
          borderCapStyle: 'round' as const,
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: SERIES,
          // 2px surface ring keeps the dots legible where they cross the line
          pointBorderColor: SURFACE,
          pointBorderWidth: 2,
          pointHitRadius: 16,
        },
      ],
    }),
    [data],
  );

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: prefersReducedMotion() ? false : { duration: 400 },
      // Crosshair behaviour: the nearest point on the x axis wins, no need to
      // land exactly on the dot
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { right: 40, top: 8 } },
      plugins: {
        // One series: the card title already says what is plotted
        legend: { display: false },
        tooltip: {
          backgroundColor: '#263238',
          padding: 10,
          displayColors: false,
          titleFont: { size: 11, weight: 'normal' },
          bodyFont: { size: 13, weight: 'bold' },
          callbacks: {
            title: (items) => {
              const point = data[items[0].dataIndex];
              return `${point.period} ${point.year}`;
            },
            label: (item) => `${item.parsed.y} m³`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: GRID },
          ticks: {
            color: INK_MUTED,
            font: { size: 10 },
            maxRotation: 0,
            autoSkipPadding: 8,
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: GRID },
          border: { display: false },
          ticks: {
            color: INK_MUTED,
            font: { size: 10 },
            maxTicksLimit: 5,
            padding: 6,
            callback: (value) => `${value}`,
          },
        },
      },
    }),
    [data],
  );

  return (
    <Line
      data={chartData}
      options={options}
      plugins={[crosshair, endpointLabel]}
      aria-label='Consumo del medidor por periodo, en metros cúbicos'
    />
  );
};
