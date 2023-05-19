import stream from 'stream';
import { promisify } from 'util';
import Client from './client';

const pipeline = promisify(stream.pipeline);

export default class StorageClient extends Client {
  async getMyDrives() {
    const { data } = await this.apiRequest({
      url: '/me/drives',
      method: 'GET'
    });
    return data.value;
  }

  formatPath(path: string) {
    const root = `/drives/${this.cfg.driveId}/root`;
    if (!path || path === '/') return root;
    return `${root}:/${path.replace(/^\/|\/$/gm, '')}:`;
  }

  async getDisks() {
    const drives = await this.getMyDrives();
    const drivesList = {};
    drives.forEach((drive) => { drivesList[drive.id] = drive.owner.user.displayName; });
    return drivesList;
  }

  async getFolderPaths() {
    const children = ['/'];
    await this.getFolderChildrenPath('', children);
    this.logger.info(`Folders found: ${children.length}`);
    children.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const result: any = {};
    children.forEach((child) => { result[child] = child; });
    return result;
  }

  async getFolderChildrenPath(path: string, children: string[], nextLink?: string) {
    const { data } = await this.apiRequest({
      url: nextLink || `${this.formatPath(path)}/children?$select=name,folder&$top=999`,
      method: 'GET'
    });
    for (const child of data.value) {
      if (child.folder) {
        children.push(`${path}/${child.name}`);
        if (data['@odata.nextLink']) await this.getFolderChildrenPath(path, children, data['@odata.nextLink']);
        if (child.folder.childCount > 0) {
          await this.getFolderChildrenPath(`${path}/${child.name}`, children);
        }
      }
    }
  }

  async getChildren(path: string, nextLink?: string, top = 999) {
    const { data } = await this.apiRequest({
      url: nextLink || `${this.formatPath(path)}/children?$top=${top}`,
      method: 'GET'
    });
    return data;
  }

  async getFileMetadata(path: string) {
    const { data } = await this.apiRequest({
      url: this.formatPath(path),
      method: 'GET'
    });
    return data;
  }

  async downloadFile(path: string) {
    const { data } = await this.apiRequest({
      url: `${this.formatPath(path)}/content`,
      method: 'GET',
      responseType: 'stream'
    });
    return data;
  }

  async createUploadSession(path: string) {
    const { data } = await this.apiRequest({
      url: `${this.formatPath(path)}/createUploadSession`,
      method: 'POST',
      data: {
        item: {
          '@microsoft.graph.conflictBehavior': 'replace'
        }
      }
    });
    return data;
  }

  async uploadLargeFile(uploadUrl, dataStreamResponse) {
    const fileSize = parseInt(dataStreamResponse.headers['content-length'], 10);

    let start = 0;
    let end = 0;
    let buff = Buffer.from('');
    const rangeSize = 320 * 1024 * 10;
    let result;
    this.logger.info(`Going to upload file with size ${fileSize}b`);

    const chunkCollector = async (part) => {
      buff = Buffer.concat([buff, part]);
      if (buff.length >= rangeSize || ((buff.length + start) === fileSize)) {
        const slicedPart = buff.subarray(0, rangeSize);
        end = Math.min(slicedPart.length + end, fileSize) - (end ? 0 : 1);
        this.logger.debug(`uploading bytes from ${start} to ${end} (of ${fileSize})`);
        const uploadResponse = await this.uploadPartFile(uploadUrl, slicedPart, `bytes ${start}-${end}/${fileSize}`);
        if (uploadResponse.status === 201 || uploadResponse.status === 200) {
          result = uploadResponse.data;
        }
        start = end + 1;
        buff = buff.subarray(rangeSize, buff.length);
      }
    };

    return new Promise((resolve, reject) => {
      dataStreamResponse.data.on('data', async (chunk) => {
        dataStreamResponse.data.pause();
        try {
          await chunkCollector(chunk);
          if (!result) {
            dataStreamResponse.data.resume();
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async uploadFile(path: string, data) {
    const { data: result } = await this.apiRequest({
      url: `${this.formatPath(path)}/content`,
      method: 'PUT',
      data,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return result;
  }

  async uploadPartFile(uploadUrl: string, data, range) {
    return this.apiRequest({
      url: uploadUrl,
      method: 'PUT',
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        'Content-Range': range
      },
      data
    });
  }

  async deleteItem(path: string) {
    const { data } = await this.apiRequest({
      url: this.formatPath(path),
      method: 'DELETE'
    });
    return data;
  }

  async createFolder(path: string, name: string, conflictBehavior: string) {
    const { data } = await this.apiRequest({
      url: `${this.formatPath(path)}/children`,
      method: 'POST',
      data: {
        name,
        folder: {},
        '@microsoft.graph.conflictBehavior': conflictBehavior
      }
    });
    return data;
  }
}
