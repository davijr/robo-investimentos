#!/bin/bash

if [[ $1 && $2 ]]; then

    echo "git checkout -b " . $1
    git checkout -b $1

    echo "git add ."
    git add .

    echo "git commit -a -m"
    git commit -a -m "$2"

    echo "git push --set-upstream origin $1"
    git push --set-upstream origin $1

elif [[ $1 ]]; then

    echo "git add ."
    git add .

    echo "git commit -a -m $1"
    git commit -a -m "$1"

    echo "git push"
    git push

else

    echo "git add ."
    git add .

    echo "git commit -a -m sync"
    git commit -a -m "sync"

    echo "git push"
    git push
    
fi
