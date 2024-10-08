# Welcome to Deleight contributing guide <!-- omit in toc -->

Thank you for investing your time in contributing to our project! Any contribution you make will make Deleight so much better :sparkles:.

Read our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide you will learn the many ways you can contribute and get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

Use the table of contents on the left corner of this document to get to a specific section of this guide quickly.

## New contributor guide

Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/getting-started-with-git/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)


## Getting started

To get an overview of the project, read the [README](./README.md) file.  

Deleight is a project to provide cool framework functions like reactivity and other things that help to write more expressive JavaScript without loosing the freedom to use Vanilla JavaScript (or anything else) wherever we want. 

This is such a large and ambitious project and we need help in many areas:

1. **Create issues**. Ask about how to accomplish common 'framework' tasks with Deleight. We find it easier to show the code when questions like these come up than to think of everything directly when adding examples in the docs. These demos can help a lot in showing devs how they can complete their projects faster with Deleight. They can also be used to expand the test suite.

2. **Find bugs**. Although we have tested the main functionality in most of the modules. It has simply been been unrealistic to test many edge cases so far. We expect usage in these scenarios to increase as the library adoption goes up. Therefore we need to see that the library is robust enough to handle these situations also.

3. **Improve the docs**. Although we have tried hard to make the documenation as effective as possible, many important features have not yet been documented. Also the inline examples ctill need work to fully demonstrate the features. The [Process](mksunny1.github.io/deleight-api-docs/main/modules/deleight.process.html) module in particular still needs a lot of work here.

4. **Community work**. As your knowledge of Deleight increases, please share your knowledge with others. You can do so here in the discussions area or in other platforms, including those you create yourself. Connect your community to here and other Deleight communities by adding it in the [Communities.md](/Communities.md) file.

5. **Write code**. As the issues increase, we will need more help to write all the code to fix bugs, add tests, add more features and improve workflow with Github Actions and other tools. Kindly contribute here if you have the time. 


## HowTos

### Issues

#### Create a new issue

Before creating an issue, [first search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can [open a new issue](https://github.com/mksunny1/deleight/issues/new).

#### Solve an issue

Scan through our [existing issues](https://github.com/mksunny1/deleight/issues) to find one that interests you. You can narrow down the search using `labels` as filters. See "[Label reference](https://docs.github.com/en/contributing/collaborating-on-github-docs/label-reference)" for more information. As a general rule, we don’t assign issues to anyone. If you find an issue to work on, you are welcome to open a PR with a fix.

### Make Changes

#### Make changes to the project description

You can start your contribution journey with small changes such as a typo, sentence fix, or a broken link in the README, CONTRIBUTING or CODE_OF_CONDUCT files. 

1. Fork the repository. 
- Simply click the `fork` button at the top right corner of the project page.
2. Make your changes.
3. [create a pull request](#pull-request) for a review.

#### Make changes locally

1. Fork the repository.
- Using GitHub Desktop:
  - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
  - Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

2. Install or update **Node.js**. 

3. Create a working branch and start with your changes!

### Commit your update

Commit the changes once you are happy with them.

### Pull Request

When you're finished with the changes, create a pull request.
- Fill the "Ready for review" template so that we can review your PR. This template helps reviewers understand your changes as well as the purpose of your pull request.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to allow maintainer edits so the branch can be updated for a merge.
Once you submit your PR, a team member will review your proposal. We may ask questions or request additional information.
- We may ask for changes to be made before a PR can be merged using pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
- If you run into any merge issues, check out this [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you resolve merge conflicts and other issues.

### Your PR is merged!

Congratulations :tada::tada: You have done valuable work for the web :sparkles:.

Once your PR is merged, your contributions will be publicly visible on the main [Deleight project](https://github.com/mksunny1/deleight).


