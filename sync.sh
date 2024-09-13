#!/bin/bash

echo "git add ."
git add .

echo "git commit -a -m"
git commit -a -m "$1"

echo "git push"
git push
