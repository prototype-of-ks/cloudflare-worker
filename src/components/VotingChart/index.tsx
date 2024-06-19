import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

Chart.defaults.font.size = 12;

const pieChartData = {
  labels: ['Yes', 'No'],
  datasets: [
    {
      label: 'Voting Result',
      data: [3, 1],
      backgroundColor: ['rgb(134, 239, 172)', 'rgb(252, 165, 165)'],
      hoverOffset: 4,
    },
  ],
};

const VotingChart: React.FC = () => {
  const barChartContainer = useRef<HTMLCanvasElement | null>(null);
  const pieChartContainer = useRef<HTMLCanvasElement | null>(null);
  const barChart = useRef<Chart | null>(null);
  const pieChart = useRef<Chart<'pie'> | null>(null);

  useEffect(() => {
    const pieChartCtx = pieChartContainer.current?.getContext('2d');
    if (pieChartCtx) {
      pieChart.current = new Chart(pieChartCtx, {
        type: 'pie',
        data: pieChartData,
      });
    }

    return () => {
      if (pieChart.current) pieChart.current.destroy();
    };
  }, []);

  useEffect(() => {
    const barChartCtx = barChartContainer.current?.getContext('2d');

    if (barChartCtx) {
      barChart.current = new Chart(barChartCtx, {
        type: 'bar',
        data: {
          labels: [
            'Open Zoom App',
            'Open Camera',
            'Show Notification in Video',
            'Text box to video',
          ],
          datasets: [
            {
              label: 'Yes',
              data: [4, 3, 1, 2],
              backgroundColor: 'rgb(134, 239, 172)',
              // borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 0,
              barThickness: 40,
            },
            {
              label: 'No',
              data: [0, 1, 3, 2],
              backgroundColor: 'rgb(252, 165, 165)',
              // borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              barThickness: 40,
            },
          ],
        },
        options: {
					responsive: true,
					maintainAspectRatio: false,
          plugins: {
						decimation: {
							enabled: false
						},
            title: {
              position: 'top',
              text: 'Voting Result',
              display: true,
              font: {
                size: 20,
                weight: 'bold',
              },
            },
          },
          indexAxis: 'x',
          scales: {
            y: {
							type: 'linear',
							ticks: {
								precision: 0
							},
							title: {
								display: true,
								text: 'Count', // Y 轴标题
								font: {
									size: 16,
									weight: 'bold',
									family: 'Arial'
								},
								padding: {
									top: 0,
									bottom: 10
								}
							}
            },
						x: {
							type: 'category',
							position: 'bottom',
							title: {
								display: true,
								text: 'Idea', // X 轴标题
								font: {
									size: 16,
									weight: 'bold',
									family: 'Arial'
								},
								padding: {
									top: 0,
									bottom: 10
								}
							}
						}
          },
        },
      });
    }

    return () => {
      if (barChart.current) barChart.current.destroy();
    };
  }, []);

  return (
    <div className="w-full h-[360px] overflow-auto">
      <canvas ref={barChartContainer} width="480"></canvas>
      {/* <canvas ref={pieChartContainer} width="200" height="200"></canvas> */}
    </div>
  );
};

export default VotingChart;
