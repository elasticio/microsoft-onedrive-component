# microsoft-onedrive-component
## Table of Contents

* [General information](#general-information)
   * [Description](#description)
   * [Purpose](#purpose)
   * [Completeness Matrix](#completeness-matrix)
* [Requirements](#requirements)
   * [Environment variables](#environment-variables)
* [Credentials](#credentials)
* [Triggers](#triggers)
    * [Get New And Updated Files Polling](#get-new-and-updated-files-polling)
* [Actions](#actions)
    * [Delete Action](#delete-action)
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

## Triggers
### Get New And Updated Files Polling
Triggers to get all new and updated files since last polling.

#### List of Expected Config fields
* **Drive Identity** - OneDrive instance to work with. Selects by owner
* **Folder path** - Dropdown list with folder path where new and updated path should be polled
* **Emit Behaviour** -  Options are: default is `Emit Individually` emits each object in separate message, `Fetch All` emits all objects in one message
* **Start Time** - Start datetime of polling. Default min date:-271821-04-20T00:00:00.000Z
* **End Time** - End datetime of polling. Default max date: +275760-09-13T00:00:00.000Z
* **Size Of Polling Page** - Indicates the size of pages to be fetched. Defaults to 1000
* **Expand Children** - checkbox for polling files from child folders
* **Add file content** - checkbox for attaching files content to action response


## Actions
### Get file
Action to get item from OneDrive by provided path in selected disc.

#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
* **Add file content** - checkbox for attaching files content to action response
#### Metadata fields description
* **Path** - Full path to item to create or replace

### Create Folder Action 
Create new folder in provided `path`. If `path` not exist component will fail.
#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
* **Conflict Behaviour** - behaviour in case folder already exists. Default: `Fail`. Options: `Fail`, `Replace`, `Rename` 
#### Metadata fields description
* **Path** - Path to to folder where new folder will be created. Use empty string or `/` for root
* **Name** - Name of new folder

### Upsert File Action 
Action upsert(create or replace) with first file from attachment by provided path in Microsoft One Drive
#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
#### Metadata fields description
* **Path** - Full path to item to create or replace

### Delete action
Action to delete item from OneDrive by provided path in selected disc.
#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
#### Metadata fields description
* **Path** - Full path to item to delete

## License

Apache-2.0 © [elastic.io GmbH](http://elastic.io)
