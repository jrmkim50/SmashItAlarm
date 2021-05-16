import { INSTALLED } from '../app/utils/constants';
import { getAsyncStorageItem, setAsyncStorageItem } from '../app/utils/utils';

test('Correctly sets installed data', () => {
    let installed = getAsyncStorageItem(INSTALLED);
    expect(installed).toEqual({});
})