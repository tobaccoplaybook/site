#!/bin/sh

# run this to publish whatever is in the _site directory
# pattern described at http://blog.blindgaenger.net/generate_github_pages_in_a_submodule.html

DATE=$(date +%y%m%d\ %H:%M)
GREEN="\033[1;32m"
ENDCOLOR="\033[0m"



# copy everything in build to _site
rm -rf _site/*
cp -v -R build/* _site/

# commit and push gh-pages branch
cd _site
git add .
git commit -m "$DATE update"
git push origin gh-pages

# commit and push master
cd ../
git commit -a -m "$DATE update"
git push origin master

git log --stat -1

echo $GREEN"Published as '$DATE update'" $ENDCOLOR