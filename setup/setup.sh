#!/usr/bin/env bash





# Distill the commonly used crypts from the cred file.

# Get just the crypts. (This could be parallelized by splitting the file, just like in psort.)
cat ../cred | node lines-2-single-crypts.js > crypts_single.txt 
# Sort them in parallel.
./psort.sh crypts_single.txt crypts_single_sorted.txt
#rm crypts_single.txt
# Count the frequency of each crypt, ignore uncommon and CSV them. Ready for database import! :D
cat crypts_single_sorted.txt | uniq -c | node ignore-single-below-limit-and-csv.js 20 > frequencies_single.csv
#rm crypts_single_sorted.txt



cat ../cred | node lines2hints.js 1 > hints_single.txt
./psort.sh hints_single.txt hints_single_sorted.txt
#rm hints.txt

# Uses frequencies_single.csv.
cat hints_single_sorted.txt | node filter-single-sorted-hints.js | uniq > hints_single_unique.txt

# Split all relevant hints into one file per crypt.
awk '{ 
    d="../single/" substr($0, 1, 2);               # Determine output dir. name
    f=d "/" substr($0, 1, 16);         # Determine output file path.
    if (!dirs[d]++) system("echo .; mkdir -p \"" d "\"");     # Make sure output dir. exists.
    print substr($0, 18, 1000) >> f;  # Output line.
    close(f);                         # Close output file.
  }' hints_single_unique.txt




cat ../cred | node lines-2-double-crypts.js > crypts_double.txt
./psort.sh crypts_double.txt crypts_double_sorted.txt
cat crypts_double_sorted.txt | uniq -c | node ignore-double-below-limit-and-csv.js 20 > frequencies_double.csv

cat ../cred | node lines2hints.js 2 > hints_double.txt
./psort.sh hints_double.txt hints_double_sorted.txt
cat hints_double_sorted.txt | node filter-double-sorted-hints.js | uniq > hints_double_unique.txt
awk '{ 
    d="../double/" substr($0, 1, 3);               # Determine output dir. name
    f=d "/" substr($0, 1, 32);         # Determine output file path.
    if (!dirs[d]++) system("echo .; mkdir -p \"" d "\"");     # Make sure output dir. exists.
    print substr($0, 34, 1000) >> f;  # Output line.
    close(f);                         # Close output file.
  }' hints_double_unique.txt








# Try sorting the hints by frequency for a certin crypt. Common ones are likely useless?



psql -c "DROP DATABASE xkcd_1286"
psql -c "CREATE DATABASE xkcd_1286"
psql -d xkcd_1286 -f schema.sql
psql -d xkcd_1286 -c "\COPY frequenciesSingle (crypt,frequency) FROM STDIN DELIMITER E','" < frequencies_single.csv
psql -d xkcd_1286 -c "\COPY frequenciesDouble (first,second,frequency) FROM STDIN DELIMITER E','" < frequencies_double.csv

