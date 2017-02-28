#!/bin/sh

# run this to setup the system on a new computer
# make sure node and npm are installed first

DIR=`pwd`

# clone content repo
git clone git@github.com:tobaccoplaybook/content.git

# clone system repo
git clone git@github.com:tobaccoplaybook/site.git
cd site
npm i

cd $DIR
ll





