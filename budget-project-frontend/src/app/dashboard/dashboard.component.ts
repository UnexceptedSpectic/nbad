import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'pb-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    public data: DataService,
    private router: Router) { }

  ngOnInit(): void {
    // Check for jwt in query param. Present after signin redirect back to app
    this.data.setNewJwt();
    let jwt = localStorage.getItem('jwt');
    if (jwt != null) {
      this.data.monitorJwtExpiration(jwt);
      this.data.showLoggedInMenu();
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/'])
    }

    if (this.data.budgetsDataSource.datasets[0].data.length == 0) {
      this.data.loadDashboardCharts();
    } else {
      this.data.loadCharts();
      this.data.showChartArea();
    }

    // Modify budget update form based on selected action
    let budgetAction = document.getElementById('budget-action') as HTMLSelectElement;
    budgetAction.addEventListener('change', () => {
      let titleDropdownDiv = document.querySelector('div.budget-title') as HTMLDivElement;
      let newTitleDiv = document.querySelector('div.new-title') as HTMLDivElement;
      if (budgetAction.value === 'add') {
        titleDropdownDiv.style.display = 'none';
        newTitleDiv.style.display = 'block';
      } else {
        titleDropdownDiv.style.display = 'block';
        newTitleDiv.style.display = 'none';
      }

      let expenseAmount = document.querySelector('div.expense-amount-input') as HTMLDivElement;
      let budgetAmount = document.querySelector('div.budget-amount-input') as HTMLDivElement;
      if (budgetAction.value === 'delete') {
        expenseAmount.style.display = 'none';
        budgetAmount.style.display = 'none';
      } else {
        expenseAmount.style.display = 'block';
        budgetAmount.style.display = 'block';
      }
    }, false);

  }

  loadChartsForMonth(): void {
    this.data.loadDashboardCharts();
  }

  userBudgetModification(): void {
    let errorMessage = document.querySelector('.budget-operation-error') as HTMLParagraphElement;
    let submitButton = document.getElementById('budget-mod-submit') as HTMLButtonElement;
    let action = document.getElementById('budget-action') as HTMLSelectElement;
    let title = document.getElementById('budget-title') as HTMLSelectElement;
    let budgetAmount = document.getElementById('target-expense-amount') as HTMLInputElement;
    let expenseAmount = document.getElementById('actual-expense-amount') as HTMLInputElement;

    submitButton.disabled = true;
    errorMessage.innerHTML = '';

    if (action.value === 'add') {
      let title = document.getElementById('new-title') as HTMLInputElement;
      if (budgetAmount.value.length != 0 && expenseAmount.value.length != 0 && title.value.length != 0) {
        let labels = this.data.budgetsDataSource.labels;
        if ((labels.length !=0 && !labels.includes(title.value)) || labels.length == 0) {
          this.data.addBudget(title.value, Number(this.data.monthInd), Math.round(Number(budgetAmount.value)), Math.round(Number(expenseAmount.value)));
          title.value = '';
        } else {
          errorMessage.innerHTML = 'You are trying to add a budget item that already exists';
        }
      }
    } else if (action.value === 'update') {
      if (budgetAmount.value.length != 0 && expenseAmount.value.length != 0) {
        let title = document.getElementById('budget-title') as HTMLSelectElement;
        this.data.updateBudget(title[title.value].text, Number(this.data.monthInd), Math.round(Number(budgetAmount.value)), Math.round(Number(expenseAmount.value)));
      }
    } else {
      this.data.deleteBudget(title[title.value].text, Number(this.data.monthInd));
    }
    submitButton.disabled = false;
    budgetAmount.value = '';
    expenseAmount.value = '';

  }

}
