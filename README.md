# Vulcan Mongo Backup

## Make your data safe

This package enable a cron job that saves a Meteor app Mongo database using `mongodump`.

See [Awesome Vulcan](https://www.awesome-vulcan.com) for usage examples.

**/!\ This is an experimental package, API will certainly evolve in the months to come**.

## Installation

Clone this repo:

```sh
git clone https://github.com/lbke/vulcan-mongo-backup
```

You can clone it directly in your app `packages` folder. You can also clone it in an isolated `vulcan-packages` folder outside of your app, and then set the `METEOR_PACKAGE_DIRS` environment variable to `"/some-dir/vulcan-packages"`. This way, you can put all your reusable package in this `vulcan-packages` folder without polluting your own app.

Simply import the package in your app (see Awesome Vulcan for settings demo).

This package won't be published on Atmosphere or npm until it is a bit more mature.

## Contributing

This package will evolve and improve depending on the use cases we encounter. Best way to contribute is to use it in your own app, and propose ideas, suggestions and PR based on your experience.

We seek for maximum reusability, so each method should be as configurable as possible, and split into independant functions whenever possible.

_[Built with love by LBKE](https://github.com/lbke)_

## Roadmap

- Support other storage system (file system, other services...). Right now only AWS S3 is supported.
- Swich to Node cron module instead of relying on Meteor
