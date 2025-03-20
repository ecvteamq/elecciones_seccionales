import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import {FieldsetModule} from 'primeng/fieldset';
import {CardModule} from 'primeng/card';
import { CalendarModule } from 'primeng/calendar';
import {TabViewModule} from 'primeng/tabview';
import {DividerModule} from 'primeng/divider';
import {AccordionModule} from 'primeng/accordion';
import {ChartModule} from 'primeng/chart';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DropdownModule,
    FormsModule,
    InputSwitchModule,
    FieldsetModule,
    CardModule,
    TabViewModule,
    AccordionModule,
    ChartModule
  ],exports:[
    TableModule,
    DialogModule,
    InputTextModule,
    MultiSelectModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DropdownModule,
    FormsModule,
    InputSwitchModule,
    FieldsetModule,
    CardModule,
    CalendarModule,
    TabViewModule,
    DividerModule,
    AccordionModule,
    ChartModule
  ]
})
export class SharedModule { }
