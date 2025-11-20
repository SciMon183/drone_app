#!/bin/bash 

echo "podaj pierwsza liczxbę" 
read liczba1

echo "poidaj drugą liczbę"
read liczba2

let wynik=$liczba1+$liczba2

echo "wynik dodawania: $wynik"

exit 0
