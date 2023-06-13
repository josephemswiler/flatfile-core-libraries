import api, { Flatfile } from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'

export const config: Pick<
  Flatfile.WorkbookConfig,
  'name' | 'sheets' | 'actions'
> = {
  name: 'Employees workbook',
  sheets: [
    {
      name: 'TestSheet',
      slug: 'TestSheet',
      fields: [
        {
          key: 'first_name',
          type: 'string',
          label: 'First name',
          constraints: [
            {
              type: 'required'
            }
          ]
        },
        {
          key: 'last_name',
          type: 'string',
          label: 'last name'
        },
        {
          key: 'full_name',
          type: 'string',
          label: 'full name'
        }
      ],
      actions: [
        {
          label: 'split fields',
          operation: 'contacts:split-fields',
          description: 'Would you like to split fields?',
          mode: 'foreground',
          confirm: true
        }
      ]
    }
  ],
  actions: [
    {
      label: 'Submit',
      operation: 'contacts:submit',
      description: 'Would you like to submit your workbook?',
      mode: 'foreground',
      primary: true,
      confirm: true
    }
  ]
}

async function splitFields(jobId: string, sheetId: string) {
  await api.jobs.ack(jobId, {
    info: "I'm starting the spliting fields job"
  })

  const records = await api.records.get(sheetId)
  const recordsUpdates = records.data.records?.map((record) => {
    const fullName = record.values['full_name'].value
    const splitName = fullName?.toLocaleString().split(' ')

    record.values['first_name'].value = splitName ? splitName[0] : ''
    record.values['last_name'].value = splitName ? splitName[1] : ''

    return record
  })

  await api.records.update(sheetId, recordsUpdates as Flatfile.Record_[])

  await api.jobs.complete(jobId, {
    info: "Job's work is done"
  })
}

/**
 * Example Listener
 */
export const listener = FlatfileListener.create((client) => {
  client.on(
    'job:ready',
    // @ts-ignore
    { payload: { operation: 'contacts:split-fields' } },
    async (event: any) => {
      const { context } = event
      return splitFields(context.jobId, context.sheetId)
    }
  )
})
