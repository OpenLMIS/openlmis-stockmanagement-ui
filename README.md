# OpenLMIS Stock Management UI Module
This repository is the UI for the [OpenLMIS Stock Management Service.](https://github.com/OpenLMIS/openlmis-stockmanagement)

## Prerequisites
* Docker 1.11+
* Docker Compose 1.6+

## Quick Start
1. Fork/clone this repository from GitHub.

 ```shell
 git clone https://github.com/OpenLMIS/openlmis-stockmanagement-ui.git
 ```
2. Develop w/ Docker by running `docker-compose run --service-ports stockmanagement-ui`.
3. You should now be in an interactive shell inside the newly created development environment, build the project with: `npm install && grunt` and then you can build and start it with `grunt build --serve`.
4. Go to `http://localhost:9000/webapp/` to see the login page.

*Note:* To change the location of where the OpenLMIS-UI attemps to access OpenLMIS, use the command `grunt build --openlmisServerUrl=<openlmis server url> --serve`.

## Building & Testing
See the [OpenLMIS/dev-ui project](https://github.com/OpenLMIS/dev-ui) for more information on what commands are available, below are the command you might use during a normal work day.

```shell
// Open docker in an interactive shell
> docker-compose run --service-ports stockmanagement-ui

// Install dependencies 
$ npm install
$ grunt

// Build and run the UI against a OpenLMIS server
$ grunt build --openlmisServerUrl=<openlmis server url> --serve

// Run unit tests
$ grunt karma:unit

// Run a watch process that will build and test your code
// NOTE: You must change a file at least once before your code is rebuilt
$ grunt watch --openlmisServerUrl=<openlmis server url> --serve

```

### Built Artifacts
After the OpenLMIS-UI is built and being served, you can access the following documents:
- `http://localhost:9000/webapp/` The compiled OpenLMIS application
- `http://localhost:9000/docs/` JS Documentation created from the source code
- `http://localhost:9000/styleguide/` KSS Documentation created from the CSS


### Build Deployment Image
The specialized docker-compose.builder.yml is geared toward CI and build
servers for automated building, testing and docker image generation of
the UI module.

```shell
> docker-compose pull
> docker-compose run ./build.sh stockmanagement-ui
> docker-compose build image
```

### Internationalization (i18n)
Transifex has been integrated into the development and build process. In order to sync with the project's resources in Transifex, you must provide values for the following keys: TRANSIFEX_USER, TRANSIFEX_PASSWORD.

For the development environment in Docker, you can sync with Transifex by running the sync_transifex.sh script. This will upload your source messages file to the Transifex project and download translated messages files.

The build process has syncing with Transifex seamlessly built-in.

## Configuration

Values in `config.json` are substituted into the sources at build time, and an implementation's own
UI repository can override any of them by declaring the same key in its `config.json`.

### Default reasons on Issue and Receive

| Key | Effect |
| --- | --- |
| `defaultIssueReasonId` | Reason preselected on a new Issue line item |
| `defaultReceiveReasonId` | Reason preselected on a new Receive line item |

Neither key is set here, so both screens leave the reason optional and preselect nothing, which is how
the reference distribution behaves. Setting one makes the reason field required on that screen as well
as preselecting it, because a screen that prescribes a reason is a screen that expects every line to
carry one.

Preselection applies to a line that has nothing to inherit. As with the source or destination and the
date, a line added after another one takes that line's reason, so a reason the user picked by hand
carries down the rest of the event. The reason comment is unaffected: it stays optional, and it is
still offered only for reasons configured to allow free text.

A configured id has to be a reason the screen actually offers, which means all of:

- the reason category is `TRANSFER`, and its type is `DEBIT` for Issue or `CREDIT` for Receive -
  the stock management service rejects any other combination on an event that carries a destination
  or a source;
- it has a valid reason assignment, not hidden, for the program and facility type of the user
  filling the screen.

An id that does not meet this, or a key left unset, leaves that screen exactly as it is without one:
nothing is preselected and the reason stays optional. Reasons are administered under
Administration -> Reasons, which is also where the free text flag lives.
