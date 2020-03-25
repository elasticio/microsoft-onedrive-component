# microsoft-onedrive-component
## Table of Contents

* [General information](#general-information)
   * [Description](#description)
   * [Purpose](#purpose)
   * [Completeness Matrix](#completeness-matrix)
* [Requirements](#requirements)
   * [Environment variables](#environment-variables)
* [Credentials](#credentials)
* [Actions](#actions)
    [Delete Action](#delete-action)
* [Known Limitations](#known-limitations)
* [License](#license)

## General information  
Microsoft OneDrive component for the [elastic.io platform](http://www.elastic.io 'elastic.io platform')
### Description  
This is the component for working with Microsoft OneDrive storage service on [elastic.io platform](http://www.elastic.io/ "elastic.io platform").

### Purpose  
The component provides ability to connect to Microsoft OneDrive storage service.

### Completeness Matrix
![image]()

[Completeness Matrix]()

## Requirements

#### Environment variables
Name|Mandatory|Description|Values|
|----|---------|-----------|------|
|`OAUTH_CLIENT_ID`| true | Microsoft Graph Application OAuth2 Client ID | Can be found in your application page on [https://portal.azure.com](https://portal.azure.com) |
|`OAUTH_CLIENT_SECRET`| true | Microsoft Graph Application OAuth2 Client Secret | Can be found in your application page on [https://portal.azure.com](https://portal.azure.com) |
|`LOG_LEVEL`| false | Controls logger level | `trace`, `debug`, `info`, `warning`, `error` |
|`ATTACHMENT_MAX_SIZE`| false | For `elastic.io` attachments configuration. Maximal possible attachment size in bytes. By default set to 1000000 and according to platform limitations CAN'T be bigger than that. | Up to `1000000` bytes|

## Credentials
To create new credentials you need to authorize in Microsoft system using OAuth2 protocol.

## Actions
### Get file
Action to get item from OneDrive by provided path in selected disc.

#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
* **Add file content** - checkbox for attaching files content to action response
#### Metadata fields description
* **Path** - Full path to item to create or replace

### Create Folder
Create new folder in provided `path`. If `path` not exist component will fail.
#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
* **Conflict Behaviour** - behaviour in case folder already exists. Default: `Fail`. Options: `Fail`, `Replace`, `Rename`.
    1. `Fail` - fails if folder with same name already exists under provided `path`
    2. `Rename` - rename folder if folder with same name already exists under provided `path`. Examples: `exists` -> `exists_1`, `exists_1` -> `exists_1_1`
    3. `Replace` - replace folder if folder with same name already exists under provided `path`. Note: files inside folder will not be replaced, but last modified date of folder will be updated
#### Metadata fields description
* **Path** - Path to to folder where new folder will be created. Use empty string or `/` for root
* **Name** - Name of new folder

### Upsert File
Action upserts (create or replace) with first file from attachment by provided path in Microsoft One Drive
#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
#### Metadata fields description
* **Path** - Full path to item to create or replace

### Delete
Action to delete item from OneDrive by provided path in selected disc.
#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
#### Metadata fields description
* **Path** - Full path to item to delete

## License

Apache-2.0 © [elastic.io GmbH](http://elastic.io)
