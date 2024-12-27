import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { MatListModule } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';


import { GoalStore } from '../../goal.store';
import { GoalService } from '../../goal.service';
import { EntitiesService } from '../../entities.service';

@Component({
  selector: 'app-goal',
  standalone: true,
  imports: [MatListModule, MatDivider, MatButtonModule, MatExpansionModule],
  templateUrl: './goal.component.html',
  styleUrl: './goal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalComponent implements OnInit{

  goalStore = inject(GoalStore)
  goalService = inject(GoalService)

  entitiesService = inject(EntitiesService)

  goalTypes = [ 'daily', 'weekly', 'monthly', 'annual'] 

  async ngOnInit() {
    await this.entitiesService.fetchEntities()
    await this.goalStore.loadAll()
  }

  async addGoal(range: string, entityId: string){
    const newVal = {
      range,
      entityId
    }
    await this.goalService.addGoal(newVal)
    await this.goalStore.loadAll()
  }

  async updateGoal(goalType: string, entityId: string, operation: number){
    const goal = this.getValue(goalType, entityId)
    if(goal){
      const newVal = {
        quantity: operation === 1 ? goal.quantity + 1 : goal.quantity - 1,
        range: goal.range
      }      
      await this.goalService.updateGoal(newVal, goal.id)
      await this.goalStore.loadAll()
    }
  }

  getGoal(id: string){
    return this.goalStore.goals().find(el => el.id === id)
  }

  getValue(goalType: string, entityId: string){
    return this.goalStore.goals().find(el => el.range === goalType && el.entity_id === entityId)
  }

}
