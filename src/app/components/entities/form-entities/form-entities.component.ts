import { Component, computed, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { EntitiesService } from '../../entities.service';
import { BasicEntitiesService } from '../../basic-entities.service';
import { FormBasicActivityComponent } from '../../basic-activity-entity/form-basic-activity/form-basic-activity.component';

@Component({
  selector: 'app-form-entities',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './form-entities.component.html',
  styleUrl: './form-entities.component.css',
})
export class FormEntitiesComponent implements OnInit {
  entitiesService = inject(EntitiesService);
  basicEntitiesService = inject(BasicEntitiesService);

  constructor(public dialogRef: MatDialogRef<FormBasicActivityComponent>) {}

  async ngOnInit() {
    await this.basicEntitiesService.fetchBasicActivities();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  basicActivities = computed(() => {
    return this.basicEntitiesService.loadedBasicActivities().map((el) => {
      return {
        value: el.id,
        label: el.name,
      };
    });
  });

  insertEntityForm = new FormGroup(
    {
      basicEntity: new FormControl(''),
      name: new FormControl(''),
      unitValue: new FormControl('', {
        validators: [Validators.required, Validators.min(1)],
      }),
    },
    { validators: this.oneFieldOnlyValidator('basicEntity', 'name') }
  );

  async insertEntity() {
    if (this.insertEntityForm.valid) {
      try {
        if (this.insertEntityForm.valid) {
          const newEntity: {
            unit_value: string;
            name?: string;
            basic_entity_id?: string;
          } = {
            unit_value: this.insertEntityForm.value.unitValue!,
          };
          if (this.insertEntityForm.value.basicEntity) {
            newEntity.basic_entity_id = this.insertEntityForm.value.basicEntity;
          } else if (this.insertEntityForm.value.name) {
            newEntity.name = this.insertEntityForm.value.name;
          }
          await this.entitiesService.addEntity(newEntity);
          this.entitiesService.fetchEntities();
          this.closeDialog();
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  oneFieldOnlyValidator(field1: string, field2: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const field1Value = group.get(field1)?.value;
      const field2Value = group.get(field2)?.value;

      if ((field1Value && field2Value) || (!field1Value && !field2Value)) {
        return { oneFieldOnly: true }; // Errore se entrambi o nessuno dei due sono popolati
      }

      return null; // Valido
    };
  }
}
