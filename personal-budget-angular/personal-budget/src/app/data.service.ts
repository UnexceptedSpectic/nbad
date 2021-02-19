import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import { D3DonutChart } from './homepage/d3.chart';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public dataSource = {
    datasets: [
        {
        data: [],
        backgroundColor: []
        }
    ],
    labels: []
  };

  loadCharts(): void {
    if (this.dataSource.datasets[0].data.length === 0) {
      // Fetch and save data
      this.getBudget();
    } else {
      // Use existing data
      this.createCharts();
    }
  }

  createChartjsChart(inputData): void {
    const ctx = document.getElementById('myChart');
    const myPieChart = new Chart(ctx, {
        type: 'pie',
        data: inputData
    });
}

  createCharts(): void {
    this.createChartjsChart(this.dataSource);
    const d3chart = new D3DonutChart();
    d3chart.create(this.dataSource);
  }

  getBudget(): void {
    this.http.get('http://localhost:3000/budget')
      .subscribe((res: any) => {
        res.forEach((obj, index) => {
            this.dataSource.datasets[0].data[index] = obj.dollars;
            this.dataSource.datasets[0].backgroundColor[index] = '#' + obj.color;
            this.dataSource.labels[index] = obj.title;
        });
        this.createCharts();
      });
  }

  constructor(private http: HttpClient) { }
}
