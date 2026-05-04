import { Routes } from '@angular/router';
import { CategoriesListComponent } from './categories/categories-component/categories-list-component';
import { NotFoundComponent } from '../not-found/not-found.component';
import { ReportsListComponent } from './reports/reports-list-component/reports-list-component';
import { DisplayReportComponent } from './reports/display-report-component/display-report-component';
import { BudgetListComponent } from './budgets/budget-list-component/budget-list-component';
import { DisplayBudgetComponent } from './budgets/display-budget-component/display-budget-component';
import { ReserveComponent } from './reserve/reserve-component/reserve-component';
import { PlannerComponent } from './planner/planner-component/planner-component';


export const routes: Routes = [
    { path: '', redirectTo: '/reserve', pathMatch: 'full' },
    { path: 'categories', component: CategoriesListComponent},
    { path: 'reports', component: ReportsListComponent},
    { path: 'budgets', component: BudgetListComponent},
    { path: 'reserve', component: ReserveComponent},
    { path: 'planner', component: PlannerComponent},
    { path: 'displayReport/:reportId', component: DisplayReportComponent},
    { path: 'displayBudget/:budgetId', component: DisplayBudgetComponent},
    { path: '**', component: NotFoundComponent },
];
