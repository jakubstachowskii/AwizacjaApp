#!/bin/bash

echo "Budowanie aplikacji..."
npm run build
if [ $? -ne 0 ]; then
    echo "Błąd podczas budowania aplikacji!"
    exit 1
fi

echo "Uruchamianie aplikacji..."
npm run electron 