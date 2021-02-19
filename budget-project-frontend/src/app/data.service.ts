import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart } from 'chart.js';
import { randomColor } from 'randomcolor';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of, timer } from 'rxjs';
import { removeAllChildNodes } from './util.js';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute) { }


  public budgetDomain: string = 'http://budget.libredelibre.com';
  public budgetBackendDomain: string = 'http://budget.libredelibre.com:3000';
  public ssoDomain: string = 'http://auth.libredelibre.com';
  public ssoSuiteId: string = '5fe3b479216ca802f957456c';
  public monthInd: string;

  public expenseBudgetBarChart: any;
  public expensePieChart: any;
  public budgetPieChart: any;

  public budgetsDataSource = {
    datasets: [
        {
        data: [],
        backgroundColor: []
        }
    ],
    labels: []
  };

  public expensesDataSource = {
    datasets: [
        {
        data: [],
        backgroundColor: []
        }
    ],
    labels: []
  };

  public budgetExpensesDataSource = {
    datasets: [
      {
        label: "Expense",
        backgroundColor: [],
        borderColor: 'green',
        data: []
      },
      {
        label: "Budget",
        backgroundColor: [],
        borderColor: 'red',
        data: []
      }
    ],
    labels: []
  }

  // Manage page elements

  updateErrorText(text: string): void {
    let p = document.querySelector('.month-selector .log') as HTMLParagraphElement;
    p.innerHTML = text;
  }

  setCategoryDropdowns() {
    let budgetCategorySelect = document.getElementById('budget-title') as HTMLDivElement;
    let actionSelect = document.getElementById('budget-action') as HTMLDivElement;
    if (this.budgetsDataSource.labels.length == 0) {
      // Hide non add actions
      actionSelect.childNodes.forEach(el => {
        let select = el as HTMLSelectElement;
        if (select.value != 'add') {
          select.style.display = 'none';
        }
      })
      // Update visible form fields
      actionSelect.dispatchEvent(new Event('change'));
    } else {
      // Allow all actions
      actionSelect.childNodes.forEach(el => {
        let select = el as HTMLSelectElement;
        select.style.display = 'block';
      })
      // Update visible form fields
      actionSelect.dispatchEvent(new Event('change'));
      // Update title dropdown
      removeAllChildNodes(budgetCategorySelect);
      this.budgetsDataSource.labels.forEach((title, ind) => {
        let option = document.createElement('option');
        option.value = ind.toString();
        option.innerHTML = title;
        budgetCategorySelect.appendChild(option);
      });
    }
  }

  showLoggedInMenu() {
    let dashboardPageLink = document.querySelector('.menu #dashboard') as HTMLUListElement;
    let loginLink = document.querySelector('.menu #login') as HTMLUListElement;
    let logoutLink = document.querySelector('.menu #logout') as HTMLUListElement;
    dashboardPageLink.style.display = 'inline-block';
    logoutLink.style.display = 'inline-block';
    loginLink.style.display = 'none';
  }

  // Configure and load charts

  loadCharts(): void {
    // Use existing data
    this.createCharts();
  }

  showChartArea() {
    let chartsArea = document.querySelector('.chartsContainer') as HTMLDivElement;
    chartsArea.style.display = 'grid';
  }

  createCharts(): void {
    this.createBudgetPieChart(this.budgetsDataSource);
    this.createExpensePieChart(this.expensesDataSource);
    this.createExpenseBudgetBarChart(this.budgetExpensesDataSource);
  }

  createBudgetPieChart(inputData): void {
    if (this.budgetPieChart != undefined) {
      this.budgetPieChart.destroy();
    }
    const ctx = document.getElementById('budgetPieChart');
    this.budgetPieChart = new Chart(ctx, {
        type: 'pie',
        data: inputData,
        options: {
          responsive: false,
        }
    });
  }

  createExpensePieChart(inputData): void {
    if (this.expensePieChart != undefined) {
      this.expensePieChart.destroy();
    }
    const ctx = document.getElementById('expensePieChart');
    this.expensePieChart = new Chart(ctx, {
        type: 'pie',
        data: inputData,
        options: {
          responsive: false,
        }
    });
  }

  createExpenseBudgetBarChart(inputData): void {
    if (this.expenseBudgetBarChart != undefined) {
      this.expenseBudgetBarChart.destroy();
    }
    const ctx = document.getElementById('expenseBudgetBarChart');
    this.expenseBudgetBarChart = new Chart(ctx, {
        type: 'bar',
        data: inputData,
        options: {
          title: {
            display: true,
            text: 'Comparison of expenses to budgets',
            fontSize: 22
          },
          scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Amount (dollars)'
              }
            }]
          },
          responsive: false,
        }
    });
    Chart.defaults.global.defaultFontSize = 16;
    Chart.defaults.global.defaultFontColor = 'black';
  }

  loadDashboardCharts(): void {
    this.updateErrorText('');
    let monthSelector = document.getElementById('month-selector') as HTMLSelectElement;
    this.monthInd = monthSelector.value;
    this.http.get(this.budgetBackendDomain + '/budget', {
      headers: {
        'Authorization': localStorage.getItem('jwt')
      },
      params: {
        month: this.monthInd
      }
    })
    .pipe(
      catchError((err) => {
        // Token expired
        if (err.status == 401) {
          this.logout();
        } else if (err.status == 404) {
          this.updateErrorText('No data available for this user/month');
          // Clear budget title dropdown
          this.budgetsDataSource.labels = [];
          this.setCategoryDropdowns();
        } else {
          console.log(err);
          return of([]);
        }
      })
    )
    .subscribe((res: any) => {
      if (res.length != 0) {
        this.updateLocalDataModels(res);
      }
    });

  }

  updateLocalDataModels(res: any): void {
    // Clear data
    this.budgetsDataSource.datasets[0].data = [];
    this.budgetsDataSource.datasets[0].backgroundColor = [];
    this.budgetsDataSource.labels = [];
    this.expensesDataSource.datasets[0].data = [];
    this.expensesDataSource.datasets[0].backgroundColor = [];
    this.expensesDataSource.labels = [];
    res.forEach((obj, index) => {
      // Data for budget pie chart
      this.budgetsDataSource.datasets[0].data[index] = obj.budget;
      this.budgetsDataSource.datasets[0].backgroundColor[index] = randomColor();
      this.budgetsDataSource.labels[index] = obj.title;
      // Data for expenses pie chart
      this.expensesDataSource.datasets[0].data[index] = obj.expense;
      this.expensesDataSource.datasets[0].backgroundColor[index] = randomColor();
      this.expensesDataSource.labels[index] = obj.title;
    });
    this.setBudgetExpensesDataSource()
    this.setCategoryDropdowns();
    this.showChartArea();
    this.createCharts();
  }

  setBudgetExpensesDataSource() {
    let dataLength = this.expensesDataSource.datasets[0].data.length;
    let expenseBackgroundColors: string[] = [];
    let budgetBackgroundColors: string[] = [];
    for (let i = 0; i < dataLength; i++) {
      expenseBackgroundColors.push('#a30e15');
      budgetBackgroundColors.push('#53680c');
    }
    this.budgetExpensesDataSource.datasets[0].data = this.expensesDataSource.datasets[0].data;
    this.budgetExpensesDataSource.datasets[1].data = this.budgetsDataSource.datasets[0].data;
    this.budgetExpensesDataSource.datasets[0].backgroundColor = expenseBackgroundColors;
    this.budgetExpensesDataSource.datasets[1].backgroundColor = budgetBackgroundColors;
    this.budgetExpensesDataSource.labels = this.expensesDataSource.labels;
  }

  // Modify budget and expense data

  addBudget(title: string, month: number, budgetAmount: number, expenseAmount: number) {
    this.http.post(this.budgetBackendDomain + '/budget',
      {
        title: title,
        month: month,
        budget: budgetAmount,
        expense: expenseAmount
      }, {
        headers: {
          'Authorization': localStorage.getItem('jwt')
        }
      })
      .pipe(
        catchError((err) => {
          console.log(err);
          return of([]);
        })
      )
      .subscribe((res: any) => {
        this.updateLocalDataModels(res);
      })
  }

  updateBudget(title: string, month: number, budgetAmount: number, expenseAmount: number) {
    this.http.put(this.budgetBackendDomain + '/budget',
      {
        title: title,
        month: month,
        budget: budgetAmount,
        expense: expenseAmount
      }, {
        headers: {
          'Authorization': localStorage.getItem('jwt')
        }
      })
      .pipe(
        catchError((err) => {
          console.log(err);
          return of([]);
        })
      )
      .subscribe((res: any) => {
        this.updateLocalDataModels(res);
      })
  }

  deleteBudget(title: string, month: number) {
    this.http.delete(this.budgetBackendDomain + '/budget',
    {
      headers: {
        'Authorization': localStorage.getItem('jwt')
      },
      params: {
        title: title,
        month: month.toString()
      }
    })
    .pipe(
      catchError((err) => {
        console.log(err);
        return of([]);
      })
    )
    .subscribe((res: any) => {
      this.updateLocalDataModels(res);
    })
  }

  // Manage login state

  monitorJwtExpiration(jwt: string): void {
    let jwtSecondsToExpiration = Number(JSON.parse(atob(jwt.split('.')[1])).exp) - Math.round(Date.now() / 1000);
    timer((jwtSecondsToExpiration - 20) * 1000)
      .subscribe(() => {
        let response = confirm('Your session will expire in 20 seconds. Press OK to stay signed in');
        if (response == true) {
          let jwt = localStorage.getItem('jwt');
          localStorage.removeItem('jwt');
          // Renew jwt
          window.location.href = this.ssoDomain + '/login?redirectUrl=' + this.budgetDomain + '/dashboard/&jwt=' + jwt;
        } else {
          this.logout();
        }
    })
  }

  login(): void {
    window.location.href = this.ssoDomain + '/login?ssoSuiteId=' + this.ssoSuiteId + '&redirectUrl=' + this.budgetDomain + '/dashboard/';
  }

  logout(): void {
    let jwt = localStorage.getItem('jwt');
    localStorage.removeItem('jwt');
    window.location.href = this.ssoDomain + '/logout?redirectUrl=' + this.budgetDomain + '/&jwt=' + jwt;
  }

  setNewJwt(): void {
    this.route.queryParams
      .subscribe(params => {
        if (params.jwt != undefined) {
          localStorage.setItem('jwt', params.jwt);
        } else if (params.jwts != undefined) {
          let userJwts = JSON.parse(params.jwts) as string[];
          // Given multiple accounts signed into the same sso suite, use the latest one
          localStorage.setItem('jwt', userJwts[userJwts.length - 1]);
        }
      });
  }

}
