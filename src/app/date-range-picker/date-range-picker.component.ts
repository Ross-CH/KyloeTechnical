// Author: Ross Harvey
// Date: 2022-07-01

import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.css']
})
export class DateRangePickerComponent {

  @Output() dateChange: EventEmitter<FormGroup> = new EventEmitter<FormGroup>()
  today = new Date()
  dateForm = new FormGroup({
    startDate: new FormControl(new Date(1262304000000)), // 2010-01-01
    startTime: new FormControl('00:00:00'),
    endDate: new FormControl(new Date()),
    endTime: new FormControl('23:59:59'),
  })
  startDateFilter = (d: Date | null): boolean => {
    const startDate = (d || new Date())
    const endDate = this.dateForm.value.endDate
    return endDate >= startDate || endDate == null
  };
  endDateFilter = (d: Date | null): boolean => {
    const startDate = this.dateForm.value.startDate
    const endDate = (d || new Date())
    return startDate <= endDate || startDate == null
  };

  emitDateChange(e: any) {
    // Update each date value with their respective time value
    let startTime = this.dateForm.value.startTime ? this.dateForm.value.startTime.split(':') : ['00', '00', '00'];
    let startDate = this.dateForm.value.startDate ? new Date(this.dateForm.value.startDate) : new Date(1262304000000);
    startDate.setHours(parseInt(startTime[0]))
    startDate.setMinutes(parseInt(startTime[1]))
    startDate.setSeconds(parseInt(startTime[2]))

    let endTime = this.dateForm.value.endTime ? this.dateForm.value.endTime.split(':') : ['23', '59', '59'];
    let endDate = this.dateForm.value.endDate ? new Date(this.dateForm.value.endDate) : new Date();
    endDate.setHours(parseInt(endTime[0]))
    endDate.setMinutes(parseInt(endTime[1]))
    endDate.setSeconds(parseInt(endTime[2]))

    this.dateForm.value.startDate = startDate
    this.dateForm.value.endDate = endDate

    this.dateChange.emit(this.dateForm)
  }

}
