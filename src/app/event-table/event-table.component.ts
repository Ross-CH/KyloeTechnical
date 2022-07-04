// Author: Ross Harvey
// Date: 2022-07-01

import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatSort } from '@angular/material/sort';
import { KyloeEvent } from "../event.model";
import { EventService } from "../event.service";
import { FormGroup } from "@angular/forms";
import { MatSelectChange } from "@angular/material/select";

@Component({
  selector: 'app-event-table',
  templateUrl: './event-table.component.html',
  styleUrls: ['./event-table.component.css']
})
export class EventTableComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<KyloeEvent>;
  displayedColumns = ['type', 'name', 'id', 'updated_fields', 'timestamp'];  // Columns displayed in the table.
  resultsLength = 0;
  dataSource!: MatTableDataSource<KyloeEvent>
  startDate = new Date(0);
  endDate = new Date();
  defaultFilterPredicate!: (data: KyloeEvent, filter: string) => boolean  // Default filter predicate to be restored later
  filterValues = {};
  filterColumns = new Array({
    displayName: '',
    propertyName: '',
    options: Array<String>()
  });
  fieldFilterValues = [];
  uniqueFields = [];

  constructor(private eventService: EventService) {
    this.eventService.eventSubject.subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.resultsLength = data.length;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = this.customFilter();
      if (this.table) {
        this.table.dataSource = this.dataSource;
        this.defaultFilterPredicate = this.dataSource.filterPredicate;
        this.getFilterOptions()
      }
    });

    // Template for filling out string filter dropdown menus. Becomes populated with unique values in the column
    this.filterColumns = [
      {
        displayName: 'Event Type',
        propertyName: 'eventType',
        options: []
      },
      {
        displayName: 'Entity Name',
        propertyName: 'entityName',
        options: []
      }
    ]
  }

  fileChanged(event: { event: any }): void {
    this.eventService.readFile(event.event.target.files[0]);
    this.eventService.updateTable();
  }

  dateFilter(event: FormGroup) {
    // Assign maximum and minimum possible date values to start and end dates if date-picker values have not been defined.
    this.startDate = event.value.startDate ? event.value.startDate : new Date(0);
    this.endDate = event.value.endDate ? event.value.endDate : new Date(8640000000000000);
    console.log(event.value)

    // Apply the filter again
    this.dataSource.filter = JSON.stringify(this.filterValues)
  }

  checkUnique(value: any, index: number, self: any) {
    return self.indexOf(value) === index;
  }

  // Iterate through each of the filterable columns, and append each unique value to the column's dropdown filter menu.
  getFilterOptions() {
    this.filterColumns.forEach((obj, index) => {
      let uniqueValues: any[] = [];
      this.dataSource.data.forEach((record) => {
        // Using @ts-ignore until I am able to find a more robust solution, because it works for now.
        // @ts-ignore
        uniqueValues.push(record[obj.propertyName])
      });
      uniqueValues = uniqueValues.filter(this.checkUnique)
      this.filterColumns[index].options = uniqueValues
    });

    // Get all unique values in all fieldsUpdated arrays
    let uniqueFields: never[] = []
    this.dataSource.data.forEach((record) => {
      for (const index in record.fieldsUpdated) {
        // @ts-ignore
        uniqueFields.push(record.fieldsUpdated[index])
      }
    })
    this.uniqueFields = uniqueFields.filter(this.checkUnique)
  }

  updateTextFilter(filter: { propertyName: string; displayName: string; options: String[] }, event: Event) {
    // @ts-ignore
    this.filterValues[filter.propertyName] = event.target.value.trim().toLowerCase()
    this.dataSource.filter = JSON.stringify(this.filterValues)
  }

  updateFieldsFilter(event: MatSelectChange) {
    this.fieldFilterValues = event.value;
    this.dataSource.filter = JSON.stringify(this.filterValues)
  }

  customFilter() {
    return (data: any, filter: string): boolean => {
      let filterTerms = JSON.parse(filter);
      let isFilterSet = false;
      for (const column in filterTerms) {
        if (filterTerms[column].toString() !== '') {
          isFilterSet = true;
        } else {
          delete filterTerms[column]
        }
      }

      let checkTextFilters = () => {
        let found = true;
        if (isFilterSet) {
          for (const column in filterTerms) {
            if (!found) return false
            filterTerms[column].trim().toLowerCase().split(' ').forEach((word: string) => {
              found = data[column].toString().toLowerCase().indexOf(word) != -1 && isFilterSet;
            });
          }
          return found;
        } else {
          return true;
        }
      };

      return checkTextFilters() && this.checkDateFilter(data) && this.checkFieldsFilter(data);
    }
  }

  checkFieldsFilter(data: any): boolean {
    // data: current kyloe event record
    // data.fieldsUpdated: array of updated fields in current kyloe event row
    // this.fieldFilterValues: array of terms by which to filter current record

    //  Returns true by default
    //  for each filter term, loop through each updated field in the row
    //    - if a match is found
    //      - break the inner loop and mark the current filter term as found
    //    - if the inner loop completes and no match is found
    //      - return false

    for (const i in this.fieldFilterValues) {
      let currentFilterTermFound = false;
      for (const j in data.fieldsUpdated) {
        if (data.fieldsUpdated[j] === this.fieldFilterValues[i]) {
          currentFilterTermFound = true;
          break;
        }
      }
      if (!currentFilterTermFound) {
        return false;
      }
    }

    return true;
  }

  checkDateFilter(data: any): boolean {
    return data.timestamp! >= this.startDate && data.timestamp <= this.endDate;
  }

}
