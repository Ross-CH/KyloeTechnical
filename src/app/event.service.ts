// Author: Ross Harvey
// Date: 2022-07-01

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { KyloeEvent } from "./event.model";

@Injectable({
  providedIn: 'root'
})
export class EventService {
  events: KyloeEvent[] = []
  eventSubject = new Subject<KyloeEvent[]>()

  constructor() {
  }

  updateTable() {
    this.eventSubject.next(this.events)
  }

  // Reads contents of provided file and converts the data into a usable format
  readFile(file: any): void {
    let fileReader = new FileReader()
    fileReader.readAsText(file);
    fileReader.onload = () => {
      let text = fileReader.result!.toString().trim()
      // Split events file into array of strings, separated by new lines in file
      let stringEventArray = text!.split('\n');
      // Regex to find the array of updated fields in each event.
      const regex = /\[.*]/g
      // For each line in file, extract the list of updated fields and convert remaining comma-separated elements into an array
      // Then convert list of updated fields into its own array and combine both sub-arrays into a KyloeEvent class
      this.events = stringEventArray.map(event => {
        let eventData = [...event.matchAll(regex)].map(i => i[0])
        let eventFieldsUpdated = [...eventData.toString().replace('[', '').replace(']', '').split(', ')]
        eventData = event.toString().replace(/\[.*], /g, '').split(', ')

        // If the updated fields array has a single element consisting of an empty string, replace the array with an empty array
        if (eventFieldsUpdated.length === 1 && eventFieldsUpdated[0] === '') eventFieldsUpdated = [];

        return new KyloeEvent(eventData[0],
            eventData[1],
            parseInt(eventData[2]),
            eventFieldsUpdated, new Date(eventData[eventData.length - 1])
        );
      });
      this.updateTable()
    }
  }

}
