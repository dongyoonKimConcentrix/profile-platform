"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CapabilityRadarChartProps {
  capabilities: {
    markupPrecision: number;
    jsTsLogic: number;
    frameworkProficiency: number;
    uiUxDesign: number;
    webOptimization: number;
    accessibility: number;
  };
}

export function CapabilityRadarChart({ capabilities }: CapabilityRadarChartProps) {
  const data = {
    labels: [
      "마크업 정밀도",
      "JS/TS 논리력",
      "프레임워크 숙련도",
      "UI/UX 설계",
      "웹 최적화",
      "접근성 준수",
    ],
    datasets: [
      {
        label: "후보자 역량",
        data: [
          capabilities.markupPrecision,
          capabilities.jsTsLogic,
          capabilities.frameworkProficiency,
          capabilities.uiUxDesign,
          capabilities.webOptimization,
          capabilities.accessibility,
        ],
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgba(99, 102, 241, 0.8)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(99, 102, 241, 1)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          display: false,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        pointLabels: {
          font: {
            size: 11,
            weight: "normal" as const,
          },
          color: "#374151",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed.r}%`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <Radar data={data} options={options} />
    </div>
  );
}
