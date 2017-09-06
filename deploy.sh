#!/bin/sh

DATE=$(date +%y%m%d\ %H:%M)
GREEN="\033[1;32m"
ENDCOLOR="\033[0m"

MESSAGE="$DATE update"

while [[ $# -gt 1 ]]
do
key="$1"

case $key in
    -m|--message)
    MESSAGE="$2"
    shift # past argument
    ;;
    *)
          # unknown option
    ;;
esac
shift # past argument or value
done

echo "message: ${MESSAGE}"

# copy everything in build to docs (github serves the site from the /docs directory)
rm -rf docs/*
cp -v -R build/* docs/

# remove mac stuff
find . -name '.DS_Store' -type f -delete

# requires: npm install html-minifier -g
html-minifier --input-dir docs --output-dir docs --file-ext html --collapse-whitespace --minify-js --remove-comments --minify-css



# commit and push content repo
cd ../content/
git add .
git commit -m "${MESSAGE}"
git push origin master

# commit and push master
cd ../site/
git add .
git commit -a -m "${MESSAGE}"
git push origin master

#git log --stat -1

echo $GREEN"Published as '$DATE update'" $ENDCOLOR

npm version patch
