#!/bin/sh

# Update everything (just in case)
npm rebuild
npm install --no-optional

# Built and test
grunt
grunt sonar --sonarLogin=$SONAR_LOGIN --sonarPassword=$SONAR_PASSWORD
