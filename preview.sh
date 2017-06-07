#!/bin/sh

echo "Publishing preview"

cp -R build/* docs/preview/
git add docs/preview
git commit docs/ -m "auto preview"
git push origin master

