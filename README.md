# OpenLMIS Stock Management UI

## Instructions (in progresss)
Currently the docker-compose process doesn't work, but this will change.

For now, you can run the Stock Management UI by follow these instructions:

```
# Go to where ever you want your files to live

# (1) Pull the openlmis/dev-ui image from docker hub
> docker pull openlmis/dev-ui

# (2) Clone this repository
> git clone github.com/OpenLMIS/openlmis-stockmanagement-ui

# (3) Clone the requisition-refUI (into a different directory)
> git clone github.com/OpenLMIS/openlmis-requisition-refUI

# (4) Change to the openlmis-stockmanagement-ui
> cd openlmis-stockmanagement-ui

# (5) Run the openlmis/dev-ui with docker, mounting the stockmangement-ui and requisition-refUI directories
> docker run
    -v $(pwd):/app
    -v <PATH TO openlmis-requisition-refUI>:/openlmis-requisition-ui
    -p 9000:9000
    --rm
    -it
    openlmis/dev-ui

# You should now have started a Docker container in the /dev-ui directory

# (6) Change to /app
> cd /app

# (7) Install NodeJS packages
> npm install

# (8) Build the OpenLMIS-UI
> grunt

# Congrats, you have just build the OpenLMIS-UI -- there should be a directory at /app/build/ full of good stuff.

```

To build the OpenLMIS-UI and start a demo server that works with the [OpenLMIS Ref Distro](https://github.com/OpenLMIS/openlmis-ref-distro) — first set up the Ref Distro and run docker-compose, then...
```
# Starting from stop 7 above

# (8) Build the OpenLMIS-UI with a OpenLMIS Server Url, and start a development server
> grunt build --openlmisServerUrl=http://<YOUR LOCAL IP ADDRESS> --serve

# Now you can visit http://localhost:9000 and see your work!

# (9) - optional - Use grunt watch to rebuild the OpenLMIS-UI when changes are made to server files
> grunt watch --openlmisServerUrl=http://<YOUR LOCAL IP ADDRESS> --serve 

```

For more details about build commands available, see the [OpenLMIS/dev-ui](https://github.com/OpenLMIS/dev-ui)

