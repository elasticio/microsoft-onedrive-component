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
   
* [Actions](#actions)
   
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
|`LOG_LEVEL`| false | Controls logger level | `trace`, `debug`, `info`, `warning`, `error` |
|`ATTACHMENT_MAX_SIZE`| false | For `elastic.io` attachments configuration. Maximal possible attachment size in bytes. By default set to 1000000 and according to platform limitations CAN'T be bigger than that. | Up to `1000000` bytes|

## Credentials

## Triggers

## Actions

## License

Apache-2.0 © [elastic.io GmbH](http://elastic.io)
