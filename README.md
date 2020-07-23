# complyci

Check that your apps dependancies comply with your open source licence policy each time your app is updated.

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## How it works

![Information flow](https://github.com/Tom-Davidson/complyci/blob/master/docs/how_it_works.png "Information flow")

When you check your code into GitHub complyci is notified via a github webhook. It then downloads your code using your ssh credentials (so you can access private repos) and generates a report.

## Current limitations

- Works with your dependancy management system, does not scan your project
- Only supports npm currently
