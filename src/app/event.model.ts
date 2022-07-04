// Author: Ross Harvey
// Date: 2022-07-01

export class KyloeEvent {
  constructor(
      public eventType: string,
      public entityName: string,
      public entityID: number,
      public fieldsUpdated: {},
      public timestamp: Date
  ) {
  }
}
