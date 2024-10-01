import { Component, inject, OnInit, signal } from '@angular/core';

import { MatListModule } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';


import { GoalStore } from '../../goal.store';
import { Goal } from '../../goal.model';
import { GoalService } from '../../goal.service';

@Component({
  selector: 'app-goal',
  standalone: true,
  imports: [MatListModule, MatDivider, MatButtonModule],
  providers: [GoalStore],
  templateUrl: './goal.component.html',
  styleUrl: './goal.component.css'
})
export class GoalComponent implements OnInit{

  goalStore = inject(GoalStore)
  goalService = inject(GoalService)

  goalTypes = [ 'daily', 'weekly', 'monthly', 'annual'] 

  async ngOnInit() {
    await this.goalStore.loadAll()
  }

  getValue(goalType: string){
    return this.goalStore.goals().find(el => el.range === goalType)
  }

  async addGoal(range: string){
    await this.goalService.addGoal(range)
    await this.goalStore.loadAll()
  }

  async updateGoal(goalType: string, operation: number){
    const goal = this.getValue(goalType)
    if(goal){
      const newVal = {
        quantity: operation === 1 ? goal.quantity + 1 : goal.quantity - 1,
        range: goal.range
      }      
      await this.goalService.updateGoal(newVal, goal.id)
      await this.goalStore.loadAll()
    }
  }

}
