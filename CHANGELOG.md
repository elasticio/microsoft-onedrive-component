# 1.0.2 (october 30, 2020)

* Update sailor version to 2.6.18
* Annual audit of the component code to check if it exposes a sensitive data in the logs

# 1.0.1 (August 4, 2020)

* Adapt Polling Trigger to account for the fact that OrderBy is not supported in One Drive for Business
* Polling trigger handles cases where there are more than 200 matching files
* Limit parallelization of writing to steward in polling trigger
* Polling trigger correctly sorts items by timestamp
* Update dependencies. Sailor is updated to version `2.6.14`
* Fix integration tests

# 1.0.0 (March 26, 2020)

* Create Get New And Updated Files Polling Trigger
* Create Upsert File Action
* Create Create Folder Action
* Create Get File Action
* Create Delete File Action
