# Introduction

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

Please, don't use the issue tracker for support questions. Check whether the support@elastic.io can help with your issue.

# Ground Rules

This includes not just how to communicate with others (being respectful, considerate, etc) but also technical responsibilities (importance of testing, project dependencies, etc). Mention and link to your code of conduct, if you have one.

Please make sure your contribution has following properties:
* Code is written and formatted in accordance with the [styling guide](#coding-style)
* Code (incl. configs, test samples, environment variables etc.) MUST NOT contain any sensitive data like passwords, tokens, API keys etc.
* Integration application logs does not contain any sensitive data (if needed due to requirements)
* Code is covered with unit tests
* Code is covered with integration tests
* Continuous deployment:
  * Publish script
  * Secrets
  * k8s descriptors
* Documentation 
  * Readme.md with sequence diagrams, overview, description and installation manual
  * Environment variables listing and description (env-vars.md) Changelogs (CHANGELOG.md). 
* Sign the [Contributor License Agreement](https://cla-assistant.io/elasticio/microsoft-onedrive-component)

Contributions are accepted in form of pull requests. Working on your first Pull Request? You can learn how from this *free* series, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

At this point, you're ready to make your changes! Feel free to ask for help; everyone is a beginner at first :smile_cat:

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

# How to report a security bug

If you find a security vulnerability, do NOT open an issue. Email support@elastic.io instead.

In order to determine whether you are dealing with a security issue, ask yourself these two questions:
* Can I access something that's not mine, or something I shouldn't have access to?
* Can I disable something for other people?

If the answer to either of those two questions are "yes", then you're probably dealing with a security issue. Note that even if you answer "no" to both questions, you may still be dealing with a security issue, so if you're unsure, just email us at support@elastic.io.

# Code review process

The core team looks at Pull Requests on a regular basis in a bi-weekly planning meetings. Before you contribution may be merged into the source code please 
make sure the [Contributor License Agreement](https://cla-assistant.io/elasticio/microsoft-onedrive-component) is signed.

# Coding Style
We would like your contribution to be formatted according with the following style:
* Eslint shout be used to enforce code quality/act as an early detector of bugs
  * Airbnb style guidelines: [see more here](https://github.com/airbnb/javascript)
  * Eslint may also require plugins for [mocha](https://www.npmjs.com/package/eslint-plugin-mocha) and [sinon](https://www.npmjs.com/package/eslint-plugin-sinon)
* Async code should ideally be handled using async/await functions in a try/catch block
  * [Example](https://codeburst.io/async-patterns-in-node-js-only-4-different-ways-to-do-it-70186ee83250?gi=92953dd8e280)
  *  [Related reading on Node’s event loop/concurrency handling](https://blog.risingstack.com/node-js-at-scale-understanding-node-js-event-loop/)
* Code (in dependency libraries) that is callback based should use promisify to allow the use of await
* Const is preferred over let.  Using var or undeclared variables should be avoided.
* Node.js v8 is the current standard


After feedback has been given we expect responses within two weeks. After two weeks we may close the pull request if it isn't showing any activity.