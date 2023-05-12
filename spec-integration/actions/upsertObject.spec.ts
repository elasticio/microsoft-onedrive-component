import { expect } from 'chai';
import { getContext, creds } from '../common';
import { processAction } from '../../src/actions/upsertObject';

describe('upsertObject', () => {
  it('should create', async () => {
    const cfg = {
      driveId: 'b!WJfmHKrb2EqIJw-mFMYNnOxjnjtrE8FMsCoFLVlwK9pIE5QBGeHbSr5l8j5-Q3hR'
    };
    const msg = {
      body: {
        files: [
          {
            url: 'https://if0s.info/files/Sync.7z',
            path: '/1/my fold/2/Sync.7z'
          }
        ]
      }
    };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
  });
});
