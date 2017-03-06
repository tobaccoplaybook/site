#!/bin/sh

# Use this if you do NOT want to commit code-changes (just content)


DATE=$(date +%y%m%d\ %H:%M)
GREEN="\033[1;32m"
ENDCOLOR="\033[0m"

MESSAGE="$DATE content-update"

echo "message: ${MESSAGE}"

# copy everything in build to docs (github serves the site from the /docs directory)
rm -rf docs/*
cp -v -R build/* docs/

# commit and push content repo
cd ../content/
git add .
git commit -m "${MESSAGE}"
git push origin master

# commit and push master
cd ../site/
#git add .
#git commit -a -m "${MESSAGE}"
git commit -m "${MESSAGE}" -- docs
git push origin master

#git log --stat -1

echo $GREEN"Published as '$MESSAGE'" $ENDCOLOR

