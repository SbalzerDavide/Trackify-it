import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ChartService } from '../../../shared/lib/chart.service';
import { ChartInfo } from '../../../shared/lib/chart.model';
import { EntitiesService } from '../../entities.service';



@Component({
  selector: 'app-form-save-chart',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatSelectModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatSlideToggleModule],
  templateUrl: './form-save-chart.component.html',
  styleUrl: './form-save-chart.component.css'
})
export class FormSaveChartComponent implements OnInit{

  data = inject(MAT_DIALOG_DATA);

  chartService = inject(ChartService)
  entitiesService = inject(EntitiesService)

  rangeTypes = signal<string[]>(['weekly', 'monthly', 'annual'])

  constructor(public dialogRef: MatDialogRef<FormSaveChartComponent>){}

  entities = computed(()=>{    
    return this.entitiesService.loadedEntities().map((el)=>{
      return {
        value: el.id,
        label: el.basic_entities?.name ?? el.name
      }
    })
  })

  async ngOnInit() {
    await this.entitiesService.fetchEntities()
  }


  saveChartForm = new FormGroup({
    name: new FormControl(this.data.name, {
      validators: [Validators.required]
    }),
    entity: new FormControl(this.data.activeEntity, {
      validators: [Validators.required]
    }),
    rangeType: new FormControl(this.data.rangeType, {
      validators: [Validators.required]
    }),
    isRangeAbsolute: new FormControl(this.data.isRangeAbsolute),
    showIndashboard: new FormControl(this.data.showInDashboard)

  })

  closeDialog() {
    this.dialogRef.close();
  }

  async saveChart(){
    try{
      if(this.saveChartForm.valid){
        let chartInfo: ChartInfo = {
          name: this.saveChartForm.value.name!,
          entity_id: this.saveChartForm.value.entity,
          is_range_absolute: this.saveChartForm.value.isRangeAbsolute,
          range_type: this.saveChartForm.value.rangeType,
          show_in_dashboard: this.saveChartForm.value.showIndashboard!
        }
        if(this.data.chartId){
          await this.chartService.updateChart(chartInfo, this.data.chartId)
          this.chartService.updateCharts.next(chartInfo)
        } else{
          await this.chartService.addChart(chartInfo)
        }
        this.closeDialog()
      }
    } catch(error){
      console.error(error)
    }
  }

  async delete(){
    await this.chartService.deleteChart(this.data.chartId)
    this.chartService.updateCharts.next(null)
    this.closeDialog()
  }

}
