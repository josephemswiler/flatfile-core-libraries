import { Component, OnInit } from '@angular/core'
import { sheet } from './sheet'
import { SpaceService } from '@flatfile/angular-sdk'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  showSpace: boolean = false
  data: any

  constructor(private spaceService: SpaceService) {}

  ngOnInit() {}

  title = 'angular'

  toggleSpace() {
    this.spaceService.OpenEmbed()
    this.showSpace = !this.showSpace
  }

  closeSpace() {
    this.showSpace = false
  }

  spaceProps = {
    name: 'My simplified space!',
    publishableKey: 'pk_123456',
    sheet,
    onSubmit: async ({
      job,
      sheet,
    }: {
      job?: any
      sheet?: any
    }): Promise<any> => {
      const data = await sheet.allData()
      console.log('onSubmit', data)
    },
    onRecordHook: (record: any, event: any) => {
      const firstName = record.get('firstName')
      const lastName = record.get('lastName')
      if (firstName && !lastName) {
        record.set('lastName', 'Rock')
        record.addInfo('lastName', 'Welcome to the Rock fam')
      }
      return record
    },
    closeSpace: {
      operation: 'submitActionFg',
      onClose: this.closeSpace.bind(this),
    },
  }
}
