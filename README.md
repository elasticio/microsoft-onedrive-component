# microsoft-onedrive-component

[![CircleCI](https://circleci.com/gh/elasticio/microsoft-onedrive-component.svg?style=svg)](https://circleci.com/gh/elasticio/microsoft-onedrive-component)

[![CLA assistant](https://cla-assistant.io/readme/badge/elasticio/microsoft-onedrive-component)](https://cla-assistant.io/elasticio/microsoft-onedrive-component)

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
    * [Get File](#get-file)
    * [Upsert File](#upsert-file)
    * [Delete File](#delete-file)
    * [Create Folder](#create-folder)
* [Known Limitations](#known-limitations)
* [Contribution Guidelines](#Contribution)
* [License](#license)

## General information  
Microsoft OneDrive component for the [elastic.io platform](http://www.elastic.io 'elastic.io platform')
### Description  
This is the component for working with Microsoft OneDrive storage service on [elastic.io platform](http://www.elastic.io/ "elastic.io platform").

### Purpose  
The component provides ability to connect to Microsoft OneDrive storage service.

### Completeness Matrix
![image](https://user-images.githubusercontent.com/16806832/77531578-d58d1280-6e9b-11ea-8802-4ed8e492f081.png)

[Completeness Matrix](https://docs.google.com/spreadsheets/d/1xXDb039POOWOKE7Iamfuz5si7Y7bX1l8mJSuDb4Gums/edit#gid=0)

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
Triggers to get all new and updated files since last polling. Polling is provided by `lastModifiedDateTime` file's property.

#### List of Expected Config fields
* **Drive Identity** - OneDrive instance to work with. Selects by owner
* **Folder path** - Dropdown list with folder path where new and updated path should be polled
* **Emit Behaviour** -  Options are: default is `Emit Individually` emits each object in separate message, `Fetch All` emits all objects in one message
* **Start Time** - Start datetime of polling. Default min date:-271821-04-20T00:00:00.000Z
* **End Time** - End datetime of polling. Default max date: +275760-09-13T00:00:00.000Z
* **Size Of Polling Page** - Indicates the size of pages to be fetched. Defaults to 1000
* **Expand Children** - checkbox for polling files from child folders
* **Enable File Attachments** - checkbox for attaching files content to action response

## Actions
### Get File
Action to get item from OneDrive by provided path in selected disc.

#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
* **Enable File Attachments** - checkbox for attaching files content to action response
#### Metadata fields description
* **Path** - Full path to item to create or replace
#### Input example:
```
{
    "path": "base_folder/inner_folder/file.any"
}
```

### Upsert File
Action upserts (create or replace) with first file from attachment by provided path in Microsoft One Drive
#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
#### Metadata fields description
* **Path** - Full path to item to create or replace
#### Input example:
```
{
    "path": "base_folder/inner_folder/file.any"
}
```

### Delete File
Action to delete item from OneDrive by provided path in selected disc.
Returns filename if file was deleted and empty message if already wasn't exist
#### Input fields description
* **Drive Identity** - OneDrive instance to work with. Selects by owner
#### Metadata fields description
* **Path** - Full path to item to delete
#### Input example:
```
{
    "path": "base_folder/inner_folder/file.any"
}
```

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

## Known Limitations

1. Maximal possible size for an attachment is 10 MB.
2. Attachments mechanism does not work with [Local Agent Installation](https://support.elastic.io/support/solutions/articles/14000076461-announcing-the-local-agent-)

## Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how you could contribute to development of this component.

## License

Apache-2.0 © [elastic.io GmbH](http://elastic.io)
